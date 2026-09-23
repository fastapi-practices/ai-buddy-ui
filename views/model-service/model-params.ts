import type {
  AIBatchCreateModelsParams,
  AIModelCapability,
  AIModelKind,
  AIModelModality,
  AIModelParams,
  AIProviderModelResult,
  AIProviderType,
  AIStatusType,
  AIThinkingLevel,
  AIThinkingPolicy,
} from '../../api';

import { AI_PROVIDER_TYPE } from './provider-params';

export interface AIModelFormValues {
  capabilities?: AIModelCapability[];
  input_modalities?: AIModelModality[] | null;
  context_window?: null | number;
  kind: AIModelKind;
  max_output_tokens?: null | number;
  model_id: string;
  name?: null | string;
  policy_can_disable?: boolean;
  policy_default_level?: AIThinkingLevel | null;
  policy_enabled?: boolean;
  policy_levels?: AIThinkingLevel[];
  policy_verified?: boolean;
  remark?: null | string;
  sort?: number;
  status: AIStatusType;
}

export const THINKING_LEVEL_OPTIONS: {
  label: string;
  value: AIThinkingLevel;
}[] = [
  { label: '极简', value: 'minimal' },
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '极高', value: 'xhigh' },
];

export function supportsModelKind(
  providerType: AIProviderType,
  kind: AIModelKind,
) {
  if (kind === 'embedding') {
    return new Set<AIProviderType>([
      AI_PROVIDER_TYPE.openai,
      AI_PROVIDER_TYPE.openrouter,
      AI_PROVIDER_TYPE.openai_responses,
    ]).has(providerType);
  }
  if (kind === 'image') {
    return new Set<AIProviderType>([
      AI_PROVIDER_TYPE.openai,
      AI_PROVIDER_TYPE.google,
      AI_PROVIDER_TYPE.xai,
      AI_PROVIDER_TYPE.openai_responses,
    ]).has(providerType);
  }
  return true;
}

export function canConfigureThinkingPolicy(values: AIModelFormValues) {
  return values.kind === 'chat' && values.capabilities?.includes('thinking');
}

export function thinkingPolicyFormValues(policy: AIThinkingPolicy | null) {
  return {
    policy_can_disable: policy?.can_disable ?? false,
    policy_default_level: policy?.default_level ?? undefined,
    policy_enabled: policy !== null,
    policy_levels: policy?.levels ?? [],
    policy_verified: policy?.verified ?? false,
  };
}

export function validateThinkingPolicy(values: AIModelFormValues) {
  if (!canConfigureThinkingPolicy(values) || !values.policy_enabled) {
    return null;
  }
  const levels = values.policy_levels ?? [];
  if (
    values.policy_default_level &&
    !levels.includes(values.policy_default_level)
  ) {
    return '默认思考档位必须包含在支持的档位中';
  }
  return null;
}

function toOptionalNumber(value?: null | number) {
  return typeof value === 'number' && value > 0 ? value : null;
}

export function createAIBatchModelPayload(
  providerId: number,
  selectedModels: AIProviderModelResult[],
): AIBatchCreateModelsParams {
  return {
    items: selectedModels.map((model) => ({
      capabilities: model.kind === 'chat' ? (model.capabilities ?? []) : [],
      input_modalities: model.input_modalities,
      context_window: model.context_window ?? null,
      kind: model.kind,
      max_output_tokens: model.max_output_tokens ?? null,
      model_id: model.id,
      name: model.display_name?.trim() || null,
      provider_id: providerId,
      remark: null,
      sort: 0,
      status: 1,
    })),
  };
}

export function createAIModelPayload(
  providerId: number,
  values: AIModelFormValues,
  originalPolicy?: AIThinkingPolicy | null,
): AIModelParams {
  const policy: AIThinkingPolicy | null =
    canConfigureThinkingPolicy(values) && values.policy_enabled
      ? {
          levels: values.policy_levels ?? [],
          default_level: values.policy_default_level || null,
          can_disable: values.policy_can_disable ?? false,
          source: 'manual',
          verified: values.policy_verified ?? false,
        }
      : null;
  if (
    policy &&
    originalPolicy &&
    policy.default_level === originalPolicy.default_level &&
    policy.can_disable === originalPolicy.can_disable &&
    policy.verified === originalPolicy.verified &&
    policy.levels.length === originalPolicy.levels.length &&
    policy.levels.every((level) => originalPolicy.levels.includes(level))
  ) {
    policy.source = originalPolicy.source;
  }

  return {
    capabilities: values.kind === 'chat' ? (values.capabilities ?? []) : [],
    input_modalities: values.input_modalities ?? null,
    thinking_policy: policy,
    context_window: toOptionalNumber(values.context_window),
    kind: values.kind,
    max_output_tokens: toOptionalNumber(values.max_output_tokens),
    model_id: values.model_id.trim(),
    name: values.name?.trim() || null,
    provider_id: providerId,
    remark: values.remark?.trim() || null,
    sort: values.sort ?? 0,
    status: values.status,
  };
}
