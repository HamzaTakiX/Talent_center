<script lang="ts">
  import { addCard, data } from "$lib/state/index.svelte";
  import Delete from "./delete.svelte";
  import { cvT } from "$lib/i18n/cvTranslate.svelte";

  const addEducation = () => addCard("education");
</script>

{#snippet educationCard(index: number)}
  <div class="grid-(~ cols-2 gap5) relative">
    <Delete {index} type="education" />

    <label for="institution-{index}">{cvT('cv.forms.education.institution')}</label>
    <label for="edu-date-{index}">{cvT('cv.forms.common.date')}</label>

    <input
      id="institution-{index}"
      type="text"
      placeholder={cvT('cv.forms.placeholders.institutionExample')}
      class="input"
      bind:value={data.education[index].institution}
    />

    <input
      id="edu-date-{index}"
      type="text"
      placeholder={cvT('cv.forms.placeholders.dateExample')}
      class="input"
      bind:value={data.education[index].date}
    />

    <label for="qualification-{index}" class="col-span-2">{cvT('cv.forms.education.degree')}</label>
    <input
      id="qualification-{index}"
      type="text"
      placeholder={cvT('cv.forms.placeholders.qualificationExample')}
      class="col-span-2 input"
      bind:value={data.education[index].qualification}
    />
  </div>
{/snippet}

<div class="grid gap5">
  <strong class="frow">
    <i class="i-qlementine-icons:education-16"></i> {cvT('cv.forms.steps.education')}
  </strong>

  {#each data.education as edu, index}
    {#if index > 0}
      <hr class="w-full brd" />
    {/if}
    {@render educationCard(index)}
  {/each}

  <button type="button" class="quickcv-add-btn ml-auto" onclick={addEducation}>{cvT('cv.forms.education.add')}</button>
</div>
