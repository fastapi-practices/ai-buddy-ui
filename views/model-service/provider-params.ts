import type { AIProviderParams, AIProviderType, AIStatusType } from '../../api';

export const AI_PROVIDER_TYPE = {
  openai: 0,
  anthropic: 1,
  google: 2,
  xai: 3,
  openrouter: 4,
  openai_responses: 5,
} as const;

export const AI_PROVIDER_DEFAULT_HOST: Record<AIProviderType, string> = {
  0: 'https://api.openai.com',
  1: 'https://api.anthropic.com',
  2: 'https://generativelanguage.googleapis.com',
  3: 'https://api.x.ai',
  4: 'https://openrouter.ai',
  5: 'https://api.openai.com',
};

export interface AIProviderFormValues {
  name: string;
  type: AIProviderType;
  api_key?: null | string;
  api_host?: null | string;
  status: AIStatusType;
  remark?: null | string;
}

export function getProviderDefaultHost(type?: AIProviderType | number) {
  return (
    AI_PROVIDER_DEFAULT_HOST[Number(type) as AIProviderType] ??
    AI_PROVIDER_DEFAULT_HOST[0]
  );
}

export function normalizeProviderApiHost(value?: null | string) {
  return (value ?? '').trim().replace(/\/+$/, '');
}

export function isProviderDefaultHost(value?: null | string) {
  const host = normalizeProviderApiHost(value);
  if (!host) {
    return true;
  }
  return Object.values(AI_PROVIDER_DEFAULT_HOST).includes(
    host as (typeof AI_PROVIDER_DEFAULT_HOST)[AIProviderType],
  );
}

export function resolveProviderApiHost(
  type: AIProviderType | number,
  value?: null | string,
) {
  const host = normalizeProviderApiHost(value);
  return host || getProviderDefaultHost(type);
}

export function createAIProviderPayload(
  values: AIProviderFormValues,
): AIProviderParams {
  return {
    api_host: resolveProviderApiHost(values.type, values.api_host),
    api_key: values.api_key?.trim() ?? '',
    name: values.name.trim(),
    remark: values.remark?.trim() || null,
    status: values.status,
    type: values.type,
  };
}
