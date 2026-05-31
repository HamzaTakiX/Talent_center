<script lang="ts">
  import { cvAnalysis } from './analysisState.svelte';
  import { getPrimaryPreviewInsight } from '../../../../cv/utils/insightQuality';

  interface Props {
    sectionId: string;
  }

  let { sectionId }: Props = $props();

  const visible = $derived(cvAnalysis.phase === 'done');
  const insight = $derived(
    visible ? getPrimaryPreviewInsight(cvAnalysis.result, sectionId) : null
  );
  const isFocus = $derived(
    cvAnalysis.focusedSection === sectionId && visible
  );
</script>

{#if insight}
  <aside
    class="cv-preview-annotation cv-preview-annotation--stacked cv-preview-annotation--{insight.severity}"
    class:cv-preview-annotation--focus={isFocus}
    aria-label="Recruiter note"
    dir={insight.message.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr'}
  >
    <span class="cv-preview-annotation__marker" aria-hidden="true"></span>
    <p class="cv-preview-annotation__text">{insight.message}</p>
  </aside>
{/if}
