<script>
  import { sleep } from '@sveltia/utils/misc';
  import { _ } from 'svelte-i18n';
  import FieldPreview from '$lib/components/contents/details/preview/field-preview.svelte';
  import ReactPreviewBridge from '$lib/components/contents/details/preview/react-preview-bridge.svelte';
  import { entryDraft } from '$lib/services/contents/draft';
  import { getPreviewTemplate } from '$lib/services/contents/preview-templates.js';

  /**
   * @import { InternalLocaleCode } from '$lib/types/private';
   */

  /**
   * @typedef {object} Props
   * @property {InternalLocaleCode} locale Current pane's locale.
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    locale,
    /* eslint-enable prefer-const */
  } = $props();

  const fields = $derived($entryDraft?.fields ?? []);
  const collection = $derived($entryDraft?.collection);
  const previewTemplate = $derived(collection?.preview_template);
  const customPreviewComponent = $derived(
    previewTemplate ? getPreviewTemplate(previewTemplate) : null
  );
</script>

{#if customPreviewComponent}
  <!-- Use custom preview template via React bridge -->
  <ReactPreviewBridge {locale} reactComponent={customPreviewComponent} />
{:else}
  <!-- Use default field-by-field preview -->
  <div role="document" aria-label={$_('content_preview')}>
    {#each fields as fieldConfig (fieldConfig.name)}
      {#await sleep() then}
        <FieldPreview keyPath={fieldConfig.name} {locale} {fieldConfig} />
      {/await}
    {/each}
  </div>
{/if}

<style lang="scss">
  div {
    padding: 8px 16px;
  }
</style>
