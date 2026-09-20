import { describe, expect, it } from 'vitest';

import { toAssistantCategoryOptions } from './data';

describe('toAssistantCategoryOptions', () => {
  it('maps backend categories by sort', () => {
    expect(
      toAssistantCategoryOptions([
        { code: 'writing', name: '写作创作', sort: 2 },
        { code: 'efficiency', name: '效率办公', sort: 1 },
      ]),
    ).toEqual([
      { label: '效率办公', value: 'efficiency' },
      { label: '写作创作', value: 'writing' },
    ]);
  });
});
