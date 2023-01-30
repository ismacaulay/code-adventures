ca_registerScript(function createSpotLightScript(system) {
  const {
    vec3,
    engine: { cameraController, entityManager, ComponentType },
  } = system;

  const front = vec3.create();

  return {
    update(_dt, entity) {
      vec3.sub(front, cameraController.camera.target, cameraController.camera.position);
      vec3.normalize(front, front);

      const material = entityManager.getComponent(entity, ComponentType.Material);
      vec3.copy(material.uniforms.spot_light.position, cameraController.camera.position);
      vec3.copy(material.uniforms.spot_light.direction, front);
    },
  };
});
