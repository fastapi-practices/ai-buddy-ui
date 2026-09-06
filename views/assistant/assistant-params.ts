import type { AIAssistantParams, AIAssistantResult } from '../../api';

export const AI_ASSISTANT_STARTER_MAX = 8;
export const AI_ASSISTANT_STARTER_TEXT_MAX = 256;

export interface AIAssistantFormValues {
  name: string;
  prompt: string;
  description?: null | string;
  category?: null | string;
  starters?: string[];
  sort?: number;
}

export function normalizeStarters(starters?: null | string[]): string[] {
  const values: string[] = [];
  for (const item of starters ?? []) {
    const text = item.trim();
    if (!text) {
      continue;
    }
    values.push(text.slice(0, AI_ASSISTANT_STARTER_TEXT_MAX));
    if (values.length >= AI_ASSISTANT_STARTER_MAX) {
      break;
    }
  }
  return values;
}

export function toAIAssistantFormValues(
  row?: AIAssistantResult,
): AIAssistantFormValues {
  return {
    name: row?.name ?? '',
    prompt: row?.prompt ?? '',
    description: row?.description ?? '',
    category: row?.category ?? '',
    starters: [...(row?.starters ?? [])],
    sort: row?.sort ?? 0,
  };
}

export function createAIAssistantPayload(
  values: AIAssistantFormValues,
): AIAssistantParams {
  return {
    name: values.name.trim(),
    prompt: values.prompt.trim(),
    description: values.description?.trim() || null,
    category: values.category?.trim() || null,
    starters: normalizeStarters(values.starters),
    sort: values.sort ?? 0,
  };
}
