<script lang="ts">
  import {
    computeMobileFitScale,
    effectiveViewScale,
    getIsMobileViewport,
    setMobileFitScale,
  } from '$lib/state/viewport.svelte';
  import { ui } from '$lib/state/index.svelte';
  import { cvT } from '$lib/i18n/cvTranslate.svelte';

  let {
    children,
    class: className = '',
    showMobileLabel = false,
  }: {
    children?: import('svelte').Snippet;
    class?: string;
    showMobileLabel?: boolean;
  } = $props();

  let scrollEl = $state<HTMLDivElement | null>(null);

  const scale = $derived(effectiveViewScale());

  $effect(() => {
    const el = scrollEl;
    if (!el) return;

    const update = () => {
      setMobileFitScale(computeMobileFitScale(el.clientWidth));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  });
</script>

<div
  bind:this={scrollEl}
  class={`quickcv-preview-scroll quickcv-paper-surface h-full min-h-0 min-w-0 overflow-x-hidden overflow-y-auto flex flex-col items-center scrollbar ${className}`}
  dir="ltr"
>
  {#if showMobileLabel && getIsMobileViewport() && ui.mode === 'split'}
    <div class="quickcv-mobile-preview-bar" aria-live="polite">
      <span class="quickcv-mobile-preview-bar__dot" aria-hidden="true"></span>
      <span class="quickcv-mobile-preview-bar__label">{cvT('cv.forms.mobile.livePreview')}</span>
    </div>
  {/if}

  <div class="quickcv-preview-stage flex w-full flex-1 justify-center items-start pt3 pb4">
    <div class="doc max-w-full min-w-0" id="resume" dir="ltr" style={`scale: ${scale}%`}>
      {@render children?.()}
    </div>
  </div>
</div>
