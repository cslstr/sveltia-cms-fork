<script>
  import { Button } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import { siteConfig } from '$lib/services/config';

  /**
   * @typedef {object} Props
   * @property {string} selectedType - Currently selected release type
   * @property {string} currentVersion - Current version for preview
   */

  /** @type {Props} */
  let {
    selectedType = $bindable(''),
    currentVersion
  } = $props();

  const releaseTypes = $derived([
    {
      type: 'patch',
      icon: '🔧',
      label: $siteConfig?.deployment?.release_types?.patch?.label || $_('deployment.release_types.patch.label')
    },
    {
      type: 'minor',
      icon: '📝',
      label: $siteConfig?.deployment?.release_types?.minor?.label || $_('deployment.release_types.minor.label')
    },
    {
      type: 'major',
      icon: '🚀',
      label: $siteConfig?.deployment?.release_types?.major?.label || $_('deployment.release_types.major.label')
    }
  ]);

  const handleTypeSelect = (type) => {
    selectedType = selectedType === type ? '' : type;
  };
</script>

<div class="release-types">
  {#each releaseTypes as { type, icon, label }}
    <button
      class="release-type-card"
      class:selected={selectedType === type}
      onclick={() => handleTypeSelect(type)}
      type="button"
    >
      <div class="card-header">
        <span class="icon">{icon}</span>
        <h4 class="title">{label}</h4>
      </div>
    </button>
  {/each}
</div>

<style>
  .release-types {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .release-type-card {
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 2px solid var(--sui-secondary-border-color);
    border-radius: 8px;
    background: var(--sui-primary-background-color);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .release-type-card:hover {
    border-color: var(--sui-primary-accent-color);
    background: var(--sui-secondary-background-color);
  }

  .release-type-card.selected {
    border-color: var(--sui-primary-accent-color);
    background: var(--sui-accent-background-color);
    box-shadow: 0 0 0 1px var(--sui-primary-accent-color);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .icon {
    font-size: 1.5rem;
  }

  .title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--sui-primary-foreground-color);
  }
</style>