import { describe, expect, it } from 'vitest';

import { subagentSchema, useSubagentColumns } from './data';

describe('subagentSchema', () => {
  it('only catalogs name, description, prompt and sort', () => {
    expect(subagentSchema.map((item) => item.fieldName)).toEqual([
      'name',
      'description',
      'prompt',
      'sort',
    ]);
  });
});

describe('useSubagentColumns', () => {
  it('does not render dropped tool catalog fields', () => {
    const fields = (useSubagentColumns() ?? []).map((item) => item.field);
    expect(fields).not.toContain('allowed_tools');
    expect(fields).not.toContain('max_calls');
    expect(fields).toContain('user_id');
  });
});
