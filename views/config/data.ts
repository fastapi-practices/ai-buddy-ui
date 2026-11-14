import type { VbenFormSchema } from '#/adapter/form';

import {
  AI_BUDDY_AGENT_DURABILITY_ENABLED,
  AI_BUDDY_AGENT_DURABILITY_RECOVERY_ENABLED,
  AI_BUDDY_AGENT_DURABILITY_RECOVERY_INTERVAL_SECONDS,
  AI_BUDDY_AGENT_DURABILITY_STALE_SECONDS,
  AI_BUDDY_AGENT_DYNAMIC_SUBAGENTS_ENABLED,
  AI_BUDDY_AGENT_DYNAMIC_SUBAGENTS_MAX,
  AI_BUDDY_AGENT_EXECUTION_BACKEND,
  AI_BUDDY_AGENT_FALLBACK_MODELS,
  AI_BUDDY_COMPACTION_KEEP_MESSAGES,
  AI_BUDDY_COMPACTION_MAX_MESSAGES,
  AI_BUDDY_DOC2X_API_KEY,
  AI_BUDDY_DOC2X_API_URL,
  AI_BUDDY_DOCUMENT_EXTRACT_BACKEND,
  AI_BUDDY_EMBEDDING_BACKEND,
  AI_BUDDY_EXA_API_KEY,
  AI_BUDDY_HTTP_MAX_RETRIES,
  AI_BUDDY_JEV_INPUT_THRESHOLD,
  AI_BUDDY_JEV_MODEL,
  AI_BUDDY_KEENABLE_API_KEY,
  AI_BUDDY_KNOWLEDGE_MAX_FILES,
  AI_BUDDY_KNOWLEDGE_MAX_IMAGE_BYTES,
  AI_BUDDY_KNOWLEDGE_MAX_IMAGE_PIXELS,
  AI_BUDDY_KNOWLEDGE_MAX_IMAGES,
  AI_BUDDY_KNOWLEDGE_MAX_PDF_PAGES,
  AI_BUDDY_KNOWLEDGE_MAX_TOTAL_BYTES,
  AI_BUDDY_MARKITDOWN_DOCINTEL_API_KEY,
  AI_BUDDY_MARKITDOWN_DOCINTEL_ENDPOINT,
  AI_BUDDY_MCP_MAX_RETRIES,
  AI_BUDDY_MINERU_API_KEY,
  AI_BUDDY_MISTRAL_API_KEY,
  AI_BUDDY_MISTRAL_API_URL,
  AI_BUDDY_OCR_BACKEND,
  AI_BUDDY_OCR_TIMEOUT_SECONDS,
  AI_BUDDY_ONNX_EMBEDDING_MODEL,
  AI_BUDDY_OPEN_MINERU_API_KEY,
  AI_BUDDY_OPEN_MINERU_API_URL,
  AI_BUDDY_PADDLEOCR_API_URL,
  AI_BUDDY_RAG_CHUNK_CHARS,
  AI_BUDDY_RAG_CHUNK_OVERLAP,
  AI_BUDDY_RAG_TOP_K,
  AI_BUDDY_TAVILY_API_KEY,
  AI_BUDDY_TYPESAFE_API_KEY,
  AI_BUDDY_UNSTRUCTURED_API_KEY,
  AI_BUDDY_UNSTRUCTURED_API_URL,
} from './config-keys';
import FallbackModelSelect from './fallback-model-select.vue';
import OnnxModelPicker from './onnx-model-picker.vue';

const SWITCH_OPTIONS = [
  { label: '开启', value: 'true' },
  { label: '关闭', value: 'false' },
];

export const searchEngineSchema: VbenFormSchema[] = [
  {
    component: 'InputPassword',
    description: '用于 Exa 联网搜索。获取 https://dashboard.exa.ai',
    fieldName: AI_BUDDY_EXA_API_KEY,
    label: 'Exa API Key',
  },
  {
    component: 'InputPassword',
    description: '用于 Tavily 联网搜索。获取 https://app.tavily.com/home',
    fieldName: AI_BUDDY_TAVILY_API_KEY,
    label: 'Tavily API Key',
  },
  {
    component: 'InputPassword',
    description: '用于 Keenable 联网搜索。获取 https://keenable.ai',
    fieldName: AI_BUDDY_KEENABLE_API_KEY,
    label: 'Keenable API Key',
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
    description: '单个知识切片的最大字符数，过大容易超出向量模型的上下文长度',
    fieldName: AI_BUDDY_RAG_CHUNK_CHARS,
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
    description: '相邻切片的重复字符数，保留少量重叠可避免切断跨切片的语义',
    fieldName: AI_BUDDY_RAG_CHUNK_OVERLAP,
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
    description:
      '每次检索召回的知识片段数量，越大上下文越丰富但更慢、更耗 token',
    fieldName: AI_BUDDY_RAG_TOP_K,
    label: '检索条数',
  },
];

export const ragLimitSchema: VbenFormSchema[] = [
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 200,
    description: '单次知识导入允许的最大文件数',
    fieldName: AI_BUDDY_KNOWLEDGE_MAX_FILES,
    label: '知识文件数上限',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 104_857_600,
    description: '单次知识导入允许的最大总字节数',
    fieldName: AI_BUDDY_KNOWLEDGE_MAX_TOTAL_BYTES,
    label: '知识总量上限',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 200,
    description: '单个 PDF 文档允许解析的最大页数',
    fieldName: AI_BUDDY_KNOWLEDGE_MAX_PDF_PAGES,
    label: 'PDF 页数上限',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 200,
    description: '单次知识导入允许解析的最大图片数',
    fieldName: AI_BUDDY_KNOWLEDGE_MAX_IMAGES,
    label: '知识图片数上限',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 20_971_520,
    description: '单张知识图片允许的最大字节数',
    fieldName: AI_BUDDY_KNOWLEDGE_MAX_IMAGE_BYTES,
    label: '知识图片字节上限',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 40_000_000,
    description: '单次知识导入允许解析的图片像素总数',
    fieldName: AI_BUDDY_KNOWLEDGE_MAX_IMAGE_PIXELS,
    label: '知识图片像素上限',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 300,
    description: '知识 OCR 识别的超时秒数',
    fieldName: AI_BUDDY_OCR_TIMEOUT_SECONDS,
    label: 'OCR 超时',
  },
];

export const ragEmbedSchema: VbenFormSchema[] = [
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: [
        { label: '默认向量模型', value: 'remote' },
        { label: '本地 ONNX / fastembed', value: 'onnx' },
      ],
    },
    defaultValue: 'remote',
    fieldName: AI_BUDDY_EMBEDDING_BACKEND,
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
      show: (values) => values[AI_BUDDY_EMBEDDING_BACKEND] === 'onnx',
      triggerFields: [AI_BUDDY_EMBEDDING_BACKEND],
    },
    description: '未下载的模型需先下载才能保存，切换模型会重建全部知识索引',
    fieldName: AI_BUDDY_ONNX_EMBEDDING_MODEL,
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
    fieldName: AI_BUDDY_DOCUMENT_EXTRACT_BACKEND,
    label: '抽取方式',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) =>
        values[AI_BUDDY_DOCUMENT_EXTRACT_BACKEND] === 'unstructured',
      triggerFields: [AI_BUDDY_DOCUMENT_EXTRACT_BACKEND],
    },
    description:
      '空则使用官方托管地址，密钥获取 https://platform.unstructured.io',
    fieldName: AI_BUDDY_UNSTRUCTURED_API_URL,
    label: 'Unstructured URL',
  },
  {
    component: 'InputPassword',
    dependencies: {
      show: (values) =>
        values[AI_BUDDY_DOCUMENT_EXTRACT_BACKEND] === 'unstructured',
      triggerFields: [AI_BUDDY_DOCUMENT_EXTRACT_BACKEND],
    },
    fieldName: AI_BUDDY_UNSTRUCTURED_API_KEY,
    label: 'Unstructured Key',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) =>
        values[AI_BUDDY_DOCUMENT_EXTRACT_BACKEND] === 'markitdown',
      triggerFields: [AI_BUDDY_DOCUMENT_EXTRACT_BACKEND],
    },
    description: '可留空走本地解析，开通 https://portal.azure.com',
    fieldName: AI_BUDDY_MARKITDOWN_DOCINTEL_ENDPOINT,
    label: 'Azure 文档智能 Endpoint',
  },
  {
    component: 'InputPassword',
    dependencies: {
      show: (values) =>
        values[AI_BUDDY_DOCUMENT_EXTRACT_BACKEND] === 'markitdown',
      triggerFields: [AI_BUDDY_DOCUMENT_EXTRACT_BACKEND],
    },
    fieldName: AI_BUDDY_MARKITDOWN_DOCINTEL_API_KEY,
    label: 'Azure 文档智能 Key',
  },
  {
    component: 'InputPassword',
    dependencies: {
      show: (values) => values[AI_BUDDY_DOCUMENT_EXTRACT_BACKEND] === 'mineru',
      triggerFields: [AI_BUDDY_DOCUMENT_EXTRACT_BACKEND],
    },
    description: '获取 https://mineru.net/apiManage/token',
    fieldName: AI_BUDDY_MINERU_API_KEY,
    label: 'MinerU Token',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) =>
        values[AI_BUDDY_DOCUMENT_EXTRACT_BACKEND] === 'open_mineru',
      triggerFields: [AI_BUDDY_DOCUMENT_EXTRACT_BACKEND],
    },
    description: '例如 http://127.0.0.1:8000',
    fieldName: AI_BUDDY_OPEN_MINERU_API_URL,
    label: 'Open MinerU URL',
  },
  {
    component: 'InputPassword',
    dependencies: {
      show: (values) =>
        values[AI_BUDDY_DOCUMENT_EXTRACT_BACKEND] === 'open_mineru',
      triggerFields: [AI_BUDDY_DOCUMENT_EXTRACT_BACKEND],
    },
    fieldName: AI_BUDDY_OPEN_MINERU_API_KEY,
    label: 'Open MinerU Key',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => values[AI_BUDDY_DOCUMENT_EXTRACT_BACKEND] === 'doc2x',
      triggerFields: [AI_BUDDY_DOCUMENT_EXTRACT_BACKEND],
    },
    description: '空则使用官方地址，密钥获取 https://open.noedgeai.com',
    fieldName: AI_BUDDY_DOC2X_API_URL,
    label: 'Doc2X URL',
  },
  {
    component: 'InputPassword',
    dependencies: {
      show: (values) => values[AI_BUDDY_DOCUMENT_EXTRACT_BACKEND] === 'doc2x',
      triggerFields: [AI_BUDDY_DOCUMENT_EXTRACT_BACKEND],
    },
    fieldName: AI_BUDDY_DOC2X_API_KEY,
    label: 'Doc2X Key',
  },
];

export const ragOcrSchema: VbenFormSchema[] = [
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: [
        { label: 'PaddleOCR', value: 'paddleocr' },
        { label: '本地 ONNX', value: 'onnx' },
        { label: '默认对话模型（需识图能力）', value: 'vision' },
        { label: 'Mistral OCR', value: 'mistral' },
      ],
    },
    defaultValue: 'onnx',
    fieldName: AI_BUDDY_OCR_BACKEND,
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
      show: (values) => values[AI_BUDDY_OCR_BACKEND] === 'onnx',
      triggerFields: [AI_BUDDY_OCR_BACKEND],
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
      show: (values) => values[AI_BUDDY_OCR_BACKEND] === 'paddleocr',
      triggerFields: [AI_BUDDY_OCR_BACKEND],
    },
    description: '空则使用本机 paddleocr，需先下载模型',
    fieldName: AI_BUDDY_PADDLEOCR_API_URL,
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
        values[AI_BUDDY_OCR_BACKEND] === 'paddleocr' &&
        !String(values[AI_BUDDY_PADDLEOCR_API_URL] || '').trim(),
      triggerFields: [AI_BUDDY_OCR_BACKEND, AI_BUDDY_PADDLEOCR_API_URL],
    },
    description: '未下载的模型需先下载才能保存',
    fieldName: 'paddleocr_model',
    modelPropName: 'value',
    formItemClass:
      'col-span-full !items-start [&_.overflow-hidden]:!overflow-visible [&_[data-state=open]]:!h-auto',
    label: 'PaddleOCR 模型',
  },
];

// Mistral 同时用于文档解析和 OCR：解析方式在「文档解析」菜单，
// 该菜单的取值通过菜单的 contextKeys 注入本表单，仅用于条件显示。
function isMistralBackend(values: Partial<Record<string, any>>): boolean {
  return (
    values[AI_BUDDY_DOCUMENT_EXTRACT_BACKEND] === 'mistral' ||
    values[AI_BUDDY_OCR_BACKEND] === 'mistral'
  );
}

export const ragMistralSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    dependencies: {
      show: isMistralBackend,
      triggerFields: [AI_BUDDY_DOCUMENT_EXTRACT_BACKEND, AI_BUDDY_OCR_BACKEND],
    },
    description:
      '空则使用官方地址，密钥获取 https://console.mistral.ai/api-keys',
    fieldName: AI_BUDDY_MISTRAL_API_URL,
    label: 'Mistral URL',
  },
  {
    component: 'InputPassword',
    dependencies: {
      show: isMistralBackend,
      triggerFields: [AI_BUDDY_DOCUMENT_EXTRACT_BACKEND],
    },
    fieldName: AI_BUDDY_MISTRAL_API_KEY,
    label: 'Mistral Key',
  },
];

export const ragRetrievalSchema: VbenFormSchema[] = [
  ...ragEmbedSchema,
  ...ragStoreSchema,
];

export const documentExtractSchema: VbenFormSchema[] = [...ragExtractSchema];

export const ocrSchema: VbenFormSchema[] = [
  ...ragOcrSchema,
  ...ragMistralSchema,
];

export const knowledgeLimitSchema: VbenFormSchema[] = [...ragLimitSchema];

export const runtimeBaseSchema: VbenFormSchema[] = [
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: [
        { label: '本机（需连接桌面客户端）', value: 'local' },
        { label: '服务端沙箱', value: 'sandbox' },
      ],
    },
    defaultValue: 'local',
    description: '未指定执行环境时使用的默认后端',
    fieldName: AI_BUDDY_AGENT_EXECUTION_BACKEND,
    label: '默认执行后端',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 0,
      precision: 0,
    },
    defaultValue: 5,
    fieldName: AI_BUDDY_HTTP_MAX_RETRIES,
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
    fieldName: AI_BUDDY_MCP_MAX_RETRIES,
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
    fieldName: AI_BUDDY_COMPACTION_KEEP_MESSAGES,
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
    fieldName: AI_BUDDY_COMPACTION_MAX_MESSAGES,
    label: '压缩触发阈值',
  },
];

export const agentRecoverySchema: VbenFormSchema[] = [
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: SWITCH_OPTIONS,
    },
    defaultValue: 'false',
    description: '开启后整轮生成写入持久化工作流，进程崩溃后可自动恢复',
    fieldName: AI_BUDDY_AGENT_DURABILITY_ENABLED,
    label: '容灾执行',
  },
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: SWITCH_OPTIONS,
    },
    defaultValue: 'true',
    description: '开启后周期巡检并恢复卡在等待状态的容灾工作流',
    fieldName: AI_BUDDY_AGENT_DURABILITY_RECOVERY_ENABLED,
    label: '容灾巡检',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 60,
    description: '容灾巡检后台任务的扫描间隔秒数',
    fieldName: AI_BUDDY_AGENT_DURABILITY_RECOVERY_INTERVAL_SECONDS,
    label: '容灾巡检间隔',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 60,
    description: '助手消息静默多久判定为中断并触发恢复',
    fieldName: AI_BUDDY_AGENT_DURABILITY_STALE_SECONDS,
    label: '容灾静默阈值',
  },
  {
    component: FallbackModelSelect,
    componentProps: {
      class: 'w-full',
    },
    description: '模型不可用时按选择顺序依次重试的兜底模型',
    fieldName: AI_BUDDY_AGENT_FALLBACK_MODELS,
    label: '兜底模型',
    modelPropName: 'value',
  },
];

export const dynamicSubagentSchema: VbenFormSchema[] = [
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: SWITCH_OPTIONS,
    },
    defaultValue: 'true',
    description: '开启后模型可在运行中动态创建子代理',
    fieldName: AI_BUDDY_AGENT_DYNAMIC_SUBAGENTS_ENABLED,
    label: '动态子代理',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 1,
      precision: 0,
    },
    defaultValue: 3,
    description: '单轮对话允许动态创建的子代理数量上限',
    fieldName: AI_BUDDY_AGENT_DYNAMIC_SUBAGENTS_MAX,
    label: '动态子代理上限',
  },
];

export const jevSchema: VbenFormSchema[] = [
  {
    component: 'InputPassword',
    description: '空则关闭 Jev 护栏。获取 https://console.typesafe.ai',
    fieldName: AI_BUDDY_TYPESAFE_API_KEY,
    label: 'TypeSafe API Key',
  },
  {
    component: 'Input',
    defaultValue: 'jev-latest',
    fieldName: AI_BUDDY_JEV_MODEL,
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
    fieldName: AI_BUDDY_JEV_INPUT_THRESHOLD,
    label: 'Jev 输入阈值',
  },
];
