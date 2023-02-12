import { vec2, vec3 } from 'gl-matrix';
import type { DrawCommand } from 'toolkit/rendering/commands';
import { RendererType } from 'toolkit/rendering/renderer';

export function createDefaultRenderer(
  device: GPUDevice,
  params: { clearColour: vec3; size: vec2 },
) {
  console.log('Using default renderer');
  const clearColour = vec3.clone(params.clearColour);

  const pipelineCache: GenericObject<GPURenderPipeline> = {};
  const bindGroupCache: GenericObject<any> = {};

  let colourTexture = device.createTexture({
    size: params.size,
    format: 'rgba8unorm',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });

  // create the depth texture
  let depthTexture = device.createTexture({
    size: params.size,
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  return {
    type: RendererType.Default,

    get clearColour() {
      return clearColour;
    },

    get texture() {
      return colourTexture;
    },

    render(commandEncoder: GPUCommandEncoder, draws: DrawCommand[]) {
      // TODO: Cache this?
      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
          {
            view: colourTexture.createView(),
            clearValue: [clearColour[0], clearColour[1], clearColour[2], 1],
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
        depthStencilAttachment: {
          view: depthTexture.createView(),

          depthClearValue: 1.0,
          depthLoadOp: 'clear',
          depthStoreOp: 'store',
        },
      };

      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

      for (let i = 0; i < draws.length; ++i) {
        const { shader, buffers, count, instances, indices } = draws[i];

        // setup the render pipeline for the shader
        let pipeline = pipelineCache[shader.id];
        if (!pipeline) {
          pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
              module: shader.vertex.module,
              entryPoint: shader.vertex.entryPoint,
              buffers: buffers.map((buf) => buf.layout),
            },
            fragment: {
              module: shader.fragment.module,
              entryPoint: shader.fragment.entryPoint,
              targets: [
                {
                  format: colourTexture.format,
                  blend: shader.blend,
                },
              ],
            },

            primitive: {
              topology: 'triangle-list',
              cullMode: 'none',
            },

            depthStencil: {
              depthWriteEnabled: true,
              depthCompare: 'less',
              format: 'depth24plus',
            },
          });
          pipelineCache[shader.id] = pipeline;
        }
        passEncoder.setPipeline(pipeline);

        // setup the shader bind groups
        let groups = bindGroupCache[shader.id];
        if (!groups) {
          groups = shader.bindings.map((groupDescriptors, idx) => {
            return device.createBindGroup({
              layout: pipeline.getBindGroupLayout(idx),
              entries: groupDescriptors.entries.map((entry, idx) => {
                return {
                  binding: idx,
                  resource: entry.resource,
                };
              }),
            });
          });
          bindGroupCache[shader.id] = groups;
        }
        groups.forEach((group: any, idx: number) => {
          passEncoder.setBindGroup(idx, group);
        });

        // setup the vertex buffers
        buffers.forEach((buf, idx) => {
          passEncoder.setVertexBuffer(idx, buf.buffer);
        });

        // draw
        if (indices) {
          passEncoder.setIndexBuffer(indices.buffer, indices.format);
          passEncoder.drawIndexed(count, instances, 0, 0, 0);
        } else {
          passEncoder.draw(count, instances, 0, 0);
        }
      }

      passEncoder.end();
    },

    resize(size: [number, number]) {
      colourTexture.destroy();
      colourTexture = device.createTexture({
        size,
        format: 'rgba8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });

      depthTexture.destroy();
      depthTexture = device.createTexture({
        size,
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
    },

    destroy() {
      colourTexture.destroy();
      depthTexture.destroy();
    },
  };
}
