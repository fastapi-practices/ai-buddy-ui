export type FallbackModelRef = {
  modelId: string;
  providerId: number;
};

/**
 * 兜底模型以 `供应商ID:模型ID` 的逗号分隔字符串保存在配置中。
 */
export function fallbackModelValue(
  providerId: number,
  modelId: string,
): string {
  return `${providerId}:${modelId}`;
}

export function parseFallbackModels(
  value: null | string | undefined,
): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializeFallbackModels(values: string[]): string {
  return values
    .map((item) => item.trim())
    .filter(Boolean)
    .join(',');
}

export function splitFallbackModelValue(
  value: string,
): FallbackModelRef | null {
  const separator = value.indexOf(':');
  if (separator <= 0) {
    return null;
  }
  const providerId = Number(value.slice(0, separator));
  const modelId = value.slice(separator + 1).trim();
  if (!Number.isInteger(providerId) || !modelId) {
    return null;
  }
  return { modelId, providerId };
}
