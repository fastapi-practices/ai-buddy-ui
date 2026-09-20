import type {
  AIModelCapability,
  AIModelKind,
  AIModelResult,
  AIProviderResult,
} from '../../api';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

import { DictEnum, getDictOptions } from '#/utils/dict';

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

export const MODEL_CAPABILITY_OPTIONS: {
  color: string;
  icon: string;
  label: string;
  value: AIModelCapability;
}[] = [
  {
    color: 'orange',
    icon: 'icon-[carbon--tools]',
    label: '工具',
    value: 'tools',
  },
  {
    color: 'geekblue',
    icon: 'icon-[carbon--idea]',
    label: '思考',
    value: 'thinking',
  },
  {
    color: 'default',
    icon: 'icon-[carbon--string-text]',
    label: '文本',
    value: 'text',
  },
  {
    color: 'green',
    icon: 'icon-[carbon--view]',
    label: '图片',
    value: 'image',
  },
  {
    color: 'purple',
    icon: 'icon-[carbon--video]',
    label: '视频',
    value: 'video',
  },
  {
    color: 'magenta',
    icon: 'icon-[carbon--volume-up]',
    label: '音频',
    value: 'audio',
  },
  {
    color: 'gold',
    icon: 'icon-[carbon--document]',
    label: '文档',
    value: 'document',
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
    'icon-[carbon--help]'
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
      width: 90,
      formatter: ({ cellValue }) => getModelKindLabel(cellValue),
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
      field: 'created_time',
      title: $t('common.table.created_time'),
      width: 168,
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

export function createProviderSchema(): VbenFormSchema[] {
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
      defaultValue: 0,
      fieldName: 'type',
      label: '供应商类型',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'api_host',
      label: 'API Host',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      fieldName: 'api_key',
      label: 'API Key',
      rules: 'required',
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

export function createModelSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'model_id',
      label: '模型 ID',
      rules: 'required',
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
        options: MODEL_KIND_OPTIONS,
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
      fieldName: 'capabilities',
      label: '能力',
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
