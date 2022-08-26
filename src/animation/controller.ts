export function createAnimationController({
  onStep,
}: {
  onStep: ({ frame }: { frame: number }) => void;
}) {
  let frame = 0;

  onStep({ frame });

  return {
    stepForward() {
      frame++;
      onStep({ frame });
    },
    stepBackward() {
      frame--;
      onStep({ frame });
    },
  };
}
