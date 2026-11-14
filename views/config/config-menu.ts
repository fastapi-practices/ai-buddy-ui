import type { VbenFormSchema } from '#/adapter/form';

import {
  AI_BUDDY_DOCUMENT_EXTRACT_BACKEND,
  isEditableAIConfigKey,
} from './config-keys';
import {
  agentRecoverySchema,
  documentExtractSchema,
  dynamicSubagentSchema,
  jevSchema,
  knowledgeLimitSchema,
  ocrSchema,
  ragRetrievalSchema,
  runtimeBaseSchema,
  searchEngineSchema,
} from './data';

/**
 * 单个配置菜单允许展示的最大配置项数量，超出需要拆分为新的菜单。
 */
export const AI_CONFIG_MENU_MAX_ITEMS = 10;

export type AIConfigMenu = {
  /** 菜单唯一标识，同时用作标签页 key */
  key: string;
  /** 菜单标题的国际化 key */
  labelKey: string;
  /** 菜单图标样式（完整 class，便于 Tailwind 静态扫描） */
  icon: string;
  /** 该菜单渲染的表单项 */
  schema: VbenFormSchema[];
  /** 该菜单负责保存的配置键，由 schema 自动推导 */
  keys: string[];
  /** 只为条件显示读取的其他菜单配置键，不参与本菜单保存 */
  contextKeys?: string[];
  /** 是否需要在表单中渲染 ONNX 模型选择器 */
  usesOnnx?: boolean;
};

type AIConfigMenuInput = Omit<AIConfigMenu, 'keys'>;

function createMenu(menu: AIConfigMenuInput): AIConfigMenu {
  return {
    ...menu,
    keys: menu.schema
      .map((item) => item.fieldName)
      .filter((fieldName): fieldName is string =>
        isEditableAIConfigKey(fieldName),
      ),
  };
}

export const aiConfigMenus: AIConfigMenu[] = [
  createMenu({
    key: 'search-engine',
    labelKey: 'ai-buddy.configMenu.searchEngine',
    icon: 'icon-[carbon--search] -mb-1 size-5',
    schema: searchEngineSchema,
  }),
  createMenu({
    key: 'rag-retrieval',
    labelKey: 'ai-buddy.configMenu.ragRetrieval',
    icon: 'icon-[carbon--data-base] -mb-1 size-5',
    schema: ragRetrievalSchema,
    usesOnnx: true,
  }),
  createMenu({
    key: 'document-extract',
    labelKey: 'ai-buddy.configMenu.documentExtract',
    icon: 'icon-[carbon--document] -mb-1 size-5',
    schema: documentExtractSchema,
  }),
  createMenu({
    key: 'ocr',
    labelKey: 'ai-buddy.configMenu.ocr',
    icon: 'icon-[carbon--image] -mb-1 size-5',
    schema: ocrSchema,
    usesOnnx: true,
    // Mistral 也可能是文档解析方式，读取「文档解析」菜单的取值用于条件显示
    contextKeys: [AI_BUDDY_DOCUMENT_EXTRACT_BACKEND],
  }),
  createMenu({
    key: 'knowledge-limit',
    labelKey: 'ai-buddy.configMenu.knowledgeLimit',
    icon: 'icon-[carbon--meter] -mb-1 size-5',
    schema: knowledgeLimitSchema,
  }),
  createMenu({
    key: 'runtime',
    labelKey: 'ai-buddy.configMenu.runtime',
    icon: 'icon-[carbon--settings] -mb-1 size-5',
    schema: runtimeBaseSchema,
  }),
  createMenu({
    key: 'agent-recovery',
    labelKey: 'ai-buddy.configMenu.agentRecovery',
    icon: 'icon-[carbon--restart] -mb-1 size-5',
    schema: agentRecoverySchema,
  }),
  createMenu({
    key: 'dynamic-subagent',
    labelKey: 'ai-buddy.configMenu.dynamicSubagent',
    icon: 'icon-[carbon--flow] -mb-1 size-5',
    schema: dynamicSubagentSchema,
  }),
  createMenu({
    key: 'jev',
    labelKey: 'ai-buddy.configMenu.jev',
    icon: 'icon-[carbon--security] -mb-1 size-5',
    schema: jevSchema,
  }),
];

export function findAIConfigMenu(key: string): AIConfigMenu | undefined {
  return aiConfigMenus.find((menu) => menu.key === key);
}
