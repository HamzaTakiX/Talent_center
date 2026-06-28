<script lang="ts">
  import { addCard, data } from "$lib/state/index.svelte";
  import Delete from "./delete.svelte";
  import { cvT } from "$lib/i18n/cvTranslate.svelte";

  const add = () => addCard("skills");
</script>

{#snippet projectCard(index: number)}
  <div class="relative grid-(~ cols-2 gap5)">
    <Delete {index} type="skills" />

    <label for="skill-{index}">{cvT('cv.forms.skills.name')}</label>
    <label for="skill-icon-{index}">{cvT('cv.forms.skills.iconUrl')}</label>

    <input
      id="skill-{index}"
      type="text"
      placeholder={cvT('cv.preview.placeholders.skill')}
      class="input"
      bind:value={data.skills[index].name}
    />

    <input
      id="skill-icon-{index}"
      type="text"
      placeholder={cvT('cv.forms.placeholders.skillIcon')}
      class="input"
      bind:value={data.skills[index].icon}
    />
  </div>
{/snippet}

<div class="grid gap5">
  <strong class="frow">
    <i class="i-typcn:code-outline"></i> {cvT('cv.forms.steps.skills')}
  </strong>

  {#each data.skills as _, index}
    {@render projectCard(index)}
  {/each}

  <button type="button" class="quickcv-add-btn ml-auto" onclick={add}>{cvT('cv.forms.skills.add')}</button>
</div>
