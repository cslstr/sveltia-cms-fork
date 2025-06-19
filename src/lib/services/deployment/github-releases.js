import { get } from 'svelte/store';
import { backend } from '$lib/services/backends';
import { user } from '$lib/services/user';

/**
 * Fetch the latest release from GitHub
 * @returns {Promise<{tag_name: string, name: string}>}
 */
export const fetchLatestRelease = async () => {
  const { repository } = get(backend) ?? {};
  const { owner, repo } = repository ?? {};
  
  if (!owner || !repo) {
    throw new Error('Repository information not available');
  }

  const userToken = get(user)?.token;
  if (!userToken) {
    throw new Error('GitHub authentication token not available');
  }

  // Use existing GitHub API integration
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
    headers: {
      'Authorization': `token ${userToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      // No releases yet, return default
      return { tag_name: 'v0.0.0', name: 'Initial Release' };
    }
    throw new Error(`Failed to fetch latest release: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Create a new GitHub release
 * @param {string} tagName - The tag name (e.g., 'v1.2.3')
 * @param {string} name - Release name
 * @param {string} body - Release notes
 * @param {string} targetBranch - Target branch (from config)
 * @returns {Promise<object>}
 */
export const createRelease = async (tagName, name, body, targetBranch = 'main') => {
  const { repository } = get(backend) ?? {};
  const { owner, repo } = repository ?? {};
  
  if (!owner || !repo) {
    throw new Error('Repository information not available');
  }

  const userToken = get(user)?.token;
  if (!userToken) {
    throw new Error('GitHub authentication token not available');
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${userToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tag_name: tagName,
      target_commitish: targetBranch,
      name,
      body,
      draft: false,
      prerelease: false
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to create release: ${response.statusText}. ${errorData.message || ''}`);
  }

  return response.json();
};