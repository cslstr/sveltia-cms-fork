<script>
  import { Alert, Button, Dialog, TextArea, Toast } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import { siteConfig } from '$lib/services/config';
  import { fetchLatestRelease, createRelease } from '$lib/services/deployment/github-releases';
  import { incrementVersion, generateReleaseName, generateReleaseNotes } from '$lib/services/deployment/version-manager';
  import VersionDisplay from './version-display.svelte';
  import ReleaseTypeButtons from './release-type-buttons.svelte';

  /**
   * @typedef {object} Props
   * @property {boolean} open - Whether the modal is open
   */

  /** @type {Props} */
  let {
    open = $bindable(false)
  } = $props();

  let currentVersion = $state('v0.0.0');
  let selectedReleaseType = $state('');
  let releaseNotes = $state('');
  let isLoading = $state(false);
  let toastMessage = $state('');
  let showToast = $state(false);
  let toastStatus = $state('success');

  const modalIntro = $derived(
    $siteConfig?.deployment?.modal_intro || 
    'Make and save all the changes you desire to the site, then use the buttons below to deploy a release update to the live site.'
  );

  const loadCurrentVersion = async () => {
    try {
      const release = await fetchLatestRelease();
      currentVersion = release.tag_name;
    } catch (error) {
      console.error('Failed to fetch current version:', error);
      currentVersion = 'v0.0.0';
    }
  };

  const handleDeploy = async () => {
    if (!selectedReleaseType) return;

    isLoading = true;
    try {
      const newVersion = incrementVersion(currentVersion, selectedReleaseType);
      const releaseName = generateReleaseName(newVersion, selectedReleaseType);
      const targetBranch = $siteConfig?.backend?.branch || 'main';
      
      // Use release notes with config and custom notes
      const finalReleaseNotes = generateReleaseNotes(selectedReleaseType, $siteConfig, releaseNotes);

      await createRelease(newVersion, releaseName, finalReleaseNotes, targetBranch);

      toastMessage = $_('deployment.release_created', { values: { version: newVersion } });
      toastStatus = 'success';
      showToast = true;
      
      // Reset form
      selectedReleaseType = '';
      releaseNotes = '';
      currentVersion = newVersion;
      open = false;
    } catch (error) {
      console.error('Failed to create release:', error);
      toastMessage = $_('deployment.release_failed');
      toastStatus = 'error';
      showToast = true;
    } finally {
      isLoading = false;
    }
  };

  // Load version when modal opens
  $effect(() => {
    if (open) {
      loadCurrentVersion();
      // Reset form when opening
      selectedReleaseType = '';
      releaseNotes = '';
    }
  });

</script>

<Dialog
  title={$_('deployment.title')}
  size="large"
  bind:open
  showOk={false}
  showCancel={false}
  showClose={true}
>
  <div class="deploy-content">
    <p class="intro">{modalIntro}</p>
    
    <VersionDisplay {currentVersion} {selectedReleaseType} />
    
    <div class="release-section">
      <h3>{$_('deployment.select_release_type')}</h3>
      <ReleaseTypeButtons 
        bind:selectedType={selectedReleaseType}
        {currentVersion}
      />
    </div>

    <div class="notes-section">
      <label for="release-notes">{$_('deployment.release_notes_optional')}</label>
      <TextArea
        id="release-notes"
        bind:value={releaseNotes}
        placeholder={$_('deployment.release_notes_placeholder')}
        rows={3}
      />
    </div>

    <div class="actions">
      <Button
        variant="secondary"
        label={$_('back')}
        disabled={isLoading}
        onclick={() => { open = false; }}
      />
      <Button
        variant="primary"
        label={isLoading ? $_('deployment.creating_release') : $_('deploy_changes')}
        disabled={!selectedReleaseType || isLoading}
        onclick={handleDeploy}
      />
    </div>
  </div>
</Dialog>

<Toast bind:show={showToast}>
  <Alert status={toastStatus}>{toastMessage}</Alert>
</Toast>

<style>
  .deploy-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .intro {
    margin: 0;
    color: var(--sui-secondary-foreground-color);
    line-height: 1.5;
  }

  .release-section h3,
  .notes-section label {
    margin: 0 0 0.75rem 0;
    font-weight: 600;
    color: var(--sui-primary-foreground-color);
  }

  .notes-section label {
    display: block;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--sui-secondary-border-color);
  }

  @media (max-width: 768px) {
    .actions {
      flex-direction: column-reverse;
    }
  }
</style>