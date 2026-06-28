<script lang="ts">
  import { onMount } from 'svelte';
  import Ui from '$lib/ui/index.svelte';
  import Default from '$lib/templates/default.svelte';
  import Minimal from '$lib/templates/minimal.svelte';
  import Tile from '$lib/templates/tile.svelte';
  import { demoState, ui } from '$lib/state/index.svelte';
  import { generatePDF } from '$lib/utils';
  import { runPremiumCvAnalysis, initCvAiSectionFocusListener } from '$lib/ai/runAnalysis';
  import { initViewportListeners } from '$lib/state/viewport.svelte';
  import { initCvI18n, getCvI18nTick } from '$lib/i18n/cvTranslate.svelte';
  import {
    loadCvDraft,
    saveCvDraft,
    hasUserCvContent,
    markCvDraftAutosaveReady,
    scheduleCvDraftAutosave,
  } from '$lib/state/cvDraftStorage';
  import { getCvSnapshot } from '$lib/state/index.svelte';

  const themes = {
    default: Default,
    minimal: Minimal,
    tile: Tile,
  } as const;

  type ThemeKey = keyof typeof themes;

  let themeKey = $state<ThemeKey>('default');
  let rootEl = $state<HTMLDivElement | null>(null);

  const Component = $derived(themes[themeKey] ?? Default);

  const syncSplitOverflow = () => {
    rootEl?.classList.toggle('quickcv-root--split', ui.mode === 'split');
  };

  const onMode = (e: Event) => {
    const detail = (e as CustomEvent<'split' | 'tab'>).detail;
    if (detail === 'split' || detail === 'tab') ui.mode = detail;
  };

  const onScale = (e: Event) => {
    const detail = (e as CustomEvent<number>).detail;
    if (typeof detail === 'number') ui.viewScale = detail;
  };

  const onDemo = (e: Event) => {
    const fill = (e as CustomEvent<{ fill: boolean }>).detail?.fill;
    demoState[fill ? 'fill' : 'empty']();
  };

  const onDownload = () => generatePDF();

  const onAnalyze = () => {
    void runPremiumCvAnalysis();
  };

  const onSave = () => {
    const ok = saveCvDraft();
    window.dispatchEvent(new CustomEvent('quickcv:save-done', { detail: { ok } }));
  };

  $effect(() => {
    syncSplitOverflow();
  });

  $effect(() => {
    getCvSnapshot();
    scheduleCvDraftAutosave();
  });

  onMount(() => {
    const removeViewport = initViewportListeners();
    const removeI18n = initCvI18n();
    const fromUrl = new URLSearchParams(window.location.search).get('theme');
    if (fromUrl && fromUrl in themes) {
      themeKey = fromUrl as ThemeKey;
    }
    const hadDraft = loadCvDraft();
    if (!hadDraft && !hasUserCvContent()) {
      demoState.fill();
    }
    markCvDraftAutosaveReady();
    rootEl?.classList.remove('dark');
    syncSplitOverflow();

    window.addEventListener('quickcv:mode', onMode);
    window.addEventListener('quickcv:viewScale', onScale);
    window.addEventListener('quickcv:demo', onDemo);
    window.addEventListener('quickcv:download', onDownload);
    window.addEventListener('quickcv:analyze', onAnalyze);
    window.addEventListener('quickcv:save', onSave);
    const removeFocusListener = initCvAiSectionFocusListener();

    return () => {
      removeViewport();
      removeI18n();
      removeFocusListener();
      window.removeEventListener('quickcv:mode', onMode);
      window.removeEventListener('quickcv:viewScale', onScale);
      window.removeEventListener('quickcv:demo', onDemo);
      window.removeEventListener('quickcv:download', onDownload);
      window.removeEventListener('quickcv:analyze', onAnalyze);
      window.removeEventListener('quickcv:save', onSave);
    };
  });
</script>

<div bind:this={rootEl} class="quickcv-root quickcv-admin flex h-full min-h-0 w-full flex-col">
  <div class="min-h-0 flex-1 overflow-hidden">
    {#key getCvI18nTick()}
      <Ui>
        <Component />
      </Ui>
    {/key}
  </div>
</div>
