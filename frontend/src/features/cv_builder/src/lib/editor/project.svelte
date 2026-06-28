<script lang="ts">
  import { addCard, data } from "$lib/state/index.svelte";
  import Delete from "./delete.svelte";
  import { cvT } from "$lib/i18n/cvTranslate.svelte";

  const addProject = () => addCard("projects");
</script>

{#snippet projectCard(index: number)}
  <div class="relative grid-(~ cols-2 gap5)">
    <Delete {index} type="projects" />

    <label for="project-{index}">{cvT('cv.forms.projects.name')}</label>
    <label for="project-link-{index}">{cvT('cv.forms.projects.url')}</label>

    <input
      id="project-{index}"
      type="text"
      placeholder={cvT('cv.preview.placeholders.skill')}
      class="input"
      bind:value={data.projects[index].name}
    />

    <input
      id="project-link-{index}"
      placeholder={cvT('cv.forms.placeholders.projectLink')}
      class="input"
      bind:value={data.projects[index].link}
      type="url"
    />

    <label for="project-desc-{index}" class="col-span-2">{cvT('cv.forms.projects.description')}</label>
    <input
      id="project-desc-{index}"
      type="text"
      placeholder={cvT('cv.forms.placeholders.projectDesc')}
      class="col-span-2 input"
      bind:value={data.projects[index].desc}
    />
  </div>
{/snippet}

<div class="grid gap5">
  <strong class="frow">
    <i class="i-pajamas:project"></i> {cvT('cv.forms.steps.projects')}
  </strong>

  {#each data.projects as project, index}
    {#if index > 0}
      <hr class="w-full brd" />
    {/if}
    {@render projectCard(index)}
  {/each}

  <button type="button" class="quickcv-add-btn ml-auto" onclick={addProject}>{cvT('cv.forms.projects.add')}</button>
</div>
