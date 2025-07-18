<script>
  import { Checkbox, GridCell, GridRow, TruncatedText } from '@sveltia/ui';
  import AssetPreview from '$lib/components/assets/shared/asset-preview.svelte';
  import UnusedAssetBadge from '$lib/components/assets/shared/unused-asset-badge.svelte';
  import { goto } from '$lib/services/app/navigation';
  import { canPreviewAsset, focusedAsset, selectedAssets } from '$lib/services/assets';
  import { isAssetUnusedInArtwork } from '$lib/services/assets/artwork-usage';
  import { listedAssets } from '$lib/services/assets/view';
  import { isMediumScreen, isSmallScreen } from '$lib/services/user/env';

  /**
   * @import { Asset, ViewType } from '$lib/types/private';
   */

  /**
   * @typedef {object} Props
   * @property {Asset} asset Asset.
   * @property {ViewType} viewType View type.
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    asset,
    viewType,
    /* eslint-enable prefer-const */
  } = $props();

  const { name, kind } = $derived(asset);
  const isUnused = $derived(isAssetUnusedInArtwork(asset));

  /**
   * Update the asset selection.
   * @param {boolean} selected Whether the current asset item is selected.
   */
  const updateSelection = (selected) => {
    selectedAssets.update((assets) => {
      const index = assets.indexOf(asset);

      if (selected && index === -1) {
        assets.push(asset);
      }

      if (!selected && index > -1) {
        assets.splice(index, 1);
      }

      return assets;
    });
  };
</script>

<!-- @todo Add support for drag to move. -->

<GridRow
  aria-rowindex={$listedAssets.indexOf(asset)}
  onChange={(event) => {
    updateSelection(event.detail.selected);
  }}
  onfocus={() => {
    $focusedAsset = asset;
  }}
  onclick={() => {
    if (($isSmallScreen || $isMediumScreen) && $focusedAsset && canPreviewAsset($focusedAsset)) {
      goto(`/assets/${$focusedAsset.path}`, { transitionType: 'forwards' });
    }
  }}
  ondblclick={() => {
    if ($focusedAsset && canPreviewAsset($focusedAsset)) {
      goto(`/assets/${$focusedAsset.path}`, { transitionType: 'forwards' });
    }
  }}
>
  {#if !($isSmallScreen || $isMediumScreen)}
    <GridCell class="checkbox">
      <Checkbox
        role="none"
        tabindex="-1"
        checked={$selectedAssets.includes(asset)}
        onChange={({ detail: { checked } }) => {
          updateSelection(checked);
        }}
      />
    </GridCell>
  {/if}
  <GridCell class="image">
    <div class="image-container">
      <AssetPreview
        {kind}
        {asset}
        variant={viewType === 'list' ? 'icon' : 'tile'}
        cover={$isSmallScreen}
        checkerboard={kind === 'image'}
      />
      {#if viewType === 'grid'}
        <UnusedAssetBadge
          variant="grid"
          show={isUnused}
        />
      {/if}
    </div>
  </GridCell>
  {#if !$isSmallScreen || viewType === 'list'}
    <GridCell class="title">
      <div role="none" class="label title-container">
        <TruncatedText lines={2}>
          {name}
        </TruncatedText>
        {#if viewType === 'list'}
          <UnusedAssetBadge
            variant="list"
            show={isUnused}
          />
        {/if}
      </div>
    </GridCell>
  {/if}
</GridRow>

<style lang="scss">
  .label {
    word-break: break-all;
    
    &.title-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
  }

  :global(.image) {
    .image-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
  }
</style>
