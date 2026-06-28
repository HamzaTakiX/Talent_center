<script lang="ts">
  import Delete from "./delete.svelte";
  import { addCard, data } from "$lib/state/index.svelte";
  import { cvT } from "$lib/i18n/cvTranslate.svelte";

  const addWorkexp = () => addCard("workExp");
</script>

{#snippet card(index: number)}
  <div class="grid-(~ cols-2 gap5) relative">
    <Delete {index} type="workExp" />

    <label for="company-{index}" class="col-span-2">{cvT('cv.forms.experience.company')}</label>
    <input
      id="company-{index}"
      type="text"
      placeholder={cvT('cv.forms.placeholders.companyExample')}
      class="col-span-2 input"
      bind:value={data.workExp[index].company}
    />

    <label for="title-{index}">{cvT('cv.forms.experience.title')}</label>
    <label for="date-{index}">{cvT('cv.forms.common.date')}</label>

    <input
      id="title-{index}"
      type="text"
      class="input"
      placeholder={cvT('cv.preview.placeholders.jobTitle')}
      bind:value={data.workExp[index].title}
    />

    <input
      id="date-{index}"
      type="text"
      class="input"
      placeholder={cvT('cv.forms.placeholders.dateRange')}
      bind:value={data.workExp[index].date}
    />

    <label for="description-{index}" class="col-span-2">{cvT('cv.forms.experience.description')}</label>
    <textarea
      id="description-{index}"
      placeholder={cvT('cv.forms.placeholders.experienceDesc')}
      class="input col-span-2 min-h-[6rem]"
      bind:value={data.workExp[index].desc}
    ></textarea>
  </div>
{/snippet}

<div class="grid gap5">
  <strong class="frow">
    <i class="i-tabler:briefcase"></i> {cvT('cv.forms.steps.experience')}
  </strong>

  {#each data.workExp as work, index}
    {#if index > 0}
      <hr class="w-full brd" />
    {/if}

    {@render card(index)}
  {/each}

  <button type="button" class="quickcv-add-btn ml-auto" onclick={addWorkexp}>{cvT('cv.forms.experience.add')}</button>
</div>
