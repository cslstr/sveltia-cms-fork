<script>
  import { Alert, Button, Dialog, Icon } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';

  /**
   * @typedef {object} Props
   * @property {boolean} open - Whether the modal is open
   */

  /** @type {Props} */
  let {
    open = $bindable(false)
  } = $props();
</script>

<Dialog
  title={$_('deployment.local_mode_title')}
  size="medium"
  bind:open
  showOk={false}
  showCancel={false}
  showClose={true}
>
  <div class="local-mode-content">
    <div class="icon-container">
      <Icon name="info" size="large" />
    </div>
    
    <div class="message">
      <p>{$_('deployment.local_mode_message')}</p>
    </div>

    <Alert status="info">
      <strong>Local Repository Mode</strong><br>
      Deployment features require a GitHub connection with proper authentication. 
      Please use the production site to access deployment functionality.
    </Alert>

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
    gap: 1.5rem;
    text-align: center;
  }

  .icon-container {
    display: flex;
    justify-content: center;
    color: var(--sui-primary-accent-color);
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