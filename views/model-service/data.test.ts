import { describe, expect, it } from 'vitest';

import {
  getModelModalityColor,
  getModelModalityIcon,
  getModelModalityLabel,
  MODEL_MODALITY_OPTIONS,
} from './model-modalities';

describe('model table input modalities', () => {
  it('provides icon, color and tooltip text for every modality', () => {
    for (const option of MODEL_MODALITY_OPTIONS) {
      expect(getModelModalityLabel(option.value)).toBe(option.label);
      expect(getModelModalityIcon(option.value)).toBe(option.icon);
      expect(getModelModalityColor(option.value)).toBe(option.color);
    }
  });

  it('keeps unknown modalities readable', () => {
    expect(getModelModalityLabel('unknown')).toBe('unknown');
    expect(getModelModalityIcon('unknown')).toBe('carbon:help');
    expect(getModelModalityColor('unknown')).toBe('default');
  });
});
