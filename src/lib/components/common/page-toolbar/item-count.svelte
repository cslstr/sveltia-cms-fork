<script>
  import { _ } from 'svelte-i18n';

  /**
   * @import { Writable } from 'svelte/store';
   * @import { Asset, Entry, EntryCollection, FilteringConditions } from '$lib/types/private';
   */

  /**
   * @typedef {object} Props
   * @property {({ name: string, entries: Entry[] }[] | Record<string, Asset[]>)} groups - Entry groups or asset groups
   * @property {FilteringConditions[] | FilteringConditions | undefined} activeFilters - Currently active filters
   * @property {EntryCollection | undefined} collection - Collection configuration (for entry lists)
   * @property {'entries' | 'assets'} type - Type of items being counted
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    groups,
    activeFilters,
    collection,
    type,
    /* eslint-enable prefer-const */
  } = $props();

  /**
   * Get the total count of items across all groups
   */
  const totalCount = $derived(() => {
    if (!groups) return 0;
    
    if (type === 'entries') {
      // Entry groups: Array of { name: string, entries: Entry[] }
      return Array.isArray(groups)
        ? groups.reduce((total, group) => total + (group.entries?.length || 0), 0)
        : 0;
    } else {
      // Asset groups: Record<string, Asset[]>
      return typeof groups === 'object' && !Array.isArray(groups)
        ? Object.values(groups).reduce((total, group) => total + (Array.isArray(group) ? group.length : 0), 0)
        : 0;
    }
  });

  /**
   * Check if any filters are currently active
   */
  const hasActiveFilters = $derived(
    type === 'entries'
      ? Array.isArray(activeFilters) && activeFilters.length > 0
      : activeFilters && activeFilters.field && activeFilters.pattern
  );

  /**
   * Get filter labels for display
   */
  const getFilterLabels = () => {
    if (!hasActiveFilters) return [];

    if (type === 'entries' && Array.isArray(activeFilters) && collection?.view_filters) {
      return activeFilters.map(filter => {
        const configFilter = collection.view_filters.find(
          vf => vf.field === filter.field && String(vf.pattern) === String(filter.pattern)
        );
        return configFilter?.label || `${filter.field}: ${filter.pattern}`;
      });
    }

    if (type === 'assets' && activeFilters?.field === 'fileType') {
      // Map asset file types to readable labels
      const typeLabels = {
        image: $_('image'),
        video: $_('video'),
        audio: $_('audio'),
        document: $_('document'),
        other: $_('other')
      };
      return [typeLabels[activeFilters.pattern] || activeFilters.pattern];
    }

    return [];
  };

  /**
   * Generate the display text for the item count
   */
  const displayText = $derived(() => {
    const count = totalCount();
    const hasFilters = hasActiveFilters;
    
    if (count === 0) {
      return type === 'entries' ? $_('no_entries') : $_('no_assets');
    }

    if (!hasFilters) {
      return type === 'entries'
        ? $_('x_entries_displayed', { values: { count } })
        : $_('x_assets_displayed', { values: { count } });
    }

    const filterLabels = getFilterLabels();
    
    if (filterLabels.length === 1) {
      // Single specific filter
      return type === 'entries'
        ? $_('x_entries_matching_filter_named', { values: { count, filter: filterLabels[0] } })
        : $_('x_assets_matching_filter_named', { values: { count, filter: filterLabels[0] } });
    } else if (filterLabels.length > 1) {
      // Multiple specific filters
      const filterText = filterLabels.join($_('and_separator', { default: ' and ' }));
      return type === 'entries'
        ? $_('x_entries_matching_filters_named', { values: { count, filters: filterText } })
        : $_('x_assets_matching_filters_named', { values: { count, filters: filterText } });
    } else {
      // Generic filter message
      return type === 'entries'
        ? $_('x_entries_matching_filter', { values: { count } })
        : $_('x_assets_matching_filter', { values: { count } });
    }
  });
</script>

{#if totalCount() > 0 || hasActiveFilters}
  <span role="none" class="item-count">
    {displayText()}
  </span>
{/if}

<style lang="scss">
  .item-count {
    color: var(--sui-secondary-foreground-color);
    font-size: var(--sui-font-size-small);
    white-space: nowrap;
  }
</style>