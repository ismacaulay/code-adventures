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
    Vector3,
    Box3,
    Matrix4,
    Group,
    TorusKnotGeometry,
    BoxHelper,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const CENTRE = new Vector3(1000, 1500, 2300);

function computeBoxCorners(box: Box3) {
    const corners = [];

    corners.push(new Vector3(box.min.x, box.min.y, box.min.z));
    corners.push(new Vector3(box.max.x, box.min.y, box.min.z));
    corners.push(new Vector3(box.max.x, box.max.y, box.min.z));
    corners.push(new Vector3(box.min.x, box.max.y, box.min.z));

    corners.push(new Vector3(box.min.x, box.min.y, box.max.z));
    corners.push(new Vector3(box.max.x, box.min.y, box.max.z));
    corners.push(new Vector3(box.max.x, box.max.y, box.max.z));
    corners.push(new Vector3(box.min.x, box.max.y, box.max.z));

    return corners;
}

function computeZPlanes({
    box,
    orientation,
    target,
    distance,
}: {
    box: Box3;
    target: Vector3;
    orientation: Matrix4;
    distance: number;
}) {
    const corners = computeBoxCorners(box);
    const x = new Vector3();
    let zmin = Number.MAX_VALUE;
    let zmax = Number.MIN_VALUE;
    for (let i = 0; i < 8; ++i) {
        x.copy(corners[i]);
        x.sub(target);
        x.applyMatrix4(orientation);

        zmin = Math.min(zmin, x.z);
        zmax = Math.max(zmax, x.z);
    }

    const padding = 0.1 * Math.abs(zmax - zmin);
    zmin -= padding;
    zmax += padding;

    let znear = distance - zmax;
    let zfar = distance - zmin;

    return { znear, zfar };
}

const orientation = new Matrix4();
const targetToCamera = new Vector3();
function updateCameraZPlanes({
    camera,
    target,
    boundingBox,
}: {
    camera: OrthographicCamera | PerspectiveCamera;
    target: Vector3;
    boundingBox: Box3;
}) {
    orientation.copy(camera.matrixWorldInverse).extractRotation(orientation);
    const distance = targetToCamera.copy(target).sub(camera.position).length();

    const { znear, zfar } = computeZPlanes({
        box: boundingBox,
        target,
        orientation,
        distance,
    });

    camera.near = znear;
    camera.far = zfar;
    camera.updateProjectionMatrix();
}

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
    const viewObjects = new Group();
    scene.add(viewObjects);
    const aspect = window.innerWidth / (window.innerHeight / 2);

    const camera = new PerspectiveCamera(50, aspect, 0.1, 3000);
    camera.position.copy(CENTRE);
    camera.position.x += 50;
    camera.position.y += 25;
    camera.position.z += 50;
    const controls = new OrbitControls(camera, renderer1.domElement);
    controls.target.copy(CENTRE);

    let frustumSize = 5;
    const orthoCamera = new OrthographicCamera(
        (frustumSize * aspect) / -2,
        (frustumSize * aspect) / 2,
        frustumSize / 2,
        frustumSize / -2,
        1,
        20.0,
    );
    orthoCamera.position.copy(CENTRE);
    orthoCamera.position.z += 5;
    const orbitControls = new OrbitControls(orthoCamera, renderer2.domElement);
    orbitControls.target.copy(CENTRE);

    const cameraHelper = new CameraHelper(orthoCamera);
    scene.add(cameraHelper);

    const gridHelper = new GridHelper(100, 100, 0x888888, 0x444444);
    gridHelper.position.copy(CENTRE);
    scene.add(gridHelper);

    const render = function () {
        requestAnimationFrame(render);

        controls.update();
        orbitControls.update();
        cameraHelper.update();

        cameraHelper.visible = true;
        gridHelper.visible = true;
        boxHelper.visible = true;

        renderer1.clear();
        renderer1.render(scene, camera);

        cameraHelper.visible = false;
        gridHelper.visible = false;
        boxHelper.visible = false;

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
    box.position.copy(CENTRE);
    viewObjects.add(box);

    const torusKnotGeom = new TorusKnotGeometry(1, 0.5, 32, 16);
    const torusKnot = new Mesh(torusKnotGeom, material);
    torusKnot.position.copy(CENTRE);
    torusKnot.position.x += 5;
    viewObjects.add(torusKnot);

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

    const allObjectBoundingBox = new Box3();
    allObjectBoundingBox.expandByObject(viewObjects);
    const boxHelper = new BoxHelper(viewObjects, 0x00ff00);
    scene.add(boxHelper);

    const size = new Vector3();
    allObjectBoundingBox.getSize(size);
    frustumSize = Math.hypot(...size.toArray());
    allObjectBoundingBox.getCenter(size);
    orthoCamera.position.copy(size);
    orthoCamera.position.z -= 5;
    orbitControls.target.copy(size);

    function handleOrthoCameraChanged() {
        updateCameraZPlanes({
            camera: orthoCamera,
            target: orbitControls.target,
            boundingBox: allObjectBoundingBox,
        });
    }
    orbitControls.addEventListener('change', handleOrthoCameraChanged);

    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();
    handleOrthoCameraChanged();

    render();
})();
