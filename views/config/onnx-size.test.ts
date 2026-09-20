import { describe, expect, it } from 'vitest';

import { formatOnnxSize } from './onnx-size';

describe('formatOnnxSize', () => {
  it('uses MB below 1 G and G at or above 1 G', () => {
    expect(formatOnnxSize(0.09)).toBe('约 92 MB');
    expect(formatOnnxSize(0.13)).toBe('约 133 MB');
    expect(formatOnnxSize(1)).toBe('约 1 G');
    expect(formatOnnxSize(1.2)).toBe('约 1.2 G');
    expect(formatOnnxSize(null)).toBe('大小未知');
  });
});
