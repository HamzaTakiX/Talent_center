<script lang="ts">
  import Details from "./details.svelte";
  import WorkExp from "./workexp.svelte";
  import Project from "./project.svelte";
  import Education from "./edu.svelte";
  import Skills from "./skills.svelte";
  import Languages from "./languages.svelte";
</script>

<div class="quickcv-form-sections">
  <section class="quickcv-form-card" data-cv-section="profile_summary">
    <Details />
  </section>
  <section class="quickcv-form-card" data-cv-section="skills">
    <Skills />
  </section>
  <section class="quickcv-form-card" data-cv-section="languages">
    <Languages />
  </section>
  <section class="quickcv-form-card" data-cv-section="experience">
    <WorkExp />
  </section>
  <section class="quickcv-form-card" data-cv-section="projects">
    <Project />
  </section>
  <section class="quickcv-form-card quickcv-form-card--last" data-cv-section="education">
    <Education />
  </section>
</div>
