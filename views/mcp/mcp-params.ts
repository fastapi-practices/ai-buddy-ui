import type { AIMcpParams, AIMcpResult, AIMcpType } from '../../api';

export const MCP_STDIO_TYPE: AIMcpType = 0;
export const MCP_STREAMABLE_HTTP_TYPE: AIMcpType = 2;

export function getDefaultMcpType(isSuperuser: boolean): AIMcpType {
  return isSuperuser ? MCP_STDIO_TYPE : MCP_STREAMABLE_HTTP_TYPE;
}

export function assertCanUseStdioMcp(
  type: AIMcpType | number,
  isSuperuser: boolean,
  name?: string,
) {
  if (Number(type) !== MCP_STDIO_TYPE || isSuperuser) {
    return;
  }

  throw new Error(
    name
      ? `${name} 为 stdio 类型，仅超级管理员可以使用`
      : '仅超级管理员可以使用 stdio MCP',
  );
}

export interface AIMcpFormValues {
  name: string;
  type: AIMcpType;
  description?: null | string;
  command?: null | string;
  argsText?: null | string;
  envText?: null | string;
  url?: null | string;
  headersText?: null | string;
  timeout?: number;
  read_timeout?: number;
  tool_prefix?: null | string;
  include_instructions?: boolean;
}

function parseJsonObject(
  value: null | string | undefined,
  field: string,
): null | Record<string, unknown> {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${field} 必须是 JSON 对象`);
  }
  return parsed as Record<string, unknown>;
}

function parseArgs(value: null | string | undefined): null | string[] {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.split(/\s+/).filter(Boolean);
}

export function toAIMcpFormValues(
  row?: AIMcpResult,
  options?: { defaultType?: AIMcpType },
): AIMcpFormValues {
  return {
    name: row?.name ?? '',
    type: row?.type ?? options?.defaultType ?? MCP_STDIO_TYPE,
    description: row?.description ?? '',
    command: row?.command ?? '',
    argsText: row?.args?.join(' ') ?? '',
    envText: row?.env ? JSON.stringify(row.env, null, 2) : '',
    url: row?.url ?? '',
    headersText: row?.headers ? JSON.stringify(row.headers, null, 2) : '',
    timeout: row?.timeout ?? 5,
    read_timeout: row?.read_timeout ?? 300,
    tool_prefix: row?.tool_prefix ?? '',
    include_instructions: row?.include_instructions ?? false,
  };
}

export function createAIMcpPayload(
  values: AIMcpFormValues,
  options?: { isSuperuser?: boolean },
): AIMcpParams {
  const type = Number(values.type) as AIMcpType;
  assertCanUseStdioMcp(type, options?.isSuperuser !== false);
  const isStdio = type === MCP_STDIO_TYPE;

  return {
    name: values.name.trim(),
    type,
    description: values.description?.trim() || null,
    command: isStdio ? values.command?.trim() || null : null,
    args: isStdio ? parseArgs(values.argsText) : null,
    env: isStdio ? parseJsonObject(values.envText, '环境变量') : null,
    url: isStdio ? null : values.url?.trim() || null,
    headers: isStdio ? null : parseJsonObject(values.headersText, '请求头'),
    timeout: values.timeout ?? 5,
    read_timeout: values.read_timeout ?? 300,
    tool_prefix: values.tool_prefix?.trim() || null,
    include_instructions: values.include_instructions === true,
  };
}
