import { derived, get } from 'svelte/store';
import { allAssets } from '$lib/services/assets';
import { getCollection } from '$lib/services/contents/collection';
import { getEntriesByCollection } from '$lib/services/contents/collection/entries';

/**
 * @import { Readable } from 'svelte/store';
 * @import { Asset, Entry } from '$lib/types/private';
 */

/**
 * Convert a public artwork path to internal asset path.
 * @param {string} publicPath Public path like "/artwork/paintings_42.jpg"
 * @returns {string} Internal path like "assets/artwork/paintings_42.jpg"
 */
export const convertPublicToInternalPath = (publicPath) => {
  if (!publicPath || typeof publicPath !== 'string') {
    return '';
  }
  
  // Handle paths that start with /artwork/
  if (publicPath.startsWith('/artwork/')) {
    return publicPath.replace('/artwork/', 'assets/artwork/');
  }
  
  // Handle paths that are just filenames
  if (!publicPath.includes('/')) {
    return `assets/artwork/${publicPath}`;
  }
  
  return publicPath;
};

/**
 * Convert an internal asset path to public artwork path.
 * @param {string} internalPath Internal path like "assets/artwork/paintings_42.jpg"
 * @returns {string} Public path like "/artwork/paintings_42.jpg"
 */
export const convertInternalToPublicPath = (internalPath) => {
  if (!internalPath || typeof internalPath !== 'string') {
    return '';
  }
  
  if (internalPath.startsWith('assets/artwork/')) {
    return internalPath.replace('assets/artwork/', '/artwork/');
  }
  
  return internalPath;
};

/**
 * Get all assets that are in the artwork folder.
 * @returns {Asset[]} Artwork assets
 */
export const getArtworkAssets = () => {
  return get(allAssets).filter(asset => 
    asset.path.startsWith('assets/artwork/')
  );
};

/**
 * Extract all image paths from artwork entries.
 * @returns {string[]} Array of internal asset paths used in artwork
 */
export const getArtworkImagePaths = () => {
  const artworkCollection = getCollection('artwork');
  
  if (!artworkCollection) {
    return [];
  }
  
  const artworkEntries = getEntriesByCollection('artwork');
  
  /** @type {string[]} */
  const usedImagePaths = [];
  
  artworkEntries.forEach(entry => {
    const { locales } = entry;
    const { defaultLocale } = artworkCollection._i18n;
    
    // Get the content for the default locale
    const locale = defaultLocale in locales ? defaultLocale : Object.keys(locales)[0];
    const content = locales[locale]?.content;
    
    if (content && content.image) {
      const internalPath = convertPublicToInternalPath(content.image);
      if (internalPath) {
        usedImagePaths.push(internalPath);
      }
    }
  });
  
  return [...new Set(usedImagePaths)]; // Remove duplicates
};

/**
 * Get all unused artwork assets.
 * @returns {Asset[]} Assets that are not used in any artwork entry
 */
export const getUnusedArtworkAssets = () => {
  const artworkAssets = getArtworkAssets();
  const usedImagePaths = getArtworkImagePaths();
  
  return artworkAssets.filter(asset => 
    !usedImagePaths.includes(asset.path)
  );
};

/**
 * Check if a specific asset is unused in artwork.
 * @param {Asset} asset Asset to check
 * @returns {boolean} True if the asset is unused
 */
export const isAssetUnusedInArtwork = (asset) => {
  if (!asset || !asset.path.startsWith('assets/artwork/')) {
    return false;
  }
  
  const usedImagePaths = getArtworkImagePaths();
  return !usedImagePaths.includes(asset.path);
};

/**
 * Reactive store for unused artwork assets.
 * @type {Readable<Asset[]>}
 */
export const unusedArtworkAssets = derived(
  [allAssets],
  () => getUnusedArtworkAssets()
);

/**
 * Reactive store for artwork asset usage map.
 * @type {Readable<Map<string, boolean>>}
 */
export const artworkAssetUsageMap = derived(
  [allAssets],
  () => {
    const usageMap = new Map();
    const artworkAssets = getArtworkAssets();
    const usedImagePaths = getArtworkImagePaths();
    
    artworkAssets.forEach(asset => {
      usageMap.set(asset.path, !usedImagePaths.includes(asset.path));
    });
    
    return usageMap;
  }
);