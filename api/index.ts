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
export type AIModelKind = 'chat' | 'embedding' | 'image';
export type AIDefaultModelKind = AIModelKind;
export type AIModelCapability = 'thinking' | 'tools';
export type AIModelModality = 'audio' | 'image' | 'text' | 'video';
export type AIThinkingLevel = 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
export interface AIThinkingPolicy {
  levels: AIThinkingLevel[];
  default_level: AIThinkingLevel | null;
  can_disable: boolean;
}
export type AIAssistantSortType = 'comprehensive' | 'hottest' | 'newest';

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
  user_id: number;
  created_time: string;
  updated_time?: null | string;
}

export interface AIProviderModelResult {
  id: string;
  object?: null | string;
  created?: null | number;
  display_name?: null | string;
  kind: AIModelKind;
  capabilities?: AIModelCapability[];
  input_modalities: AIModelModality[];
  context_window?: null | number;
  max_output_tokens?: null | number;
}

export type AIDefaultModelOptionalResult = AIDefaultModelResult | null;

export interface AIProviderModelOptionResult {
  id: number;
  user_id: number;
  name: string;
  type: AIProviderType;
  status: AIStatusType;
  models: AIModelResult[];
}

export interface AIModelOptionsResult {
  providers: AIProviderModelOptionResult[];
  default_candidates: Record<AIDefaultModelKind, number[]>;
  default_models: Record<AIDefaultModelKind, AIDefaultModelResult | null>;
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
  kind?: AIModelKind | null;
  capability?: AIModelCapability | null;
  page?: number;
  size?: number;
}

export interface AIAllModelQueryParams {
  provider_id: number;
  kind?: AIModelKind;
  capability?: AIModelCapability;
}

export interface AIModelArchitectureSuggestion {
  source: string;
  last_updated: null | string;
  kind: AIModelKind | null;
  input_modalities: AIModelModality[] | null;
  tools: boolean | null;
  thinking: boolean | null;
  thinking_policy: AIThinkingPolicy | null;
  context_window: number | null;
  max_output_tokens: number | null;
}

export interface AIModelParams {
  provider_id: number;
  model_id: string;
  name?: null | string;
  kind: AIModelKind;
  capabilities?: AIModelCapability[];
  input_modalities?: AIModelModality[] | null;
  thinking_policy?: AIThinkingPolicy | null;
  context_window?: null | number;
  max_output_tokens?: null | number;
  sort?: number;
  status: AIStatusType;
  remark?: null | string;
}

export interface AIBatchCreateModelsParams {
  items: AIModelParams[];
}

export interface AIModelResult extends AIModelParams {
  id: number;
  name: string;
  kind: AIModelKind;
  capabilities: AIModelCapability[];
  input_modalities: AIModelModality[] | null;
  thinking_policy: AIThinkingPolicy | null;
  sort: number;
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
  kind: AIDefaultModelKind;
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

export interface AIMcpImportParams {
  config: string;
}

export interface AIMcpImportResult {
  created: number;
  skipped: string[];
}

interface AIKnowledgeBaseQueryParams {
  name?: null | string;
  page?: number;
  size?: number;
}

export interface AIKnowledgeBaseParams {
  name: string;
  description?: null | string;
  provider_id?: null | number;
  model_id?: null | string;
}

export interface AIKnowledgeBaseResult extends AIKnowledgeBaseParams {
  id: number;
  user_id: number;
  created_time: string;
  updated_time?: null | string;
}

interface AIKnowledgeDocumentQueryParams {
  title?: null | string;
  page?: number;
  size?: number;
}

export interface AIKnowledgeDocumentUploadOptions {
  title?: string;
  provider_id?: number;
  model_id?: string;
}

export interface AIKnowledgeDocumentResult {
  id: number;
  user_id: number;
  knowledge_base_id: number;
  title: string;
  source?: null | string;
  file_type: string;
  content: string;
  object_key?: null | string;
  provider_id?: null | number;
  model_id?: null | string;
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
  version: string;
  id: number;
  user_id: number;
  object_key?: null | string;
  created_time: string;
  updated_time?: null | string;
}

interface AIAssistantQueryParams {
  name?: null | string;
  category?: null | string;
  sort_type?: AIAssistantSortType;
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
  usage_count: number;
  created_time: string;
  updated_time?: null | string;
}

export interface AIAssistantCategoryResult {
  code: string;
  name: string;
  sort: number;
}

interface AIExpertQueryParams {
  name?: null | string;
  page?: number;
  size?: number;
}

export interface AIExpertParams {
  name: string;
  prompt: string;
  description?: null | string;
  starters?: string[];
  mcp_ids?: number[];
  skill_ids?: number[];
  knowledge_ids?: number[];
  sort?: number;
}

export interface AIExpertResult extends AIExpertParams {
  id: number;
  user_id: number;
  usage_count: number;
  created_time: string;
  updated_time?: null | string;
}

interface AISubagentQueryParams {
  name?: null | string;
  page?: number;
  size?: number;
}

export interface AISubagentParams {
  name: string;
  description: string;
  prompt: string;
  sort?: number;
}

export interface AISubagentResult extends AISubagentParams {
  id: number;
  user_id: number;
  created_time: string;
  updated_time?: null | string;
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

export async function getAIModelDetailApi(pk: number) {
  return requestClient.get<AIModelResult>(`/api/v1/models/${pk}`);
}

export async function getAIModelArchitectureApi(pk: number) {
  return requestClient.get<AIModelArchitectureSuggestion>(
    `/api/v1/models/${pk}/architecture`,
  );
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

function defaultModelPath(kind: AIDefaultModelKind) {
  return `/api/v1/default-models/${kind}`;
}

export async function getAIDefaultModelApi(kind: AIDefaultModelKind) {
  return requestClient.get<AIDefaultModelResult>(defaultModelPath(kind));
}

export async function getAIDefaultModelOptionalApi(kind: AIDefaultModelKind) {
  const response = await fetch(resolveAIBuddyApiUrl(defaultModelPath(kind)), {
    headers: getAIBuddyRequestHeaders(),
    method: 'GET',
  });

  return readOptionalDefaultModelResponse<AIDefaultModelResult>(response);
}

export async function updateAIDefaultModelApi(
  kind: AIDefaultModelKind,
  data: AIDefaultModelParams,
) {
  return requestClient.put<AIActionResult>(defaultModelPath(kind), data);
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

export async function getAllAIMcpApi() {
  return requestClient.get<AIMcpResult[]>('/api/v1/mcps/all');
}

export async function createAIMcpApi(data: AIMcpParams) {
  return requestClient.post<AIActionResult>('/api/v1/mcps', data);
}

export async function importAIMcpApi(data: AIMcpImportParams) {
  return requestClient.post<AIMcpImportResult>('/api/v1/mcps/import', data);
}

export async function updateAIMcpApi(pk: number, data: AIMcpParams) {
  return requestClient.put<AIActionResult>(`/api/v1/mcps/${pk}`, data);
}

export async function deleteAIMcpApi(pk: number) {
  return requestClient.delete<AIActionResult>(`/api/v1/mcps/${pk}`);
}

export async function getAllAIKnowledgeBaseApi() {
  return requestClient.get<AIKnowledgeBaseResult[]>('/api/v1/knowledges/all');
}

export async function getAIKnowledgeBaseDetailApi(pk: number) {
  return requestClient.get<AIKnowledgeBaseResult>(`/api/v1/knowledges/${pk}`);
}

export async function getAIKnowledgeBaseListApi(
  params?: AIKnowledgeBaseQueryParams,
) {
  return requestClient.get<PaginationResult<AIKnowledgeBaseResult>>(
    '/api/v1/knowledges',
    { params },
  );
}

export async function createAIKnowledgeBaseApi(data: AIKnowledgeBaseParams) {
  return requestClient.post<AIActionResult>('/api/v1/knowledges', data);
}

export async function updateAIKnowledgeBaseApi(
  pk: number,
  data: AIKnowledgeBaseParams,
) {
  return requestClient.put<AIActionResult>(`/api/v1/knowledges/${pk}`, data);
}

export async function deleteAIKnowledgeBaseApi(pk: number) {
  return requestClient.delete<AIActionResult>(`/api/v1/knowledges/${pk}`);
}

export async function getAllAIKnowledgeDocumentApi(
  pk: number,
  includeContent = false,
) {
  return requestClient.get<AIKnowledgeDocumentResult[]>(
    `/api/v1/knowledges/${pk}/documents/all`,
    { params: { include_content: includeContent } },
  );
}

export async function getAIKnowledgeDocumentDetailApi(
  pk: number,
  docId: number,
) {
  return requestClient.get<AIKnowledgeDocumentResult>(
    `/api/v1/knowledges/${pk}/documents/${docId}`,
  );
}

export async function getAIKnowledgeDocumentListApi(
  pk: number,
  params?: AIKnowledgeDocumentQueryParams,
) {
  return requestClient.get<PaginationResult<AIKnowledgeDocumentResult>>(
    `/api/v1/knowledges/${pk}/documents`,
    { params },
  );
}

export async function createAIKnowledgeDocumentApi(
  pk: number,
  files: File[],
  options?: AIKnowledgeDocumentUploadOptions,
) {
  const fields: Record<string, string> = {};
  if (options?.title) {
    fields.title = options.title;
  }
  if (typeof options?.provider_id === 'number') {
    fields.provider_id = String(options.provider_id);
  }
  if (options?.model_id) {
    fields.model_id = options.model_id;
  }
  const { data, headers } = toUploadRequest(
    files,
    Object.keys(fields).length > 0 ? fields : undefined,
  );
  return requestClient.post<AIActionResult>(
    `/api/v1/knowledges/${pk}/documents`,
    data,
    { headers },
  );
}

export async function deleteAIKnowledgeDocumentApi(pk: number, docId: number) {
  return requestClient.delete<AIActionResult>(
    `/api/v1/knowledges/${pk}/documents/${docId}`,
  );
}

export async function getAISkillDetailApi(pk: number) {
  return requestClient.get<AISkillResult>(`/api/v1/skills/${pk}`);
}

export async function getAllAISkillApi() {
  return requestClient.get<AISkillResult[]>('/api/v1/skills/all');
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

export async function getAllAIAssistantApi() {
  return requestClient.get<AIAssistantResult[]>('/api/v1/assistants/all');
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

export interface AIOnnxOption {
  id: string;
  name: string;
  size_gb: null | number;
  downloaded: boolean;
}

export interface AIOnnxCatalog {
  embedding: AIOnnxOption[];
  ocr: AIOnnxOption[];
  paddleocr: AIOnnxOption[];
  cache_dir: string;
  ocr_cache_dir: string;
  paddleocr_cache_dir: string;
}

export interface AIOnnxDownloadStatus {
  status: 'done' | 'downloading' | 'failed' | 'idle';
  progress: number;
  model_id: string;
  error: null | string;
  cache_dir: string;
}

export async function getAllAIConfigApi() {
  return requestClient.get<AIConfigResult[]>('/api/v1/sys/configs/all', {
    params: { type: 'AI' },
  });
}

export async function getAIOnnxOptionsApi() {
  return requestClient.get<AIOnnxCatalog>('/api/v1/knowledges/onnx-options');
}

export async function downloadAIOnnxModelApi(modelId: string) {
  return requestClient.post<AIOnnxDownloadStatus>(
    '/api/v1/knowledges/onnx-download',
    { model_id: modelId },
  );
}

export async function getAIOnnxDownloadStatusApi() {
  return requestClient.get<AIOnnxDownloadStatus>(
    '/api/v1/knowledges/onnx-download-status',
  );
}

export async function downloadAIOcrOnnxModelApi(modelId: string) {
  return requestClient.post<AIOnnxDownloadStatus>(
    '/api/v1/knowledges/ocr-onnx-download',
    { model_id: modelId },
  );
}

export async function getAIOcrOnnxDownloadStatusApi() {
  return requestClient.get<AIOnnxDownloadStatus>(
    '/api/v1/knowledges/ocr-onnx-download-status',
  );
}

export async function downloadAIPaddleocrModelApi(modelId: string) {
  return requestClient.post<AIOnnxDownloadStatus>(
    '/api/v1/knowledges/paddleocr-download',
    { model_id: modelId },
  );
}

export async function getAIPaddleocrDownloadStatusApi() {
  return requestClient.get<AIOnnxDownloadStatus>(
    '/api/v1/knowledges/paddleocr-download-status',
  );
}

export async function updateAIConfigApi(params: AIConfigParams[]) {
  return requestClient.put('/api/v1/sys/configs', params);
}

export async function getAllAIExpertApi() {
  return requestClient.get<AIExpertResult[]>('/api/v1/experts/all');
}

export async function getAIExpertDetailApi(pk: number) {
  return requestClient.get<AIExpertResult>(`/api/v1/experts/${pk}`);
}

export async function getAIExpertListApi(params?: AIExpertQueryParams) {
  return requestClient.get<PaginationResult<AIExpertResult>>(
    '/api/v1/experts',
    { params },
  );
}

export async function createAIExpertApi(data: AIExpertParams) {
  return requestClient.post<AIActionResult>('/api/v1/experts', data);
}

export async function updateAIExpertApi(pk: number, data: AIExpertParams) {
  return requestClient.put<AIActionResult>(`/api/v1/experts/${pk}`, data);
}

export async function deleteAIExpertApi(pk: number) {
  return requestClient.delete<AIActionResult>(`/api/v1/experts/${pk}`);
}

export async function getAllAISubagentApi() {
  return requestClient.get<AISubagentResult[]>('/api/v1/subagents/all');
}

export async function getAISubagentDetailApi(pk: number) {
  return requestClient.get<AISubagentResult>(`/api/v1/subagents/${pk}`);
}

export async function getAISubagentListApi(params?: AISubagentQueryParams) {
  return requestClient.get<PaginationResult<AISubagentResult>>(
    '/api/v1/subagents',
    { params },
  );
}

export async function createAISubagentApi(data: AISubagentParams) {
  return requestClient.post<AIActionResult>('/api/v1/subagents', data);
}

export async function updateAISubagentApi(pk: number, data: AISubagentParams) {
  return requestClient.put<AIActionResult>(`/api/v1/subagents/${pk}`, data);
}

export async function deleteAISubagentApi(pk: number) {
  return requestClient.delete<AIActionResult>(`/api/v1/subagents/${pk}`);
}
