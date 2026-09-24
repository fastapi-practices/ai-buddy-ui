import type {
  AIModelArchitectureSuggestion,
  AIModelCapability,
  AIModelParams,
  AIModelResult,
  AIThinkingPolicy,
} from '../../api';

export type ArchitectureField =
  | 'context_window'
  | 'input_modalities'
  | 'kind'
  | 'max_output_tokens'
  | 'thinking'
  | 'thinking_policy'
  | 'tools';

const SYNC_FIELDS: ArchitectureField[] = [
  'kind',
  'input_modalities',
  'tools',
  'thinking',
  'thinking_policy',
  'context_window',
  'max_output_tokens',
];

export function syncArchitecturePayload(
  current: AIModelResult,
  suggestion: AIModelArchitectureSuggestion,
): AIModelParams | null {
  const payload = architecturePayload(current, suggestion, SYNC_FIELDS);
  return JSON.stringify(payload) ===
    JSON.stringify(architecturePayload(current, suggestion, []))
    ? null
    : payload;
}

export function suggestedCapabilities(
  current: AIModelCapability[],
  suggestion: AIModelArchitectureSuggestion,
  selected: ArchitectureField[],
): AIModelCapability[] {
  const result = new Set(current);
  for (const [flag, capability] of [
    ['tools', 'tools'],
    ['thinking', 'thinking'],
  ] as const) {
    if (!selected.includes(flag) || suggestion[flag] === null) continue;
    if (suggestion[flag] === true) result.add(capability);
    else result.delete(capability);
  }
  return [...result];
}

export function architecturePayload(
  current: AIModelResult,
  suggestion: AIModelArchitectureSuggestion,
  selected: ArchitectureField[],
  policy?: AIThinkingPolicy | null,
): AIModelParams {
  const fields = new Set(selected);
  const kind =
    fields.has('kind') && suggestion.kind ? suggestion.kind : current.kind;
  const capabilities =
    kind === 'chat'
      ? suggestedCapabilities(current.capabilities, suggestion, selected)
      : [];
  let thinkingPolicy: AIThinkingPolicy | null = null;
  if (kind === 'chat' && capabilities.includes('thinking')) {
    thinkingPolicy = current.thinking_policy;
    if (fields.has('thinking_policy') && suggestion.thinking_policy) {
      thinkingPolicy = suggestion.thinking_policy;
    }
    if (policy !== undefined) thinkingPolicy = policy;
  }
  return {
    provider_id: current.provider_id,
    model_id: current.model_id,
    name: current.name,
    kind,
    capabilities,
    input_modalities:
      fields.has('input_modalities') && suggestion.input_modalities
        ? suggestion.input_modalities
        : current.input_modalities,
    thinking_policy: thinkingPolicy,
    context_window:
      fields.has('context_window') && suggestion.context_window !== null
        ? suggestion.context_window
        : current.context_window,
    max_output_tokens:
      fields.has('max_output_tokens') && suggestion.max_output_tokens !== null
        ? suggestion.max_output_tokens
        : current.max_output_tokens,
    sort: current.sort,
    status: current.status,
    remark: current.remark,
  };
}
