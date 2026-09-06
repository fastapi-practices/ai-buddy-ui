import type { AIAssistantResult } from '../../api';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

const assistantCategoryOptions = [
  { label: '效率办公', value: 'efficiency' },
  { label: '写作创作', value: 'writing' },
  { label: '翻译语言', value: 'translation' },
  { label: '职场求职', value: 'career' },
  { label: '编程开发', value: 'development' },
  { label: '学习教育', value: 'education' },
  { label: '生活兴趣', value: 'lifestyle' },
  { label: '产品运营', value: 'product' },
  { label: '法律合规', value: 'legal' },
  { label: '金融财务', value: 'finance' },
];

export const queryAssistantSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('ai_buddy.assistantManage.name'),
  },
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: assistantCategoryOptions,
    },
    fieldName: 'category',
    label: $t('ai_buddy.assistantManage.category'),
  },
];

export function useAssistantColumns(
  onActionClick?: OnActionClickFn<AIAssistantResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    {
      field: 'name',
      title: $t('ai_buddy.assistantManage.name'),
      minWidth: 180,
      align: 'left',
    },
    {
      field: 'category',
      title: $t('ai_buddy.assistantManage.category'),
      width: 140,
      align: 'left',
      formatter: ({ cellValue }) =>
        assistantCategoryOptions.find((item) => item.value === cellValue)
          ?.label ?? cellValue,
    },
    {
      field: 'description',
      title: $t('ai_buddy.assistantManage.description'),
      width: 380,
      align: 'left',
    },
    {
      field: 'sort',
      title: $t('ai_buddy.assistantManage.sort'),
      width: 80,
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
      width: 140,
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('ai_buddy.assistant'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit', 'delete'],
      },
    },
  ];
}

export const assistantSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('ai_buddy.assistantManage.name'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      class: 'w-full',
      options: assistantCategoryOptions,
    },
    fieldName: 'category',
    label: $t('ai_buddy.assistantManage.category'),
  },
  {
    component: 'Textarea',
    fieldName: 'description',
    label: $t('ai_buddy.assistantManage.description'),
  },
  {
    component: 'Textarea',
    fieldName: 'prompt',
    label: $t('ai_buddy.assistantManage.prompt'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 0,
      precision: 0,
      step: 1,
    },
    defaultValue: 0,
    fieldName: 'sort',
    label: $t('ai_buddy.assistantManage.sort'),
  },
];
