import type { AIMcpOAuthConfigResult, AIMcpResult } from '../../api';
import type { AIMcpOAuthFormValues } from './mcp-oauth-params';

import { describe, expect, it } from 'vitest';

import {
  canConfigureMcpOAuth,
  createAIMcpOAuthPayload,
  getMcpOAuthConfigIssue,
  toAIMcpOAuthFormValues,
} from './mcp-oauth-params';

const configured: AIMcpOAuthConfigResult = {
  configured: true,
  enabled: false,
  redirect_uri: 'https://api.example.com/api/v1/mcps/oauth/callback',
  authorization_url: 'https://provider.example.com/oauth/authorize',
  token_url: 'https://provider.example.com/oauth/token',
  client_id: 'registered-client',
  has_client_secret: true,
  scope: 'read write',
  token_endpoint_auth_method: 'client_secret_basic',
};

function validValues(): AIMcpOAuthFormValues {
  return toAIMcpOAuthFormValues(configured);
}

describe('canConfigureMcpOAuth', () => {
  const builtin: Pick<AIMcpResult, 'type' | 'url' | 'user_id'> = {
    user_id: 0,
    type: 2,
    url: 'https://provider.example.com/mcp',
  };

  it.each([1, 2] as const)(
    'allows superusers to configure built-in HTTPS transport %s',
    (type) => {
      expect(canConfigureMcpOAuth({ ...builtin, type }, true)).toBe(true);
    },
  );

  it('requires a superuser, built-in ownership, and remote transport', () => {
    expect(canConfigureMcpOAuth(builtin, false)).toBe(false);
    expect(canConfigureMcpOAuth({ ...builtin, user_id: 42 }, true)).toBe(false);
    expect(canConfigureMcpOAuth({ ...builtin, type: 0 }, true)).toBe(false);
  });

  it.each([
    null,
    '',
    'not a url',
    'http://provider.example.com/mcp',
    'https://',
    'https://user:secret@provider.example.com/mcp',
    'https://@provider.example.com/mcp',
    'https://provider.example.com/mcp#tools',
    'https://provider.example.com/mcp#',
    'https://localhost/mcp',
    'https://127.0.0.1/mcp',
    'https://[::1]/mcp',
    'https://192.168.1.2/mcp',
    'https://10.0.0.1/mcp',
    'https://172.16.0.1/mcp',
    'https://169.254.169.254/mcp',
    'https://[fc00::1]/mcp',
    'https://[fe80::1]/mcp',
    'https://-invalid.example.com/mcp',
    'https://invalid..example.com/mcp',
    'https://metadata.google.internal/mcp',
    'https://service.local/mcp',
    'https://service.internal/mcp',
    'https://service.lan/mcp',
    'https://service.home.arpa/mcp',
  ])('hides the entry for unsupported MCP URL %s', (url) => {
    expect(canConfigureMcpOAuth({ ...builtin, url }, true)).toBe(false);
  });
});

describe('toAIMcpOAuthFormValues', () => {
  it('loads editable fields, preserves disabled state, and never fills secrets', () => {
    const values = toAIMcpOAuthFormValues({
      ...configured,
      client_secret: 'must not be read',
    } as AIMcpOAuthConfigResult);

    expect(values).toEqual({
      enabled: false,
      authorization_url: configured.authorization_url,
      token_url: configured.token_url,
      client_id: configured.client_id,
      client_secret: '',
      scope: configured.scope,
      token_endpoint_auth_method: 'client_secret_basic',
    });
  });

  it('defaults an unconfigured MCP to enabled and blank editable fields', () => {
    const values = toAIMcpOAuthFormValues({
      configured: false,
      enabled: false,
      redirect_uri: configured.redirect_uri,
      authorization_url: null,
      token_url: null,
      client_id: null,
      has_client_secret: false,
      scope: '',
      token_endpoint_auth_method: 'none',
    });

    expect(values).toEqual(toAIMcpOAuthFormValues());
    expect(values.enabled).toBe(true);
    expect(values.client_secret).toBe('');
  });
});

describe('createAIMcpOAuthPayload', () => {
  it('sends only writable fields and omits an unchanged secret when disabling', () => {
    expect(
      createAIMcpOAuthPayload({
        ...validValues(),
        ...configured,
        client_secret: '',
        authorization_url: `  ${configured.authorization_url}  `,
        token_url: `  ${configured.token_url}  `,
        client_id: '  registered-client  ',
        scope: '  read write  ',
      }),
    ).toEqual({
      enabled: false,
      authorization_url: configured.authorization_url,
      token_url: configured.token_url,
      client_id: configured.client_id,
      scope: 'read write',
      token_endpoint_auth_method: 'client_secret_basic',
    });
  });

  it('preserves every byte of a replacement secret', () => {
    const client_secret = '  secret\n\tvalue  ';
    expect(
      createAIMcpOAuthPayload({ ...validValues(), client_secret }),
    ).toHaveProperty('client_secret', client_secret);
  });
});

describe('getMcpOAuthConfigIssue', () => {
  it.each(['client_secret_basic', 'client_secret_post'] as const)(
    'requires a saved or new secret for %s',
    (token_endpoint_auth_method) => {
      const values = { ...validValues(), token_endpoint_auth_method };

      expect(getMcpOAuthConfigIssue(values, false)).toBe('client_secret');
      expect(getMcpOAuthConfigIssue(values, true)).toBeUndefined();
      expect(
        getMcpOAuthConfigIssue(
          { ...values, client_secret: 'new secret' },
          false,
        ),
      ).toBeUndefined();
    },
  );

  it('allows a public client without a secret', () => {
    expect(
      getMcpOAuthConfigIssue(
        { ...validValues(), token_endpoint_auth_method: 'none' },
        false,
      ),
    ).toBeUndefined();
  });

  it.each(['authorization_url', 'token_url'] as const)(
    'rejects invalid HTTPS syntax, credentials, and fragments for %s',
    (field) => {
      for (const value of [
        '',
        'http://provider.example.com/oauth',
        'https://',
        'https://user:secret@provider.example.com/oauth',
        'https://provider.example.com/oauth#fragment',
        'https://localhost/oauth',
        'https://127.0.0.1/oauth',
        'https://192.168.1.2/oauth',
      ]) {
        expect(
          getMcpOAuthConfigIssue({ ...validValues(), [field]: value }, true),
        ).toBe(field);
      }
    },
  );

  it.each(['authorization_url', 'token_url'] as const)(
    'enforces the 2048 character limit on %s',
    (field) => {
      const prefix = 'https://provider.example.com/';
      const atLimit = prefix + 'a'.repeat(2048 - prefix.length);

      expect(
        getMcpOAuthConfigIssue({ ...validValues(), [field]: atLimit }, true),
      ).toBeUndefined();
      expect(
        getMcpOAuthConfigIssue(
          { ...validValues(), [field]: `${atLimit}a` },
          true,
        ),
      ).toBe(field);
    },
  );

  it('requires a nonblank client ID and enforces its 512 character limit', () => {
    expect(
      getMcpOAuthConfigIssue({ ...validValues(), client_id: '  ' }, true),
    ).toBe('client_id');
    expect(
      getMcpOAuthConfigIssue(
        { ...validValues(), client_id: 'a'.repeat(512) },
        true,
      ),
    ).toBeUndefined();
    expect(
      getMcpOAuthConfigIssue(
        { ...validValues(), client_id: 'a'.repeat(513) },
        true,
      ),
    ).toBe('client_id');
  });

  it('enforces the scope and replacement secret limits', () => {
    expect(
      getMcpOAuthConfigIssue(
        {
          ...validValues(),
          scope: 'a'.repeat(2048),
          client_secret: 'a'.repeat(8192),
        },
        false,
      ),
    ).toBeUndefined();
    expect(
      getMcpOAuthConfigIssue(
        { ...validValues(), scope: 'a'.repeat(2049) },
        true,
      ),
    ).toBe('scope');
    expect(
      getMcpOAuthConfigIssue(
        { ...validValues(), client_secret: 'a'.repeat(8193) },
        true,
      ),
    ).toBe('client_secret');
  });

  it('requires the full config when disabling and rejects unknown auth methods', () => {
    expect(
      getMcpOAuthConfigIssue(
        { ...validValues(), enabled: false, token_url: '' },
        true,
      ),
    ).toBe('token_url');
    expect(
      getMcpOAuthConfigIssue(
        {
          ...validValues(),
          token_endpoint_auth_method:
            'unsupported' as AIMcpOAuthFormValues['token_endpoint_auth_method'],
        },
        true,
      ),
    ).toBe('token_endpoint_auth_method');
  });
});
