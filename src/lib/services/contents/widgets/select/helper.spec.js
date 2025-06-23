import { describe, expect, test } from 'vitest';
import { getDefaultValueMap, getOptionLabel } from './helper.js';

/**
 * @import { SelectField } from '$lib/types/public';
 */

/** @type {Pick<SelectField, 'widget' | 'name'>} */
const baseFieldConfig = {
  widget: 'select',
  name: 'category',
};

/** @type {Pick<SelectField, 'widget' | 'name'>} */
const baseMultipleFieldConfig = {
  widget: 'select',
  name: 'tags',
};

describe('Test getDefaultValueMap()', () => {
  test('should return default value for single select field', () => {
    /** @type {SelectField} */
    const fieldConfig = {
      ...baseFieldConfig,
      options: ['option1', 'option2'],
      default: 'option1',
      multiple: false,
    };

    const keyPath = 'category';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({ category: 'option1' });
  });

  test('should return empty string for single select field without default', () => {
    /** @type {SelectField} */
    const fieldConfig = {
      ...baseFieldConfig,
      options: ['option1', 'option2'],
      multiple: false,
    };

    const keyPath = 'category';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({ category: '' });
  });

  test('should return multiple values for multiple select field with array default', () => {
    /** @type {SelectField} */
    const fieldConfig = {
      ...baseMultipleFieldConfig,
      options: ['option1', 'option2'],
      default: ['option1', 'option2'],
      multiple: true,
    };

    const keyPath = 'tags';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({
      'tags.0': 'option1',
      'tags.1': 'option2',
    });
  });

  test('should return empty array for multiple select field without default', () => {
    /** @type {SelectField} */
    const fieldConfig = {
      ...baseMultipleFieldConfig,
      options: ['option1', 'option2'],
      multiple: true,
    };

    const keyPath = 'tags';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({ tags: [] });
  });

  test('should return empty array for multiple select field with non-array default', () => {
    /** @type {SelectField} */
    const fieldConfig = {
      ...baseMultipleFieldConfig,
      options: ['option1', 'option2'],
      default: 'single-value',
      multiple: true,
    };

    const keyPath = 'tags';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({ tags: [] });
  });

  describe('with dynamicValue', () => {
    test('should prioritize dynamicValue over default for single select', () => {
      /** @type {SelectField} */
      const fieldConfig = {
        ...baseFieldConfig,
        options: ['option1', 'option2', 'option3'],
        default: 'option1',
        multiple: false,
      };

      const keyPath = 'category';

      const result = getDefaultValueMap({
        fieldConfig,
        keyPath,
        locale: '_default',
        dynamicValue: 'option2',
      });

      expect(result).toEqual({ category: 'option2' });
    });

    test('should handle comma-separated dynamicValue for multiple select', () => {
      /** @type {SelectField} */
      const fieldConfig = {
        ...baseMultipleFieldConfig,
        options: ['option1', 'option2', 'option3'],
        default: ['option1'],
        multiple: true,
      };

      const keyPath = 'tags';

      const result = getDefaultValueMap({
        fieldConfig,
        keyPath,
        locale: '_default',
        dynamicValue: 'option2, option3',
      });

      expect(result).toEqual({
        'tags.0': 'option2',
        'tags.1': 'option3',
      });
    });

    test('should handle single value dynamicValue for multiple select', () => {
      /** @type {SelectField} */
      const fieldConfig = {
        ...baseMultipleFieldConfig,
        options: ['option1', 'option2', 'option3'],
        default: ['option1', 'option2'],
        multiple: true,
      };

      const keyPath = 'tags';

      const result = getDefaultValueMap({
        fieldConfig,
        keyPath,
        locale: '_default',
        dynamicValue: 'option3',
      });

      expect(result).toEqual({
        'tags.0': 'option3',
      });
    });

    test('should handle empty dynamicValue for single select', () => {
      /** @type {SelectField} */
      const fieldConfig = {
        ...baseFieldConfig,
        options: ['option1', 'option2'],
        default: 'option1',
        multiple: false,
      };

      const keyPath = 'category';

      const result = getDefaultValueMap({
        fieldConfig,
        keyPath,
        locale: '_default',
        dynamicValue: '',
      });

      expect(result).toEqual({ category: '' });
    });

    test('should handle undefined dynamicValue', () => {
      /** @type {SelectField} */
      const fieldConfig = {
        ...baseFieldConfig,
        options: ['option1', 'option2'],
        default: 'option1',
        multiple: false,
      };

      const keyPath = 'category';

      const result = getDefaultValueMap({
        fieldConfig,
        keyPath,
        locale: '_default',
        dynamicValue: undefined,
      });

      expect(result).toEqual({ category: 'option1' });
    });

    test('should handle dynamicValue when no default exists for multiple select', () => {
      /** @type {SelectField} */
      const fieldConfig = {
        ...baseMultipleFieldConfig,
        options: ['option1', 'option2', 'option3'],
        multiple: true,
      };

      const keyPath = 'tags';

      const result = getDefaultValueMap({
        fieldConfig,
        keyPath,
        locale: '_default',
        dynamicValue: 'option1, option2',
      });

      expect(result).toEqual({
        'tags.0': 'option1',
        'tags.1': 'option2',
      });
    });

    test('should trim whitespace in comma-separated dynamicValue', () => {
      /** @type {SelectField} */
      const fieldConfig = {
        ...baseMultipleFieldConfig,
        options: ['option1', 'option2', 'option3'],
        multiple: true,
      };

      const keyPath = 'tags';

      const result = getDefaultValueMap({
        fieldConfig,
        keyPath,
        locale: '_default',
        dynamicValue: '  option1  ,   option2   ,option3  ',
      });

      expect(result).toEqual({
        'tags.0': 'option1',
        'tags.1': 'option2',
        'tags.2': 'option3',
      });
    });
  });
});

describe('Test getOptionLabel()', () => {
  test('should return value for single select without labels', () => {
    /** @type {SelectField} */
    const fieldConfig = {
      ...baseFieldConfig,
      multiple: false,
      options: ['option1', 'option2', 'option3'],
    };

    const valueMap = { category: 'option2' };
    const keyPath = 'category';
    const result = getOptionLabel({ fieldConfig, valueMap, keyPath });

    expect(result).toBe('option2');
  });

  test('should return label for single select with labels', () => {
    /** @type {SelectField} */
    const fieldConfig = {
      ...baseFieldConfig,
      multiple: false,
      options: [
        { label: 'First Option', value: 'option1' },
        { label: 'Second Option', value: 'option2' },
        { label: 'Third Option', value: 'option3' },
      ],
    };

    const valueMap = { category: 'option2' };
    const keyPath = 'category';
    const result = getOptionLabel({ fieldConfig, valueMap, keyPath });

    expect(result).toBe('Second Option');
  });

  test('should return value if label not found', () => {
    /** @type {SelectField} */
    const fieldConfig = {
      ...baseFieldConfig,
      multiple: false,
      options: [
        { label: 'First Option', value: 'option1' },
        { label: 'Second Option', value: 'option2' },
      ],
    };

    const valueMap = { category: 'option3' };
    const keyPath = 'category';
    const result = getOptionLabel({ fieldConfig, valueMap, keyPath });

    expect(result).toBe('option3');
  });

  test('should return values array for multiple select without labels', () => {
    /** @type {SelectField} */
    const fieldConfig = {
      ...baseMultipleFieldConfig,
      multiple: true,
      options: ['option1', 'option2', 'option3'],
    };

    const valueMap = {
      'tags.0': 'option1',
      'tags.1': 'option3',
    };

    const keyPath = 'tags';
    const result = getOptionLabel({ fieldConfig, valueMap, keyPath });

    expect(result).toEqual(['option1', 'option3']);
  });

  test('should return labels array for multiple select with labels', () => {
    /** @type {SelectField} */
    const fieldConfig = {
      ...baseMultipleFieldConfig,
      multiple: true,
      options: [
        { label: 'First Option', value: 'option1' },
        { label: 'Second Option', value: 'option2' },
        { label: 'Third Option', value: 'option3' },
      ],
    };

    const valueMap = {
      'tags.0': 'option1',
      'tags.1': 'option3',
    };

    const keyPath = 'tags';
    const result = getOptionLabel({ fieldConfig, valueMap, keyPath });

    expect(result).toEqual(['First Option', 'Third Option']);
  });

  test('should return empty array for multiple select with no values', () => {
    /** @type {SelectField} */
    const fieldConfig = {
      ...baseMultipleFieldConfig,
      multiple: true,
      options: ['option1', 'option2', 'option3'],
    };

    const valueMap = {};
    const keyPath = 'tags';
    const result = getOptionLabel({ fieldConfig, valueMap, keyPath });

    expect(result).toEqual([]);
  });
});
