import { stripSlashes } from '@sveltia/utils/string';
import { get, writable } from 'svelte/store';
import { siteConfig } from '$lib/services/config';
import { getFileConfig } from '$lib/services/contents/file';
import { getI18nConfig } from '$lib/services/contents/i18n';

/**
 * @import { Writable } from 'svelte/store';
 * @import {
 * CollectionType,
 * EntryCollection,
 * FileCollection,
 * InternalCollection,
 * InternalI18nOptions,
 * } from '$lib/types/private';
 * @import { Collection, CollectionFile, FieldKeyPath } from '$lib/types/public';
 */

/**
 * @type {Writable<InternalCollection | undefined>}
 */
export const selectedCollection = writable();

/**
 * @type {Map<string, InternalCollection | undefined>}
 */
export const collectionCacheMap = new Map();

/**
 * Get a list of field key paths to be used to find an entry thumbnail.
 * @param {Collection} rawCollection Raw collection definition.
 * @returns {FieldKeyPath[]} Key path list.
 */
const getThumbnailFieldNames = (rawCollection) => {
  const { folder, fields, thumbnail } = rawCollection;

  if (!folder) {
    return [];
  }

  if (typeof thumbnail === 'string') {
    return [thumbnail];
  }

  // Support multiple field names
  if (Array.isArray(thumbnail)) {
    return thumbnail;
  }

  // Collect the names of all non-nested Image/File fields for inference
  if (fields?.length) {
    return fields
      .filter(({ widget = 'string' }) => ['image', 'file'].includes(widget))
      .map(({ name }) => name);
  }

  return [];
};

/**
 * Parse an entry collection and add additional properties.
 * @param {Collection} rawCollection Raw collection definition.
 * @param {InternalI18nOptions} _i18n I18n options of the collection.
 * @returns {EntryCollection} Parsed entry collection with additional properties.
 */
const parseEntryCollection = (rawCollection, _i18n) => ({
  ...rawCollection,
  _i18n,
  _type: 'entry',
  _file: getFileConfig({ rawCollection, _i18n }),
  _thumbnailFieldNames: getThumbnailFieldNames(rawCollection),
});

/**
 * Parse a file collection and add additional properties.
 * @param {Collection} rawCollection Raw collection definition.
 * @param {InternalI18nOptions} _i18n I18n options of the collection.
 * @param {CollectionFile[]} files List of files in the collection.
 * @returns {FileCollection} Parsed file collection with additional properties.
 */
const parseFileCollection = (rawCollection, _i18n, files) => ({
  ...rawCollection,
  _i18n,
  _type: 'file',
  _fileMap: files?.length
    ? Object.fromEntries(
        files.map((file) => {
          const __i18n = getI18nConfig(rawCollection, file);
          const __file = getFileConfig({ rawCollection, file, _i18n: __i18n });

          return [file.name, { ...file, _file: __file, _i18n: __i18n }];
        }),
      )
    : {},
});

/**
 * Get a collection by name.
 * @param {string} name Collection name.
 * @returns {InternalCollection | undefined} Collection, including some extra, normalized
 * properties.
 */
export const getCollection = (name) => {
  const cache = collectionCacheMap.get(name);

  if (cache) {
    return cache;
  }

  const rawCollection = get(siteConfig)?.collections.find((c) => c.name === name);
  const isEntryCollection = typeof rawCollection?.folder === 'string';
  const isFileCollection = !isEntryCollection && Array.isArray(rawCollection?.files);

  // Ignore invalid collection
  if (!isEntryCollection && !isFileCollection) {
    collectionCacheMap.set(name, undefined);

    return undefined;
  }

  const { folder, files = [] } = rawCollection;

  // Normalize folder/file paths by removing leading/trailing slashes
  if (isEntryCollection) {
    rawCollection.folder = stripSlashes(/** @type {string} */ (folder));
  } else {
    files.forEach((f) => {
      f.file = stripSlashes(f.file);
    });
  }

  const _i18n = getI18nConfig(rawCollection);

  const collection = isEntryCollection
    ? parseEntryCollection(rawCollection, _i18n)
    : parseFileCollection(rawCollection, _i18n, files);

  collectionCacheMap.set(name, collection);

  return collection;
};

/**
 * Get the index of a collection with the given name.
 * @param {string | undefined} collectionName Collection name.
 * @returns {number} Index.
 */
export const getCollectionIndex = (collectionName) => {
  if (collectionName) {
    return get(siteConfig)?.collections.findIndex(({ name }) => name === collectionName) ?? -1;
  }

  return -1;
};

/**
 * Get the first visible entry collection or file collection in the collection list.
 * @returns {Collection | undefined} Found collection.
 */
export const getFirstCollection = () =>
  get(siteConfig)?.collections.find((c) => !c.hide && !c.divider);
