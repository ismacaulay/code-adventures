import { vec3 } from 'gl-matrix';

export namespace Intersection {
  /**
   * Computes whether the given triangle represented by t0, t1, t2
   * intersects with the AABB represented by centre and half size
   * using the Tomas Akenine-Möller overlap test algorithm
   *
   * https://fileadmin.cs.lth.se/cs/Personal/Tomas_Akenine-Moller/code/tribox3.txt
   *
   * @param t0 - triangle vertex 0
   * @param t1 - triangle vertex 1
   * @param t2 - triangle vertex 2
   * @param centre - AABB centre
   * @param halfSize - AABB half size
   */
  export function triangleAABB(
    t0: vec3,
    t1: vec3,
    t2: vec3,
    centre: vec3,
    halfSize: vec3,
  ): boolean {
    /*    use separating axis theorem to test overlap between triangle and box */
    /*    need to test for overlap in these directions: */
    /*    1) the {x,y,z}-directions (actually, since we use the AABB of the triangle */
    /*       we do not even need to test these) */
    /*    2) normal of the triangle */
    /*    3) crossproduct(edge from tri, {x,y,z}-directin) */
    /*       this gives 3x3=9 more tests */

    const v0 = vec3.create();
    const v1 = vec3.create();
    const v2 = vec3.create();

    const e0 = vec3.create();
    const e1 = vec3.create();
    const e2 = vec3.create();

    const normal = vec3.create();

    /* move everything so that the boxcenter is in (0,0,0) */
    vec3.sub(v0, t0, centre);
    vec3.sub(v1, t1, centre);
    vec3.sub(v2, t2, centre);

    /* compute triangle edges */
    vec3.sub(e0, v1, v0);
    vec3.sub(e1, v2, v1);
    vec3.sub(e2, v0, v2);

    /* Bullet 3:  */
    /*  test the 9 tests first (this was faster) */
    const halfSizeX = halfSize[0];
    const halfSizeY = halfSize[1];
    const halfSizeZ = halfSize[2];

    /**
     * AXISTEST_X01 === axisTest0
     *   v0.y, v0.z
     *   v2.y, v2.z
     *   halfSize.y, halfsize.z
     *   a, -b
     *
     * AXISTEST_X2 === axisTest0
     *   v0.y, v0.z
     *   v1.y, v1.z
     *   halfSize.y, halfsize.z
     *   a, -b
     *
     * AXISTEST_Y02 === axisTest1
     *   v0.x, v0.z
     *   v2.x, v2.z
     *   halfSize.x, halfSize.z
     *   -a, b
     *
     * AXISTEST_Y1 === axisTest1
     *   v0.x, v0.z
     *   v1.x, v1.z
     *   halfSize.x, halfSize.z
     *   -a, b
     *
     * AXISTEST_Z12 === axisTest0
     *   v1.x, v1.y
     *   v2.x, v2.y
     *   halfSize.x, halfSize.y
     *   a, -b
     *
     * AXISTEST_Z0 === axisTest0
     *   v0.x, v0.y
     *   v1.x, v1.y
     *   halfSize.x, halfSize.y
     *   a, -b
     */

    // TODO: measure the performance here
    //  - inline?
    //  - wasm?

    let fex = Math.abs(e0[0]);
    let fey = Math.abs(e0[1]);
    let fez = Math.abs(e0[2]);

    // AXISTEST_X01(e0[Z], e0[Y], fez, fey);
    if (axisTest(v0[1], v0[2], v2[1], v2[2], halfSizeY, halfSizeZ, e0[2], -e0[1], fez, fey))
      return false;

    // AXISTEST_Y02(e0[Z], e0[X], fez, fex);
    if (axisTest(v0[0], v0[2], v2[0], v2[2], halfSizeX, halfSizeZ, -e0[2], e0[0], fez, fex))
      return false;

    // AXISTEST_Z12(e0[Y], e0[X], fey, fex);
    if (axisTest(v1[0], v1[1], v2[0], v2[1], halfSizeX, halfSizeY, e0[1], -e0[0], fey, fex))
      return false;

    fex = Math.abs(e1[0]);
    fey = Math.abs(e1[1]);
    fez = Math.abs(e1[2]);

    // AXISTEST_X01(e1[Z], e1[Y], fez, fey);
    if (axisTest(v0[1], v0[2], v2[1], v2[2], halfSizeY, halfSizeZ, e1[2], -e1[1], fez, fey))
      return false;

    // AXISTEST_Y02(e1[Z], e1[X], fez, fex);
    if (axisTest(v0[0], v0[2], v2[0], v2[2], halfSizeX, halfSizeZ, -e1[2], e1[0], fez, fex))
      return false;

    // AXISTEST_Z0(e1[Y], e1[X], fey, fex);
    if (axisTest(v0[0], v0[1], v1[0], v1[1], halfSizeX, halfSizeY, e1[1], -e1[0], fey, fex))
      return false;

    fex = Math.abs(e2[0]);
    fey = Math.abs(e2[1]);
    fez = Math.abs(e2[2]);

    // AXISTEST_X2(e2[Z], e2[Y], fez, fey);
    if (axisTest(v0[1], v0[2], v1[1], v1[2], halfSizeY, halfSizeZ, e2[2], -e2[1], fez, fey))
      return false;

    // AXISTEST_Y1(e2[Z], e2[X], fez, fex);
    if (axisTest(v0[0], v0[2], v1[0], v1[2], halfSizeX, halfSizeZ, -e2[2], e2[0], fez, fex))
      return false;

    // AXISTEST_Z12(e2[Y], e2[X], fey, fex);
    if (axisTest(v1[0], v1[1], v2[0], v2[1], halfSizeX, halfSizeY, e2[1], -e2[0], fey, fex))
      return false;

    /* Bullet 1: */
    /*  first test overlap in the {x,y,z}-directions */
    /*  find min, max of the triangle each direction, and test for overlap in */
    /*  that direction -- this is equivalent to testing a minimal AABB around */
    /*  the triangle against the AABB */
    if (minMaxTest(v0[0], v1[0], v2[0], halfSizeX)) return false;
    if (minMaxTest(v0[1], v1[1], v2[1], halfSizeY)) return false;
    if (minMaxTest(v0[2], v1[2], v2[2], halfSizeZ)) return false;

    /* Bullet 2: */
    /*  test if the box intersects the plane of the triangle */
    /*  compute plane equation of triangle: normal*x+d=0 */

    vec3.cross(normal, e0, e1);
    if (!planeBoxOverlap(normal, v0, halfSize)) return false;

    return true;
  }

  function axisTest(
    v00: number,
    v01: number,
    v10: number,
    v11: number,
    halfSize0: number,
    halfSize1: number,
    a: number,
    b: number,
    fa: number,
    fb: number,
  ) {
    let p0 = a * v00 + b * v01;
    let p1 = a * v10 + b * v11;
    let min: number, max: number;

    if (p0 < p1) {
      min = p0;
      max = p1;
    } else {
      min = p1;
      max = p0;
    }

    let rad = fa * halfSize0 + fb * halfSize1;
    return min > rad || max < -rad;
  }

  function minMaxTest(x0: number, x1: number, x2: number, value: number) {
    let min = x0,
      max = x0;

    if (x1 < min) min = x1;
    if (x1 > max) max = x1;

    if (x2 < min) min = x2;
    if (x2 > max) max = x2;

    return min > value || max < -value;
  }

  function planeBoxOverlap(normal: vec3, vert: vec3, maxBox: vec3) {
    let v: number;
    let vmin = vec3.create();
    let vmax = vec3.create();

    for (let q = 0; q < 3; ++q) {
      v = vert[q];
      if (normal[q] > 0.0) {
        vmin[q] = -maxBox[q] - v;
        vmax[q] = maxBox[q] - v;
      } else {
        vmin[q] = maxBox[q] - v;
        vmax[q] = -maxBox[q] - v;
      }
    }

    if (vec3.dot(normal, vmin) > 0.0) return false;
    if (vec3.dot(normal, vmax) >= 0.0) return true;
    return false;
  }
}
