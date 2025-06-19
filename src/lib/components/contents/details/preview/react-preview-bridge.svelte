<!--
  @component
  Simple bridge to render JavaScript-based preview templates within Svelte
-->
<script>
  import { entryDraft } from '$lib/services/contents/draft';
  import { getMediaFieldURL, getMediaKind } from '$lib/services/assets';

  /**
   * @import { InternalLocaleCode } from '$lib/types/private';
   */

  /**
   * @typedef {object} Props
   * @property {InternalLocaleCode} locale Current pane's locale.
   * @property {Function} reactComponent React component to render.
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    locale,
    reactComponent,
    /* eslint-enable prefer-const */
  } = $props();

  /** @type {HTMLDivElement} */
  let containerElement;

  /**
   * Create an Immutable-like object for entry data
   * @param {any} data
   * @returns {any}
   */
  const createImmutableLike = (data) => {
    return {
      get: (key) => data?.[key],
      getIn: (path) => {
        if (!Array.isArray(path)) return data?.[path];
        let current = data;
        for (const key of path) {
          current = current?.[key];
          if (current === undefined) break;
        }
        return current;
      },
      toJS: () => data
    };
  };

  /**
   * Render the component
   */
  const renderComponent = async () => {
    // Check if container element exists and is still in the DOM
    if (!containerElement || !reactComponent) return;

    const draft = $entryDraft;
    if (!draft) {
      // Clear content if no draft
      if (containerElement) {
        containerElement.innerHTML = '';
      }
      return;
    }

    // Create entry-like object for the React component
    const entryData = draft.currentValues?.[locale] || {};
    const entry = createImmutableLike({
      data: createImmutableLike(entryData)
    });

    // Create props for the React component
    const props = {
      entry,
      locale,
      widgetFor: (fieldName) => entryData[fieldName] || '',
      widgetsFor: (fieldName) => ({
        data: createImmutableLike(entryData[fieldName] || {}),
        widgets: createImmutableLike({})
      }),
      getAsset: async (assetPath) => {
        // Use the CMS's proper asset resolution logic
        if (!assetPath) return '';
        
        // If it's already a full URL, return as-is
        if (assetPath.startsWith('http') || assetPath.startsWith('blob:')) {
          return assetPath;
        }
        
        // Use the same logic as the file preview component
        const entry = draft?.originalEntry;
        const collectionName = draft?.collectionName ?? '';
        const fileName = draft?.fileName;
        
        try {
          const resolvedUrl = await getMediaFieldURL({
            value: assetPath,
            entry,
            collectionName,
            fileName
          });
          return resolvedUrl || assetPath;
        } catch (error) {
          console.warn('Failed to resolve asset URL:', error);
          return assetPath;
        }
      },
      document: document,
      window: window
    };

    try {
      // Call the React component function (now async)
      const result = await reactComponent(props);
      
      // Double-check container still exists before setting innerHTML
      if (!containerElement) return;
      
      if (typeof result === 'string') {
        // It's HTML string
        containerElement.innerHTML = result;
      } else {
        // Try to render as HTML
        containerElement.innerHTML = '<p>Preview not available</p>';
      }
    } catch (error) {
      console.error('Error rendering preview component:', error);
      // Check container exists before setting error message
      if (containerElement) {
        containerElement.innerHTML = '<p>Error rendering preview</p>';
      }
    }
  };

  // Re-render when entry data changes
  $effect(() => {
    void [$entryDraft?.currentValues];
    renderComponent();
  });
</script>

<div bind:this={containerElement} class="react-preview-bridge">
  <!-- Component will be rendered here -->
</div>

<style>
  .react-preview-bridge {
    width: 100%;
  }
</style>