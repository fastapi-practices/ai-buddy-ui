import { describe, expect, it } from 'vitest';

import {
  AI_DYNAMIC_CONFIG_KEYS,
  isEditableAIConfigKey,
  pickEditableAIConfigs,
  pickRagConfigs,
  pickSearchEngineConfigs,
} from './config-keys';

const allConfigRows = [
  { key: 'AI_CONFIG_STATUS', value: '1' },
  { key: 'AI_EXA_API_KEY', value: 'exa' },
  { key: 'AI_TAVILY_API_KEY', value: 'tvly' },
  { key: 'AI_QDRANT_URL', value: 'http://localhost:6333' },
  { key: 'AI_QDRANT_API_KEY', value: 'qdrant' },
  { key: 'AI_EMBEDDING_API_KEY', value: 'embed' },
  { key: 'AI_EMBEDDING_API_HOST', value: 'https://api.openai.com/v1' },
  { key: 'AI_ADVISOR_MODEL', value: 'gpt-test' },
  { key: 'AI_USAGE_REQUEST_LIMIT', value: '20' },
  { key: 'AI_USAGE_TOOL_CALLS_LIMIT', value: '40' },
  { key: 'AI_USAGE_TOTAL_TOKENS_LIMIT', value: '100000' },
  { key: 'AI_SPEND_DAILY_USD', value: '5' },
  { key: 'AI_MCP_APPROVE_WRITES', value: 'true' },
  { key: 'AI_COMPACTION_KEEP_MESSAGES', value: '40' },
];

describe('pickEditableAIConfigs', () => {
  it('keeps search keys, RAG connection keys and the AI config status switch', () => {
    expect([...AI_DYNAMIC_CONFIG_KEYS]).toEqual([
      'AI_CONFIG_STATUS',
      'AI_EXA_API_KEY',
      'AI_TAVILY_API_KEY',
      'AI_QDRANT_URL',
      'AI_QDRANT_API_KEY',
      'AI_EMBEDDING_API_KEY',
      'AI_EMBEDDING_API_HOST',
    ]);

    expect(pickEditableAIConfigs(allConfigRows).map((item) => item.key)).toEqual(
      [
        'AI_CONFIG_STATUS',
        'AI_EXA_API_KEY',
        'AI_TAVILY_API_KEY',
        'AI_QDRANT_URL',
        'AI_QDRANT_API_KEY',
        'AI_EMBEDDING_API_KEY',
        'AI_EMBEDDING_API_HOST',
      ],
    );
  });

  it('splits search engine and RAG keys for tab saves', () => {
    expect(pickSearchEngineConfigs(allConfigRows).map((item) => item.key)).toEqual(
      ['AI_CONFIG_STATUS', 'AI_EXA_API_KEY', 'AI_TAVILY_API_KEY'],
    );
    expect(pickRagConfigs(allConfigRows).map((item) => item.key)).toEqual([
      'AI_QDRANT_URL',
      'AI_QDRANT_API_KEY',
      'AI_EMBEDDING_API_KEY',
      'AI_EMBEDDING_API_HOST',
    ]);
  });

  it('rejects client preference and server-only keys', () => {
    expect(isEditableAIConfigKey('AI_EXA_API_KEY')).toBe(true);
    expect(isEditableAIConfigKey('AI_QDRANT_URL')).toBe(true);
    expect(isEditableAIConfigKey('AI_ADVISOR_MODEL')).toBe(false);
    expect(isEditableAIConfigKey('AI_USAGE_REQUEST_LIMIT')).toBe(false);
    expect(isEditableAIConfigKey('AI_SPEND_DAILY_USD')).toBe(false);
    expect(isEditableAIConfigKey('AI_MCP_APPROVE_WRITES')).toBe(false);
  });
});
