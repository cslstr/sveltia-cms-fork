import { derived, writable } from 'svelte/store';
import { locale as appLocale } from 'svelte-i18n';
import { allAssets } from '$lib/services/assets';
import { allEntries } from '$lib/services/contents';
import { getFilesByEntry } from '$lib/services/contents/collection/files';
import { getAssociatedCollections } from '$lib/services/contents/entry';
import { getEntrySummary } from '$lib/services/contents/entry/summary';

/**
 * @import { Readable, Writable } from 'svelte/store';
 * @import { Asset, Entry } from '$lib/types/private';
 */

/**
 * @type {Writable<'entries' | 'assets' | null>}
 */
export const searchMode = writable(null);

/**
 * @type {Writable<string>}
 */
export const searchTerms = writable('');

/**
 * Normalize the given string for search value comparison. Since `transliterate` is slow, we only
 * apply basic normalization.
 * @param {string} value Original value.
 * @returns {string} Normalized value.
 */
export const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();

/**
 * Hold entry search results for the current search terms.
 * @type {Readable<Entry[]>}
 * @todo Search relation fields.
 */
export const entrySearchResults = derived(
  // Include `appLocale` as a dependency because `getEntrySummary()` may return a localized label
  [allEntries, searchTerms, appLocale],
  ([_allEntries, _searchTerms], set) => {
    const terms = _searchTerms ? normalize(_searchTerms) : '';
    /**
     * Check if the given label matches the search terms.
     * @param {string} label Label.
     * @returns {boolean} Result.
     */
    const hasMatch = (label) => normalize(label).includes(terms);

    const entries = (() => {
      if (!_allEntries.length || !terms) {
        return [];
      }

      return _allEntries
        .map((entry) => {
          // Count the number of matches, weighting the collection name and title
          let points = 0;

          getAssociatedCollections(entry).forEach((collection) => {
            if (hasMatch(collection.label || collection.name)) {
              points += 10;
            }

            if (
              hasMatch(
                getEntrySummary(collection, entry, { useTemplate: true, allowMarkdown: true }),
              )
            ) {
              points += 10;
            }

            points += getFilesByEntry(collection, entry).filter((file) =>
              hasMatch(file.label || file.name),
            ).length;

            Object.values(entry.locales).forEach(({ content }) => {
              points += Object.values(content).filter(
                (value) =>
                  (typeof value === 'string' && !!value && hasMatch(value)) ||
                  (typeof value === 'number' && hasMatch(String(value))),
              ).length;
            });
          });

          return { entry, points };
        })
        .filter(({ points }) => points > 0)
        .sort((a, b) => b.points - a.points)
        .map((result) => result.entry);
    })();

    set(entries);
  },
);

/**
 * Hold asset search results for the current search terms.
 * @type {Readable<Asset[]>}
 */
export const assetSearchResults = derived(
  [allAssets, searchTerms],
  ([_allAssets, _searchTerms], set) => {
    const terms = _searchTerms ? normalize(_searchTerms) : '';

    const assets = (() => {
      if (!_allAssets.length || !terms) {
        return [];
      }

      return _allAssets.filter((asset) => normalize(asset.name).includes(terms));
    })();

    set(assets);
  },
);
