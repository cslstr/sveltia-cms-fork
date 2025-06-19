<script>
  import { Button, Checkbox, Divider, Icon, Spacer, Toolbar } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import FilterMenu from '$lib/components/common/page-toolbar/filter-menu.svelte';
  import ItemCount from '$lib/components/common/page-toolbar/item-count.svelte';
  import ItemSelector from '$lib/components/common/page-toolbar/item-selector.svelte';
  import SortMenu from '$lib/components/common/page-toolbar/sort-menu.svelte';
  import ViewSwitcher from '$lib/components/common/page-toolbar/view-switcher.svelte';
  import { ASSET_KINDS, selectedAssets } from '$lib/services/assets';
  import { getArtworkAssets } from '$lib/services/assets/artwork-usage';
  import { assetGroups, currentView, listedAssets, sortFields } from '$lib/services/assets/view';
  import { isMediumScreen, isSmallScreen } from '$lib/services/user/env';

  const hasListedAssets = $derived(!!$listedAssets.length);
  const hasMultipleAssets = $derived($listedAssets.length > 1);
  const hasArtworkAssets = $derived(getArtworkAssets().length > 0);
  const showUnusedFilter = $derived($currentView.filter?.field === 'unusedArtwork');
</script>

<Toolbar variant="secondary" aria-label={$_('asset_list')}>
  {#if !($isSmallScreen || $isMediumScreen)}
    <ItemSelector allItems={Object.values($assetGroups).flat(1)} selectedItems={selectedAssets} />
  {/if}
  <Spacer flex />
  <ItemCount
    groups={$assetGroups}
    activeFilters={$currentView.filter}
    type="assets"
  />
  <SortMenu
    disabled={!hasMultipleAssets}
    {currentView}
    fields={$sortFields}
    aria-controls="asset-list"
  />
  <FilterMenu
    label={$_('type')}
    disabled={!hasMultipleAssets}
    {currentView}
    noneLabel={$_('all')}
    filters={ASSET_KINDS.map((type) => ({ label: $_(type), field: 'fileType', pattern: type }))}
    aria-controls="asset-list"
  />
  {#if hasArtworkAssets}
    <Checkbox
      label={$_('show_unused_artwork')}
      checked={showUnusedFilter}
      disabled={!hasListedAssets}
      onChange={({ detail: { checked } }) => {
        currentView.update((view) => ({
          ...view,
          filter: checked ? { field: 'unusedArtwork', pattern: '' } : undefined,
        }));
      }}
    />
  {/if}
  <ViewSwitcher disabled={!hasListedAssets} {currentView} aria-controls="asset-list" />
  {#if !($isSmallScreen || $isMediumScreen)}
    <Divider orientation="vertical" />
    <Button
      variant="ghost"
      iconic
      disabled={!hasListedAssets}
      pressed={!!$currentView.showInfo}
      aria-controls="asset-info"
      aria-expanded={!!$currentView.showInfo}
      aria-label={$_($currentView.showInfo ? 'hide_info' : 'show_info')}
      onclick={() => {
        currentView.update((view) => ({
          ...view,
          showInfo: !$currentView.showInfo,
        }));
      }}
    >
      {#snippet startIcon()}
        <Icon name="info" />
      {/snippet}
    </Button>
  {/if}
</Toolbar>
