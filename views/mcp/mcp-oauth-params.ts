import type {
  AIMcpOAuthAuthMethod,
  AIMcpOAuthConfigParams,
  AIMcpOAuthConfigResult,
  AIMcpResult,
} from '../../api';

export interface AIMcpOAuthFormValues {
  enabled: boolean;
  authorization_url: string;
  token_url: string;
  client_id: string;
  client_secret: string;
  scope: string;
  token_endpoint_auth_method: AIMcpOAuthAuthMethod;
}

export type AIMcpOAuthConfigIssue =
  | 'authorization_url'
  | 'client_id'
  | 'client_secret'
  | 'scope'
  | 'token_endpoint_auth_method'
  | 'token_url';

function isMcpOAuthHttpsUrl(value: null | string | undefined): boolean {
  if (!value || !/^https:\/\//i.test(value.trim()) || value.includes('#')) {
    return false;
  }

  try {
    const url = new URL(value.trim());
    const authority = value.trim().split('/')[2];
    const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
    const validHostname =
      hostname.startsWith('[') ||
      hostname
        .split('.')
        .every((label) => /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label));
    return (
      url.protocol === 'https:' &&
      Boolean(hostname) &&
      validHostname &&
      !authority?.includes('@') &&
      !url.username &&
      !url.password &&
      !url.hash &&
      hostname !== 'localhost' &&
      !hostname.endsWith('.localhost') &&
      hostname !== 'metadata.google.internal' &&
      !hostname.endsWith('.local') &&
      !hostname.endsWith('.internal') &&
      !hostname.endsWith('.lan') &&
      !hostname.endsWith('.home.arpa') &&
      hostname !== '[::1]' &&
      hostname !== '[::]' &&
      !/^127\./.test(hostname) &&
      !/^0\./.test(hostname) &&
      !/^10\./.test(hostname) &&
      !/^192\.168\./.test(hostname) &&
      !/^169\.254\./.test(hostname) &&
      !/^172\.(?:1[6-9]|2\d|3[01])\./.test(hostname) &&
      !/^\[(?:f[cd]|fe[89ab])/.test(hostname)
    );
  } catch {
    return false;
  }
}

export function canConfigureMcpOAuth(
  row: Pick<AIMcpResult, 'type' | 'url' | 'user_id'>,
  isSuperuser: boolean,
): boolean {
  return (
    isSuperuser &&
    row.user_id === 0 &&
    (row.type === 1 || row.type === 2) &&
    isMcpOAuthHttpsUrl(row.url)
  );
}

export function toAIMcpOAuthFormValues(
  config?: AIMcpOAuthConfigResult,
): AIMcpOAuthFormValues {
  return {
    enabled: config?.configured ? config.enabled : true,
    authorization_url: config?.authorization_url ?? '',
    token_url: config?.token_url ?? '',
    client_id: config?.client_id ?? '',
    client_secret: '',
    scope: config?.scope ?? '',
    token_endpoint_auth_method: config?.token_endpoint_auth_method ?? 'none',
  };
}

export function createAIMcpOAuthPayload(
  values: AIMcpOAuthFormValues,
): AIMcpOAuthConfigParams {
  const payload: AIMcpOAuthConfigParams = {
    enabled: values.enabled,
    authorization_url: values.authorization_url.trim(),
    token_url: values.token_url.trim(),
    client_id: values.client_id.trim(),
    scope: values.scope.trim(),
    token_endpoint_auth_method: values.token_endpoint_auth_method,
  };

  if (values.client_secret) {
    payload.client_secret = values.client_secret;
  }

  return payload;
}

export function getMcpOAuthConfigIssue(
  values: AIMcpOAuthFormValues,
  hasClientSecret: boolean,
): AIMcpOAuthConfigIssue | undefined {
  const payload = createAIMcpOAuthPayload(values);

  if (
    payload.authorization_url.length > 2048 ||
    !isMcpOAuthHttpsUrl(payload.authorization_url)
  ) {
    return 'authorization_url';
  }
  if (
    payload.token_url.length > 2048 ||
    !isMcpOAuthHttpsUrl(payload.token_url)
  ) {
    return 'token_url';
  }
  if (!payload.client_id || payload.client_id.length > 512) {
    return 'client_id';
  }
  if ((payload.scope?.length ?? 0) > 2048) {
    return 'scope';
  }
  if (
    payload.token_endpoint_auth_method !== 'none' &&
    payload.token_endpoint_auth_method !== 'client_secret_basic' &&
    payload.token_endpoint_auth_method !== 'client_secret_post'
  ) {
    return 'token_endpoint_auth_method';
  }
  if (
    (payload.client_secret?.length ?? 0) > 8192 ||
    (payload.token_endpoint_auth_method !== 'none' &&
      !hasClientSecret &&
      !payload.client_secret)
  ) {
    return 'client_secret';
  }
}
