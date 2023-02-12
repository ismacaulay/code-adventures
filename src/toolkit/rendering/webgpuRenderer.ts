import { vec2, vec3 } from 'gl-matrix';
import { BufferAttributeFormat, createVertexBuffer } from './buffers/vertexBuffer';
import {
  CommandType,
  type CopyToTextureCommand,
  type DrawCommand,
  type WriteBufferCommand,
} from './commands';
import { createDefaultRenderer } from './webgpu/renderer/defaultRenderer';
import { createWeightedBlendedRenderer } from './webgpu/renderer/weightedBlendedRenderer';

const screenShaderSource = `
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn vertex_main(
  @location(0) a_pos: vec2<f32>,
  @location(1) a_uv: vec2<f32>
) -> VertexOutput {
  var out: VertexOutput;
  out.position = vec4(a_pos.x, a_pos.y, 0.0, 1.0);
  out.uv = a_uv;
  return out;
}

@group(0) @binding(0)
var u_sampler: sampler;
@group(0) @binding(1)
var u_texture: texture_2d<f32>;

@fragment
fn fragment_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  return textureSample(u_texture, u_sampler, uv);
}
`;

export async function createWebGPURenderer(canvas: HTMLCanvasElement) {
  const gpu = navigator.gpu;
  const adapter = await gpu.requestAdapter();
  if (!adapter) {
    throw new Error('Unable to get gpu adapter');
  }

  const device = await adapter.requestDevice();

  const context = canvas.getContext('webgpu');
  if (!context) {
    throw new Error('Unable to get webgpu context');
  }

  let size = [canvas.clientWidth, canvas.clientHeight];
  if (size[0] === 0 || size[1] === 0) {
    throw new Error(`Invalid canvas size: [${canvas.clientWidth}, ${canvas.clientHeight}]`);
  }

  const devicePixelRatio = window.devicePixelRatio || 1;
  let presentationSize: vec2 = [size[0] * devicePixelRatio, size[1] * devicePixelRatio];

  // configure the context
  const presentationFormat = gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
    alphaMode: 'opaque',
  });
  canvas.width = presentationSize[0];
  canvas.height = presentationSize[1];

  // create the depth texture
  let depthTexture = device.createTexture({
    size: presentationSize,
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  // const pipelineCache: GenericObject<GPURenderPipeline> = {};
  // const bindGroupCache: GenericObject<any> = {};

  let draws: DrawCommand[] = [];
  let commands: (WriteBufferCommand | CopyToTextureCommand)[] = [];

  // let renderer = createDefaultRenderer(device, { size: presentationSize });
  let renderer = createWeightedBlendedRenderer(device, { size: presentationSize });

  // setup screen quad
  const screenSampler = device.createSampler();
  // prettier-ignore
  const screenVertices = new Float32Array([
    // positions // uv
    -1.0,  1.0,  0.0, 0.0,
    -1.0, -1.0,  0.0, 1.0,
     1.0, -1.0,  1.0, 1.0,

    -1.0,  1.0,  0.0, 0.0,
     1.0, -1.0,  1.0, 1.0,
     1.0,  1.0,  1.0, 0.0
  ]);
  const screenVertexBuffer = createVertexBuffer(device, {
    array: screenVertices,
    attributes: [
      {
        location: 0,
        format: BufferAttributeFormat.Float32x2,
      },
      {
        location: 1,
        format: BufferAttributeFormat.Float32x2,
      },
    ],
  });

  const screenShaderModule = device.createShaderModule({
    code: screenShaderSource,
  });
  const screenPipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: screenShaderModule,
      entryPoint: 'vertex_main',
      buffers: [screenVertexBuffer.layout],
    },
    fragment: {
      module: screenShaderModule,
      entryPoint: 'fragment_main',
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },

    primitive: {
      topology: 'triangle-list',
      cullMode: 'none',
    },
  });

  let screenBindGroup: Maybe<GPUBindGroup>;

  return {
    device,

    get type() {
      return renderer.type;
    },

    get clearColour() {
      return renderer.clearColour;
    },
    set clearColour(value: vec3) {
      vec3.copy(renderer.clearColour, value);
    },

    begin() {},

    submit(command: DrawCommand | WriteBufferCommand | CopyToTextureCommand) {
      if (command.type === CommandType.Draw) {
        draws.push(command);
      } else if (command.type === CommandType.WriteBuffer) {
        commands.push(command);
      } else if (command.type === CommandType.CopyToTexture) {
        commands.push(command);
      }
    },

    end() {
      // handle resize if necessary
      if (canvas.clientWidth !== size[0] || canvas.clientHeight !== size[1]) {
        size = [canvas.clientWidth, canvas.clientHeight];
        presentationSize = [size[0] * devicePixelRatio, size[1] * devicePixelRatio];

        canvas.width = presentationSize[0];
        canvas.height = presentationSize[1];
        renderer.resize(presentationSize);

        // when the size changes, the renderer texture gets recreated so we need
        // to invalidate the screen bindgroup
        screenBindGroup = undefined;
      }

      const commandEncoder = device.createCommandEncoder();

      // handle the copy commands
      for (let i = 0; i < commands.length; ++i) {
        const command = commands[i];
        if (command.type === CommandType.WriteBuffer) {
          let { dst, src } = command;

          if (src instanceof Float64Array) {
            src = new Float32Array(src);
          }
          device.queue.writeBuffer(dst, 0, src.buffer, src.byteOffset, src.byteLength);
        } else if (command.type === CommandType.CopyToTexture) {
          let { dst, src } = command;

          if (src instanceof ImageBitmap) {
            device.queue.copyExternalImageToTexture({ source: src }, { texture: dst }, [
              src.width,
              src.height,
            ]);
          } else {
            const {
              buffer,
              shape: [width, height],
            } = src;
            device.queue.writeTexture(
              { texture: dst },
              buffer,
              {
                bytesPerRow: width * 4,
              },
              {
                width,
                height,
              },
            );
          }
        }
      }
      commands = [];

      // use the renderer for the draw commands
      renderer.render(commandEncoder, draws);
      draws = [];

      // render the final texture to a quad
      const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: [0, 0, 0, 1],
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      });

      passEncoder.setPipeline(screenPipeline);

      if (!screenBindGroup) {
        screenBindGroup = device.createBindGroup({
          layout: screenPipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: screenSampler },
            {
              binding: 1,
              resource: renderer.texture.createView(),
            },
          ],
        });
      }
      passEncoder.setBindGroup(0, screenBindGroup);
      passEncoder.setVertexBuffer(0, screenVertexBuffer.buffer);
      passEncoder.draw(6, 1, 0, 0);
      passEncoder.end();

      device.queue.submit([commandEncoder.finish()]);
    },

    destroy() {
      depthTexture.destroy();
    },
  };
}
