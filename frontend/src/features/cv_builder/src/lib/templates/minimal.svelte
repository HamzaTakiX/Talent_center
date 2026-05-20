<script lang="ts">
  import { formatUrl, textAreaFormat } from "$lib/utils";
  import { data } from "$lib/state/index.svelte";
  import PreviewSectionAnnotation from "$lib/ai/PreviewSectionAnnotation.svelte";
</script>

<div class="cv-preview-block cv-preview-block--header" data-cv-preview-section="profile_summary">
  <PreviewSectionAnnotation sectionId="profile_summary" />
  <h1 class="text-4xl">{data.details.name}</h1>
  <div class="frow mt--1">
    <span> {data.details.email} </span>|
    <span> {data.details.phone} </span>|
    <a href={data.details.website} target="_blank">{formatUrl(data.details.website)}</a>
    <a href={`https://github.com/${data.details.github}`} target="_blank">
      Github: @{data.details.github}
    </a>
  </div>
  <h2>Summary</h2>
  <hr class="brd-fg mt--2" />
  <p>{data.details.about}</p>
</div>

<div class="cv-preview-block" data-cv-preview-section="experience">
  <PreviewSectionAnnotation sectionId="experience" />
  <h2>Work Experience</h2>
  <hr class="brd-fg mt--2" />
  {#each data.workExp as work}
    <div>
      <div class="frow justify-between">
        <h3 class="text-xl font-semibold">{work.title}</h3>
        <span>{work.date}</span>
      </div>
      <p class="text-lg">{work.company}</p>
      <ul class="list-disc ml5">
        {#each textAreaFormat(work.desc) as line}
          <li>{line}</li>
        {/each}
      </ul>
    </div>
  {/each}
</div>

<div class="cv-preview-block" data-cv-preview-section="education">
  <PreviewSectionAnnotation sectionId="education" />
  <h2>Education</h2>
  <hr class="brd-fg mt--2" />
  {#each data.education as edu}
    <div>
      <div class="frow justify-between">
        <h3 class="text-xl font-semibold">{edu.institution}</h3>
        <span>{edu.date}</span>
      </div>
      <p class="text-lg">{edu.qualification}</p>
    </div>
  {/each}
</div>

<div class="cv-preview-block" data-cv-preview-section="skills">
  <PreviewSectionAnnotation sectionId="skills" />
  <h2>Skills</h2>
  <hr class="brd-fg mt--2" />
  <p>{data.skills.map((s) => s.name).join(", ")}</p>
</div>

<div class="cv-preview-block" data-cv-preview-section="projects">
  <PreviewSectionAnnotation sectionId="projects" />
  <h2>Projects</h2>
  <hr class="brd-fg mt--2" />
  {#if data.projects.length > 0}
    {#each data.projects as x}
      <div>
        <h4 class="frow">
          {x.name} <a class="ml-auto" href={x.link} target="_blank">Link</a>
        </h4>
        <p>{x.desc}</p>
      </div>
    {/each}
  {/if}
</div>
