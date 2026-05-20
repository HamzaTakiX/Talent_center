<script lang="ts">
  import Editor from "../editor/index.svelte";
  import { ui } from "$lib/state/index.svelte";
  import { Tab, Tabs, TabsContent, TabsList } from "@haze-ui/svelte";

  let { children } = $props();

</script>

{#if ui.mode == "split"}
  <div class="quickcv-split grid-(~ cols-2) h-full min-h-0">
    <div class="quickcv-editor-scroll scrollbar">
      <Editor />
    </div>

    <div
      class="quickcv-preview-scroll quickcv-paper-surface h-full min-h-0 min-w-0 overflow-x-hidden overflow-y-auto pt5 flex justify-center items-start scrollbar"
      dir="ltr"
    >
      <div
        class="doc max-w-full min-w-0"
        id="resume"
        dir="ltr"
        style={`scale: ${ui.viewScale}%`}
      >
        {@render children?.()}
      </div>
    </div>
  </div>
{:else}
  <div class={`grid gap3 justify-center py10`}>
    <Tabs>
      <TabsList class="quickcv-tabs-list mx-auto !bg-bg bg-muted tabon-(!bg-secondary)">
        <Tab value="editor"><i class="i-fa-regular:edit"></i>
          Editor</Tab>
        <Tab value="viewer">
          <i class="i-fluent:eye-28-regular"></i> Viewer</Tab>
      </TabsList>

      <TabsContent value="editor" class="quickcv-tabs-editor max-w-[1000px]">
        <Editor />
      </TabsContent>

      <TabsContent
        value="viewer"
        class="quickcv-tabs-viewer quickcv-paper-surface flex justify-center pt5"
      >
        <div
          class="doc max-w-full min-w-0"
          id="resume"
          dir="ltr"
          style={`scale: ${ui.viewScale}%`}
        >
          {@render children?.()}
        </div>
      </TabsContent>
    </Tabs>
  </div>
{/if}
