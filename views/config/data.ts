import type { VbenFormSchema } from '#/adapter/form';

import {
  AI_COMPACTION_KEEP_MESSAGES,
  AI_COMPACTION_MAX_MESSAGES,
  AI_DOC2X_API_KEY,
  AI_DOC2X_API_URL,
  AI_DOCUMENT_EXTRACT_BACKEND,
  AI_EMBEDDING_BACKEND,
  AI_EXA_API_KEY,
  AI_HTTP_MAX_RETRIES,
  AI_JEV_INPUT_THRESHOLD,
  AI_JEV_MODEL,
  AI_MARKITDOWN_DOCINTEL_API_KEY,
  AI_MARKITDOWN_DOCINTEL_ENDPOINT,
  AI_MCP_MAX_RETRIES,
  AI_MINERU_API_KEY,
  AI_MISTRAL_API_KEY,
  AI_MISTRAL_API_URL,
  AI_OCR_BACKEND,
  AI_ONNX_EMBEDDING_MODEL,
  AI_OPEN_MINERU_API_KEY,
  AI_OPEN_MINERU_API_URL,
  AI_PADDLEOCR_API_URL,
  AI_RAG_CHUNK_CHARS,
  AI_RAG_CHUNK_OVERLAP,
  AI_RAG_TOP_K,
  AI_TAVILY_API_KEY,
  AI_TYPESAFE_API_KEY,
  AI_UNSTRUCTURED_API_KEY,
  AI_UNSTRUCTURED_API_URL,
} from './config-keys';
import OnnxModelPicker from './onnx-model-picker.vue';

function isMistralBackend(values: Partial<Record<string, any>>): boolean {
  return (
    values[AI_DOCUMENT_EXTRACT_BACKEND] === 'mistral' ||
    values[AI_OCR_BACKEND] === 'mistral'
  );
}

export const searchEngineSchema: VbenFormSchema[] = [
  {
    component: 'InputPassword',
    description: '用于 Exa 联网搜索。获取 https://dashboard.exa.ai',
    fieldName: AI_EXA_API_KEY,
    label: 'Exa API Key',
  },
  {
    component: 'InputPassword',
    description: '用于 Tavily 联网搜索。获取 https://app.tavily.com/home',
    fieldName: AI_TAVILY_API_KEY,
    label: 'Tavily API Key',
  },
];

export const ragStoreSchema: VbenFormSchema[] = [
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 500,
    fieldName: AI_RAG_CHUNK_CHARS,
    label: '切片长度',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 0,
      precision: 0,
    },
    defaultValue: 80,
    fieldName: AI_RAG_CHUNK_OVERLAP,
    label: '切片重叠',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 6,
    fieldName: AI_RAG_TOP_K,
    label: '检索条数',
  },
];

export const ragEmbedSchema: VbenFormSchema[] = [
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: [
        { label: '远程默认向量模型', value: 'remote' },
        { label: '本地 ONNX / fastembed', value: 'onnx' },
      ],
    },
    defaultValue: 'remote',
    description:
      '知识库未指定向量模型时，远程模式需要已配置的默认向量模型；本地模式使用已下载的 ONNX 模型',
    fieldName: AI_EMBEDDING_BACKEND,
    label: '向量化方式',
  },
  {
    component: OnnxModelPicker,
    componentProps: {
      class: 'w-full',
      source: 'embedding',
    },
    defaultValue: 'BAAI/bge-small-zh-v1.5',
    dependencies: {
      show: (values) => values[AI_EMBEDDING_BACKEND] === 'onnx',
      triggerFields: [AI_EMBEDDING_BACKEND],
    },
    description: '未下载的模型需先下载才能保存，切换模型会重建全部知识索引',
    fieldName: AI_ONNX_EMBEDDING_MODEL,
    modelPropName: 'value',
    formItemClass:
      'col-span-full !items-start [&_.overflow-hidden]:!overflow-visible [&_[data-state=open]]:!h-auto',
    label: 'ONNX 向量模型',
  },
];

export const ragExtractSchema: VbenFormSchema[] = [
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: [
        { label: '内置解析（pypdf / Office）', value: 'native' },
        { label: 'MarkItDown', value: 'markitdown' },
        { label: 'Unstructured', value: 'unstructured' },
        { label: 'MinerU', value: 'mineru' },
        { label: 'Open MinerU', value: 'open_mineru' },
        { label: 'Doc2X', value: 'doc2x' },
        { label: 'Mistral OCR', value: 'mistral' },
      ],
    },
    defaultValue: 'native',
    description: '扫描版 PDF 抽不出文本时会回退 OCR',
    fieldName: AI_DOCUMENT_EXTRACT_BACKEND,
    label: '抽取方式',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => values[AI_DOCUMENT_EXTRACT_BACKEND] === 'unstructured',
      triggerFields: [AI_DOCUMENT_EXTRACT_BACKEND],
    },
    description:
      '空则使用官方托管地址，密钥获取 https://platform.unstructured.io',
    fieldName: AI_UNSTRUCTURED_API_URL,
    label: 'Unstructured URL',
  },
  {
    component: 'InputPassword',
    dependencies: {
      show: (values) => values[AI_DOCUMENT_EXTRACT_BACKEND] === 'unstructured',
      triggerFields: [AI_DOCUMENT_EXTRACT_BACKEND],
    },
    fieldName: AI_UNSTRUCTURED_API_KEY,
    label: 'Unstructured Key',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => values[AI_DOCUMENT_EXTRACT_BACKEND] === 'markitdown',
      triggerFields: [AI_DOCUMENT_EXTRACT_BACKEND],
    },
    description: '可留空走本地解析，开通 https://portal.azure.com',
    fieldName: AI_MARKITDOWN_DOCINTEL_ENDPOINT,
    label: 'Azure 文档智能 Endpoint',
  },
  {
    component: 'InputPassword',
    dependencies: {
      show: (values) => values[AI_DOCUMENT_EXTRACT_BACKEND] === 'markitdown',
      triggerFields: [AI_DOCUMENT_EXTRACT_BACKEND],
    },
    fieldName: AI_MARKITDOWN_DOCINTEL_API_KEY,
    label: 'Azure 文档智能 Key',
  },
  {
    component: 'InputPassword',
    dependencies: {
      show: (values) => values[AI_DOCUMENT_EXTRACT_BACKEND] === 'mineru',
      triggerFields: [AI_DOCUMENT_EXTRACT_BACKEND],
    },
    description: '获取 https://mineru.net/apiManage/token',
    fieldName: AI_MINERU_API_KEY,
    label: 'MinerU Token',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => values[AI_DOCUMENT_EXTRACT_BACKEND] === 'open_mineru',
      triggerFields: [AI_DOCUMENT_EXTRACT_BACKEND],
    },
    description: '例如 http://127.0.0.1:8000',
    fieldName: AI_OPEN_MINERU_API_URL,
    label: 'Open MinerU URL',
  },
  {
    component: 'InputPassword',
    dependencies: {
      show: (values) => values[AI_DOCUMENT_EXTRACT_BACKEND] === 'open_mineru',
      triggerFields: [AI_DOCUMENT_EXTRACT_BACKEND],
    },
    fieldName: AI_OPEN_MINERU_API_KEY,
    label: 'Open MinerU Key',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => values[AI_DOCUMENT_EXTRACT_BACKEND] === 'doc2x',
      triggerFields: [AI_DOCUMENT_EXTRACT_BACKEND],
    },
    description: '空则使用官方地址，密钥获取 https://open.noedgeai.com',
    fieldName: AI_DOC2X_API_URL,
    label: 'Doc2X URL',
  },
  {
    component: 'InputPassword',
    dependencies: {
      show: (values) => values[AI_DOCUMENT_EXTRACT_BACKEND] === 'doc2x',
      triggerFields: [AI_DOCUMENT_EXTRACT_BACKEND],
    },
    fieldName: AI_DOC2X_API_KEY,
    label: 'Doc2X Key',
  },
];

export const ragOcrSchema: VbenFormSchema[] = [
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: [
        { label: '系统 OCR', value: 'system' },
        { label: 'Tesseract', value: 'tesseract' },
        { label: 'PaddleOCR', value: 'paddleocr' },
        { label: '本地 ONNX', value: 'onnx' },
        { label: '默认对话模型（需识图能力）', value: 'vision' },
        { label: 'Mistral OCR', value: 'mistral' },
      ],
    },
    defaultValue: 'system',
    fieldName: AI_OCR_BACKEND,
    label: 'OCR 方式',
  },
  {
    component: OnnxModelPicker,
    componentProps: {
      class: 'w-full',
      source: 'ocr',
    },
    defaultValue: 'rapidocr',
    dependencies: {
      show: (values) => values[AI_OCR_BACKEND] === 'onnx',
      triggerFields: [AI_OCR_BACKEND],
    },
    description: '未下载的模型需先下载才能保存',
    fieldName: 'ocr_onnx_model',
    modelPropName: 'value',
    formItemClass:
      'col-span-full !items-start [&_.overflow-hidden]:!overflow-visible [&_[data-state=open]]:!h-auto',
    label: 'ONNX OCR 模型',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => values[AI_OCR_BACKEND] === 'paddleocr',
      triggerFields: [AI_OCR_BACKEND],
    },
    description: '空则使用本机 paddleocr，需先下载模型',
    fieldName: AI_PADDLEOCR_API_URL,
    label: 'PaddleOCR URL',
  },
  {
    component: OnnxModelPicker,
    componentProps: {
      class: 'w-full',
      source: 'paddleocr',
    },
    defaultValue: 'paddleocr',
    dependencies: {
      show: (values) =>
        values[AI_OCR_BACKEND] === 'paddleocr' &&
        !String(values[AI_PADDLEOCR_API_URL] || '').trim(),
      triggerFields: [AI_OCR_BACKEND, AI_PADDLEOCR_API_URL],
    },
    description: '未下载的模型需先下载才能保存',
    fieldName: 'paddleocr_model',
    modelPropName: 'value',
    formItemClass:
      'col-span-full !items-start [&_.overflow-hidden]:!overflow-visible [&_[data-state=open]]:!h-auto',
    label: 'PaddleOCR 模型',
  },
];

export const ragMistralSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    dependencies: {
      show: isMistralBackend,
      triggerFields: [AI_DOCUMENT_EXTRACT_BACKEND, AI_OCR_BACKEND],
    },
    description:
      '空则使用官方地址，密钥获取 https://console.mistral.ai/api-keys',
    fieldName: AI_MISTRAL_API_URL,
    label: 'Mistral URL',
  },
  {
    component: 'InputPassword',
    dependencies: {
      show: isMistralBackend,
      triggerFields: [AI_DOCUMENT_EXTRACT_BACKEND, AI_OCR_BACKEND],
    },
    fieldName: AI_MISTRAL_API_KEY,
    label: 'Mistral Key',
  },
];

export const ragSchema: VbenFormSchema[] = [
  ...ragEmbedSchema,
  ...ragStoreSchema,
  ...ragExtractSchema,
  ...ragOcrSchema,
  ...ragMistralSchema,
];

export const runtimeSchema: VbenFormSchema[] = [
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 0,
      precision: 0,
    },
    defaultValue: 5,
    fieldName: AI_HTTP_MAX_RETRIES,
    label: '模型请求重试次数',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 0,
      precision: 0,
    },
    defaultValue: 1,
    fieldName: AI_MCP_MAX_RETRIES,
    label: 'MCP 调用重试次数',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 40,
    description: '压缩历史对话时保留的最近消息数',
    fieldName: AI_COMPACTION_KEEP_MESSAGES,
    label: '压缩保留消息数',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 80,
    description: '历史消息数超过此值时，尝试压缩较早的消息',
    fieldName: AI_COMPACTION_MAX_MESSAGES,
    label: '压缩触发阈值',
  },
];

export const jevSchema: VbenFormSchema[] = [
  {
    component: 'InputPassword',
    description: '空则关闭 Jev 护栏。获取 https://console.typesafe.ai',
    fieldName: AI_TYPESAFE_API_KEY,
    label: 'TypeSafe API Key',
  },
  {
    component: 'Input',
    defaultValue: 'jev-latest',
    fieldName: AI_JEV_MODEL,
    label: 'Jev 模型',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      max: 1,
      min: 0,
      precision: 2,
      step: 0.05,
    },
    defaultValue: 0.75,
    description: '有害概率达到该值后拦截用户提示',
    fieldName: AI_JEV_INPUT_THRESHOLD,
    label: 'Jev 输入阈值',
  },
];
