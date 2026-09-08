// 用量、花费、顾问模型和 MCP 写确认走客户端 forwardedProps，后台只维护搜索密钥和 RAG 连接
export const AI_CONFIG_STATUS_KEY = 'AI_CONFIG_STATUS';
export const AI_EXA_API_KEY = 'AI_EXA_API_KEY';
export const AI_TAVILY_API_KEY = 'AI_TAVILY_API_KEY';
export const AI_QDRANT_URL = 'AI_QDRANT_URL';
export const AI_QDRANT_API_KEY = 'AI_QDRANT_API_KEY';
export const AI_EMBEDDING_API_KEY = 'AI_EMBEDDING_API_KEY';
export const AI_EMBEDDING_API_HOST = 'AI_EMBEDDING_API_HOST';

export const AI_SEARCH_ENGINE_CONFIG_KEYS = [
  AI_CONFIG_STATUS_KEY,
  AI_EXA_API_KEY,
  AI_TAVILY_API_KEY,
] as const;

export const AI_RAG_CONFIG_KEYS = [
  AI_QDRANT_URL,
  AI_QDRANT_API_KEY,
  AI_EMBEDDING_API_KEY,
  AI_EMBEDDING_API_HOST,
] as const;

export const AI_DYNAMIC_CONFIG_KEYS = [
  ...AI_SEARCH_ENGINE_CONFIG_KEYS,
  ...AI_RAG_CONFIG_KEYS,
] as const;

export type AIDynamicConfigKey = (typeof AI_DYNAMIC_CONFIG_KEYS)[number];

const AI_DYNAMIC_CONFIG_KEY_SET = new Set<string>(AI_DYNAMIC_CONFIG_KEYS);

export function isEditableAIConfigKey(key: string): key is AIDynamicConfigKey {
  return AI_DYNAMIC_CONFIG_KEY_SET.has(key);
}

export function pickConfigsByKeys<T extends { key: string }>(
  rows: T[],
  keys: readonly string[],
): T[] {
  const keySet = new Set<string>(keys);
  return rows.filter((row) => keySet.has(row.key));
}

export function pickSearchEngineConfigs<T extends { key: string }>(
  rows: T[],
): T[] {
  return pickConfigsByKeys(rows, AI_SEARCH_ENGINE_CONFIG_KEYS);
}

export function pickRagConfigs<T extends { key: string }>(rows: T[]): T[] {
  return pickConfigsByKeys(rows, AI_RAG_CONFIG_KEYS);
}

export function pickEditableAIConfigs<T extends { key: string }>(
  rows: T[],
): T[] {
  return pickConfigsByKeys(rows, AI_DYNAMIC_CONFIG_KEYS);
}
