// 用量、花费、顾问模型和 MCP 写确认走客户端 forwardedProps，后台只维护搜索密钥
export const AI_CONFIG_STATUS_KEY = 'AI_CONFIG_STATUS';
export const AI_EXA_API_KEY = 'AI_EXA_API_KEY';
export const AI_TAVILY_API_KEY = 'AI_TAVILY_API_KEY';

export const AI_DYNAMIC_CONFIG_KEYS = [
  AI_CONFIG_STATUS_KEY,
  AI_EXA_API_KEY,
  AI_TAVILY_API_KEY,
] as const;

export type AIDynamicConfigKey = (typeof AI_DYNAMIC_CONFIG_KEYS)[number];

const AI_DYNAMIC_CONFIG_KEY_SET = new Set<string>(AI_DYNAMIC_CONFIG_KEYS);

export function isEditableAIConfigKey(key: string): key is AIDynamicConfigKey {
  return AI_DYNAMIC_CONFIG_KEY_SET.has(key);
}

export function pickEditableAIConfigs<T extends { key: string }>(
  rows: T[],
): T[] {
  return rows.filter((row) => isEditableAIConfigKey(row.key));
}
