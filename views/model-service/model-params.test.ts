import { describe, expect, it } from 'vitest';

import {
  createAIBatchModelPayload,
  createAIModelPayload,
  supportsModelKind,
  thinkingPolicyFormValues,
  validateThinkingPolicy,
} from './model-params';

describe('supportsModelKind', () => {
  it('limits embedding and dedicated image options by provider', () => {
    expect(supportsModelKind(0, 'embedding')).toBe(true);
    expect(supportsModelKind(4, 'embedding')).toBe(true);
    expect(supportsModelKind(5, 'embedding')).toBe(true);
    expect(supportsModelKind(1, 'embedding')).toBe(false);
    expect(supportsModelKind(2, 'image')).toBe(true);
    expect(supportsModelKind(3, 'image')).toBe(true);
    expect(supportsModelKind(4, 'image')).toBe(false);
    expect(supportsModelKind(1, 'chat')).toBe(true);
  });
});

describe('createAIBatchModelPayload', () => {
  it('preserves supported provider model metadata', () => {
    expect(
      createAIBatchModelPayload(7, [
        {
          id: 'reasoner',
          kind: 'chat',
          capabilities: ['thinking'],
          input_modalities: ['text', 'image'],
          display_name: '  Reasoner  ',
        },
        {
          id: 'embedding-v1',
          kind: 'embedding',
          capabilities: ['tools'],
          input_modalities: ['text'],
        },
      ]),
    ).toEqual({
      items: [
        {
          provider_id: 7,
          model_id: 'reasoner',
          name: 'Reasoner',
          kind: 'chat',
          capabilities: ['thinking'],
          input_modalities: ['text', 'image'],
          context_window: null,
          max_output_tokens: null,
          remark: null,
          sort: 0,
          status: 1,
        },
        {
          provider_id: 7,
          model_id: 'embedding-v1',
          name: null,
          kind: 'embedding',
          capabilities: [],
          input_modalities: ['text'],
          context_window: null,
          max_output_tokens: null,
          remark: null,
          sort: 0,
          status: 1,
        },
      ],
    });
  });
});

describe('createAIModelPayload', () => {
  it('trims model fields and keeps catalog metadata', () => {
    expect(
      createAIModelPayload(7, {
        capabilities: ['tools', 'thinking'],
        input_modalities: ['text', 'image'],
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
      capabilities: ['tools', 'thinking'],
      input_modalities: ['text', 'image'],
      thinking_policy: null,
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

  it('distinguishes inferred input modalities from an explicitly empty selection', () => {
    expect(
      createAIModelPayload(7, {
        kind: 'chat',
        model_id: 'chat-model',
        status: 1,
      }),
    ).toMatchObject({
      capabilities: [],
      input_modalities: null,
      kind: 'chat',
    });
    expect(
      createAIModelPayload(7, {
        kind: 'embedding',
        model_id: 'embedding-v1',
        input_modalities: [],
        status: 1,
      }),
    ).toMatchObject({
      input_modalities: [],
      kind: 'embedding',
    });
  });

  it('clears chat capabilities and thinking policy when changing model kind', () => {
    const payload = createAIModelPayload(7, {
      capabilities: ['tools', 'thinking'],
      kind: 'image',
      model_id: 'image-model',
      policy_enabled: true,
      policy_levels: ['low'],
      status: 1,
    });
    expect(payload.capabilities).toEqual([]);
    expect(payload.thinking_policy).toBeNull();
  });

  it('sends a verified manual policy for supported chat models', () => {
    const values = {
      capabilities: ['thinking'] as const,
      kind: 'chat' as const,
      model_id: 'reasoner',
      policy_can_disable: true,
      policy_default_level: 'medium' as const,
      policy_enabled: true,
      policy_levels: ['low', 'medium'] as const,
      policy_verified: true,
      status: 1 as const,
    };
    const formValues = {
      ...values,
      capabilities: [...values.capabilities],
      policy_levels: [...values.policy_levels],
    };
    expect(validateThinkingPolicy(formValues)).toBeNull();
    expect(createAIModelPayload(7, formValues).thinking_policy).toEqual({
      levels: ['low', 'medium'],
      default_level: 'medium',
      can_disable: true,
      source: 'manual',
      verified: true,
    });
    expect(
      createAIModelPayload(7, {
        ...formValues,
        capabilities: ['tools'],
      }).thinking_policy,
    ).toBeNull();
  });

  it('allows empty thinking levels but rejects unsupported defaults', () => {
    const values = {
      capabilities: ['thinking' as const],
      kind: 'chat' as const,
      model_id: 'reasoner',
      policy_enabled: true,
      policy_levels: [] as ('low' | 'medium')[],
      status: 1 as const,
    };
    expect(validateThinkingPolicy(values)).toBeNull();
    expect(createAIModelPayload(7, values).thinking_policy?.levels).toEqual([]);
    expect(
      validateThinkingPolicy({
        ...values,
        policy_default_level: 'medium',
        policy_levels: ['low'],
      }),
    ).toBe('默认思考档位必须包含在支持的档位中');
  });

  it('allows a thinking policy with no adjustable levels and explicit disable', () => {
    const values = {
      capabilities: ['thinking' as const],
      kind: 'chat' as const,
      model_id: 'fixed-reasoner',
      policy_enabled: true,
      policy_can_disable: true,
      policy_levels: [],
      status: 1 as const,
    };
    expect(validateThinkingPolicy(values)).toBeNull();
    expect(createAIModelPayload(7, values).thinking_policy).toEqual({
      levels: [],
      default_level: null,
      can_disable: true,
      source: 'manual',
      verified: false,
    });
  });

  it('preserves discovered source until the policy changes', () => {
    const original = {
      levels: ['low' as const],
      default_level: 'low' as const,
      can_disable: false,
      source: 'discovered' as const,
      verified: true,
    };
    const values = {
      capabilities: ['thinking' as const],
      kind: 'chat' as const,
      model_id: 'reasoner',
      ...thinkingPolicyFormValues(original),
      status: 1 as const,
    };
    expect(
      createAIModelPayload(7, values, original).thinking_policy?.source,
    ).toBe('discovered');
    expect(
      createAIModelPayload(7, { ...values, policy_can_disable: true }, original)
        .thinking_policy?.source,
    ).toBe('manual');
  });

  it('loads discovered policies without marking them verified', () => {
    expect(
      thinkingPolicyFormValues({
        levels: ['minimal'],
        default_level: null,
        can_disable: false,
        source: 'discovered',
        verified: false,
      }),
    ).toEqual({
      policy_can_disable: false,
      policy_default_level: undefined,
      policy_enabled: true,
      policy_levels: ['minimal'],
      policy_verified: false,
    });
    expect(thinkingPolicyFormValues(null).policy_enabled).toBe(false);
  });
});
