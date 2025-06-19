<script>
  import { Button } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import { backendName } from '$lib/services/backends';
  import { siteConfig } from '$lib/services/config';
  import DeployModal from '$lib/components/deployment/deploy-modal.svelte';
  import LocalModeModal from '$lib/components/deployment/local-mode-modal.svelte';

  let showDeployModal = $state(false);
  let showLocalModal = $state(false);

  const isGitHubBackend = $derived($backendName === 'github');
  const showButton = $derived(!!$backendName);

  const buttonLabel = $derived(
    isGitHubBackend
      ? $_('deploy_changes')
      : ($siteConfig?.deployment?.local_mode?.title || 'Deploy Not Available')
  );

  const handleDeployClick = () => {
    if (isGitHubBackend) {
      showDeployModal = true;
    } else {
      showLocalModal = true;
    }
  };
</script>

{#if showButton}
  <Button
    variant="secondary"
    label={buttonLabel}
    onclick={handleDeployClick}
  />

  <DeployModal bind:open={showDeployModal} />
  <LocalModeModal bind:open={showLocalModal} />
{/if}