import { Euler, Matrix4, OrthographicCamera, Vector3 } from 'three';

function toRadians(v: number) {
    return (v * Math.PI) / 180.0;
}

function constrainZoom(zoom: number) {
    const [lower, upper] = [0.1, 5000];
    if (zoom < lower) {
        return lower;
    }
    if (zoom > upper) {
        return upper;
    }
    return zoom;
}

function constrainRotation(xyz: [number, number, number]) {
    const ret = [xyz[0], xyz[1], xyz[2]];
    if (ret[0] < -180) {
        ret[0] = -180;
    }
    if (ret[0] > 0) {
        ret[0] = 0;
    }
    if (ret[2] > 180) {
        ret[2] -= 360;
    }
    if (ret[2] < -180) {
        ret[2] += 360;
    }
    return ret as [number, number, number];
}

function computePanLeft(distance: number, objectMatrix: Matrix4) {
    const [x, y, z] = objectMatrix.toArray();
    return [x * -distance, y * -distance, z * -distance];
}

function computePanUp(distance: number, objectMatrix: Matrix4) {
    const { 4: x, 5: y, 6: z } = objectMatrix.toArray();
    return [x * distance, y * distance, z * distance];
}

export function createRotationCamera(element: HTMLElement) {
    const frustumSize = 5;
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new OrthographicCamera(
        (frustumSize * aspect) / -2,
        (frustumSize * aspect) / 2,
        frustumSize / 2,
        frustumSize / -2,
        1,
        20.0,
    );

    let state = {
        zoom: 1,
        radius: 5,
        rotation: [0, 0, 0],
        up: [0, 1, 0] as [number, number, number],
        target: [0, 0, 0] as [number, number, number],
    };

    function updateState(update: any) {
        state = {
            ...state,
            ...update,
        };
    }

    const reversedRotationEuler = new Euler();
    const reversedRotationMatrix = new Matrix4();
    const cameraDir = new Vector3();

    const position = new Vector3();
    const target = new Vector3();
    const up = new Vector3();

    function update() {
        const { radius, zoom, rotation, up: upDir, target: targetDir } = state;
        target.set(...targetDir);

        reversedRotationEuler.set(
            ...(rotation.map((v) => -toRadians(v)) as [number, number, number]),
            'ZYX',
        );
        reversedRotationMatrix.makeRotationFromEuler(reversedRotationEuler);

        position.set(0, 0, radius).applyMatrix4(reversedRotationMatrix);
        position.add(target);

        up.set(...upDir).applyMatrix4(reversedRotationMatrix);
        up.normalize();

        camera.position.copy(position);
        camera.up.copy(up);
        camera.zoom = zoom;
        camera.lookAt(target);

        camera.updateMatrix();
        camera.updateProjectionMatrix();
    }

    update();

    const mouseState = {
        start: undefined as undefined | [number, number],
        prev: [0, 0],
        moved: false,
        buttons: {
            left: false,
            right: false,
            middle: false,
        },
    };
    function handleMouseDown(evt: MouseEvent) {
        evt.preventDefault();
        const { buttons, pageX, pageY } = evt;

        if (!mouseState.start) {
            mouseState.start = [pageX, pageY];
        }

        if (buttons) {
            mouseState.buttons.left = (buttons & 1) !== 0;
            mouseState.buttons.right = (buttons & 2) !== 0;
            mouseState.buttons.middle = (buttons & 4) !== 0;
        }

        element.addEventListener('mouseup', handleMouseUp);
        element.addEventListener('mousemove', handleMouseMove);
    }

    function handleMouseMove(evt: MouseEvent) {
        const { pageX, pageY } = evt;
        const { start, prev } = mouseState;

        if (!start) return;

        const offset = [pageX - start[0], pageY - start[1]];
        if (offset[0] !== 0 || offset[1] !== 0) {
            if (!mouseState.moved) {
                mouseState.moved = true;
                mouseState.prev = offset;
                return;
            }

            const delta = [offset[0] - prev[0], offset[1] - prev[1]];

            if (
                mouseState.buttons.left &&
                !mouseState.buttons.right &&
                !mouseState.buttons.middle
            ) {
                const { rotation } = state;
                const sensitivity = 0.25;
                updateState({
                    rotation: constrainRotation([
                        rotation[0] + delta[1] * sensitivity,
                        rotation[1],
                        rotation[2] + delta[0] * sensitivity,
                    ]),
                });
            } else if (
                mouseState.buttons.middle &&
                !mouseState.buttons.left &&
                !mouseState.buttons.right
            ) {
                const { matrix, right, left, top, bottom, zoom } = camera;

                const leftOffset = computePanLeft(
                    (delta[0] * (right - left)) / zoom / element.clientWidth,
                    matrix,
                );
                const upOffset = computePanUp(
                    (delta[1] * (top - bottom)) / zoom / element.clientHeight,
                    matrix,
                );

                const { target } = state;
                updateState({
                    target: [
                        target[0] + leftOffset[0] + upOffset[0],
                        target[1] + leftOffset[1] + upOffset[1],
                        target[2] + leftOffset[2] + upOffset[2],
                    ],
                });
            }

            mouseState.prev = offset;
        }
    }

    function handleMouseUp(evt: MouseEvent) {
        evt.preventDefault();
        const { buttons } = evt;
        mouseState.prev = [0, 0];
        mouseState.moved = false;

        if (buttons) {
            mouseState.buttons.left = (buttons & 1) !== 0;
            mouseState.buttons.right = (buttons & 2) !== 0;
            mouseState.buttons.middle = (buttons & 4) !== 0;
        }

        element.removeEventListener('mouseup', handleMouseUp);
        element.removeEventListener('mousemove', handleMouseMove);
    }

    function handleWheel(evt: WheelEvent) {
        const speed = -Math.sign(evt.deltaY);
        const { zoom } = state;
        updateState({ zoom: constrainZoom(zoom * (1 + speed * 0.48)) });
    }

    element.addEventListener('mousedown', handleMouseDown, { passive: false });
    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('contextmenu', (event) => event.preventDefault());

    return {
        updateState,
        update,
        camera,
        resize(width: number, height: number) {
            cameraDir.set(target.x, target.y, target.z).sub(camera.position);
            const depth = cameraDir.length();

            const aspectRatio = width / height;
            const fov = 45;
            const ymax = Math.tan((fov * Math.PI) / 180);
            const xmax = ymax * aspectRatio;
            const w = depth * xmax;
            const h = depth * ymax;

            camera.left = -w / 2;
            camera.right = +w / 2;
            camera.bottom = -h / 2;
            camera.top = +h / 2;

            camera.updateProjectionMatrix();
        },
    };
}
