<script>
  import { Alert, Button, Dialog, Icon } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import { siteConfig } from '$lib/services/config';

  /**
   * @typedef {object} Props
   * @property {boolean} open - Whether the modal is open
   */

  /** @type {Props} */
  let {
    open = $bindable(false)
  } = $props();

  const localModeTitle = $derived(
    $siteConfig?.deployment?.local_mode?.title || 'Deploy Not Available'
  );

  const localModeMessage = $derived(
    $siteConfig?.deployment?.local_mode?.message ||
    'You are working with a local repository. To deploy changes, please login via GitHub.'
  );

  // Sanitize message to only allow anchor tags with href and target attributes
  const sanitizedMessage = $derived(
    (() => {
      if (!localModeMessage) return '';
      
      // First escape all HTML
      let escaped = localModeMessage
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // Then convert back only safe anchor tags - handle malformed HTML with missing space
      return escaped.replace(
        /&lt;a\s+href=['"]([^'"]*?)\s*['"](?:\s*target=['"]([^'"]*?)['"])?&gt;(.*?)&lt;\/a&gt;/gi,
        (match, href, target, text) => {
          const targetAttr = target ? ` target="${target}"` : '';
          return `<a href="${href}"${targetAttr}>${text}</a>`;
        }
      );
    })()
  );
</script>

<Dialog
  title={localModeTitle}
  size="medium"
  bind:open
  showOk={false}
  showCancel={false}
  showClose={true}
>
  <div class="local-mode-content">
    <Alert status="info">
      Deployment features require a GitHub connection with proper authentication. 
    </Alert>
    <div class="message">
      <p>{@html sanitizedMessage}</p>
    </div>
    <div class="actions">
      <Button
        variant="primary"
        label={$_('back')}
        onclick={() => { open = false; }}
      />
    </div>
  </div>
</Dialog>

<style>
  .local-mode-content {
    display: flex;
    flex-direction: column;
    margin: 0px 50px;
    gap: 1.5rem;
    text-align: center;
  }

  .message p {
    margin: 0;
    color: var(--sui-secondary-foreground-color);
    line-height: 1.5;
  }

  .actions {
    display: flex;
    justify-content: center;
    padding-top: 1rem;
  }
</style>