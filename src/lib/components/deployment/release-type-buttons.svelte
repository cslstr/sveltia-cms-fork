<script>
  import { Button } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';

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

  const releaseTypes = [
    {
      type: 'patch',
      icon: '🔧',
      label: $_('deployment.release_types.patch.label'),
      description: $_('deployment.release_types.patch.description'),
      example: $_('deployment.release_types.patch.example')
    },
    {
      type: 'minor',
      icon: '📝',
      label: $_('deployment.release_types.minor.label'),
      description: $_('deployment.release_types.minor.description'),
      example: $_('deployment.release_types.minor.example')
    },
    {
      type: 'major',
      icon: '🚀',
      label: $_('deployment.release_types.major.label'),
      description: $_('deployment.release_types.major.description'),
      example: $_('deployment.release_types.major.example')
    }
  ];

  const handleTypeSelect = (type) => {
    selectedType = selectedType === type ? '' : type;
  };
</script>

<div class="release-types">
  {#each releaseTypes as { type, icon, label, description, example }}
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
      <p class="description">{description}</p>
      <div class="example">
        <span class="example-label">Example:</span>
        <code class="version-example">{example}</code>
      </div>
    </button>
  {/each}
</div>

<style>
  .release-types {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }

  .release-type-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
    border: 2px solid var(--sui-secondary-border-color);
    border-radius: 12px;
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
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--sui-primary-foreground-color);
  }

  .description {
    margin: 0;
    color: var(--sui-secondary-foreground-color);
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .example {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  .example-label {
    color: var(--sui-secondary-foreground-color);
  }

  .version-example {
    padding: 0.25rem 0.5rem;
    background: var(--sui-secondary-background-color);
    border: 1px solid var(--sui-secondary-border-color);
    border-radius: 4px;
    font-family: var(--sui-font-family-mono);
    font-size: 0.8rem;
    color: var(--sui-primary-accent-color);
  }

  .release-type-card.selected .version-example {
    background: var(--sui-primary-background-color);
  }

  @media (max-width: 768px) {
    .release-types {
      grid-template-columns: 1fr;
    }
    
    .release-type-card {
      padding: 1rem;
    }
  }
</style>