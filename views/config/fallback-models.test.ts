import { describe, expect, it } from 'vitest';

import {
  fallbackModelValue,
  parseFallbackModels,
  serializeFallbackModels,
  splitFallbackModelValue,
} from './fallback-models';

describe('fallback models', () => {
  it('builds the stored value from provider and model ids', () => {
    expect(fallbackModelValue(1, 'gpt-4o-mini')).toBe('1:gpt-4o-mini');
  });

  it('parses the comma separated config value', () => {
    expect(parseFallbackModels('1:gpt-4o, 2:qwen-max')).toEqual([
      '1:gpt-4o',
      '2:qwen-max',
    ]);
    expect(parseFallbackModels('')).toEqual([]);
    expect(parseFallbackModels(null)).toEqual([]);
    expect(parseFallbackModels(' , ')).toEqual([]);
  });

  it('serializes the selection back to the config value', () => {
    expect(serializeFallbackModels(['1:gpt-4o', ' 2:qwen-max '])).toBe(
      '1:gpt-4o,2:qwen-max',
    );
    expect(serializeFallbackModels([])).toBe('');
  });

  it('splits a stored value and keeps model ids containing colons intact', () => {
    expect(splitFallbackModelValue('3:gpt-4o')).toEqual({
      modelId: 'gpt-4o',
      providerId: 3,
    });
    expect(splitFallbackModelValue('3:openai/gpt-4o')).toEqual({
      modelId: 'openai/gpt-4o',
      providerId: 3,
    });
    expect(splitFallbackModelValue('3:ns:model')).toEqual({
      modelId: 'ns:model',
      providerId: 3,
    });
  });

  it('rejects malformed stored values', () => {
    expect(splitFallbackModelValue('')).toBeNull();
    expect(splitFallbackModelValue(':gpt-4o')).toBeNull();
    expect(splitFallbackModelValue('abc:gpt-4o')).toBeNull();
    expect(splitFallbackModelValue('1:')).toBeNull();
  });
});
