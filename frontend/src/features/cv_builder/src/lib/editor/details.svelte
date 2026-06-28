<script lang="ts">
  import { Input } from "@haze-ui/svelte";
  import { data } from "$lib/state/index.svelte";
  import { cvT } from "$lib/i18n/cvTranslate.svelte";
</script>

<div class="quickcv-field-grid grid-(~ cols-2 gap5)" data-cv-section="contact">
  <strong class="frow">
    <i class="i-majesticons:user-line"></i> {cvT('cv.forms.steps.personal')}
  </strong>

  <label for="name" class="col-span-2">{cvT('cv.forms.personal.fullName')}</label>

  <input
    id="name"
    type="text"
    bind:value={data.details.name}
    placeholder={cvT('cv.preview.placeholders.fullName')}
    class="col-span-2 input"
  />

  <label for="about" class="col-span-2">{cvT('cv.forms.personal.about')}</label>

  <input
    id="about"
    type="text"
    placeholder={cvT('cv.forms.placeholders.about')}
    bind:value={data.details.about}
    class="col-span-2 input"
  />

  <label for="role" class="col-span-2">{cvT('cv.forms.personal.role')}</label>

  <input
    id="role"
    type="text"
    placeholder={cvT('cv.forms.placeholders.role')}
    bind:value={data.details.role}
    class="col-span-2 input"
  />

  <label for="email">{cvT('cv.forms.personal.email')}</label>
  <label for="phone">{cvT('cv.forms.personal.phone')}</label>

  <Input
    id="email"
    type="email"
    placeholder={cvT('cv.preview.placeholders.email')}
    iconL="i-line-md:email"
    bind:value={data.details.email}
  />
  <Input
    id="phone"
    type="text"
    placeholder={cvT('cv.preview.placeholders.phone')}
    iconL="i-line-md:phone"
    bind:value={data.details.phone}
  />

  <label for="location">{cvT('cv.forms.personal.location')}</label>
  <label for="website">{cvT('cv.forms.social.website')}</label>
  <Input
    id="location"
    iconL="i-tdesign:location-filled"
    type="text"
    placeholder={cvT('cv.preview.placeholders.location')}
    bind:value={data.details.location}
  />

  <Input
    id="website"
    type="url"
    placeholder={cvT('cv.preview.placeholders.website')}
    iconL='i-lucide:globe'
    bind:value={data.details.website}
  />

  <label for="github">{cvT('cv.forms.social.github')}</label>
  <label for="linkedin">{cvT('cv.forms.social.linkedin')}</label>

  <Input
    id="github"
    placeholder={cvT('cv.forms.placeholders.githubUrl')}
    iconL="i-mdi:github"
    bind:value={data.details.github}
  />
  <Input
    id="linkedin"
    type="text"
    placeholder={cvT('cv.forms.placeholders.linkedinUrl')}
    iconL="i-mdi:linkedin"
    bind:value={data.details.linkedin}
  />
</div>
