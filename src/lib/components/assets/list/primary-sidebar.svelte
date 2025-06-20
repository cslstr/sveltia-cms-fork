<script>
  import { Icon, Listbox, Option } from '@sveltia/ui';
  import { sleep } from '@sveltia/utils/misc';
  import equal from 'fast-deep-equal';
  import { _, locale as appLocale } from 'svelte-i18n';
  import QuickSearchBar from '$lib/components/global/toolbar/items/quick-search-bar.svelte';
  import DeployButton from '$lib/components/global/toolbar/items/deploy-button.svelte';
  import { goto } from '$lib/services/app/navigation';
  import {
    allAssetFolders,
    allAssets,
    getAssetsByFolder,
    selectedAssetFolder,
  } from '$lib/services/assets';
  import { getFolderLabelByCollection } from '$lib/services/assets/view';
  import { getCollection, getCollectionIndex } from '$lib/services/contents/collection';
  import { getFileIndex } from '$lib/services/contents/collection/files';
  import { isSmallScreen } from '$lib/services/user/env';

  const numberFormatter = $derived(Intl.NumberFormat($appLocale ?? undefined));

  const folders = $derived([
    // All Assets, Global Assets, then collection-level, file-level folders, sorted by appearance
    // order in the config
    ...$allAssetFolders
      .sort(
        (a, b) =>
          getFileIndex(a.collectionName, a.fileName) - getFileIndex(b.collectionName, b.fileName),
      )
      .sort((a, b) => getCollectionIndex(a.collectionName) - getCollectionIndex(b.collectionName)),
  ]);
</script>

<div role="none" class="primary-sidebar">
  {#if $isSmallScreen}
    <h2>{$_('assets')}</h2>
    <div class="search-toolbar">
      <QuickSearchBar
        onclick={(event) => {
          event.preventDefault();
          goto('/search');
        }}
      />
      <DeployButton />
    </div>
  {/if}
  <Listbox aria-label={$_('asset_folder_list')} aria-controls="assets-container">
    {#each folders as folder ([folder.collectionName, folder.fileName, folder.internalPath].join(':'))}
      {#await sleep() then}
        {@const { collectionName, internalPath, entryRelative, hasTemplateTags } = folder}
        {@const collection = collectionName ? getCollection(collectionName) : undefined}
        <!-- Can’t upload assets if collection assets are saved at entry-relative paths -->
        {@const uploadDisabled = entryRelative || hasTemplateTags}
        {@const selected = equal($selectedAssetFolder, folder)}
        <Option
          selected={$isSmallScreen ? false : selected}
          label={$appLocale ? getFolderLabelByCollection(folder) : ''}
          onSelect={() => {
            goto(`/assets/${internalPath ?? '-/all'}`, {
              transitionType: 'forwards',
              // An internal path can be shared by multiple collections, files and fields. Pass the
              // folder info as history state so we can distinguish these different asset folders
              // while keeping the URL clean.
              state: { folder },
            });
          }}
          ondragover={(event) => {
            event.preventDefault();

            if (uploadDisabled) {
              return;
            }

            if (internalPath === undefined || selected) {
              /** @type {DataTransfer} */ (event.dataTransfer).dropEffect = 'none';
            } else {
              /** @type {DataTransfer} */ (event.dataTransfer).dropEffect = 'move';
              /** @type {HTMLElement} */ (event.target).classList.add('dragover');
            }
          }}
          ondragleave={(event) => {
            event.preventDefault();

            if (uploadDisabled) {
              return;
            }

            /** @type {HTMLElement} */ (event.target).classList.remove('dragover');
          }}
          ondragend={(event) => {
            event.preventDefault();

            if (uploadDisabled) {
              return;
            }

            /** @type {HTMLElement} */ (event.target).classList.remove('dragover');
          }}
          ondrop={(event) => {
            event.preventDefault();

            if (uploadDisabled) {
              return;
            }

            /** @type {HTMLElement} */ (event.target).classList.remove('dragover');
            // @todo Move the assets while updating entries using the files, after showing a
            // confirmation dialog.
          }}
        >
          {#snippet startIcon()}
            <Icon name={collection?.icon || 'folder'} />
          {/snippet}
          {#snippet endIcon()}
            {#key $allAssets}
              {#await sleep() then}
                {@const count = (
                  internalPath !== undefined ? getAssetsByFolder(folder) : $allAssets
                ).length}
                <span
                  class="count"
                  aria-label="({$_(
                    count > 1 ? 'many_assets' : count === 1 ? 'one_asset' : 'no_assets',
                    { values: { count } },
                  )})"
                >
                  {numberFormatter.format(count)}
                </span>
              {/await}
            {/key}
          {/snippet}
        </Option>
      {/await}
    {/each}
  </Listbox>
</div>

<style>
  .search-toolbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .search-toolbar :global(.sui.search-bar) {
    flex: 1;
  }

  .search-toolbar :global(.sui.button) {
    flex-shrink: 0;
    width: auto;
    margin-inline: 12px !important;
  }
</style>

