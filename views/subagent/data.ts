import type { AISubagentResult } from '../../api';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

import { ownerColumn } from '../owner';

export const querySubagentSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('ai-buddy.subagentManage.name'),
  },
];

export function useSubagentColumns(
  onActionClick?: OnActionClickFn<AISubagentResult>,
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
      title: $t('ai-buddy.subagentManage.name'),
      minWidth: 160,
      align: 'left',
    },
    ownerColumn(),
    {
      field: 'description',
      title: $t('ai-buddy.subagentManage.description'),
      minWidth: 220,
      align: 'left',
    },
    {
      field: 'sort',
      title: $t('ai-buddy.subagentManage.sort'),
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
          nameTitle: $t('ai-buddy.subagent'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit', 'delete'],
      },
    },
  ];
}

export const subagentSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('ai-buddy.subagentManage.name'),
    rules: 'required',
  },
  {
    component: 'Textarea',
    fieldName: 'description',
    label: $t('ai-buddy.subagentManage.description'),
    rules: 'required',
  },
  {
    component: 'Textarea',
    componentProps: {
      autoSize: { minRows: 4, maxRows: 8 },
    },
    fieldName: 'prompt',
    label: $t('ai-buddy.subagentManage.prompt'),
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
    label: $t('ai-buddy.subagentManage.sort'),
  },
];
