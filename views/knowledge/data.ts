import type { AIKnowledgeBaseResult } from '../../api';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

import { ownerColumn } from '../owner';

export const queryKnowledgeSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('ai-buddy.knowledgeManage.name'),
  },
];

export function useKnowledgeColumns(
  onActionClick?: OnActionClickFn<AIKnowledgeBaseResult>,
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
      title: $t('ai-buddy.knowledgeManage.name'),
      width: 220,
      align: 'left',
    },
    ownerColumn(),
    {
      field: 'description',
      title: $t('ai-buddy.knowledgeManage.description'),
      align: 'left',
    },
    {
      field: 'model_id',
      title: $t('ai-buddy.knowledgeManage.embeddingModel'),
      width: 180,
      align: 'left',
      formatter: ({ cellValue }) => cellValue || '-',
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
      width: 240,
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('ai-buddy.knowledge'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'documents',
            text: $t('ai-buddy.knowledgeManage.documents'),
          },
          'edit',
          'delete',
        ],
      },
    },
  ];
}

export function createKnowledgeBaseSchema(
  providerOptions: { label: string; value: number }[],
  modelOptions: { label: string; value: string }[],
  onProviderChange?: (providerId?: number) => void,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('ai-buddy.knowledgeManage.name'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('ai-buddy.knowledgeManage.description'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        options: providerOptions,
        onChange: (value: number | undefined) => onProviderChange?.(value),
      },
      fieldName: 'provider_id',
      help: $t('ai-buddy.knowledgeManage.embeddingHelp'),
      label: $t('ai-buddy.knowledgeManage.embeddingProvider'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        options: modelOptions,
      },
      fieldName: 'model_id',
      help: $t('ai-buddy.knowledgeManage.embeddingHelp'),
      label: $t('ai-buddy.knowledgeManage.embeddingModel'),
    },
  ];
}
