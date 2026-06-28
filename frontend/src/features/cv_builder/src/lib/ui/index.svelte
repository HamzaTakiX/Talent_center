<script lang="ts">
  import Editor from '../editor/index.svelte';
  import PreviewPanel from './PreviewPanel.svelte';
  import { ui } from '$lib/state/index.svelte';
  import { getIsMobileViewport } from '$lib/state/viewport.svelte';
  import { Tab, Tabs, TabsContent, TabsList } from '@haze-ui/svelte';
  import { cvT } from '$lib/i18n/cvTranslate.svelte';

  let { children } = $props();
</script>

{#if ui.mode == 'split'}
  <div
    class="quickcv-split h-full min-h-0"
    class:quickcv-split--mobile={getIsMobileViewport()}
  >
    <div class="quickcv-editor-scroll scrollbar">
      <Editor />
    </div>

    <PreviewPanel showMobileLabel>
      {@render children?.()}
    </PreviewPanel>
  </div>
{:else}
  <div class="quickcv-tab-layout grid gap3 justify-center py4 sm:py10 h-full min-h-0">
    <Tabs class="quickcv-tab-layout__tabs flex h-full min-h-0 flex-col">
      <TabsList
        class="quickcv-tabs-list mx-auto !bg-bg bg-muted tabon-(!bg-secondary) shrink-0"
      >
        <Tab value="editor"><i class="i-fa-regular:edit"></i> {cvT('cv.forms.mobile.editorTab')}</Tab>
        <Tab value="viewer"><i class="i-fluent:eye-28-regular"></i> {cvT('cv.forms.mobile.viewerTab')}</Tab>
      </TabsList>

      <TabsContent value="editor" class="quickcv-tabs-editor max-w-[1000px] min-h-0 flex-1 overflow-y-auto scrollbar">
        <Editor />
      </TabsContent>

      <TabsContent value="viewer" class="quickcv-tabs-viewer min-h-0 flex-1 overflow-hidden p0">
        <PreviewPanel class="h-full !pt0">
          {@render children?.()}
        </PreviewPanel>
      </TabsContent>
    </Tabs>
  </div>
{/if}
