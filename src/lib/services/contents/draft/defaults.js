import { getDefaultValueMap as getBooleanFieldDefaultValueMap } from '$lib/services/contents/widgets/boolean/helper';
import { getDefaultValueMap as getCodeFieldDefaultValueMap } from '$lib/services/contents/widgets/code/helper';
import { getDefaultValueMap as getDateTimeFieldDefaultValueMap } from '$lib/services/contents/widgets/date-time/helper';
import { getDefaultValueMap as getHiddenFieldDefaultValueMap } from '$lib/services/contents/widgets/hidden/helper';
import { getDefaultValueMap as getKeyValueFieldDefaultValueMap } from '$lib/services/contents/widgets/key-value/helper';
import { getDefaultValueMap as getListFieldDefaultValueMap } from '$lib/services/contents/widgets/list/helper';
import { getDefaultValueMap as getMarkdownFieldDefaultValueMap } from '$lib/services/contents/widgets/markdown/helper';
import { getDefaultValueMap as getNumberFieldDefaultValueMap } from '$lib/services/contents/widgets/number/helper';
import { getDefaultValueMap as getObjectFieldDefaultValueMap } from '$lib/services/contents/widgets/object/helper';
import { getDefaultValueMap as getSelectFieldDefaultValueMap } from '$lib/services/contents/widgets/select/helper';

/**
 * @import {
 * FlattenedEntryContent,
 * GetDefaultValueMapFuncArgs,
 * InternalLocaleCode,
 * } from '$lib/types/private';
 * @import { Field, FieldKeyPath } from '$lib/types/public';
 */

/**
 * Map of functions to get default values for different field types.
 * @type {Record<string, (args: GetDefaultValueMapFuncArgs) => Record<FieldKeyPath, any>>}
 */
const GET_DEFAULT_VALUE_MAP_FUNCTIONS = {
  boolean: getBooleanFieldDefaultValueMap,
  code: getCodeFieldDefaultValueMap,
  datetime: getDateTimeFieldDefaultValueMap,
  hidden: getHiddenFieldDefaultValueMap,
  keyvalue: getKeyValueFieldDefaultValueMap,
  list: getListFieldDefaultValueMap,
  markdown: getMarkdownFieldDefaultValueMap,
  number: getNumberFieldDefaultValueMap,
  object: getObjectFieldDefaultValueMap,
  relation: getSelectFieldDefaultValueMap, // alias
  select: getSelectFieldDefaultValueMap,
};

/**
 * Populate the default value for the given field. Check if a dynamic default value is specified,
 * then look for the field configuration’s `default` property.
 * @param {object} args Arguments.
 * @param {FlattenedEntryContent} args.content An object holding a new content key-value map.
 * @param {FieldKeyPath} args.keyPath Field key path, e.g. `author.name`.
 * @param {Field} args.fieldConfig Field configuration.
 * @param {InternalLocaleCode} args.locale Locale.
 * @param {Record<string, string>} args.dynamicValues Dynamic default values.
 * @returns {void} The `content` object is modified in place.
 */
export const populateDefaultValue = ({ content, keyPath, fieldConfig, locale, dynamicValues }) => {
  // @ts-expect-error `compute` widget don’t have the `default` option
  const { widget: widgetName = 'string', default: defaultValue } = fieldConfig;

  // Skip the `compute` widget, because it doesn’t have the `default` option
  if (widgetName === 'compute') {
    return;
  }

  const dynamicValue =
    // Ignore the dynamic value if the key path looks like an array item, e.g. `tags.0` or
    // `tags.0.name`, because lists are complicated to handle
    keyPath in dynamicValues && !/\.\d+(?:\.|$)/.test(keyPath)
      ? dynamicValues[keyPath].trim() || undefined
      : undefined;

  if (widgetName in GET_DEFAULT_VALUE_MAP_FUNCTIONS) {
    Object.assign(
      content,
      GET_DEFAULT_VALUE_MAP_FUNCTIONS[widgetName]({ fieldConfig, keyPath, locale, dynamicValue }),
    );

    return;
  }

  // Handle simple string-type fields, including the built-in `color`, `uuid`, `string` and `text`
  // widgets as well as custom widgets
  content[keyPath] = dynamicValue || defaultValue || '';
};

/**
 * Get the default values for the given fields. If dynamic default values are given, these values
 * take precedence over static default values defined with the site configuration.
 * @param {Field[]} fields Field list of a collection.
 * @param {InternalLocaleCode} locale Locale.
 * @param {Record<string, string>} [dynamicValues] Dynamic default values.
 * @returns {FlattenedEntryContent} Flattened entry content for creating a new draft content or
 * adding a new list item.
 */
export const getDefaultValues = (fields, locale, dynamicValues = {}) => {
  /** @type {FlattenedEntryContent} */
  const content = {};

  fields.forEach((fieldConfig) => {
    populateDefaultValue({
      content,
      keyPath: fieldConfig.name,
      fieldConfig,
      locale,
      dynamicValues,
    });
  });

  return content;
};
