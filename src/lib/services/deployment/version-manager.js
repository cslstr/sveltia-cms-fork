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
 * Generate default release notes based on release type
 * @param {'patch'|'minor'|'major'} releaseType - Type of release
 * @returns {string} Default release notes template
 */
export const generateDefaultReleaseNotes = (releaseType) => {
  const templates = {
    patch: `## Bug Fixes and Minor Improvements

- Fixed styling issues
- Corrected typos and content errors
- Minor performance improvements

This release includes non-content bug fixes and small improvements.`,
    
    minor: `## Content Updates

- Added new artwork and content
- Updated existing content and descriptions
- Enhanced visual elements

This release includes content updates and additions to the site.`,
    
    major: `## Major Site Update

- Significant new features and functionality
- Major design or structural changes
- Important updates to site architecture

This is a major release with significant changes to the site.`
  };
  
  return templates[releaseType] || '';
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