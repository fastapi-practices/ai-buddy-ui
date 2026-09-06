import { describe, expect, it } from 'vitest';

import {
  assertCanUseStdioMcp,
  createAIMcpPayload,
  getDefaultMcpType,
  toAIMcpFormValues,
} from './mcp-params';

describe('createAIMcpPayload', () => {
  it('keeps stdio command fields and drops url fields', () => {
    expect(
      createAIMcpPayload({
        name: '  local  ',
        type: 0,
        description: '  demo  ',
        command: 'npx',
        argsText: '-y demo',
        envText: '{"TOKEN":"abc"}',
        url: 'https://example.com',
        headersText: '{"Authorization":"Bearer x"}',
        timeout: 8,
        read_timeout: 120,
        tool_prefix: ' demo ',
        include_instructions: true,
      }),
    ).toEqual({
      name: 'local',
      type: 0,
      description: 'demo',
      command: 'npx',
      args: ['-y', 'demo'],
      env: { TOKEN: 'abc' },
      url: null,
      headers: null,
      timeout: 8,
      read_timeout: 120,
      tool_prefix: 'demo',
      include_instructions: true,
    });
  });

  it('rejects stdio payloads for non-superusers', () => {
    expect(() =>
      createAIMcpPayload(
        {
          name: 'local',
          type: 0,
          command: 'npx',
        },
        { isSuperuser: false },
      ),
    ).toThrow('仅超级管理员可以使用 stdio MCP');
  });

  it('keeps http fields and drops stdio fields', () => {
    expect(
      createAIMcpPayload({
        name: 'remote',
        type: 2,
        command: 'npx',
        argsText: '-y demo',
        envText: '{"TOKEN":"abc"}',
        url: 'https://example.com/mcp',
        headersText: '{"Authorization":"Bearer x"}',
      }),
    ).toEqual({
      name: 'remote',
      type: 2,
      description: null,
      command: null,
      args: null,
      env: null,
      url: 'https://example.com/mcp',
      headers: { Authorization: 'Bearer x' },
      timeout: 5,
      read_timeout: 300,
      tool_prefix: null,
      include_instructions: false,
    });
  });
});

describe('getDefaultMcpType', () => {
  it('defaults to stdio for superusers and http otherwise', () => {
    expect(getDefaultMcpType(true)).toBe(0);
    expect(getDefaultMcpType(false)).toBe(2);
  });
});

describe('assertCanUseStdioMcp', () => {
  it('allows stdio only for superusers', () => {
    expect(() => assertCanUseStdioMcp(0, true)).not.toThrow();
    expect(() => assertCanUseStdioMcp(2, false)).not.toThrow();
    expect(() => assertCanUseStdioMcp(0, false, 'github')).toThrow(
      'github 为 stdio 类型，仅超级管理员可以使用',
    );
  });
});

describe('toAIMcpFormValues', () => {
  it('serializes nested mcp fields for the form', () => {
    expect(
      toAIMcpFormValues({
        id: 1,
        user_id: 1,
        name: 'remote',
        type: 1,
        args: ['-y', 'demo'],
        env: { TOKEN: 'abc' },
        headers: { Authorization: 'Bearer x' },
        created_time: '2026-01-01',
      }),
    ).toMatchObject({
      name: 'remote',
      type: 1,
      argsText: '-y demo',
      envText: JSON.stringify({ TOKEN: 'abc' }, null, 2),
      headersText: JSON.stringify({ Authorization: 'Bearer x' }, null, 2),
    });
  });
});
