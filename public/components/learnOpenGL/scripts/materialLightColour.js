ca_registerScript(function createMaterialLightColourScript(system) {
  const {
    vec3,
    engine: { entityManager, ComponentType },
  } = system;

  let t = 0;
  const lightColour = vec3.create();
  const lightAmbient = vec3.create();
  const lightDiffuse = vec3.create();
  const ambientBase = vec3.fromValues(0.2, 0.2, 0.2);
  const diffuseBase = vec3.fromValues(0.5, 0.5, 0.5);

  return {
    update(dt, entity) {
      t += dt;

      vec3.set(lightColour, Math.sin(t * 2.0), Math.sin(t * 0.7), Math.sin(t * 1.3));
      vec3.mul(lightDiffuse, lightColour, diffuseBase);
      vec3.mul(lightAmbient, lightDiffuse, ambientBase);

      const material = entityManager.getComponent(entity, ComponentType.Material);
      Object.assign(material.uniforms, {
        light_ambient: lightAmbient,
        light_diffuse: lightDiffuse,
      });
    },
  };
});
