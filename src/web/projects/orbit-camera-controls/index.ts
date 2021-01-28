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
    OrthographicCamera,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
    const controls = new OrbitControls(camera, renderer1.domElement);

    const frustumSize = 5;
    const orthoCamera = new OrthographicCamera(
        (frustumSize * aspect) / -2,
        (frustumSize * aspect) / 2,
        frustumSize / 2,
        frustumSize / -2,
        1,
        20.0,
    );
    orthoCamera.position.set(0, 0, 5);
    const orbitControls = new OrbitControls(orthoCamera, renderer2.domElement);

    const cameraHelper = new CameraHelper(orthoCamera);
    scene.add(cameraHelper);

    const gridHelper = new GridHelper(100, 100, 0x888888, 0x444444);
    scene.add(gridHelper);

    const render = function () {
        requestAnimationFrame(render);

        controls.update();
        orbitControls.update();
        cameraHelper.update();

        cameraHelper.visible = true;
        gridHelper.visible = true;

        renderer1.clear();
        renderer1.render(scene, camera);

        cameraHelper.visible = false;
        gridHelper.visible = false;

        renderer2.clear();
        renderer2.render(scene, orthoCamera);
    };

    function onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = 2 * aspect;
        camera.updateProjectionMatrix();

        orthoCamera.left = (2 * frustumSize * aspect) / -2;
        orthoCamera.right = (2 * frustumSize * aspect) / 2;
        orthoCamera.top = frustumSize / 2;
        orthoCamera.bottom = frustumSize / -2;
        orthoCamera.updateProjectionMatrix();

        renderer1.setSize(window.innerWidth, window.innerHeight / 2);
        renderer2.setSize(window.innerWidth, window.innerHeight / 2);

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
