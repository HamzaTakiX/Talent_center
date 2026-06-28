<script lang="ts">
  import icons from "$lib/icons";
  import { formatUrl, textAreaFormat } from "$lib/utils";
  import { data } from "$lib/state/index.svelte";
  import PreviewSectionAnnotation from "$lib/ai/PreviewSectionAnnotation.svelte";
  import { cvT } from "$lib/i18n/cvTranslate.svelte";

  let name = $derived(data.details?.name?.split(" "));
  let name2 = $derived(name?.slice(1))
</script>

{#snippet hicon(icon: string)}
  <span class={`flex p1.5 bg-secondary text-xl rounded-full`}>
    {@html icons[icon]}
  </span>
{/snippet}

<div class="cv-preview-block cv-preview-block--header" data-cv-preview-section="profile_summary">
  <PreviewSectionAnnotation sectionId="profile_summary" />
  <div class="frow mx-auto">
    <h1 class="text-4xl">{name?.[0]}</h1>
    <h1 class="text-primary text-4xl">{name2?.join(' ')}</h1>
  </div>
  <span class="text-(center xl) mb3 font-light">{data.details.role}</span>
  <div class="frow border-(t b solid fg) py3 text-sm justify-center [&>*]:gap2">
    <span class="frow">{@html icons.phone} {data.details.phone} </span>
    <span class="frow">{@html icons.mail} {data.details.email} </span>
    {#if data.details.website}
      <a class="frow" href={data.details.website} target="_blank"
        >{@html icons.globe} {formatUrl(data.details.website)}
      </a>
    {/if}
    <a
      class="frow"
      href={`https://github.com/${data.details.github}`}
      target="_blank"
      >{@html icons.github} @{data.details.github}
    </a>
  </div>
  <h2 class="frow mt4">{@render hicon("bullseye")}{cvT('cv.forms.personal.about')} :</h2>
  <p>{data.details.about}</p>
</div>

<div class="cv-preview-block" data-cv-preview-section="experience">
  <PreviewSectionAnnotation sectionId="experience" />
  <h2 class="frow">{@render hicon("briefcase")}{cvT('cv.forms.steps.experience')} :</h2>
  {#each data.workExp as work}
    <div class="frow flex-wrap gap-y-1 mb4">
      <span>
        <strong>{work.title} </strong>
        - {work.company}
      </span>
      <span class="ml-auto badge-surface-sm">
        {work.date}
      </span>
      <ul class="list-disc space-y-2 text-secondary-fg ml-2">
        {#each textAreaFormat(work?.desc) as x}
          <li class="ml-2">{x}.</li>
        {/each}
      </ul>
    </div>
  {/each}
</div>

<div class="cv-preview-block" data-cv-preview-section="education">
  <PreviewSectionAnnotation sectionId="education" />
  <h2 class="frow">{@render hicon("edu")}{cvT('cv.forms.steps.education')} :</h2>
  <div class="grid grid-cols-2 gap3">
    {#each data.education as edu}
      <div class="frow flex-wrap gap-y-1 mb4">
        <span>{edu.institution}</span>
        <span class="badge-secondary ml-auto">{edu.date}</span>
        <br />
        <span class="text-muted-fg w-full">{edu.qualification}</span>
      </div>
    {/each}
  </div>
</div>

<div class="cv-preview-block" data-cv-preview-section="languages">
  <PreviewSectionAnnotation sectionId="languages" />
  <h2 class="frow">{@render hicon("translate")}{cvT('cv.forms.steps.languages')} :</h2>
  <div class="frow flex-wrap mb4 mt2">
    {#each data.languages as lang}
      <span class="badge-secondary">
        {lang.name}{#if lang.level} · {lang.level}{/if}
      </span>
    {/each}
  </div>
</div>

<div class="cv-preview-block" data-cv-preview-section="skills">
  <PreviewSectionAnnotation sectionId="skills" />
  <h2 class="frow">{@render hicon("brain")}{cvT('cv.forms.steps.skills')} :</h2>
  <div class="frow flex-wrap mb4 mt2">
    {#each data.skills as x}
      <span class="badge-secondary">
        {#if x.icon}{@html x.icon}{/if}
        {x.name}
      </span>
    {/each}
  </div>
</div>

<div class="cv-preview-block" data-cv-preview-section="projects">
  <PreviewSectionAnnotation sectionId="projects" />
  <h2 class="frow">{@render hicon("opensource")}{cvT('cv.forms.steps.projects')} :</h2>
  {#if data.projects.length > 0}
    {#each data.projects as project}
      <div class="flex flex-wrap">
        <span class="badge-lg bg-fg text-primary-fg rounded-b-0">{project.name}</span>
        <a href={project.link} target="_blank" class="ml-auto">{cvT('cv.forms.common.link')}</a>
        <p class="brd-2-fg p3 rounded rounded-tl-0 w-full">{project.desc}</p>
      </div>
    {/each}
  {/if}
</div>
