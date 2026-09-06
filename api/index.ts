import type { PaginationResult } from '#/types';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import { useAccessStore } from '@vben/stores';

import { requestClient } from '#/api/request';

import { readOptionalDefaultModelResponse } from './response';
import { createUploadFormData } from './upload-file';

export type AIActionResult = null | string;
export type AIProviderType = 0 | 1 | 2 | 3 | 4 | 5;
export type AIStatusType = 0 | 1;
export type AIMcpType = 0 | 1 | 2;

interface AIProviderQueryParams {
  cursor?: null | string;
  name?: null | string;
  status?: AIStatusType | null;
  type?: AIProviderType | null;
  size?: number;
}

export interface AIProviderParams {
  name: string;
  type: AIProviderType;
  api_key: string;
  api_host: string;
  status: AIStatusType;
  remark?: null | string;
}

export type AIProviderUpdateParams = AIProviderParams;

export interface AIProviderResult extends AIProviderParams {
  id: number;
  created_time: string;
  updated_time?: null | string;
}

export interface AIProviderModelResult {
  id: string;
  object?: null | string;
  created?: null | number;
  display_name?: null | string;
}

export type AIDefaultModelOptionalResult = AIDefaultModelResult | null;

export interface AIProviderModelOptionResult {
  id: number;
  name: string;
  type: AIProviderType;
  status: AIStatusType;
  models: AIModelResult[];
}

export interface AIModelOptionsResult {
  providers: AIProviderModelOptionResult[];
  default_model?: AIDefaultModelResult | null;
}

export interface AIProviderListResult {
  items: AIProviderResult[];
  has_more: boolean;
  next_cursor?: null | string;
}

export interface AIModelQueryParams {
  provider_id?: null | number;
  model_id?: null | string;
  status?: AIStatusType | null;
  page?: number;
  size?: number;
}

export interface AIAllModelQueryParams {
  provider_id: number;
}

export interface AIModelParams {
  provider_id: number;
  model_id: string;
  status: AIStatusType;
  remark?: null | string;
}

export interface AIBatchCreateModelsParams {
  items: AIModelParams[];
}

export interface AIModelResult extends AIModelParams {
  id: number;
  created_time: string;
  updated_time?: null | string;
}

export interface AIDefaultModelParams {
  provider_id: number;
  model_id: string;
  status: AIStatusType;
}

export interface AIDefaultModelResult extends AIDefaultModelParams {
  id: number;
  scene: 'assistant';
  provider_name: string;
  provider_type: AIProviderType;
  created_time: string;
  updated_time?: null | string;
}

interface AIQuickPhraseQueryParams {
  content?: null | string;
  page?: number;
  size?: number;
}

export interface AIQuickPhraseParams {
  title: string;
  content: string;
  sort?: number;
}

export interface AIQuickPhraseResult extends AIQuickPhraseParams {
  id: number;
  user_id: number;
  created_time: string;
  updated_time?: null | string;
}

interface AIMcpQueryParams {
  name?: null | string;
  type?: AIMcpType | null;
  page?: number;
  size?: number;
}

export interface AIMcpParams {
  name: string;
  type: AIMcpType;
  description?: null | string;
  command?: null | string;
  url?: null | string;
  headers?: null | Record<string, unknown>;
  args?: null | string[];
  env?: null | Record<string, unknown>;
  timeout?: number;
  read_timeout?: number;
  tool_prefix?: null | string;
  include_instructions?: boolean;
}

export interface AIMcpResult extends AIMcpParams {
  id: number;
  user_id: number;
  created_time: string;
  updated_time?: null | string;
}

interface AIKnowledgeQueryParams {
  title?: null | string;
  page?: number;
  size?: number;
}

export interface AIKnowledgeParams {
  title: string;
  content: string;
  source?: null | string;
}

export interface AIKnowledgeResult extends AIKnowledgeParams {
  id: number;
  user_id: number;
  object_key?: null | string;
  created_time: string;
  updated_time?: null | string;
}

interface AISkillQueryParams {
  name?: null | string;
  page?: number;
  size?: number;
}

export interface AISkillParams {
  name: string;
  description?: null | string;
}

export interface AISkillResult extends AISkillParams {
  content: string;
  id: number;
  user_id: number;
  object_key?: null | string;
  created_time: string;
  updated_time?: null | string;
}

interface AIAssistantQueryParams {
  name?: null | string;
  category?: null | string;
  page?: number;
  size?: number;
}

export interface AIAssistantParams {
  name: string;
  prompt: string;
  description?: null | string;
  category?: null | string;
  starters?: string[];
  sort?: number;
}

export interface AIAssistantResult extends AIAssistantParams {
  id: number;
  user_id: number;
  created_time: string;
  updated_time?: null | string;
}

export interface AIAssistantCategoryResult {
  code: string;
  name: string;
  sort: number;
}

export interface AIConfigParams {
  id: string;
  name: string;
  type?: string;
  key: string;
  value: string;
  is_frontend: boolean;
  remark?: string;
}

export interface AIConfigResult extends AIConfigParams {
  created_time: string;
  updated_time?: string;
}

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function joinApiUrl(baseUrl: string, url: string) {
  if (/^(blob:|data:|https?:\/\/)/iu.test(url)) {
    return url;
  }

  if (/^https?:\/\//i.test(baseUrl)) {
    return new URL(url, baseUrl).toString();
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  if (
    normalizedBaseUrl &&
    (url === normalizedBaseUrl || url.startsWith(`${normalizedBaseUrl}/`))
  ) {
    return url;
  }

  return `${normalizedBaseUrl}/${url.replace(/^\/+/, '')}`;
}

function resolveAIBuddyApiUrl(url: string) {
  return joinApiUrl(apiURL, url);
}

function toUploadRequest(files: File[], fields?: Record<string, string>) {
  return {
    data: createUploadFormData(files, fields),
    headers: { 'Content-Type': 'multipart/form-data' },
  };
}

function getAIBuddyRequestHeaders() {
  const accessStore = useAccessStore();

  return {
    Accept: 'application/json',
    'Accept-Language': preferences.app.locale,
    Authorization: accessStore.accessToken
      ? `Bearer ${accessStore.accessToken}`
      : '',
    'Content-Type': 'application/json;charset=utf-8',
  };
}

export async function getAIProviderDetailApi(pk: number) {
  return requestClient.get<AIProviderResult>(`/api/v1/providers/${pk}`);
}

export async function getAIProviderListApi(params?: AIProviderQueryParams) {
  return requestClient.get<AIProviderListResult>('/api/v1/providers', {
    params,
  });
}

export async function getAllAIProviderApi() {
  return requestClient.get<AIProviderResult[]>('/api/v1/providers/all');
}

export async function createAIProviderApi(data: AIProviderParams) {
  return requestClient.post<AIActionResult>('/api/v1/providers', data);
}

export async function updateAIProviderApi(
  pk: number,
  data: AIProviderUpdateParams,
) {
  return requestClient.put<AIActionResult>(`/api/v1/providers/${pk}`, data);
}

export async function deleteAIProviderApi(pks: number[]) {
  return requestClient.delete<AIActionResult>('/api/v1/providers', {
    data: { pks },
  });
}

export async function getAIProviderModelsApi(pk: number) {
  return requestClient.get<AIProviderModelResult[]>(
    `/api/v1/providers/${pk}/models`,
  );
}

export async function syncAIProviderModelsApi(pk: number) {
  return requestClient.post<AIActionResult>(
    `/api/v1/providers/${pk}/models/sync`,
  );
}

export async function getAIModelDetailApi(pk: number) {
  return requestClient.get<AIModelResult>(`/api/v1/models/${pk}`);
}

export async function getAIModelListApi(params?: AIModelQueryParams) {
  return requestClient.get<PaginationResult<AIModelResult>>('/api/v1/models', {
    params,
  });
}

export async function getAllAIModelApi(params: AIAllModelQueryParams) {
  return requestClient.get<AIModelResult[]>('/api/v1/models/all', {
    params,
  });
}

export async function getAIModelOptionsApi() {
  return requestClient.get<AIModelOptionsResult>('/api/v1/model-options');
}

export async function createAIModelApi(data: AIModelParams) {
  return requestClient.post<AIActionResult>('/api/v1/models', data);
}

export async function batchCreateAIModelApi(data: AIBatchCreateModelsParams) {
  return requestClient.post<AIActionResult>('/api/v1/models/batch', data);
}

export async function updateAIModelApi(pk: number, data: AIModelParams) {
  return requestClient.put<AIActionResult>(`/api/v1/models/${pk}`, data);
}

export async function deleteAIModelApi(pks: number[]) {
  return requestClient.delete<AIActionResult>('/api/v1/models', {
    data: { pks },
  });
}

export async function getAIAssistantDefaultModelApi() {
  return requestClient.get<AIDefaultModelResult>(
    '/api/v1/default-models/assistant',
  );
}

export async function getAIAssistantDefaultModelOptionalApi() {
  const response = await fetch(
    resolveAIBuddyApiUrl('/api/v1/default-models/assistant'),
    {
      headers: getAIBuddyRequestHeaders(),
      method: 'GET',
    },
  );

  return readOptionalDefaultModelResponse<AIDefaultModelResult>(response);
}

export async function updateAIAssistantDefaultModelApi(
  data: AIDefaultModelParams,
) {
  return requestClient.put<AIActionResult>(
    '/api/v1/default-models/assistant',
    data,
  );
}

export async function getAllAIQuickPhraseApi() {
  return requestClient.get<AIQuickPhraseResult[]>('/api/v1/quick-phrases/all');
}

export async function getAIQuickPhraseDetailApi(pk: number) {
  return requestClient.get<AIQuickPhraseResult>(`/api/v1/quick-phrases/${pk}`);
}

export async function getAIQuickPhraseListApi(
  params?: AIQuickPhraseQueryParams,
) {
  return requestClient.get<PaginationResult<AIQuickPhraseResult>>(
    '/api/v1/quick-phrases',
    { params },
  );
}

export async function createAIQuickPhraseApi(data: AIQuickPhraseParams) {
  return requestClient.post<AIActionResult>('/api/v1/quick-phrases', data);
}

export async function updateAIQuickPhraseApi(
  pk: number,
  data: AIQuickPhraseParams,
) {
  return requestClient.put<AIActionResult>(`/api/v1/quick-phrases/${pk}`, data);
}

export async function deleteAIQuickPhraseApi(pk: number) {
  return requestClient.delete<AIActionResult>(`/api/v1/quick-phrases/${pk}`);
}

export async function getAIMcpListApi(params?: AIMcpQueryParams) {
  return requestClient.get<PaginationResult<AIMcpResult>>('/api/v1/mcps', {
    params,
  });
}

export async function createAIMcpApi(data: AIMcpParams) {
  return requestClient.post<AIActionResult>('/api/v1/mcps', data);
}

export async function updateAIMcpApi(pk: number, data: AIMcpParams) {
  return requestClient.put<AIActionResult>(`/api/v1/mcps/${pk}`, data);
}

export async function deleteAIMcpApi(pk: number) {
  return requestClient.delete<AIActionResult>(`/api/v1/mcps/${pk}`);
}

export async function getAIKnowledgeDetailApi(pk: number) {
  return requestClient.get<AIKnowledgeResult>(`/api/v1/knowledges/${pk}`);
}

export async function getAIKnowledgeListApi(params?: AIKnowledgeQueryParams) {
  return requestClient.get<PaginationResult<AIKnowledgeResult>>(
    '/api/v1/knowledges',
    { params },
  );
}

export async function createAIKnowledgeApi(files: File[], title?: string) {
  const { data, headers } = toUploadRequest(
    files,
    title ? { title } : undefined,
  );
  return requestClient.post<AIActionResult>('/api/v1/knowledges', data, {
    headers,
  });
}

export async function deleteAIKnowledgeApi(pk: number) {
  return requestClient.delete<AIActionResult>(`/api/v1/knowledges/${pk}`);
}

export async function getAISkillDetailApi(pk: number) {
  return requestClient.get<AISkillResult>(`/api/v1/skills/${pk}`);
}

export async function getAISkillListApi(params?: AISkillQueryParams) {
  return requestClient.get<PaginationResult<AISkillResult>>('/api/v1/skills', {
    params,
  });
}

export async function createAISkillApi(files: File[]) {
  const { data, headers } = toUploadRequest(files);
  return requestClient.post<AIActionResult>('/api/v1/skills', data, {
    headers,
  });
}

export async function deleteAISkillApi(pk: number) {
  return requestClient.delete<AIActionResult>(`/api/v1/skills/${pk}`);
}

export async function getAIAssistantDetailApi(pk: number) {
  return requestClient.get<AIAssistantResult>(`/api/v1/assistants/${pk}`);
}

export async function getAIAssistantCategoriesApi() {
  return requestClient.get<AIAssistantCategoryResult[]>(
    '/api/v1/assistants/categories',
  );
}

export async function getAIAssistantListApi(params?: AIAssistantQueryParams) {
  return requestClient.get<PaginationResult<AIAssistantResult>>(
    '/api/v1/assistants',
    { params },
  );
}

export async function createAIAssistantApi(data: AIAssistantParams) {
  return requestClient.post<AIActionResult>('/api/v1/assistants', data);
}

export async function updateAIAssistantApi(
  pk: number,
  data: AIAssistantParams,
) {
  return requestClient.put<AIActionResult>(`/api/v1/assistants/${pk}`, data);
}

export async function deleteAIAssistantApi(pk: number) {
  return requestClient.delete<AIActionResult>(`/api/v1/assistants/${pk}`);
}

export async function getAllAIConfigApi() {
  return requestClient.get<AIConfigResult[]>('/api/v1/sys/configs/all', {
    params: { type: 'AI' },
  });
}

export async function updateAIConfigApi(params: AIConfigParams[]) {
  return requestClient.put('/api/v1/sys/configs', params);
}
