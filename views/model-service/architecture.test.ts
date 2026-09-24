import type { AIModelArchitectureSuggestion, AIModelResult } from '../../api';

import { describe, expect, it } from 'vitest';

import { architecturePayload, syncArchitecturePayload } from './architecture';

const current = {
  id: 12,
  provider_id: 4,
  model_id: 'openai/gpt-5.4',
  name: 'GPT',
  kind: 'chat',
  capabilities: ['thinking'],
  input_modalities: ['text'],
  thinking_policy: {
    levels: ['low'],
    default_level: 'low',
    can_disable: false,
  },
  context_window: 32_000,
  max_output_tokens: 4000,
  sort: 3,
  status: 1,
  remark: 'curated',
  created_time: '2026-01-01',
} satisfies AIModelResult;

const suggestion = {
  source: 'models.dev',
  last_updated: '2026-08-30',
  kind: 'chat',
  input_modalities: ['text', 'image'],
  tools: true,
  thinking: true,
  thinking_policy: {
    levels: ['minimal', 'low', 'high'],
    default_level: null,
    can_disable: true,
  },
  context_window: 128_000,
  max_output_tokens: 16_384,
} satisfies AIModelArchitectureSuggestion;

describe('syncArchitecturePayload', () => {
  it('applies all known suggestions while preserving unrelated model fields', () => {
    expect(syncArchitecturePayload(current, suggestion)).toMatchObject({
      capabilities: ['thinking', 'tools'],
      thinking_policy: suggestion.thinking_policy,
      input_modalities: ['text', 'image'],
      context_window: 128_000,
      max_output_tokens: 16_384,
      remark: 'curated',
      sort: 3,
      status: 1,
    });
  });

  it('preserves manual values for fields the catalog does not know', () => {
    const payload = syncArchitecturePayload(current, {
      ...suggestion,
      kind: null,
      input_modalities: null,
      tools: null,
      thinking: null,
      thinking_policy: null,
      context_window: null,
    });
    expect(payload).toMatchObject({
      capabilities: ['thinking'],
      thinking_policy: current.thinking_policy,
      input_modalities: ['text'],
      context_window: 32_000,
      max_output_tokens: 16_384,
    });
  });

  it('clears thinking policy when the catalog disables thinking', () => {
    expect(
      syncArchitecturePayload(current, {
        ...suggestion,
        thinking: false,
        thinking_policy: null,
      }),
    ).toMatchObject({ capabilities: ['tools'], thinking_policy: null });
  });

  it('skips the update when no suggested field changes', () => {
    expect(
      syncArchitecturePayload(current, {
        ...suggestion,
        kind: null,
        input_modalities: null,
        tools: null,
        thinking: null,
        thinking_policy: null,
        context_window: null,
        max_output_tokens: null,
      }),
    ).toBeNull();
  });
});

describe('architecturePayload', () => {
  it('preserves manual values when nothing is selected', () => {
    const payload = architecturePayload(current, suggestion, []);
    expect(payload).toMatchObject({
      capabilities: ['thinking'],
      thinking_policy: current.thinking_policy,
      context_window: 32_000,
      input_modalities: ['text'],
      remark: 'curated',
    });
    expect(payload).not.toHaveProperty('id');
  });

  it('applies suggested thinking policy only when selected', () => {
    expect(
      architecturePayload(current, suggestion, ['thinking_policy'])
        .thinking_policy,
    ).toEqual(suggestion.thinking_policy);
    expect(
      architecturePayload(current, suggestion, []).thinking_policy,
    ).toEqual(current.thinking_policy);
  });

  it('allows an explicit manual policy to override the suggestion', () => {
    const manualPolicy = {
      levels: ['high'] as const,
      default_level: 'high' as const,
      can_disable: false,
    };
    expect(
      architecturePayload(current, suggestion, ['thinking_policy'], {
        ...manualPolicy,
        levels: [...manualPolicy.levels],
      }).thinking_policy,
    ).toEqual(manualPolicy);
  });

  it('can apply the suggested policy while enabling thinking', () => {
    const withoutThinking = {
      ...current,
      capabilities: [] as AIModelResult['capabilities'],
      thinking_policy: null,
    };
    expect(
      architecturePayload(withoutThinking, suggestion, [
        'thinking',
        'thinking_policy',
      ]).thinking_policy,
    ).toEqual(suggestion.thinking_policy);
    expect(
      architecturePayload(withoutThinking, suggestion, ['thinking_policy'])
        .thinking_policy,
    ).toBeNull();
  });

  it('retains manual policy when no suggested policy is available', () => {
    expect(
      architecturePayload(current, { ...suggestion, thinking_policy: null }, [
        'thinking_policy',
      ]).thinking_policy,
    ).toEqual(current.thinking_policy);
  });

  it('applies only selected fields and preserves thinking levels', () => {
    expect(
      architecturePayload(current, suggestion, ['tools', 'context_window']),
    ).toMatchObject({
      capabilities: ['thinking', 'tools'],
      thinking_policy: current.thinking_policy,
      context_window: 128_000,
      input_modalities: ['text'],
    });
  });

  it('supports all backend thinking levels and explicit off without guessing them', () => {
    const policy = {
      levels: ['minimal', 'low', 'medium', 'high', 'xhigh'],
      default_level: 'medium',
      can_disable: true,
    } as const;
    expect(
      architecturePayload(current, suggestion, [], {
        ...policy,
        levels: [...policy.levels],
      }).thinking_policy,
    ).toEqual(policy);
    expect(
      architecturePayload(current, { ...suggestion, thinking: false }, [
        'thinking',
      ]).thinking_policy,
    ).toBeNull();
  });

  it('does not replace unknown capability values', () => {
    expect(
      architecturePayload(current, { ...suggestion, tools: null }, ['tools'])
        .capabilities,
    ).toEqual(['thinking']);
  });

  it('clears chat-only state when explicitly switching to a supported image kind', () => {
    const payload = architecturePayload(
      current,
      { ...suggestion, kind: 'image', tools: null, thinking: null },
      ['kind'],
    );
    expect(payload.kind).toBe('image');
    expect(payload.capabilities).toEqual([]);
    expect(payload.thinking_policy).toBeNull();
    expect(payload.status).toBe(1);
  });
});
