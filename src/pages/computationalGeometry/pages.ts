import ConvexHull2DCompute from './ConvexHull2DCompute.svelte';
import ConvexHull2DAnimation from './ConvexHull2DAnimation.svelte';

function toUrl(path: string) {
  return `compuational-geometry/${path}`;
}

export default [
  {
    url: toUrl('convexhull2d-compute'),
    title: 'Convex Hull 2D - Compute',
    component: ConvexHull2DCompute,
  },
  {
    url: toUrl('convexhull2d-animation'),
    title: 'Convex Hull 2D - Animation',
    component: ConvexHull2DAnimation,
  },
];
