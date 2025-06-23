import { describe, expect, test, vi } from 'vitest';
import { getDefaultValues, populateDefaultValue } from './defaults.js';

/**
 * @import { FlattenedEntryContent } from '$lib/types/private';
 * @import { Field } from '$lib/types/public';
 */

// Mock the widget helper modules
vi.mock('$lib/services/contents/widgets/boolean/helper', () => ({
  getDefaultValueMap: vi.fn(({ keyPath, fieldConfig, dynamicValue }) => ({
    [keyPath]: dynamicValue === 'true' ? true : (fieldConfig.default ?? false),
  })),
}));

vi.mock('$lib/services/contents/widgets/code/helper', () => ({
  getDefaultValueMap: vi.fn(({ keyPath, fieldConfig, dynamicValue }) => ({
    [keyPath]: dynamicValue || fieldConfig.default || '',
  })),
}));

vi.mock('$lib/services/contents/widgets/date-time/helper', () => ({
  getDefaultValueMap: vi.fn(({ keyPath, fieldConfig, dynamicValue }) => ({
    [keyPath]: dynamicValue || fieldConfig.default || '',
  })),
}));

vi.mock('$lib/services/contents/widgets/hidden/helper', () => ({
  getDefaultValueMap: vi.fn(({ keyPath, fieldConfig, dynamicValue }) => ({
    [keyPath]: dynamicValue || fieldConfig.default || '',
  })),
}));

vi.mock('$lib/services/contents/widgets/key-value/helper', () => ({
  getDefaultValueMap: vi.fn(({ keyPath, fieldConfig, dynamicValue }) => ({
    [keyPath]: dynamicValue || fieldConfig.default || {},
  })),
}));

vi.mock('$lib/services/contents/widgets/list/helper', () => ({
  getDefaultValueMap: vi.fn(({ keyPath, fieldConfig, dynamicValue }) => ({
    [keyPath]: dynamicValue || fieldConfig.default || [],
  })),
}));

vi.mock('$lib/services/contents/widgets/markdown/helper', () => ({
  getDefaultValueMap: vi.fn(({ keyPath, fieldConfig, dynamicValue }) => ({
    [keyPath]: dynamicValue || fieldConfig.default || '',
  })),
}));

vi.mock('$lib/services/contents/widgets/number/helper', () => ({
  getDefaultValueMap: vi.fn(({ keyPath, fieldConfig, dynamicValue }) => ({
    [keyPath]: dynamicValue ? parseFloat(dynamicValue) : (fieldConfig.default ?? 0),
  })),
}));

vi.mock('$lib/services/contents/widgets/object/helper', () => ({
  getDefaultValueMap: vi.fn(({ keyPath, fieldConfig, dynamicValue }) => ({
    [keyPath]: dynamicValue || fieldConfig.default || {},
  })),
}));

vi.mock('$lib/services/contents/widgets/select/helper', () => ({
  getDefaultValueMap: vi.fn(({ keyPath, fieldConfig, dynamicValue }) => ({
    [keyPath]: dynamicValue || fieldConfig.default || '',
  })),
}));

describe('Test populateDefaultValue()', () => {
  test('should skip compute widget', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'computed_field',
      widget: 'compute',
      default: 'should be ignored',
    };

    populateDefaultValue({
      content,
      keyPath: 'computed_field',
      fieldConfig,
      locale: 'en',
      dynamicValues: {},
    });

    expect(content).toEqual({});
  });

  test('should use dynamic value when available and not array-like', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'title',
      widget: 'string',
      default: 'Default Title',
    };

    populateDefaultValue({
      content,
      keyPath: 'title',
      fieldConfig,
      locale: 'en',
      dynamicValues: { title: 'Dynamic Title' },
    });

    expect(content.title).toBe('Dynamic Title');
  });

  test('should ignore dynamic value for array-like key paths', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'tags',
      widget: 'string',
      default: 'Default Tag',
    };

    populateDefaultValue({
      content,
      keyPath: 'tags.0',
      fieldConfig,
      locale: 'en',
      dynamicValues: { 'tags.0': 'Dynamic Tag' },
    });

    expect(content['tags.0']).toBe('Default Tag');
  });

  test('should ignore dynamic value for nested array-like key paths', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'items',
      widget: 'string',
      default: 'Default Item',
    };

    populateDefaultValue({
      content,
      keyPath: 'items.0.name',
      fieldConfig,
      locale: 'en',
      dynamicValues: { 'items.0.name': 'Dynamic Item' },
    });

    expect(content['items.0.name']).toBe('Default Item');
  });

  test('should use trimmed dynamic value when non-empty', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'title',
      widget: 'string',
      default: 'Default Title',
    };

    populateDefaultValue({
      content,
      keyPath: 'title',
      fieldConfig,
      locale: 'en',
      dynamicValues: { title: '  Trimmed Title  ' },
    });

    expect(content.title).toBe('Trimmed Title');
  });

  test('should use default value when dynamic value is empty after trimming', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'title',
      widget: 'string',
      default: 'Default Title',
    };

    populateDefaultValue({
      content,
      keyPath: 'title',
      fieldConfig,
      locale: 'en',
      dynamicValues: { title: '   ' },
    });

    expect(content.title).toBe('Default Title');
  });

  test('should use widget-specific default value map for boolean widget', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'published',
      widget: 'boolean',
      default: true,
    };

    populateDefaultValue({
      content,
      keyPath: 'published',
      fieldConfig,
      locale: 'en',
      dynamicValues: {},
    });

    expect(content.published).toBe(true);
  });

  test('should use widget-specific default value map for number widget', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'rating',
      widget: 'number',
      default: 5,
    };

    populateDefaultValue({
      content,
      keyPath: 'rating',
      fieldConfig,
      locale: 'en',
      dynamicValues: {},
    });

    expect(content.rating).toBe(5);
  });

  test('should use widget-specific default value map for list widget', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'tags',
      widget: 'list',
      default: ['tag1', 'tag2'],
    };

    populateDefaultValue({
      content,
      keyPath: 'tags',
      fieldConfig,
      locale: 'en',
      dynamicValues: {},
    });

    expect(content.tags).toEqual(['tag1', 'tag2']);
  });

  test('should use widget-specific default value map for object widget', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'author',
      widget: 'object',
      default: { name: 'John Doe', email: 'john@example.com' },
    };

    populateDefaultValue({
      content,
      keyPath: 'author',
      fieldConfig,
      locale: 'en',
      dynamicValues: {},
    });

    expect(content.author).toEqual({ name: 'John Doe', email: 'john@example.com' });
  });

  test('should use widget-specific default value map for select widget', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'category',
      widget: 'select',
      default: 'technology',
      options: ['technology', 'health', 'finance'],
    };

    populateDefaultValue({
      content,
      keyPath: 'category',
      fieldConfig,
      locale: 'en',
      dynamicValues: {},
    });

    expect(content.category).toBe('technology');
  });

  test('should use widget-specific default value map for relation widget (alias for select)', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'related_post',
      widget: 'relation',
      default: 'post-1',
      collection: 'posts',
      search_fields: ['title'],
      value_field: 'slug',
    };

    populateDefaultValue({
      content,
      keyPath: 'related_post',
      fieldConfig,
      locale: 'en',
      dynamicValues: {},
    });

    expect(content.related_post).toBe('post-1');
  });

  test('should handle unknown widget types as string fields', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'custom_field',
      widget: 'custom',
      default: 'Custom Default',
    };

    populateDefaultValue({
      content,
      keyPath: 'custom_field',
      fieldConfig,
      locale: 'en',
      dynamicValues: {},
    });

    expect(content.custom_field).toBe('Custom Default');
  });

  test('should use empty string for unknown widget without default', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'custom_field',
      widget: 'custom',
    };

    populateDefaultValue({
      content,
      keyPath: 'custom_field',
      fieldConfig,
      locale: 'en',
      dynamicValues: {},
    });

    expect(content.custom_field).toBe('');
  });

  test('should default to string widget when widget is not specified', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'title',
      default: 'Default Title',
    };

    populateDefaultValue({
      content,
      keyPath: 'title',
      fieldConfig,
      locale: 'en',
      dynamicValues: {},
    });

    expect(content.title).toBe('Default Title');
  });

  test('should handle dynamic value with boolean widget', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'published',
      widget: 'boolean',
      default: false,
    };

    populateDefaultValue({
      content,
      keyPath: 'published',
      fieldConfig,
      locale: 'en',
      dynamicValues: { published: 'true' },
    });

    expect(content.published).toBe(true);
  });

  test('should handle dynamic value with number widget', () => {
    /** @type {FlattenedEntryContent} */
    const content = {};

    /** @type {Field} */
    const fieldConfig = {
      name: 'rating',
      widget: 'number',
      default: 1,
    };

    populateDefaultValue({
      content,
      keyPath: 'rating',
      fieldConfig,
      locale: 'en',
      dynamicValues: { rating: '4.5' },
    });

    expect(content.rating).toBe(4.5);
  });
});

describe('Test getDefaultValues()', () => {
  test('should return empty object for empty fields array', () => {
    const result = getDefaultValues([], 'en');

    expect(result).toEqual({});
  });

  test('should return default values for multiple fields', () => {
    /** @type {Field[]} */
    const fields = [
      {
        name: 'title',
        widget: 'string',
        default: 'Default Title',
      },
      {
        name: 'published',
        widget: 'boolean',
        default: false,
      },
      {
        name: 'rating',
        widget: 'number',
        default: 5,
      },
    ];

    const result = getDefaultValues(fields, 'en');

    expect(result).toEqual({
      title: 'Default Title',
      published: false,
      rating: 5,
    });
  });

  test('should apply dynamic values when provided', () => {
    /** @type {Field[]} */
    const fields = [
      {
        name: 'title',
        widget: 'string',
        default: 'Default Title',
      },
      {
        name: 'published',
        widget: 'boolean',
        default: false,
      },
      {
        name: 'category',
        widget: 'select',
        default: 'general',
        options: ['general', 'tech', 'health'],
      },
    ];

    const dynamicValues = {
      title: 'Dynamic Title',
      published: 'true',
    };

    const result = getDefaultValues(fields, 'en', dynamicValues);

    expect(result).toEqual({
      title: 'Dynamic Title',
      published: true,
      category: 'general', // should use default since no dynamic value provided
    });
  });

  test('should handle fields without widget specified', () => {
    /** @type {Field[]} */
    const fields = [
      {
        name: 'title',
        default: 'Default Title',
      },
      {
        name: 'description',
        widget: 'text',
        default: 'Default Description',
      },
    ];

    const result = getDefaultValues(fields, 'en');

    expect(result).toEqual({
      title: 'Default Title',
      description: 'Default Description',
    });
  });

  test('should skip compute widgets', () => {
    /** @type {Field[]} */
    const fields = [
      {
        name: 'title',
        widget: 'string',
        default: 'Default Title',
      },
      {
        name: 'computed_field',
        widget: 'compute',
        default: 'Should be ignored',
      },
      {
        name: 'description',
        widget: 'text',
        default: 'Default Description',
      },
    ];

    const result = getDefaultValues(fields, 'en');

    expect(result).toEqual({
      title: 'Default Title',
      description: 'Default Description',
    });
  });

  test('should handle complex field configurations', () => {
    /** @type {Field[]} */
    const fields = [
      {
        name: 'metadata',
        widget: 'object',
        default: { author: 'John Doe', date: '2023-01-01' },
      },
      {
        name: 'tags',
        widget: 'list',
        default: ['tag1', 'tag2'],
      },
      {
        name: 'content',
        widget: 'markdown',
        default: '# Hello World',
      },
    ];

    const result = getDefaultValues(fields, 'en');

    expect(result).toEqual({
      metadata: { author: 'John Doe', date: '2023-01-01' },
      tags: ['tag1', 'tag2'],
      content: '# Hello World',
    });
  });

  test('should handle empty dynamic values object', () => {
    /** @type {Field[]} */
    const fields = [
      {
        name: 'title',
        widget: 'string',
        default: 'Default Title',
      },
    ];

    const result = getDefaultValues(fields, 'en', {});

    expect(result).toEqual({
      title: 'Default Title',
    });
  });

  test('should handle different locale', () => {
    /** @type {Field[]} */
    const fields = [
      {
        name: 'title',
        widget: 'string',
        default: 'Default Title',
      },
    ];

    const result = getDefaultValues(fields, 'ja');

    expect(result).toEqual({
      title: 'Default Title',
    });
  });

  test('should ignore dynamic values for array-like key paths', () => {
    /** @type {Field[]} */
    const fields = [
      {
        name: 'items',
        widget: 'string',
        default: 'Default Item',
      },
    ];

    const dynamicValues = {
      'items.0': 'Should be ignored',
      'items.0.name': 'Should also be ignored',
    };

    const result = getDefaultValues(fields, 'en', dynamicValues);

    expect(result).toEqual({
      items: 'Default Item',
    });
  });

  test('should handle trimmed dynamic values', () => {
    /** @type {Field[]} */
    const fields = [
      {
        name: 'title',
        widget: 'string',
        default: 'Default Title',
      },
      {
        name: 'description',
        widget: 'string',
        default: 'Default Description',
      },
    ];

    const dynamicValues = {
      title: '  Trimmed Title  ',
      description: '   ', // Should be ignored and use default
    };

    const result = getDefaultValues(fields, 'en', dynamicValues);

    expect(result).toEqual({
      title: 'Trimmed Title',
      description: 'Default Description',
    });
  });
});
