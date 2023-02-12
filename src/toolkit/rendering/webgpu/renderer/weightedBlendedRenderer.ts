import { vec2, vec3 } from 'gl-matrix';
import { createVertexBuffer } from 'toolkit/rendering/buffers/vertexBuffer';
import type { DrawCommand } from 'toolkit/rendering/commands';
import { RendererType } from 'toolkit/rendering/renderer';
import { BufferAttributeFormat } from 'types/ecs/component';

const compositeShaderSource = `
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
}

@vertex
fn vertex_main(
  @location(0) a_pos: vec2<f32>,
) -> VertexOutput {
  var out: VertexOutput;
  out.position = vec4(a_pos.xy, 0.0, 1.0);
  return out;
}

@group(0) @binding(0)
var u_accum: texture_2d<f32>;
@group(0) @binding(1)
var u_reveal: texture_2d<f32>;

@fragment
fn fragment_main(@builtin(position) frag_coord: vec4<f32>) -> @location(0) vec4<f32> {
  var coords = vec2<i32>(frag_coord.xy);

  var revealage = textureLoad(u_reveal, coords, 0).x;
  var accumulation = textureLoad(u_accum, coords, 0);

  var avg_colour = accumulation.xyz / clamp(accumulation.a, 1e-4, 5e4); 
  return vec4<f32>(avg_colour, 1.0 - revealage);
}
`;

export function createWeightedBlendedRenderer(device: GPUDevice, params: { size: vec2 }) {
  const clearColour = vec3.fromValues(1.0, 1.0, 1.0);

  const pipelineCache: GenericObject<GPURenderPipeline> = {};
  const bindGroupCache: GenericObject<any> = {};

  const colourFormat: GPUTextureFormat = 'rgba8unorm';
  let colourTexture = device.createTexture({
    size: params.size,
    format: colourFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });

  const depthFormat: GPUTextureFormat = 'depth24plus';
  let depthTexture = device.createTexture({
    size: params.size,
    format: depthFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const accumFormat: GPUTextureFormat = 'rgba16float';
  let accumTexture = device.createTexture({
    size: params.size,
    format: accumFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });

  const revealFormat: GPUTextureFormat = 'r8unorm';
  let revealTexture = device.createTexture({
    size: params.size,
    format: revealFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });

  // setup composite quad
  // prettier-ignore
  const compositeVertices = new Float32Array([
    // positions 
    -1.0,  1.0,
    -1.0, -1.0,
     1.0, -1.0,

    -1.0,  1.0,
     1.0, -1.0,
     1.0,  1.0,
  ]);
  const compositeVertexBuffer = createVertexBuffer(device, {
    array: compositeVertices,
    attributes: [
      {
        location: 0,
        format: BufferAttributeFormat.Float32x2,
      },
    ],
  });

  const compositeShaderModule = device.createShaderModule({
    code: compositeShaderSource,
  });
  const compositePipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: compositeShaderModule,
      entryPoint: 'vertex_main',
      buffers: [compositeVertexBuffer.layout],
    },
    fragment: {
      module: compositeShaderModule,
      entryPoint: 'fragment_main',
      targets: [
        {
          format: colourTexture.format,
          blend: {
            color: {
              operation: 'add',
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha',
            },
            alpha: {
              operation: 'add',
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha',
            },
          },
        },
      ],
    },

    depthStencil: {
      depthWriteEnabled: false,
      depthCompare: 'always',
      format: depthTexture.format,
    },

    primitive: {
      topology: 'triangle-list',
      cullMode: 'none',
    },
  });

  let compositeBindGroup: Maybe<GPUBindGroup>;

  return {
    type: RendererType.WeightedBlended,

    get clearColour() {
      return clearColour;
    },

    get texture() {
      return colourTexture;
    },

    render(commandEncoder: GPUCommandEncoder, draws: DrawCommand[]) {
      const { opaque, transparent } = draws.reduce(
        (acc, cur) => {
          if (cur.transparent) {
            acc.transparent.push(cur);
          } else {
            acc.opaque.push(cur);
          }
          return acc;
        },
        { opaque: [] as DrawCommand[], transparent: [] as DrawCommand[] },
      );

      // draw opaque objects
      {
        const opaquePassDescriptor: GPURenderPassDescriptor = {
          colorAttachments: [
            {
              view: colourTexture.createView(),
              clearValue: [clearColour[0], clearColour[1], clearColour[2], 0.0],
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

        const passEncoder = commandEncoder.beginRenderPass(opaquePassDescriptor);
        for (let i = 0; i < opaque.length; ++i) {
          const { shader, buffers, count, instances, indices } = opaque[i];

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
                format: depthTexture.format,
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
      }

      // draw transparent objects
      {
        const transparentPassDescriptor: GPURenderPassDescriptor = {
          colorAttachments: [
            {
              view: accumTexture.createView(),
              clearValue: [0, 0, 0, 0],
              loadOp: 'clear',
              storeOp: 'store',
            },
            {
              view: revealTexture.createView(),
              clearValue: [1, 1, 1, 1],
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],

          depthStencilAttachment: {
            view: depthTexture.createView(),

            depthLoadOp: 'load',
            depthStoreOp: 'store',
          },
        };

        const passEncoder = commandEncoder.beginRenderPass(transparentPassDescriptor);
        for (let i = 0; i < transparent.length; ++i) {
          const { shader, buffers, count, instances, indices } = transparent[i];

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
                    format: accumTexture.format,
                    blend: {
                      color: {
                        operation: 'add',
                        srcFactor: 'one',
                        dstFactor: 'one',
                      },
                      alpha: {
                        operation: 'add',
                        srcFactor: 'one',
                        dstFactor: 'one',
                      },
                    },
                  },
                  {
                    format: revealTexture.format,
                    blend: {
                      color: {
                        operation: 'add',
                        srcFactor: 'zero',
                        dstFactor: 'one-minus-src',
                      },
                      alpha: {
                        operation: 'add',
                        srcFactor: 'zero',
                        dstFactor: 'one-minus-src',
                      },
                    },
                  },
                ],
              },

              primitive: {
                topology: 'triangle-list',
                cullMode: 'none',
              },

              depthStencil: {
                depthWriteEnabled: false,
                depthCompare: 'less',
                format: depthTexture.format,
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
      }

      // composite to final quad
      {
        const compositePassDescriptor: GPURenderPassDescriptor = {
          colorAttachments: [
            {
              view: colourTexture.createView(),
              loadOp: 'load',
              storeOp: 'store',
            },
          ],

          depthStencilAttachment: {
            view: depthTexture.createView(),

            depthLoadOp: 'load',
            depthStoreOp: 'store',
          },
        };

        const passEncoder = commandEncoder.beginRenderPass(compositePassDescriptor);
        passEncoder.setPipeline(compositePipeline);

        if (!compositeBindGroup) {
          compositeBindGroup = device.createBindGroup({
            layout: compositePipeline.getBindGroupLayout(0),
            entries: [
              {
                binding: 0,
                resource: accumTexture.createView(),
              },
              {
                binding: 1,
                resource: revealTexture.createView(),
              },
            ],
          });
        }

        passEncoder.setBindGroup(0, compositeBindGroup);
        passEncoder.setVertexBuffer(0, compositeVertexBuffer.buffer);
        passEncoder.draw(6, 1, 0, 0);
        passEncoder.end();
      }
    },

    resize(size: [number, number]) {
      colourTexture.destroy();
      colourTexture = device.createTexture({
        size,
        format: colourFormat,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });

      depthTexture.destroy();
      depthTexture = device.createTexture({
        size,
        format: depthFormat,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });

      accumTexture.destroy();
      accumTexture = device.createTexture({
        size,
        format: accumFormat,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });

      revealTexture.destroy();
      revealTexture = device.createTexture({
        size,
        format: revealFormat,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });

      compositeBindGroup = undefined;
    },

    destroy() {
      colourTexture.destroy();
      depthTexture.destroy();
      accumTexture.destroy();
      revealTexture.destroy();
    },
  };
}
