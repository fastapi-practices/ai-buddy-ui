import type { AIExpertResult } from '../../api';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

import { ownerColumn } from '../owner';

export interface ResourceOption {
  label: string;
  value: number;
}

export const queryExpertSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('ai-buddy.expertManage.name'),
  },
];

export function useExpertColumns(
  onActionClick?: OnActionClickFn<AIExpertResult>,
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
      title: $t('ai-buddy.expertManage.name'),
      minWidth: 180,
      align: 'left',
    },
    ownerColumn(),
    {
      field: 'description',
      title: $t('ai-buddy.expertManage.description'),
      minWidth: 240,
      align: 'left',
    },
    {
      field: 'sort',
      title: $t('ai-buddy.expertManage.sort'),
      width: 80,
    },
    {
      field: 'usage_count',
      title: $t('ai-buddy.expertManage.usageCount'),
      width: 100,
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
          nameTitle: $t('ai-buddy.expert'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit', 'delete'],
      },
    },
  ];
}

export function createExpertSchema(
  mcpOptions: ResourceOption[],
  skillOptions: ResourceOption[],
  knowledgeOptions: ResourceOption[],
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('ai-buddy.expertManage.name'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('ai-buddy.expertManage.description'),
    },
    {
      component: 'Textarea',
      componentProps: {
        autoSize: { minRows: 4, maxRows: 8 },
      },
      fieldName: 'prompt',
      label: $t('ai-buddy.expertManage.prompt'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        mode: 'multiple',
        options: mcpOptions,
      },
      fieldName: 'mcp_ids',
      label: $t('ai-buddy.expertManage.mcp'),
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        mode: 'multiple',
        options: skillOptions,
      },
      fieldName: 'skill_ids',
      label: $t('ai-buddy.expertManage.skill'),
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        mode: 'multiple',
        options: knowledgeOptions,
      },
      fieldName: 'knowledge_ids',
      label: $t('ai-buddy.expertManage.knowledge'),
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
      label: $t('ai-buddy.expertManage.sort'),
    },
  ];
}
