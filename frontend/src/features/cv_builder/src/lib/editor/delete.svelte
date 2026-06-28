<script lang="ts">
  import { deleteCard } from "$lib/state/index.svelte";
  import type { ListsData } from "$lib/state/types";
  import { cvT } from "$lib/i18n/cvTranslate.svelte";

  interface Props {
    index: number;
    type: ListsData;
  }

  let { index, type }: Props = $props();
</script>

<button
  class="absolute right-0 btn-soft-eqmd text-danger rounded-full"
  aria-label={cvT('cv.forms.common.delete')}
  onclick={() => deleteCard(type, index)}
>
  <i class="i-mi:delete"></i>
</button>
