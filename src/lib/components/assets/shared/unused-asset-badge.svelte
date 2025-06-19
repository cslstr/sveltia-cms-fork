<script>
  import { _ } from 'svelte-i18n';

  /**
   * @typedef {object} Props
   * @property {'grid' | 'list'} variant Display variant for different views
   * @property {boolean} [show] Whether to show the badge
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    variant = 'grid',
    show = true,
    /* eslint-enable prefer-const */
  } = $props();
</script>

{#if show}
  <div 
    role="status" 
    class="unused-badge {variant}"
    aria-label={$_('unused_asset')}
    title={$_('unused_asset_tooltip')}
  >
    <span class="icon">⚠</span>
    <span class="text">{$_('unused')}</span>
  </div>
{/if}

<style lang="scss">
  .unused-badge {
    display: flex;
    align-items: center;
    gap: 2px;
    background-color: #fbbf24; /* Yellow-400 */
    color: #92400e; /* Yellow-800 */
    border-radius: 12px;
    font-size: 10px;
    font-weight: 600;
    line-height: 1;
    padding: 2px 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
    flex-shrink: 0;
    
    .icon {
      font-size: 8px;
    }
    
    .text {
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    
    &.grid {
      position: absolute;
      top: 4px;
      right: 4px;
      z-index: 10;
    }
    
    &.list {
      position: relative;
      /* No positioning needed - will be placed by flex layout */
    }
  }
</style>