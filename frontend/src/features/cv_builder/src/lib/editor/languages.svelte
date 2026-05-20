<script lang="ts">
  import { addCard, data } from "$lib/state/index.svelte";
  import Delete from "./delete.svelte";

  const add = () => addCard("languages");
</script>

{#snippet langCard(index: number)}
  <div class="relative grid-(~ cols-2 gap5)">
    <Delete {index} type="languages" />

    <label for="lang-name-{index}">Language</label>
    <label for="lang-level-{index}">Level</label>

    <input
      id="lang-name-{index}"
      type="text"
      placeholder="French, English…"
      class="input"
      bind:value={data.languages[index].name}
    />

    <input
      id="lang-level-{index}"
      type="text"
      placeholder="Native, B2, Professional…"
      class="input"
      bind:value={data.languages[index].level}
    />
  </div>
{/snippet}

<div class="grid gap5">
  <strong class="frow">
    <i class="i-material-symbols:translate"></i> Languages
  </strong>

  {#each data.languages as _, index}
    {@render langCard(index)}
  {/each}

  <button type="button" class="quickcv-add-btn ml-auto" onclick={add}>Add Language</button>
</div>
