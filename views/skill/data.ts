import type { AISkillResult } from '../../api';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

export const querySkillSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('ai-buddy.skillManage.name'),
  },
];

export function useSkillColumns(
  onActionClick?: OnActionClickFn<AISkillResult>,
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
      title: $t('ai-buddy.skillManage.name'),
      width: 220,
      align: 'left',
    },
    {
      field: 'description',
      title: $t('ai-buddy.skillManage.description'),
      align: 'left',
    },
    {
      field: 'object_key',
      title: $t('ai-buddy.skillManage.objectKey'),
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
          nameField: 'name',
          nameTitle: $t('ai-buddy.skill'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['delete'],
      },
    },
  ];
}
