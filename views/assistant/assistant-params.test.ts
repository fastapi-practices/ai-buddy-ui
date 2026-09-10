import { describe, expect, it } from 'vitest';

import {
  AI_ASSISTANT_STARTER_MAX,
  createAIAssistantPayload,
  normalizeStarters,
  toAIAssistantFormValues,
} from './assistant-params';

describe('normalizeStarters', () => {
  it('trims empty items and caps the list at 8', () => {
    expect(
      normalizeStarters([
        '  hello  ',
        '',
        '  ',
        ...Array.from({ length: 10 }, (_, index) => `q${index}`),
      ]),
    ).toEqual(['hello', 'q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6']);
    expect(normalizeStarters(null)).toEqual([]);
    expect(AI_ASSISTANT_STARTER_MAX).toBe(8);
  });
});

describe('createAIAssistantPayload', () => {
  it('keeps identity fields and drops blank optional values', () => {
    expect(
      createAIAssistantPayload({
        name: '  writer  ',
        prompt: '  you are a writer  ',
        description: '  demo  ',
        category: '  office  ',
        starters: ['  hi  ', ''],
        sort: 3,
      }),
    ).toEqual({
      name: 'writer',
      prompt: 'you are a writer',
      description: 'demo',
      category: 'office',
      starters: ['hi'],
      sort: 3,
    });
  });
});

describe('toAIAssistantFormValues', () => {
  it('copies starters so the form can edit them independently', () => {
    const starters = ['hello'];
    const values = toAIAssistantFormValues({
      id: 1,
      user_id: 1,
      name: 'writer',
      prompt: 'you are a writer',
      starters,
      usage_count: 0,
      created_time: '2026-01-01',
    });

    expect(values.starters).toEqual(['hello']);
    expect(values.starters).not.toBe(starters);
    expect(toAIAssistantFormValues().sort).toBe(0);
  });
});
