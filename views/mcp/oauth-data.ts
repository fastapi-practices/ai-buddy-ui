import type { VbenFormSchema } from '#/adapter/form';

import { $t } from '@vben/locales';

export function createMcpOAuthSchema(
  hasClientSecret = false,
): VbenFormSchema[] {
  const label = (key: string) => $t(`ai-buddy.mcpManage.oauth.${key}`);

  return [
    {
      component: 'Switch',
      defaultValue: true,
      fieldName: 'enabled',
      label: label('enabled'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 2048 },
      fieldName: 'authorization_url',
      label: label('authorizationUrl'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 2048 },
      fieldName: 'token_url',
      label: label('tokenUrl'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 512 },
      fieldName: 'client_id',
      label: label('clientId'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        options: [
          { label: label('publicClient'), value: 'none' },
          { label: label('secretBasic'), value: 'client_secret_basic' },
          { label: label('secretPost'), value: 'client_secret_post' },
        ],
      },
      defaultValue: 'none',
      fieldName: 'token_endpoint_auth_method',
      label: label('authMethod'),
      rules: 'selectRequired',
    },
    {
      component: 'InputPassword',
      componentProps: {
        autocomplete: 'new-password',
        maxlength: 8192,
        placeholder: label(
          hasClientSecret ? 'secretKeepPlaceholder' : 'secretNotConfigured',
        ),
      },
      defaultValue: '',
      dependencies: {
        show: (values) => values.token_endpoint_auth_method !== 'none',
        triggerFields: ['token_endpoint_auth_method'],
      },
      fieldName: 'client_secret',
      label: label('clientSecret'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 2048 },
      defaultValue: '',
      fieldName: 'scope',
      label: label('scope'),
    },
    {
      component: 'Input',
      fieldName: 'redirect_uri',
      label: label('redirectUri'),
    },
  ];
}
