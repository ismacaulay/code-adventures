import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    Mesh,
    MeshPhongMaterial,
    PointLight,
    DoubleSide,
    GridHelper,
    CameraHelper,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createRotationCamera } from './cameraControls';

(function main() {
    const renderer1 = new WebGLRenderer({ antialias: true });
    renderer1.setClearColor(0xffffff);
    renderer1.setPixelRatio(window.devicePixelRatio);
    renderer1.setSize(window.innerWidth, window.innerHeight / 2);
    document.body.appendChild(renderer1.domElement);

    const renderer2 = new WebGLRenderer({ antialias: true });
    renderer2.setClearColor(0xffffff);
    renderer2.setPixelRatio(window.devicePixelRatio);
    renderer2.setSize(window.innerWidth, window.innerHeight / 2);
    document.body.appendChild(renderer2.domElement);

    const scene = new Scene();
    const aspect = window.innerWidth / (window.innerHeight / 2);

    const camera = new PerspectiveCamera(50, aspect, 0.1, 3000);
    camera.position.set(50, 25, 50);
    camera.lookAt(0, 0, 0);

    const rotationCamera = createRotationCamera(renderer2.domElement);
    rotationCamera.updateState({ rotation: [-48, 0, -42] });

    const cameraHelper = new CameraHelper(rotationCamera.camera);
    scene.add(cameraHelper);

    // let insetWidth = Math.max(300, window.innerHeight / 4);
    // let insetHeight = Math.max(300, window.innerHeight / 4);

    const gridHelper = new GridHelper(100, 100, 0x888888, 0x444444);
    scene.add(gridHelper);

    const controls = new OrbitControls(camera, renderer1.domElement);

    const render = function () {
        requestAnimationFrame(render);

        controls.update();
        rotationCamera.update();
        cameraHelper.update();

        renderer1.clear();

        cameraHelper.visible = true;
        gridHelper.visible = true;
        // renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        renderer1.render(scene, camera);

        cameraHelper.visible = false;
        gridHelper.visible = false;

        renderer2.render(scene, rotationCamera.camera);
        // renderer.clearDepth();

        // renderer.setScissorTest(true);
        // renderer.setScissor(20, 20, insetWidth, insetHeight);
        // renderer.setViewport(20, 20, insetWidth, insetHeight);
        // renderer.render(scene, rotationCamera.camera);
        //
        // renderer.setScissorTest(false);
    };

    function onWindowResize() {
        camera.aspect = window.innerWidth / (window.innerHeight / 2);
        camera.updateProjectionMatrix();
        rotationCamera.resize(window.innerWidth, window.innerHeight / 2);

        renderer1.setSize(window.innerWidth, window.innerHeight / 2);
        renderer2.setSize(window.innerWidth, window.innerHeight / 2);

        // insetWidth = Math.max(300, window.innerHeight / 4);
        // insetHeight = Math.max(300, window.innerHeight / 4);

        // rotationCamera.resize(insetWidth, insetHeight);
        // orthoCamera.aspect = insetWidth / insetHeight;
        // camera2.updateProjectionMatrix();
        render();
    }

    const material = new MeshPhongMaterial({
        color: 0x156289,
        emissive: 0x072534,
        side: DoubleSide,
        flatShading: true,
    });
    const boxGeometry = new BoxGeometry(2, 2, 2);
    const box = new Mesh(boxGeometry, material);
    scene.add(box);

    // const geometry = new SphereGeometry();
    //
    // const sphere2 = new Mesh(geometry, material.clone());
    // sphere2.material.color.set(0xff0000);
    // sphere2.position.set(3, 0, 0);
    // scene.add(sphere2);
    //
    // const sphere3 = new Mesh(geometry, material.clone());
    // sphere3.material.color.set(0x00ff00);
    // sphere3.position.set(-3, 0, 0);
    // scene.add(sphere3);

    const lights = [];
    lights[0] = new PointLight(0xffffff, 1, 0);
    lights[1] = new PointLight(0xffffff, 1, 0);
    lights[2] = new PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);

    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);

    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();

    render();
})();
