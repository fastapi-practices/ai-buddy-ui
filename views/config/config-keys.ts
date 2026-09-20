// 用量、花费、顾问模型和 MCP 写确认走客户端 forwardedProps
// 向量化走默认向量模型，后台维护搜索密钥、Jev 护栏、文档抽取/OCR、切片和运行参数
export const AI_EXA_API_KEY = 'AI_EXA_API_KEY';
export const AI_TAVILY_API_KEY = 'AI_TAVILY_API_KEY';
export const AI_TYPESAFE_API_KEY = 'AI_TYPESAFE_API_KEY';
export const AI_JEV_MODEL = 'AI_JEV_MODEL';
export const AI_JEV_INPUT_THRESHOLD = 'AI_JEV_INPUT_THRESHOLD';
export const AI_HTTP_MAX_RETRIES = 'AI_HTTP_MAX_RETRIES';
export const AI_MCP_MAX_RETRIES = 'AI_MCP_MAX_RETRIES';
export const AI_COMPACTION_KEEP_MESSAGES = 'AI_COMPACTION_KEEP_MESSAGES';
export const AI_COMPACTION_MAX_MESSAGES = 'AI_COMPACTION_MAX_MESSAGES';
export const AI_DOCUMENT_EXTRACT_BACKEND = 'AI_DOCUMENT_EXTRACT_BACKEND';
export const AI_UNSTRUCTURED_API_URL = 'AI_UNSTRUCTURED_API_URL';
export const AI_UNSTRUCTURED_API_KEY = 'AI_UNSTRUCTURED_API_KEY';
export const AI_MARKITDOWN_DOCINTEL_ENDPOINT =
  'AI_MARKITDOWN_DOCINTEL_ENDPOINT';
export const AI_MARKITDOWN_DOCINTEL_API_KEY = 'AI_MARKITDOWN_DOCINTEL_API_KEY';
export const AI_MINERU_API_KEY = 'AI_MINERU_API_KEY';
export const AI_OPEN_MINERU_API_URL = 'AI_OPEN_MINERU_API_URL';
export const AI_OPEN_MINERU_API_KEY = 'AI_OPEN_MINERU_API_KEY';
export const AI_DOC2X_API_URL = 'AI_DOC2X_API_URL';
export const AI_DOC2X_API_KEY = 'AI_DOC2X_API_KEY';
export const AI_MISTRAL_API_URL = 'AI_MISTRAL_API_URL';
export const AI_MISTRAL_API_KEY = 'AI_MISTRAL_API_KEY';
export const AI_EMBEDDING_BACKEND = 'AI_EMBEDDING_BACKEND';
export const AI_ONNX_EMBEDDING_MODEL = 'AI_ONNX_EMBEDDING_MODEL';
export const AI_OCR_BACKEND = 'AI_OCR_BACKEND';
export const AI_PADDLEOCR_API_URL = 'AI_PADDLEOCR_API_URL';
export const AI_RAG_CHUNK_CHARS = 'AI_RAG_CHUNK_CHARS';
export const AI_RAG_CHUNK_OVERLAP = 'AI_RAG_CHUNK_OVERLAP';
export const AI_RAG_TOP_K = 'AI_RAG_TOP_K';

export const AI_SEARCH_ENGINE_CONFIG_KEYS = [
  AI_EXA_API_KEY,
  AI_TAVILY_API_KEY,
] as const;

export const AI_RAG_EMBED_CONFIG_KEYS = [
  AI_EMBEDDING_BACKEND,
  AI_ONNX_EMBEDDING_MODEL,
] as const;

export const AI_RAG_STORE_CONFIG_KEYS = [
  AI_RAG_CHUNK_CHARS,
  AI_RAG_CHUNK_OVERLAP,
  AI_RAG_TOP_K,
] as const;

export const AI_RAG_EXTRACT_CONFIG_KEYS = [
  AI_DOCUMENT_EXTRACT_BACKEND,
  AI_UNSTRUCTURED_API_URL,
  AI_UNSTRUCTURED_API_KEY,
  AI_MARKITDOWN_DOCINTEL_ENDPOINT,
  AI_MARKITDOWN_DOCINTEL_API_KEY,
  AI_MINERU_API_KEY,
  AI_OPEN_MINERU_API_URL,
  AI_OPEN_MINERU_API_KEY,
  AI_DOC2X_API_URL,
  AI_DOC2X_API_KEY,
  AI_MISTRAL_API_URL,
  AI_MISTRAL_API_KEY,
] as const;

export const AI_RAG_OCR_CONFIG_KEYS = [
  AI_OCR_BACKEND,
  AI_PADDLEOCR_API_URL,
] as const;

export const AI_RAG_CONFIG_KEYS = [
  ...AI_RAG_EMBED_CONFIG_KEYS,
  ...AI_RAG_STORE_CONFIG_KEYS,
  ...AI_RAG_EXTRACT_CONFIG_KEYS,
  ...AI_RAG_OCR_CONFIG_KEYS,
] as const;

export const AI_RUNTIME_CONFIG_KEYS = [
  AI_HTTP_MAX_RETRIES,
  AI_MCP_MAX_RETRIES,
  AI_COMPACTION_KEEP_MESSAGES,
  AI_COMPACTION_MAX_MESSAGES,
] as const;

export const AI_JEV_CONFIG_KEYS = [
  AI_TYPESAFE_API_KEY,
  AI_JEV_MODEL,
  AI_JEV_INPUT_THRESHOLD,
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

export function pickJevConfigs<T extends { key: string }>(rows: T[]): T[] {
  return pickConfigsByKeys(rows, AI_JEV_CONFIG_KEYS);
}

export function pickEditableAIConfigs<T extends { key: string }>(
  rows: T[],
): T[] {
  return pickConfigsByKeys(rows, AI_DYNAMIC_CONFIG_KEYS);
}
