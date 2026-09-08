import type { VbenFormSchema } from '#/adapter/form';

import { DictEnum, getDictOptions } from '#/utils/dict';

import {
  AI_CONFIG_STATUS_KEY,
  AI_EMBEDDING_API_HOST,
  AI_EMBEDDING_API_KEY,
  AI_EXA_API_KEY,
  AI_QDRANT_API_KEY,
  AI_QDRANT_URL,
  AI_TAVILY_API_KEY,
} from './config-keys';

export const searchEngineSchema: VbenFormSchema[] = [
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

export const ragSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: AI_QDRANT_URL,
    label: 'Qdrant URL',
    help: '用于知识向量存储的 Qdrant 地址',
  },
  {
    component: 'InputPassword',
    fieldName: AI_QDRANT_API_KEY,
    label: 'Qdrant API Key',
    help: '用于知识向量存储的 Qdrant API Key',
  },
  {
    component: 'InputPassword',
    fieldName: AI_EMBEDDING_API_KEY,
    label: 'Embedding API Key',
    help: '用于知识向量化的嵌入接口密钥',
  },
  {
    component: 'Input',
    fieldName: AI_EMBEDDING_API_HOST,
    label: 'Embedding API Host',
    help: '用于知识向量化的嵌入接口地址',
  },
];
