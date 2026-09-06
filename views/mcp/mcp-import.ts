import type { AIMcpParams, AIMcpType } from '../../api';

import { assertCanUseStdioMcp } from './mcp-params';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeType(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[\s_-]/g, '');
}

function isSupportedServerType(value: unknown): boolean {
  if (value === 0 || value === 1 || value === 2) {
    return true;
  }
  const type = normalizeType(value);
  return (
    type === 'stdio' ||
    type === 'sse' ||
    type === 'http' ||
    type === 'streamablehttp'
  );
}

function isServerConfig(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.command === 'string' && value.command.trim()) {
    return true;
  }
  if (typeof value.url === 'string' && value.url.trim()) {
    return true;
  }
  if (typeof value.baseUrl === 'string' && value.baseUrl.trim()) {
    return true;
  }
  return isSupportedServerType(value.type);
}

function extractServerMap(parsed: unknown): Record<string, unknown> {
  if (!isRecord(parsed)) {
    throw new Error('MCP JSON 必须是对象');
  }

  if (isRecord(parsed.mcpServers)) {
    return parsed.mcpServers;
  }
  if (isRecord(parsed.servers)) {
    return parsed.servers;
  }
  if (isServerConfig(parsed)) {
    const name =
      typeof parsed.name === 'string' && parsed.name.trim()
        ? parsed.name.trim()
        : 'imported';
    return { [name]: parsed };
  }

  const entries = Object.entries(parsed);
  if (
    entries.length > 0 &&
    entries.every(([, value]) => isServerConfig(value))
  ) {
    return parsed;
  }

  throw new Error('未识别到标准 MCP 配置，请使用 mcpServers 格式');
}

function toArgs(value: unknown, name: string): null | string[] {
  if (value == null || value === '') {
    return null;
  }
  if (Array.isArray(value)) {
    const args = value
      .map((item) => String(item))
      .filter((item) => item.trim());
    return args.length > 0 ? args : null;
  }
  if (typeof value === 'string') {
    const args = value.trim().split(/\s+/).filter(Boolean);
    return args.length > 0 ? args : null;
  }
  throw new Error(`${name} 的 args 必须是数组或字符串`);
}

function toObject(
  value: unknown,
  field: string,
  name: string,
): null | Record<string, unknown> {
  if (value == null || value === '') {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error(`${name} 的 ${field} 必须是 JSON 对象`);
  }
  return value;
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return fallback;
}

function pickString(value: unknown): null | string {
  if (typeof value !== 'string') {
    return null;
  }
  return value.trim() || null;
}

function pickUrl(config: Record<string, unknown>): string {
  if (typeof config.url === 'string' && config.url.trim()) {
    return config.url.trim();
  }
  if (typeof config.baseUrl === 'string' && config.baseUrl.trim()) {
    return config.baseUrl.trim();
  }
  return '';
}

function isSkippedType(value: unknown): boolean {
  return normalizeType(value) === 'inmemory';
}

function resolveType(config: Record<string, unknown>, name: string): AIMcpType {
  if (config.type === 0 || config.type === 1 || config.type === 2) {
    return config.type;
  }

  const type = normalizeType(config.type);
  if (type === 'stdio') {
    return 0;
  }
  if (type === 'sse') {
    return 1;
  }
  if (type === 'http' || type === 'streamablehttp') {
    return 2;
  }
  if (type) {
    throw new Error(`${name} 使用了不支持的类型 ${String(config.type)}`);
  }

  if (typeof config.command === 'string' && config.command.trim()) {
    return 0;
  }

  const url = pickUrl(config);
  if (url) {
    return /\/sse(\b|\/|$)/i.test(url) ? 1 : 2;
  }

  throw new Error(`${name} 缺少 command 或 url`);
}

function toAIMcpParams(
  key: string,
  config: Record<string, unknown>,
  allowStdio: boolean,
): AIMcpParams {
  const name = pickString(config.name) ?? key.trim();
  if (!name) {
    throw new Error('MCP 名称不能为空');
  }

  const type = resolveType(config, name);
  assertCanUseStdioMcp(type, allowStdio, name);
  const isStdio = type === 0;
  const command = pickString(config.command);
  const url = pickUrl(config);

  if (isStdio && !command) {
    throw new Error(`${name} 缺少 command`);
  }
  if (!isStdio && !url) {
    throw new Error(`${name} 缺少 url`);
  }

  return {
    name,
    type,
    description: pickString(config.description),
    command: isStdio ? command : null,
    args: isStdio ? toArgs(config.args, name) : null,
    env: isStdio ? toObject(config.env, '环境变量', name) : null,
    url: isStdio ? null : url,
    headers: isStdio ? null : toObject(config.headers, '请求头', name),
    timeout: toNumber(config.timeout, 5),
    read_timeout: toNumber(config.read_timeout ?? config.readTimeout, 300),
    tool_prefix: pickString(config.tool_prefix ?? config.toolPrefix),
    include_instructions:
      config.include_instructions === true ||
      config.includeInstructions === true,
  };
}

export function parseStandardMcpJson(
  raw: string,
  options?: { allowStdio?: boolean },
): AIMcpParams[] {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('请粘贴 MCP JSON 配置');
  }

  const allowStdio = options?.allowStdio !== false;

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error('MCP JSON 格式无效');
  }

  const serverMap = extractServerMap(parsed);
  const payloads: AIMcpParams[] = [];

  for (const [key, value] of Object.entries(serverMap)) {
    if (!isRecord(value)) {
      throw new Error(`${key} 配置必须是对象`);
    }
    if (isSkippedType(value.type)) {
      continue;
    }
    payloads.push(toAIMcpParams(key, value, allowStdio));
  }

  if (payloads.length === 0) {
    throw new Error('未解析到可导入的 MCP 服务');
  }

  return payloads;
}
