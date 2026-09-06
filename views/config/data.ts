import type { VbenFormSchema } from '#/adapter/form';

import { DictEnum, getDictOptions } from '#/utils/dict';

import {
  AI_CONFIG_STATUS_KEY,
  AI_EXA_API_KEY,
  AI_TAVILY_API_KEY,
} from './config-keys';

export const aiConfigSchema: VbenFormSchema[] = [
  {
    component: 'RadioGroup',
    componentProps: {
      options: getDictOptions(DictEnum.SYS_STATUS, { asString: true }),
      optionType: 'button',
    },
    defaultValue: '1',
    fieldName: AI_CONFIG_STATUS_KEY,
    label: '状态',
    help: '默认使用本地配置，当启用时，将使用此配置',
    rules: 'required',
  },
  {
    component: 'InputPassword',
    fieldName: AI_EXA_API_KEY,
    label: 'Exa API Key',
    help: '用于 AI 联网搜索的 Exa API Key',
  },
  {
    component: 'InputPassword',
    fieldName: AI_TAVILY_API_KEY,
    label: 'Tavily API Key',
    help: '用于 AI 联网搜索的 Tavily API Key',
  },
];
