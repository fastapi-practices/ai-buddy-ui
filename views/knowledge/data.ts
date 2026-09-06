import type { AIKnowledgeResult } from '../../api';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

export const queryKnowledgeSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'title',
    label: $t('ai-buddy.knowledgeManage.title'),
  },
];

export function useKnowledgeColumns(
  onActionClick?: OnActionClickFn<AIKnowledgeResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    {
      field: 'title',
      title: $t('ai-buddy.knowledgeManage.title'),
      width: 220,
      align: 'left',
    },
    {
      field: 'source',
      title: $t('ai-buddy.knowledgeManage.source'),
      align: 'left',
    },
    {
      field: 'object_key',
      title: $t('ai-buddy.knowledgeManage.objectKey'),
      width: 260,
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
      width: 240,
      cellRender: {
        attrs: {
          nameField: 'title',
          nameTitle: $t('ai-buddy.knowledge'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['delete'],
      },
    },
  ];
}
