import type { AIKnowledgeBaseParams, AIOnnxOption } from '../../api';

export type KnowledgeEmbeddingMode = 'default' | 'local' | 'remote';

export interface AIKnowledgeBaseFormValues {
  name: string;
  description?: null | string;
  embedding_mode: KnowledgeEmbeddingMode;
  provider_id?: null | number;
  model_id?: null | string;
  local_model_id?: string;
}

export function resetKnowledgeEmbeddingBinding(
  mode: KnowledgeEmbeddingMode,
  providerId?: null | number,
): Pick<
  AIKnowledgeBaseFormValues,
  'embedding_mode' | 'local_model_id' | 'model_id' | 'provider_id'
> {
  return {
    embedding_mode: mode,
    provider_id: mode === 'remote' ? (providerId ?? undefined) : undefined,
    model_id: undefined,
    local_model_id: undefined,
  };
}

export function toAIKnowledgeBaseFormValues(
  row?: AIKnowledgeBaseParams,
): AIKnowledgeBaseFormValues {
  const modelId = row?.model_id?.trim() || undefined;
  const mode =
    row?.provider_id != null ? 'remote' : modelId ? 'local' : 'default';
  return {
    ...resetKnowledgeEmbeddingBinding(mode, row?.provider_id),
    name: row?.name ?? '',
    description: row?.description ?? '',
    model_id: mode === 'remote' ? modelId : undefined,
    local_model_id: mode === 'local' ? modelId : undefined,
  };
}

export function createAIKnowledgeBasePayload(
  values: AIKnowledgeBaseFormValues,
): AIKnowledgeBaseParams {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || null,
    provider_id:
      values.embedding_mode === 'remote' ? (values.provider_id ?? null) : null,
    model_id:
      values.embedding_mode === 'local'
        ? values.local_model_id?.trim() || null
        : values.embedding_mode === 'remote'
          ? values.model_id?.trim() || null
          : null,
  };
}

export function getKnowledgeEmbeddingIssue(
  values: AIKnowledgeBaseFormValues,
  options: {
    localModels: Pick<AIOnnxOption, 'downloaded' | 'id'>[];
    modelIds: string[];
    providerIds: number[];
  },
):
  | 'localModelRequired'
  | 'localModelUnavailable'
  | 'localModelUndownloaded'
  | 'remoteBindingUnavailable'
  | 'remotePairRequired'
  | undefined {
  if (values.embedding_mode === 'local') {
    const modelId = values.local_model_id?.trim();
    if (!modelId) {
      return 'localModelRequired';
    }
    const model = options.localModels.find((item) => item.id === modelId);
    if (!model) {
      return 'localModelUnavailable';
    }
    if (!model.downloaded) {
      return 'localModelUndownloaded';
    }
  }
  if (values.embedding_mode === 'remote') {
    const modelId = values.model_id?.trim();
    if (values.provider_id == null || !modelId) {
      return 'remotePairRequired';
    }
    if (
      !options.providerIds.includes(values.provider_id) ||
      !options.modelIds.includes(modelId)
    ) {
      return 'remoteBindingUnavailable';
    }
  }
  return undefined;
}
