<script>
  import { _ } from 'svelte-i18n';
  import { previewNextVersion } from '$lib/services/deployment/version-manager';

  /**
   * @typedef {object} Props
   * @property {string} currentVersion - Current version string
   * @property {string} [selectedReleaseType] - Selected release type
   */

  /** @type {Props} */
  let {
    currentVersion,
    selectedReleaseType = ''
  } = $props();

  const nextVersion = $derived(previewNextVersion(currentVersion, selectedReleaseType));
  const showNextVersion = $derived(!!selectedReleaseType && nextVersion !== currentVersion);
</script>

<div class="version-display">
  <div class="current-version">
    <span class="label">{$_('deployment.current_version', { values: { version: currentVersion } })}</span>
  </div>
  
  {#if showNextVersion}
    <div class="next-version">
      <span class="arrow">→</span>
      <span class="label next">{$_('deployment.next_version', { values: { version: nextVersion } })}</span>
    </div>
  {/if}
</div>

<style>
  .version-display {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--sui-secondary-background-color);
    border: 1px solid var(--sui-secondary-border-color);
    border-radius: 8px;
    font-family: var(--sui-font-family-mono);
  }

  .current-version,
  .next-version {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .label {
    font-weight: 600;
    color: var(--sui-primary-foreground-color);
  }

  .label.next {
    color: var(--sui-primary-accent-color);
  }

  .arrow {
    font-size: 1.2rem;
    color: var(--sui-secondary-foreground-color);
  }

  @media (max-width: 768px) {
    .version-display {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    
    .arrow {
      transform: rotate(90deg);
    }
  }
</style>