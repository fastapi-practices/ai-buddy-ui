import type {
  AIModelCapability,
  AIModelKind,
  AIModelParams,
  AIStatusType,
} from '../../api';

export interface AIModelFormValues {
  capabilities?: AIModelCapability[];
  context_window?: null | number;
  kind: AIModelKind;
  max_output_tokens?: null | number;
  model_id: string;
  name?: null | string;
  remark?: null | string;
  sort?: number;
  status: AIStatusType;
}

function toOptionalNumber(value?: null | number) {
  return typeof value === 'number' && value > 0 ? value : null;
}

export function createAIModelPayload(
  providerId: number,
  values: AIModelFormValues,
): AIModelParams {
  return {
    capabilities: values.capabilities ?? [],
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
