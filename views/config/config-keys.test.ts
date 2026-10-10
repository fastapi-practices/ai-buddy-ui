import { describe, expect, it } from 'vitest';

import {
  AI_DYNAMIC_CONFIG_KEYS,
  isEditableAIConfigKey,
  pickEditableAIConfigs,
  pickJevConfigs,
  pickRagConfigs,
  pickRuntimeConfigs,
  pickSearchEngineConfigs,
} from './config-keys';

const allConfigRows = [
  { key: 'AI_BUDDY_CONFIG_STATUS', value: '1' },
  { key: 'AI_BUDDY_AGENT_EXECUTION_BACKEND', value: 'local' },
  { key: 'AI_EXA_API_KEY', value: 'legacy' },
  { key: 'AI_BUDDY_EXA_API_KEY', value: 'exa' },
  { key: 'AI_BUDDY_TAVILY_API_KEY', value: 'tvly' },
  { key: 'AI_BUDDY_EMBEDDING_BACKEND', value: 'remote' },
  { key: 'AI_BUDDY_ONNX_EMBEDDING_MODEL', value: 'BAAI/bge-small-zh-v1.5' },
  { key: 'AI_BUDDY_RAG_CHUNK_CHARS', value: '500' },
  { key: 'AI_BUDDY_RAG_CHUNK_OVERLAP', value: '80' },
  { key: 'AI_BUDDY_RAG_TOP_K', value: '6' },
  { key: 'AI_BUDDY_DOCUMENT_EXTRACT_BACKEND', value: 'native' },
  { key: 'AI_BUDDY_UNSTRUCTURED_API_URL', value: '' },
  { key: 'AI_BUDDY_UNSTRUCTURED_API_KEY', value: '' },
  { key: 'AI_BUDDY_MARKITDOWN_DOCINTEL_ENDPOINT', value: '' },
  { key: 'AI_BUDDY_MARKITDOWN_DOCINTEL_API_KEY', value: '' },
  { key: 'AI_BUDDY_MINERU_API_KEY', value: '' },
  { key: 'AI_BUDDY_OPEN_MINERU_API_URL', value: '' },
  { key: 'AI_BUDDY_OPEN_MINERU_API_KEY', value: '' },
  { key: 'AI_BUDDY_DOC2X_API_URL', value: '' },
  { key: 'AI_BUDDY_DOC2X_API_KEY', value: '' },
  { key: 'AI_BUDDY_MISTRAL_API_URL', value: '' },
  { key: 'AI_BUDDY_MISTRAL_API_KEY', value: '' },
  { key: 'AI_BUDDY_OCR_BACKEND', value: 'off' },
  { key: 'AI_BUDDY_PADDLEOCR_API_URL', value: '' },
  { key: 'AI_BUDDY_ADVISOR_MODEL', value: 'gpt-test' },
  { key: 'AI_BUDDY_USAGE_REQUEST_LIMIT', value: '20' },
  { key: 'AI_BUDDY_USAGE_TOOL_CALLS_LIMIT', value: '40' },
  { key: 'AI_BUDDY_USAGE_TOTAL_TOKENS_LIMIT', value: '100000' },
  { key: 'AI_BUDDY_SPEND_DAILY_USD', value: '5' },
  { key: 'AI_BUDDY_MCP_APPROVE_WRITES', value: 'true' },
  { key: 'AI_BUDDY_HTTP_MAX_RETRIES', value: '5' },
  { key: 'AI_BUDDY_MCP_MAX_RETRIES', value: '1' },
  { key: 'AI_BUDDY_COMPACTION_KEEP_MESSAGES', value: '40' },
  { key: 'AI_BUDDY_COMPACTION_MAX_MESSAGES', value: '80' },
  { key: 'AI_BUDDY_TYPESAFE_API_KEY', value: 'ts-key' },
  { key: 'AI_BUDDY_JEV_MODEL', value: 'jev-latest' },
  { key: 'AI_BUDDY_JEV_INPUT_THRESHOLD', value: '0.75' },
];

describe('pickEditableAIConfigs', () => {
  it('keeps search keys, RAG connection keys, runtime keys and Jev keys', () => {
    expect([...AI_DYNAMIC_CONFIG_KEYS]).toEqual([
      'AI_BUDDY_EXA_API_KEY',
      'AI_BUDDY_TAVILY_API_KEY',
      'AI_BUDDY_EMBEDDING_BACKEND',
      'AI_BUDDY_ONNX_EMBEDDING_MODEL',
      'AI_BUDDY_RAG_CHUNK_CHARS',
      'AI_BUDDY_RAG_CHUNK_OVERLAP',
      'AI_BUDDY_RAG_TOP_K',
      'AI_BUDDY_DOCUMENT_EXTRACT_BACKEND',
      'AI_BUDDY_UNSTRUCTURED_API_URL',
      'AI_BUDDY_UNSTRUCTURED_API_KEY',
      'AI_BUDDY_MARKITDOWN_DOCINTEL_ENDPOINT',
      'AI_BUDDY_MARKITDOWN_DOCINTEL_API_KEY',
      'AI_BUDDY_MINERU_API_KEY',
      'AI_BUDDY_OPEN_MINERU_API_URL',
      'AI_BUDDY_OPEN_MINERU_API_KEY',
      'AI_BUDDY_DOC2X_API_URL',
      'AI_BUDDY_DOC2X_API_KEY',
      'AI_BUDDY_MISTRAL_API_URL',
      'AI_BUDDY_MISTRAL_API_KEY',
      'AI_BUDDY_OCR_BACKEND',
      'AI_BUDDY_PADDLEOCR_API_URL',
      'AI_BUDDY_AGENT_EXECUTION_BACKEND',
      'AI_BUDDY_HTTP_MAX_RETRIES',
      'AI_BUDDY_MCP_MAX_RETRIES',
      'AI_BUDDY_COMPACTION_KEEP_MESSAGES',
      'AI_BUDDY_COMPACTION_MAX_MESSAGES',
      'AI_BUDDY_TYPESAFE_API_KEY',
      'AI_BUDDY_JEV_MODEL',
      'AI_BUDDY_JEV_INPUT_THRESHOLD',
    ]);

    expect(
      pickEditableAIConfigs(allConfigRows).map((item) => item.key),
    ).toEqual([
      'AI_BUDDY_AGENT_EXECUTION_BACKEND',
      'AI_BUDDY_EXA_API_KEY',
      'AI_BUDDY_TAVILY_API_KEY',
      'AI_BUDDY_EMBEDDING_BACKEND',
      'AI_BUDDY_ONNX_EMBEDDING_MODEL',
      'AI_BUDDY_RAG_CHUNK_CHARS',
      'AI_BUDDY_RAG_CHUNK_OVERLAP',
      'AI_BUDDY_RAG_TOP_K',
      'AI_BUDDY_DOCUMENT_EXTRACT_BACKEND',
      'AI_BUDDY_UNSTRUCTURED_API_URL',
      'AI_BUDDY_UNSTRUCTURED_API_KEY',
      'AI_BUDDY_MARKITDOWN_DOCINTEL_ENDPOINT',
      'AI_BUDDY_MARKITDOWN_DOCINTEL_API_KEY',
      'AI_BUDDY_MINERU_API_KEY',
      'AI_BUDDY_OPEN_MINERU_API_URL',
      'AI_BUDDY_OPEN_MINERU_API_KEY',
      'AI_BUDDY_DOC2X_API_URL',
      'AI_BUDDY_DOC2X_API_KEY',
      'AI_BUDDY_MISTRAL_API_URL',
      'AI_BUDDY_MISTRAL_API_KEY',
      'AI_BUDDY_OCR_BACKEND',
      'AI_BUDDY_PADDLEOCR_API_URL',
      'AI_BUDDY_HTTP_MAX_RETRIES',
      'AI_BUDDY_MCP_MAX_RETRIES',
      'AI_BUDDY_COMPACTION_KEEP_MESSAGES',
      'AI_BUDDY_COMPACTION_MAX_MESSAGES',
      'AI_BUDDY_TYPESAFE_API_KEY',
      'AI_BUDDY_JEV_MODEL',
      'AI_BUDDY_JEV_INPUT_THRESHOLD',
    ]);
  });

  it('splits search engine, RAG and runtime keys for tab saves', () => {
    expect(
      pickSearchEngineConfigs(allConfigRows).map((item) => item.key),
    ).toEqual(['AI_BUDDY_EXA_API_KEY', 'AI_BUDDY_TAVILY_API_KEY']);
    expect(pickRagConfigs(allConfigRows).map((item) => item.key)).toEqual([
      'AI_BUDDY_EMBEDDING_BACKEND',
      'AI_BUDDY_ONNX_EMBEDDING_MODEL',
      'AI_BUDDY_RAG_CHUNK_CHARS',
      'AI_BUDDY_RAG_CHUNK_OVERLAP',
      'AI_BUDDY_RAG_TOP_K',
      'AI_BUDDY_DOCUMENT_EXTRACT_BACKEND',
      'AI_BUDDY_UNSTRUCTURED_API_URL',
      'AI_BUDDY_UNSTRUCTURED_API_KEY',
      'AI_BUDDY_MARKITDOWN_DOCINTEL_ENDPOINT',
      'AI_BUDDY_MARKITDOWN_DOCINTEL_API_KEY',
      'AI_BUDDY_MINERU_API_KEY',
      'AI_BUDDY_OPEN_MINERU_API_URL',
      'AI_BUDDY_OPEN_MINERU_API_KEY',
      'AI_BUDDY_DOC2X_API_URL',
      'AI_BUDDY_DOC2X_API_KEY',
      'AI_BUDDY_MISTRAL_API_URL',
      'AI_BUDDY_MISTRAL_API_KEY',
      'AI_BUDDY_OCR_BACKEND',
      'AI_BUDDY_PADDLEOCR_API_URL',
    ]);
    expect(pickRuntimeConfigs(allConfigRows).map((item) => item.key)).toEqual([
      'AI_BUDDY_AGENT_EXECUTION_BACKEND',
      'AI_BUDDY_HTTP_MAX_RETRIES',
      'AI_BUDDY_MCP_MAX_RETRIES',
      'AI_BUDDY_COMPACTION_KEEP_MESSAGES',
      'AI_BUDDY_COMPACTION_MAX_MESSAGES',
    ]);
    expect(pickJevConfigs(allConfigRows).map((item) => item.key)).toEqual([
      'AI_BUDDY_TYPESAFE_API_KEY',
      'AI_BUDDY_JEV_MODEL',
      'AI_BUDDY_JEV_INPUT_THRESHOLD',
    ]);
  });

  it('rejects client preference and server-only keys', () => {
    expect(isEditableAIConfigKey('AI_BUDDY_CONFIG_STATUS')).toBe(false);
    expect(isEditableAIConfigKey('AI_EXA_API_KEY')).toBe(false);
    expect(isEditableAIConfigKey('AI_BUDDY_AGENT_EXECUTION_BACKEND')).toBe(
      true,
    );
    expect(isEditableAIConfigKey('AI_BUDDY_EXA_API_KEY')).toBe(true);
    expect(isEditableAIConfigKey('AI_BUDDY_QDRANT_URL')).toBe(false);
    expect(isEditableAIConfigKey('AI_BUDDY_QDRANT_API_KEY')).toBe(false);
    expect(isEditableAIConfigKey('AI_BUDDY_HTTP_MAX_RETRIES')).toBe(true);
    expect(isEditableAIConfigKey('AI_BUDDY_COMPACTION_KEEP_MESSAGES')).toBe(
      true,
    );
    expect(isEditableAIConfigKey('AI_BUDDY_DOCUMENT_EXTRACT_BACKEND')).toBe(
      true,
    );
    expect(isEditableAIConfigKey('AI_BUDDY_EMBEDDING_BACKEND')).toBe(true);
    expect(isEditableAIConfigKey('AI_BUDDY_ONNX_EMBEDDING_MODEL')).toBe(true);
    expect(isEditableAIConfigKey('AI_BUDDY_OCR_BACKEND')).toBe(true);
    expect(isEditableAIConfigKey('AI_BUDDY_UNSTRUCTURED_API_KEY')).toBe(true);
    expect(isEditableAIConfigKey('AI_BUDDY_MARKITDOWN_DOCINTEL_ENDPOINT')).toBe(
      true,
    );
    expect(isEditableAIConfigKey('AI_BUDDY_RAG_CHUNK_CHARS')).toBe(true);
    expect(isEditableAIConfigKey('AI_BUDDY_EMBEDDING_API_KEY')).toBe(false);
    expect(isEditableAIConfigKey('AI_BUDDY_ADVISOR_MODEL')).toBe(false);
    expect(isEditableAIConfigKey('AI_BUDDY_USAGE_REQUEST_LIMIT')).toBe(false);
    expect(isEditableAIConfigKey('AI_BUDDY_SPEND_DAILY_USD')).toBe(false);
    expect(isEditableAIConfigKey('AI_BUDDY_MCP_APPROVE_WRITES')).toBe(false);
    expect(isEditableAIConfigKey('AI_BUDDY_TYPESAFE_API_KEY')).toBe(true);
    expect(isEditableAIConfigKey('AI_BUDDY_JEV_MODEL')).toBe(true);
    expect(isEditableAIConfigKey('AI_BUDDY_JEV_INPUT_THRESHOLD')).toBe(true);
  });
});
