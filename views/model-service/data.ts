import type {
  AIModelCapability,
  AIModelKind,
  AIModelModality,
  AIModelResult,
  AIProviderResult,
  AIProviderType,
} from '../../api';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

import { DictEnum, getDictOptions } from '#/utils/dict';

import { supportsModelKind, THINKING_LEVEL_OPTIONS } from './model-params';
import {
  AI_PROVIDER_TYPE,
  getProviderDefaultHost,
  isProviderDefaultHost,
} from './provider-params';

export const PROVIDER_TYPE_OPTIONS = [
  { label: 'OpenAI', value: 0 },
  { label: 'Anthropic', value: 1 },
  { label: 'Google', value: 2 },
  { label: 'xAI', value: 3 },
  { label: 'OpenRouter', value: 4 },
  { label: 'OpenAI Responses', value: 5 },
];

export const MODEL_KIND_OPTIONS: { label: string; value: AIModelKind }[] = [
  { label: '对话', value: 'chat' },
  { label: '向量', value: 'embedding' },
  { label: '绘画', value: 'image' },
];

export const MODEL_MODALITY_OPTIONS: {
  label: string;
  value: AIModelModality;
}[] = [
  { label: '文本', value: 'text' },
  { label: '图片', value: 'image' },
  { label: '音频', value: 'audio' },
  { label: '视频', value: 'video' },
  { label: '向量', value: 'vector' },
];

export function getModelModalityLabel(modality: AIModelModality) {
  return (
    MODEL_MODALITY_OPTIONS.find((item) => item.value === modality)?.label ??
    modality
  );
}

export const MODEL_CAPABILITY_OPTIONS: {
  color: string;
  icon: string;
  label: string;
  value: AIModelCapability;
}[] = [
  {
    color: 'orange',
    icon: 'carbon:tools',
    label: '工具',
    value: 'tools',
  },
  {
    color: 'geekblue',
    icon: 'carbon:idea',
    label: '思考',
    value: 'thinking',
  },
];

export function getModelKindLabel(kind?: AIModelKind | string) {
  return (
    MODEL_KIND_OPTIONS.find((item) => item.value === kind)?.label ?? kind ?? '-'
  );
}

export function getModelCapabilityLabel(
  capability?: AIModelCapability | string,
) {
  return (
    MODEL_CAPABILITY_OPTIONS.find((item) => item.value === capability)?.label ??
    capability ??
    '-'
  );
}

export function getModelCapabilityIcon(
  capability?: AIModelCapability | string,
) {
  return (
    MODEL_CAPABILITY_OPTIONS.find((item) => item.value === capability)?.icon ??
    'carbon:help'
  );
}

export function getModelCapabilityColor(
  capability?: AIModelCapability | string,
) {
  return (
    MODEL_CAPABILITY_OPTIONS.find((item) => item.value === capability)?.color ??
    'default'
  );
}

export function pickActiveProviderId(
  providers: AIProviderResult[],
  currentId?: number,
): number | undefined {
  if (providers.length === 0) {
    return undefined;
  }
  if (currentId && providers.some((item) => item.id === currentId)) {
    return currentId;
  }
  return providers[0]?.id;
}

export function getProviderTypeLabel(type: number) {
  return (
    PROVIDER_TYPE_OPTIONS.find((item) => item.value === type)?.label ??
    `Type ${type}`
  );
}

export function useModelColumns(
  onActionClick?: OnActionClickFn<AIModelResult>,
): VxeGridProps['columns'] {
  return [
    { field: 'checkbox', type: 'checkbox', align: 'left', width: 50 },
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    {
      field: 'name',
      title: '名称',
      minWidth: 140,
      align: 'left',
    },
    { field: 'model_id', title: '模型 ID', minWidth: 180, align: 'left' },
    {
      field: 'kind',
      title: '类型',
      width: 110,
      formatter: ({ cellValue }) => getModelKindLabel(cellValue),
    },
    {
      field: 'input_modalities',
      title: '输入模态',
      minWidth: 110,
      formatter: ({ cellValue }) =>
        cellValue?.length
          ? cellValue
              .map((modality: AIModelModality) =>
                getModelModalityLabel(modality),
              )
              .join('、')
          : '-',
    },
    {
      field: 'capabilities',
      title: '能力',
      minWidth: 200,
      align: 'left',
      slots: { default: 'capabilities' },
    },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'CellTag',
      },
      width: 100,
    },
    {
      field: 'sort',
      title: '排序',
      width: 80,
    },
    {
      field: 'remark',
      title: $t('common.table.mark'),
      align: 'left',
    },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 100,
      cellRender: {
        attrs: {
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit'],
      },
    },
  ];
}

export function createProviderSchema(options?: {
  isEdit?: boolean;
}): VbenFormSchema[] {
  const isEdit = Boolean(options?.isEdit);

  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: '供应商名称',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        options: PROVIDER_TYPE_OPTIONS,
      },
      defaultValue: AI_PROVIDER_TYPE.openai,
      fieldName: 'type',
      label: '供应商类型',
      rules: 'required',
    },
    {
      component: 'Input',
      defaultValue: getProviderDefaultHost(AI_PROVIDER_TYPE.openai),
      dependencies: {
        componentProps(values) {
          return {
            placeholder: getProviderDefaultHost(values.type),
          };
        },
        trigger(values, actions) {
          const current = String(values.api_host ?? '').trim();
          if (!current || isProviderDefaultHost(current)) {
            void actions.setFieldValue(
              'api_host',
              getProviderDefaultHost(values.type),
            );
          }
        },
        triggerFields: ['type'],
      },
      fieldName: 'api_host',
      help: '空则使用该类型默认地址',
      label: 'API Host',
    },
    {
      component: 'InputPassword',
      fieldName: 'api_key',
      label: 'API Key',
      ...(isEdit
        ? { help: '留空或保持脱敏值则不修改密钥' }
        : { rules: 'required' }),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: getDictOptions(DictEnum.SYS_STATUS),
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: '状态',
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
    },
  ];
}

export function createModelSchema(options?: {
  providerType?: AIProviderType;
}): VbenFormSchema[] {
  const isOpenRouter = options?.providerType === AI_PROVIDER_TYPE.openrouter;

  return [
    {
      component: 'Input',
      fieldName: 'model_id',
      label: '模型 ID',
      rules: 'required',
      ...(isOpenRouter
        ? { help: '必须包含供应商前缀，例如 openai/gpt-4o-mini' }
        : {}),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        options: MODEL_KIND_OPTIONS.filter(
          (option) =>
            options?.providerType === undefined ||
            supportsModelKind(options.providerType, option.value),
        ),
      },
      defaultValue: 'chat',
      fieldName: 'kind',
      label: '类型',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        mode: 'multiple',
        options: MODEL_CAPABILITY_OPTIONS,
      },
      defaultValue: [],
      dependencies: {
        show: (values) => values.kind === 'chat',
        triggerFields: ['kind'],
      },
      fieldName: 'capabilities',
      label: '行为能力',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        mode: 'multiple',
        options: MODEL_MODALITY_OPTIONS,
      },
      description: '未指定时按模型类型补全，显式清空表示不支持该模态',
      fieldName: 'input_modalities',
      label: '输入模态',
    },
    {
      component: 'Switch',
      defaultValue: false,
      dependencies: {
        show: (values) =>
          values.kind === 'chat' && values.capabilities?.includes('thinking'),
        triggerFields: ['kind', 'capabilities'],
      },
      fieldName: 'policy_enabled',
      label: '配置思考策略',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        mode: 'multiple',
        options: THINKING_LEVEL_OPTIONS,
      },
      defaultValue: [],
      dependencies: {
        show: (values) =>
          values.kind === 'chat' &&
          values.capabilities?.includes('thinking') &&
          values.policy_enabled,
        triggerFields: ['kind', 'capabilities', 'policy_enabled'],
      },
      fieldName: 'policy_levels',
      label: '支持的思考档位',
    },
    {
      component: 'Select',
      dependencies: {
        componentProps: (values) => ({
          allowClear: true,
          class: 'w-full',
          options: THINKING_LEVEL_OPTIONS.filter((option) =>
            values.policy_levels?.includes(option.value),
          ),
        }),
        show: (values) =>
          values.kind === 'chat' &&
          values.capabilities?.includes('thinking') &&
          values.policy_enabled,
        triggerFields: [
          'kind',
          'capabilities',
          'policy_enabled',
          'policy_levels',
        ],
      },
      fieldName: 'policy_default_level',
      label: '默认思考档位',
    },
    {
      component: 'Switch',
      defaultValue: false,
      dependencies: {
        show: (values) =>
          values.kind === 'chat' &&
          values.capabilities?.includes('thinking') &&
          values.policy_enabled,
        triggerFields: ['kind', 'capabilities', 'policy_enabled'],
      },
      fieldName: 'policy_can_disable',
      label: '允许关闭思考',
    },
    {
      component: 'Switch',
      defaultValue: false,
      dependencies: {
        show: (values) =>
          values.kind === 'chat' &&
          values.capabilities?.includes('thinking') &&
          values.policy_enabled,
        triggerFields: ['kind', 'capabilities', 'policy_enabled'],
      },
      fieldName: 'policy_verified',
      label: '已验证可用',
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        min: 1,
        precision: 0,
      },
      fieldName: 'context_window',
      label: '上下文窗口',
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        min: 1,
        precision: 0,
      },
      fieldName: 'max_output_tokens',
      label: '最大输出',
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        min: 0,
        precision: 0,
      },
      defaultValue: 0,
      fieldName: 'sort',
      label: '排序',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: getDictOptions(DictEnum.SYS_STATUS),
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: '状态',
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
    },
  ];
}

export const modelSchema = createModelSchema();

export const queryModelSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'model_id',
    label: '模型 ID',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      options: MODEL_KIND_OPTIONS,
    },
    fieldName: 'kind',
    label: '类型',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      options: MODEL_CAPABILITY_OPTIONS,
    },
    fieldName: 'capability',
    label: '能力',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: getDictOptions(DictEnum.SYS_STATUS),
    },
    fieldName: 'status',
    label: '状态',
  },
];
