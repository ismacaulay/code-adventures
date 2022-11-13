import { CommandType, type DrawCommand, type WriteBufferCommand } from './commands';

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
  const devicePixelRatio = window.devicePixelRatio || 1;
  let presentationSize = [size[0] * devicePixelRatio, size[1] * devicePixelRatio];

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

  const pipelineCache: GenericObject<GPURenderPipeline> = {};
  const bindGroupCache: GenericObject<any> = {};

  let draws: DrawCommand[] = [];
  let commands: WriteBufferCommand[] = [];

  return {
    device,

    begin() {},

    submit(command: DrawCommand | WriteBufferCommand) {
      if (command.type === CommandType.Draw) {
        draws.push(command);
      } else if (command.type === CommandType.WriteBuffer) {
        commands.push(command);
      }
    },

    end() {
      if (canvas.clientWidth !== size[0] || canvas.clientHeight !== size[1]) {
        size = [canvas.clientWidth, canvas.clientHeight];
        presentationSize = [size[0] * devicePixelRatio, size[1] * devicePixelRatio];

        canvas.width = presentationSize[0];
        canvas.height = presentationSize[1];
        depthTexture.destroy();
        depthTexture = device.createTexture({
          size: presentationSize,
          format: 'depth24plus',
          usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
      }

      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: [0, 0, 0, 1],
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
        }
      }
      commands = [];

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
                  format: presentationFormat,
                },
              ],
            },

            primitive: {
              topology: 'triangle-list',
              cullMode: 'none',
            },

            depthStencil: {
              depthWriteEnabled: true,
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

        if (indices) {
          passEncoder.setIndexBuffer(indices.buffer, indices.format);
          passEncoder.drawIndexed(count, instances, 0, 0, 0);
        } else {
          passEncoder.draw(count, instances, 0, 0);
        }
      }
      draws = [];

      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);
    },

    destroy() {
      depthTexture.destroy();
    },
  };
}
