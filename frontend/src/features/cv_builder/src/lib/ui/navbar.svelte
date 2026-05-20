<script lang="ts">
  import { Btn, Tab, Tabs, TabsList } from "@haze-ui/svelte";
  import { generatePDF } from "$lib/utils";
  import Viewscale from "./viewscale.svelte";
  import { demoState, ui } from "$lib/state/index.svelte";

  let { toolbarOnly = false }: { embedded?: boolean; toolbarOnly?: boolean } = $props();

  const setActive = (x: string) => {
    ui.mode = x;
  };

  const handleDemo = (x: Event & { currentTarget: HTMLInputElement }) => {
    demoState[x.currentTarget.checked ? "fill" : "empty"]();
  };
</script>

{#if toolbarOnly}
  <div class="quickcv-toolbar">
    <Viewscale />

    <label for="demoswitch" class="brd frow p2 px3 rounded cursor-pointer text-sm">
      <input
        type="checkbox"
        class="checkbox-sm"
        id="demoswitch"
        onchange={handleDemo}
      />
      <span>Demo</span>
    </label>

    <div class="quickcv-admin-tabs">
    <Tabs value={ui.mode} setValue={setActive}>
      <TabsList class="p1 tab-(p2 px2 text-sm) tabon-(brd)">
        <Tab value="split">
          <i class="i-material-symbols:splitscreen-left"></i>
          Split
        </Tab>
        <Tab value="tab">
          <i class="i-gravity-ui:layout-tabs"></i>
          Tabbed
        </Tab>
      </TabsList>
    </Tabs>
    </div>

    <span class="quickcv-toolbar__spacer"></span>

    <Btn
      iconL="i-tabler:download"
      txt="Download"
      class="btn-primary"
      onclick={generatePDF}
    />
  </div>
{:else}
  <nav class="p3 brd frow items-center sticky top-0 z-10 bg-bg">
    <div class="frow">
      <i class="i-icon-park-solid:flashlamp bg-info text-xl"></i>
      <strong>Quick CV</strong>
    </div>
    <a href="/templates" class="mr-auto ml2">Templates</a>
    <Viewscale />
    <Btn iconL="i-tabler:download" txt="Download" class="btn-primary" onclick={generatePDF} />
  </nav>
{/if}
