// 用量、花费、顾问模型和 MCP 写确认走客户端 forwardedProps
// 向量化按知识库绑定及 RAG 配置选择模型
export const AI_BUDDY_AGENT_EXECUTION_BACKEND =
  'AI_BUDDY_AGENT_EXECUTION_BACKEND';
export const AI_BUDDY_EXA_API_KEY = 'AI_BUDDY_EXA_API_KEY';
export const AI_BUDDY_TAVILY_API_KEY = 'AI_BUDDY_TAVILY_API_KEY';
export const AI_BUDDY_TYPESAFE_API_KEY = 'AI_BUDDY_TYPESAFE_API_KEY';
export const AI_BUDDY_JEV_MODEL = 'AI_BUDDY_JEV_MODEL';
export const AI_BUDDY_JEV_INPUT_THRESHOLD = 'AI_BUDDY_JEV_INPUT_THRESHOLD';
export const AI_BUDDY_HTTP_MAX_RETRIES = 'AI_BUDDY_HTTP_MAX_RETRIES';
export const AI_BUDDY_MCP_MAX_RETRIES = 'AI_BUDDY_MCP_MAX_RETRIES';
export const AI_BUDDY_COMPACTION_KEEP_MESSAGES =
  'AI_BUDDY_COMPACTION_KEEP_MESSAGES';
export const AI_BUDDY_COMPACTION_MAX_MESSAGES =
  'AI_BUDDY_COMPACTION_MAX_MESSAGES';
export const AI_BUDDY_DOCUMENT_EXTRACT_BACKEND =
  'AI_BUDDY_DOCUMENT_EXTRACT_BACKEND';
export const AI_BUDDY_UNSTRUCTURED_API_URL = 'AI_BUDDY_UNSTRUCTURED_API_URL';
export const AI_BUDDY_UNSTRUCTURED_API_KEY = 'AI_BUDDY_UNSTRUCTURED_API_KEY';
export const AI_BUDDY_MARKITDOWN_DOCINTEL_ENDPOINT =
  'AI_BUDDY_MARKITDOWN_DOCINTEL_ENDPOINT';
export const AI_BUDDY_MARKITDOWN_DOCINTEL_API_KEY =
  'AI_BUDDY_MARKITDOWN_DOCINTEL_API_KEY';
export const AI_BUDDY_MINERU_API_KEY = 'AI_BUDDY_MINERU_API_KEY';
export const AI_BUDDY_OPEN_MINERU_API_URL = 'AI_BUDDY_OPEN_MINERU_API_URL';
export const AI_BUDDY_OPEN_MINERU_API_KEY = 'AI_BUDDY_OPEN_MINERU_API_KEY';
export const AI_BUDDY_DOC2X_API_URL = 'AI_BUDDY_DOC2X_API_URL';
export const AI_BUDDY_DOC2X_API_KEY = 'AI_BUDDY_DOC2X_API_KEY';
export const AI_BUDDY_MISTRAL_API_URL = 'AI_BUDDY_MISTRAL_API_URL';
export const AI_BUDDY_MISTRAL_API_KEY = 'AI_BUDDY_MISTRAL_API_KEY';
export const AI_BUDDY_EMBEDDING_BACKEND = 'AI_BUDDY_EMBEDDING_BACKEND';
export const AI_BUDDY_ONNX_EMBEDDING_MODEL = 'AI_BUDDY_ONNX_EMBEDDING_MODEL';
export const AI_BUDDY_OCR_BACKEND = 'AI_BUDDY_OCR_BACKEND';
export const AI_BUDDY_PADDLEOCR_API_URL = 'AI_BUDDY_PADDLEOCR_API_URL';
export const AI_BUDDY_RAG_CHUNK_CHARS = 'AI_BUDDY_RAG_CHUNK_CHARS';
export const AI_BUDDY_RAG_CHUNK_OVERLAP = 'AI_BUDDY_RAG_CHUNK_OVERLAP';
export const AI_BUDDY_RAG_TOP_K = 'AI_BUDDY_RAG_TOP_K';

export const AI_SEARCH_ENGINE_CONFIG_KEYS = [
  AI_BUDDY_EXA_API_KEY,
  AI_BUDDY_TAVILY_API_KEY,
] as const;

export const AI_RAG_EMBED_CONFIG_KEYS = [
  AI_BUDDY_EMBEDDING_BACKEND,
  AI_BUDDY_ONNX_EMBEDDING_MODEL,
] as const;

export const AI_RAG_STORE_CONFIG_KEYS = [
  AI_BUDDY_RAG_CHUNK_CHARS,
  AI_BUDDY_RAG_CHUNK_OVERLAP,
  AI_BUDDY_RAG_TOP_K,
] as const;

export const AI_RAG_EXTRACT_CONFIG_KEYS = [
  AI_BUDDY_DOCUMENT_EXTRACT_BACKEND,
  AI_BUDDY_UNSTRUCTURED_API_URL,
  AI_BUDDY_UNSTRUCTURED_API_KEY,
  AI_BUDDY_MARKITDOWN_DOCINTEL_ENDPOINT,
  AI_BUDDY_MARKITDOWN_DOCINTEL_API_KEY,
  AI_BUDDY_MINERU_API_KEY,
  AI_BUDDY_OPEN_MINERU_API_URL,
  AI_BUDDY_OPEN_MINERU_API_KEY,
  AI_BUDDY_DOC2X_API_URL,
  AI_BUDDY_DOC2X_API_KEY,
  AI_BUDDY_MISTRAL_API_URL,
  AI_BUDDY_MISTRAL_API_KEY,
] as const;

export const AI_RAG_OCR_CONFIG_KEYS = [
  AI_BUDDY_OCR_BACKEND,
  AI_BUDDY_PADDLEOCR_API_URL,
] as const;

export const AI_RAG_CONFIG_KEYS = [
  ...AI_RAG_EMBED_CONFIG_KEYS,
  ...AI_RAG_STORE_CONFIG_KEYS,
  ...AI_RAG_EXTRACT_CONFIG_KEYS,
  ...AI_RAG_OCR_CONFIG_KEYS,
] as const;

export const AI_RUNTIME_CONFIG_KEYS = [
  AI_BUDDY_AGENT_EXECUTION_BACKEND,
  AI_BUDDY_HTTP_MAX_RETRIES,
  AI_BUDDY_MCP_MAX_RETRIES,
  AI_BUDDY_COMPACTION_KEEP_MESSAGES,
  AI_BUDDY_COMPACTION_MAX_MESSAGES,
] as const;

export const AI_JEV_CONFIG_KEYS = [
  AI_BUDDY_TYPESAFE_API_KEY,
  AI_BUDDY_JEV_MODEL,
  AI_BUDDY_JEV_INPUT_THRESHOLD,
] as const;

export const AI_DYNAMIC_CONFIG_KEYS = [
  ...AI_SEARCH_ENGINE_CONFIG_KEYS,
  ...AI_RAG_CONFIG_KEYS,
  ...AI_RUNTIME_CONFIG_KEYS,
  ...AI_JEV_CONFIG_KEYS,
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

export function pickRagStoreConfigs<T extends { key: string }>(rows: T[]): T[] {
  return pickConfigsByKeys(rows, AI_RAG_STORE_CONFIG_KEYS);
}

export function pickRagExtractConfigs<T extends { key: string }>(
  rows: T[],
): T[] {
  return pickConfigsByKeys(rows, AI_RAG_EXTRACT_CONFIG_KEYS);
}

export function pickRagOcrConfigs<T extends { key: string }>(rows: T[]): T[] {
  return pickConfigsByKeys(rows, AI_RAG_OCR_CONFIG_KEYS);
}

export function pickRuntimeConfigs<T extends { key: string }>(rows: T[]): T[] {
  return pickConfigsByKeys(rows, AI_RUNTIME_CONFIG_KEYS);
}

export function normalizeAIConfigValue(key: string, value: string): string {
  if (key === AI_BUDDY_AGENT_EXECUTION_BACKEND && value === 'opensandbox') {
    return 'sandbox';
  }
  return value;
}

export function pickJevConfigs<T extends { key: string }>(rows: T[]): T[] {
  return pickConfigsByKeys(rows, AI_JEV_CONFIG_KEYS);
}

export function pickEditableAIConfigs<T extends { key: string }>(
  rows: T[],
): T[] {
  return pickConfigsByKeys(rows, AI_DYNAMIC_CONFIG_KEYS);
}
