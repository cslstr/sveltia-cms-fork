import { describe, expect, test } from 'vitest';
import { getDefaultValueMap } from './helper.js';

/**
 * @import { CodeField } from '$lib/types/public';
 */

/** @type {Pick<CodeField, 'widget' | 'name'>} */
const baseFieldConfig = {
  widget: 'code',
  name: 'test_code',
};

describe('Test getDefaultValueMap()', () => {
  test('should return code-only format when output_code_only is true', () => {
    /** @type {CodeField} */
    const fieldConfig = {
      ...baseFieldConfig,
      default: 'console.log("hello");',
      output_code_only: true,
    };

    const keyPath = 'script';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({
      script: 'console.log("hello");',
    });
  });

  test('should return empty string for code-only format when default is not a string', () => {
    /** @type {CodeField} */
    const fieldConfig = {
      ...baseFieldConfig,
      default: { code: 'console.log("hello");', lang: 'javascript' },
      output_code_only: true,
    };

    const keyPath = 'script';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({
      script: '',
    });
  });

  test('should return object format when output_code_only is false with string default', () => {
    /** @type {CodeField} */
    const fieldConfig = {
      ...baseFieldConfig,
      default: 'console.log("hello");',
      output_code_only: false,
      keys: { code: 'code', lang: 'lang' },
    };

    const keyPath = 'script';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({
      script: {},
      'script.code': 'console.log("hello");',
      'script.lang': '',
    });
  });

  test('should return object format when output_code_only is false with object default', () => {
    /** @type {CodeField} */
    const fieldConfig = {
      ...baseFieldConfig,
      default: {
        code: 'console.log("hello");',
        lang: 'javascript',
      },
      output_code_only: false,
      keys: { code: 'code', lang: 'lang' },
    };

    const keyPath = 'script';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({
      script: {},
      'script.code': 'console.log("hello");',
      'script.lang': 'javascript',
    });
  });

  test('should use custom keys when provided', () => {
    /** @type {CodeField} */
    const fieldConfig = {
      ...baseFieldConfig,
      default: {
        source: 'console.log("hello");',
        language: 'javascript',
      },
      output_code_only: false,
      keys: { code: 'source', lang: 'language' },
    };

    const keyPath = 'script';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({
      script: {},
      'script.source': 'console.log("hello");',
      'script.language': 'javascript',
    });
  });

  test('should use default keys when keys are not provided', () => {
    /** @type {CodeField} */
    const fieldConfig = {
      ...baseFieldConfig,
      default: {
        code: 'console.log("hello");',
        lang: 'javascript',
      },
      output_code_only: false,
    };

    const keyPath = 'script';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({
      script: {},
      'script.code': 'console.log("hello");',
      'script.lang': 'javascript',
    });
  });

  test('should handle missing code in object default', () => {
    /** @type {CodeField} */
    const fieldConfig = {
      ...baseFieldConfig,
      default: {
        lang: 'javascript',
      },
      output_code_only: false,
      keys: { code: 'code', lang: 'lang' },
    };

    const keyPath = 'script';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({
      script: {},
      'script.code': '',
      'script.lang': 'javascript',
    });
  });

  test('should handle missing lang in object default', () => {
    /** @type {CodeField} */
    const fieldConfig = {
      ...baseFieldConfig,
      default: {
        code: 'console.log("hello");',
      },
      output_code_only: false,
      keys: { code: 'code', lang: 'lang' },
    };

    const keyPath = 'script';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({
      script: {},
      'script.code': 'console.log("hello");',
      'script.lang': '',
    });
  });

  test('should handle undefined default value', () => {
    /** @type {CodeField} */
    const fieldConfig = {
      ...baseFieldConfig,
      output_code_only: false,
      keys: { code: 'code', lang: 'lang' },
    };

    const keyPath = 'script';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({
      script: {},
      'script.code': '',
      'script.lang': '',
    });
  });

  test('should default output_code_only to false when not specified', () => {
    /** @type {CodeField} */
    const fieldConfig = {
      ...baseFieldConfig,
      default: 'console.log("hello");',
    };

    const keyPath = 'script';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({
      script: {},
      'script.code': 'console.log("hello");',
      'script.lang': '',
    });
  });

  test('should handle non-string values in object default', () => {
    /** @type {CodeField} */
    const fieldConfig = {
      ...baseFieldConfig,
      default: {
        // @ts-expect-error
        code: 123, // number instead of string
        // @ts-expect-error
        lang: true, // boolean instead of string
      },
      output_code_only: false,
      keys: { code: 'code', lang: 'lang' },
    };

    const keyPath = 'script';
    const result = getDefaultValueMap({ fieldConfig, keyPath, locale: '_default' });

    expect(result).toEqual({
      script: {},
      'script.code': '',
      'script.lang': '',
    });
  });

  describe('with dynamicValue', () => {
    test('should prioritize dynamicValue over default for code-only format', () => {
      /** @type {CodeField} */
      const fieldConfig = {
        ...baseFieldConfig,
        default: 'console.log("default");',
        output_code_only: true,
      };

      const keyPath = 'script';

      const result = getDefaultValueMap({
        fieldConfig,
        keyPath,
        locale: '_default',
        dynamicValue: 'console.log("dynamic");',
      });

      expect(result).toEqual({
        script: 'console.log("dynamic");',
      });
    });

    test('should handle string dynamicValue for object format', () => {
      /** @type {CodeField} */
      const fieldConfig = {
        ...baseFieldConfig,
        default: { code: 'console.log("default");', lang: 'javascript' },
        output_code_only: false,
      };

      const keyPath = 'script';

      const result = getDefaultValueMap({
        fieldConfig,
        keyPath,
        locale: '_default',
        dynamicValue: 'console.log("dynamic");',
      });

      expect(result).toEqual({
        script: {},
        'script.code': 'console.log("dynamic");',
        'script.lang': '',
      });
    });

    test('should handle dynamicValue when no default exists', () => {
      /** @type {CodeField} */
      const fieldConfig = {
        ...baseFieldConfig,
        output_code_only: true,
      };

      const keyPath = 'script';

      const result = getDefaultValueMap({
        fieldConfig,
        keyPath,
        locale: '_default',
        dynamicValue: 'console.log("new");',
      });

      expect(result).toEqual({
        script: 'console.log("new");',
      });
    });

    test('should handle undefined dynamicValue', () => {
      /** @type {CodeField} */
      const fieldConfig = {
        ...baseFieldConfig,
        default: 'console.log("default");',
        output_code_only: true,
      };

      const keyPath = 'script';

      const result = getDefaultValueMap({
        fieldConfig,
        keyPath,
        locale: '_default',
        dynamicValue: undefined,
      });

      expect(result).toEqual({
        script: 'console.log("default");',
      });
    });

    test('should handle empty string dynamicValue for code-only format', () => {
      /** @type {CodeField} */
      const fieldConfig = {
        ...baseFieldConfig,
        default: 'console.log("default");',
        output_code_only: true,
      };

      const keyPath = 'script';

      const result = getDefaultValueMap({
        fieldConfig,
        keyPath,
        locale: '_default',
        dynamicValue: '',
      });

      expect(result).toEqual({
        script: '',
      });
    });
  });
});
