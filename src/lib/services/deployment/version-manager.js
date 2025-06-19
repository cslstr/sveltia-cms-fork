/**
 * Parse semantic version string
 * @param {string} version - Version string (e.g., 'v1.2.3' or '1.2.3')
 * @returns {{major: number, minor: number, patch: number}}
 */
export const parseVersion = (version) => {
  const cleanVersion = version.replace(/^v/, '');
  const [major = 0, minor = 0, patch = 0] = cleanVersion.split('.').map(Number);
  return { major, minor, patch };
};

/**
 * Increment version based on release type
 * @param {string} currentVersion - Current version string
 * @param {'patch'|'minor'|'major'} releaseType - Type of release
 * @returns {string} New version string with 'v' prefix
 */
export const incrementVersion = (currentVersion, releaseType) => {
  const { major, minor, patch } = parseVersion(currentVersion);
  
  switch (releaseType) {
    case 'patch':
      return `v${major}.${minor}.${patch + 1}`;
    case 'minor':
      return `v${major}.${minor + 1}.0`;
    case 'major':
      return `v${major + 1}.0.0`;
    default:
      throw new Error(`Invalid release type: ${releaseType}`);
  }
};

/**
 * Generate release name based on version and type
 * @param {string} version - Version string
 * @param {'patch'|'minor'|'major'} releaseType - Type of release
 * @returns {string} Release name
 */
export const generateReleaseName = (version, releaseType) => {
  const typeLabels = {
    patch: 'Bug Fixes',
    minor: 'Content Update',
    major: 'Major Update'
  };
  
  return `${version} - ${typeLabels[releaseType]}`;
};

/**
 * Generate default release notes based on release type and config
 * @param {'patch'|'minor'|'major'} releaseType - Type of release
 * @param {any} [config] - Site configuration object
 * @param {string} [customNotes] - Optional custom notes to append
 * @returns {string} Release notes
 */
export const generateReleaseNotes = (releaseType, config = undefined, customNotes = '') => {
  // Get the configured release note for this type
  const configuredNote = config?.deployment?.release_types?.[releaseType]?.release_note;
  
  // Fallback templates if not configured
  const fallbackTemplates = {
    patch: 'Deployed non-content bug fixes - Gallery updated',
    minor: 'Deployed content updates - Gallery updated',
    major: 'Deployed major site updates - Gallery updated'
  };
  
  const baseNote = configuredNote || fallbackTemplates[releaseType] || '';
  
  // If there are custom notes, append them on a new line
  if (customNotes && customNotes.trim()) {
    return `${baseNote}\n\n${customNotes.trim()}`;
  }
  
  return baseNote;
};

/**
 * @deprecated Use generateReleaseNotes instead
 * @param {'patch'|'minor'|'major'} releaseType - Type of release
 * @returns {string} Default release notes template
 */
export const generateDefaultReleaseNotes = (releaseType) => {
  return generateReleaseNotes(releaseType);
};

/**
 * Preview the next version for a given release type
 * @param {string} currentVersion - Current version string
 * @param {'patch'|'minor'|'major'} releaseType - Type of release
 * @returns {string} Preview of next version
 */
export const previewNextVersion = (currentVersion, releaseType) => {
  if (!releaseType) return currentVersion;
  return incrementVersion(currentVersion, releaseType);
};