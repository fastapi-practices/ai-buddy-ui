import { describe, expect, it } from 'vitest';

import {
  AI_PROVIDER_DEFAULT_HOST,
  AI_PROVIDER_TYPE,
  createAIProviderPayload,
  getProviderDefaultHost,
  isProviderDefaultHost,
  resolveProviderApiHost,
} from './provider-params';

describe('provider params', () => {
  it('uses backend default hosts by provider type', () => {
    expect(getProviderDefaultHost(AI_PROVIDER_TYPE.openai)).toBe(
      'https://api.openai.com',
    );
    expect(getProviderDefaultHost(AI_PROVIDER_TYPE.anthropic)).toBe(
      'https://api.anthropic.com',
    );
    expect(getProviderDefaultHost(AI_PROVIDER_TYPE.google)).toBe(
      'https://generativelanguage.googleapis.com',
    );
    expect(getProviderDefaultHost(AI_PROVIDER_TYPE.xai)).toBe(
      'https://api.x.ai',
    );
    expect(getProviderDefaultHost(AI_PROVIDER_TYPE.openrouter)).toBe(
      'https://openrouter.ai',
    );
    expect(getProviderDefaultHost(AI_PROVIDER_TYPE.openai_responses)).toBe(
      'https://api.openai.com',
    );
    expect(AI_PROVIDER_DEFAULT_HOST[0]).toBe('https://api.openai.com');
  });

  it('treats empty and catalog hosts as default hosts', () => {
    expect(isProviderDefaultHost('')).toBe(true);
    expect(isProviderDefaultHost(' https://api.x.ai/ ')).toBe(true);
    expect(isProviderDefaultHost('https://example.com')).toBe(false);
  });

  it('resolves empty api host to the provider default', () => {
    expect(resolveProviderApiHost(AI_PROVIDER_TYPE.google, '  ')).toBe(
      'https://generativelanguage.googleapis.com',
    );
    expect(
      resolveProviderApiHost(
        AI_PROVIDER_TYPE.openai,
        ' https://custom.example/ ',
      ),
    ).toBe('https://custom.example');
  });

  it('trims provider fields and keeps a masked key for backend restore', () => {
    expect(
      createAIProviderPayload({
        api_host: '',
        api_key: '  sk-test********abcd  ',
        name: '  OpenAI  ',
        remark: '  ',
        status: 1,
        type: AI_PROVIDER_TYPE.openai,
      }),
    ).toEqual({
      api_host: 'https://api.openai.com',
      api_key: 'sk-test********abcd',
      name: 'OpenAI',
      remark: null,
      status: 1,
      type: 0,
    });
  });
});
