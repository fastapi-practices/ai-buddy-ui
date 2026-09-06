import { describe, expect, it } from 'vitest';

import { parseStandardMcpJson } from './mcp-import';

describe('parseStandardMcpJson', () => {
  it('parses Claude Desktop mcpServers stdio config', () => {
    expect(
      parseStandardMcpJson(`{
        "mcpServers": {
          "github": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-github"],
            "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_TOKEN" }
          }
        }
      }`),
    ).toEqual([
      {
        name: 'github',
        type: 0,
        description: null,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: { GITHUB_PERSONAL_ACCESS_TOKEN: 'YOUR_TOKEN' },
        url: null,
        headers: null,
        timeout: 5,
        read_timeout: 300,
        tool_prefix: null,
        include_instructions: false,
      },
    ]);
  });

  it('parses sse and streamable http servers', () => {
    expect(
      parseStandardMcpJson(`{
        "mcpServers": {
          "sse-server": {
            "type": "sse",
            "url": "https://example.com/events",
            "headers": { "Authorization": "Bearer x" }
          },
          "http-server": {
            "type": "streamableHttp",
            "url": "https://example.com/mcp"
          }
        }
      }`),
    ).toEqual([
      {
        name: 'sse-server',
        type: 1,
        description: null,
        command: null,
        args: null,
        env: null,
        url: 'https://example.com/events',
        headers: { Authorization: 'Bearer x' },
        timeout: 5,
        read_timeout: 300,
        tool_prefix: null,
        include_instructions: false,
      },
      {
        name: 'http-server',
        type: 2,
        description: null,
        command: null,
        args: null,
        env: null,
        url: 'https://example.com/mcp',
        headers: null,
        timeout: 5,
        read_timeout: 300,
        tool_prefix: null,
        include_instructions: false,
      },
    ]);
  });

  it('parses vscode servers wrapper and infers type from url', () => {
    expect(
      parseStandardMcpJson(`{
        "servers": {
          "remote": {
            "url": "https://example.com/mcp"
          },
          "legacy": {
            "baseUrl": "https://example.com/sse"
          }
        }
      }`),
    ).toMatchObject([
      { name: 'remote', type: 2, url: 'https://example.com/mcp' },
      { name: 'legacy', type: 1, url: 'https://example.com/sse' },
    ]);
  });

  it('parses a single server object and a bare server map', () => {
    expect(
      parseStandardMcpJson(`{
        "name": "local",
        "command": "uvx",
        "args": "mcp-server-fetch"
      }`),
    ).toMatchObject([
      { name: 'local', type: 0, command: 'uvx', args: ['mcp-server-fetch'] },
    ]);

    expect(
      parseStandardMcpJson(`{
        "fetch": { "command": "uvx", "args": ["mcp-server-fetch"] }
      }`),
    ).toMatchObject([{ name: 'fetch', type: 0, command: 'uvx' }]);
  });

  it('skips inMemory servers and maps extra fields', () => {
    expect(
      parseStandardMcpJson(`{
        "mcpServers": {
          "memory": { "type": "inMemory" },
          "docs": {
            "command": "npx",
            "description": "  demo  ",
            "timeout": 8,
            "readTimeout": 120,
            "toolPrefix": " docs ",
            "includeInstructions": true
          }
        }
      }`),
    ).toEqual([
      {
        name: 'docs',
        type: 0,
        description: 'demo',
        command: 'npx',
        args: null,
        env: null,
        url: null,
        headers: null,
        timeout: 8,
        read_timeout: 120,
        tool_prefix: 'docs',
        include_instructions: true,
      },
    ]);
  });

  it('rejects stdio servers when allowStdio is false', () => {
    expect(() =>
      parseStandardMcpJson(
        `{
          "mcpServers": {
            "github": {
              "command": "npx",
              "args": ["-y", "@modelcontextprotocol/server-github"]
            }
          }
        }`,
        { allowStdio: false },
      ),
    ).toThrow('github 为 stdio 类型，仅超级管理员可以使用');

    expect(
      parseStandardMcpJson(
        `{
          "mcpServers": {
            "http-server": {
              "type": "http",
              "url": "https://example.com/mcp"
            }
          }
        }`,
        { allowStdio: false },
      ),
    ).toMatchObject([{ name: 'http-server', type: 2 }]);
  });

  it('rejects invalid json and missing transport fields', () => {
    expect(() => parseStandardMcpJson('')).toThrow('请粘贴 MCP JSON 配置');
    expect(() => parseStandardMcpJson('{')).toThrow('MCP JSON 格式无效');
    expect(() => parseStandardMcpJson('{"foo":1}')).toThrow(
      '未识别到标准 MCP 配置，请使用 mcpServers 格式',
    );
    expect(() =>
      parseStandardMcpJson('{"mcpServers":{"bad":{"type":"stdio"}}}'),
    ).toThrow('bad 缺少 command');
  });
});
