<script lang="ts">
  import { onMount } from 'svelte';

  export let direction: 'vertical' | 'horizontal';

  let dragElement: HTMLDivElement;
  let prevSibling: HTMLElement;
  let nextSibling: HTMLElement;

  let x: number;
  let y: number;

  function getParentBoundingClientRect() {
    if (!dragElement.parentElement) {
      throw new Error('Resizer has no parent');
    }

    return dragElement.parentElement.getBoundingClientRect();
  }

  function handleMouseMove(e: MouseEvent) {
    const dx = e.clientX - x;
    const dy = e.clientY - y;

    switch (direction) {
      case 'vertical':
        const prevSiblingHeight = prevSibling.getBoundingClientRect().height;
        const h = ((prevSiblingHeight + dy) * 100) / getParentBoundingClientRect().height;
        prevSibling.style.height = `${h}%`;
        console.log('parent:', getParentBoundingClientRect().height);
        console.log('prev:', prevSiblingHeight);
        break;
      case 'horizontal': {
        const prevSiblingWidth = prevSibling.getBoundingClientRect().width;
        const w = ((prevSiblingWidth + dx) * 100) / getParentBoundingClientRect().width;
        prevSibling.style.width = `${w}%`;
        break;
      }
    }

    x = e.clientX;
    y = e.clientY;

    const cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    dragElement.style.cursor = cursor;
    document.body.style.cursor = cursor;

    prevSibling.style.userSelect = 'none';
    prevSibling.style.pointerEvents = 'none';

    nextSibling.style.userSelect = 'none';
    nextSibling.style.pointerEvents = 'none';
  }

  function handleMouseUp() {
    dragElement.style.removeProperty('cursor');
    document.body.style.removeProperty('cursor');

    prevSibling.style.removeProperty('user-select');
    prevSibling.style.removeProperty('pointer-events');

    nextSibling.style.removeProperty('user-select');
    nextSibling.style.removeProperty('pointer-events');

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }

  function handleMouseDown(e: MouseEvent) {
    x = e.clientX;
    y = e.clientY;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  onMount(() => {
    prevSibling = dragElement.previousElementSibling as HTMLElement;
    nextSibling = dragElement.nextElementSibling as HTMLElement;
    dragElement.addEventListener('mousedown', handleMouseDown);

    return () => {
      dragElement.removeEventListener('mousedown', handleMouseDown);
    };
  });
</script>

<style>
  .dragbar {
    background-color: #cbd5e0;
    z-index: 1;
    background-repeat: no-repeat;
    background-position: center;
  }

  .horizontal {
    cursor: ew-resize;
    height: 100%;
    width: 4px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='30'><path d='M5 0 v30' fill='none' stroke='black'/></svg>");
  }

  .vertical {
    background-color: #cbd5e0;
    cursor: ns-resize;
    height: 4px;
    width: 100%;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='30' height='10'><path d='M0 5 h30' fill='none' stroke='black'/></svg>");
  }
</style>

<div
  class="dragbar {direction === 'vertical' ? 'vertical' : 'horizontal'}"
  bind:this={dragElement}
/>
