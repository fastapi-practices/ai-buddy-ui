import { describe, expect, it } from 'vitest';

import { createAIModelPayload } from './model-params';

describe('createAIModelPayload', () => {
  it('trims model fields and keeps catalog metadata', () => {
    expect(
      createAIModelPayload(7, {
        capabilities: ['tools', 'text'],
        context_window: 128_000,
        kind: 'chat',
        max_output_tokens: 0,
        model_id: '  gpt-test  ',
        name: '  GPT Test  ',
        remark: '  ',
        sort: 3,
        status: 1,
      }),
    ).toEqual({
      capabilities: ['tools', 'text'],
      context_window: 128_000,
      kind: 'chat',
      max_output_tokens: null,
      model_id: 'gpt-test',
      name: 'GPT Test',
      provider_id: 7,
      remark: null,
      sort: 3,
      status: 1,
    });
  });
});
