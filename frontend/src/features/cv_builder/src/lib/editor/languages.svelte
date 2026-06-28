<script lang="ts">
  import { addCard, data } from "$lib/state/index.svelte";
  import Delete from "./delete.svelte";
  import { cvT } from "$lib/i18n/cvTranslate.svelte";

  const add = () => addCard("languages");
</script>

{#snippet langCard(index: number)}
  <div class="relative grid-(~ cols-2 gap5)">
    <Delete {index} type="languages" />

    <label for="lang-name-{index}">{cvT('cv.forms.languages.name')}</label>
    <label for="lang-level-{index}">{cvT('cv.forms.languages.level')}</label>

    <input
      id="lang-name-{index}"
      type="text"
      placeholder={cvT('cv.forms.placeholders.languageExample')}
      class="input"
      bind:value={data.languages[index].name}
    />

    <input
      id="lang-level-{index}"
      type="text"
      placeholder={cvT('cv.forms.placeholders.languageLevel')}
      class="input"
      bind:value={data.languages[index].level}
    />
  </div>
{/snippet}

<div class="grid gap5">
  <strong class="frow">
    <i class="i-material-symbols:translate"></i> {cvT('cv.forms.steps.languages')}
  </strong>

  {#each data.languages as _, index}
    {@render langCard(index)}
  {/each}

  <button type="button" class="quickcv-add-btn ml-auto" onclick={add}>{cvT('cv.forms.languages.add')}</button>
</div>
