import type { AIMcpResult, AIMcpType } from '../../api';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

import { getDefaultMcpType, MCP_STDIO_TYPE } from './mcp-params';

export const MCP_TYPE_OPTIONS = [
  { label: 'stdio', value: 0 },
  { label: 'SSE', value: 1 },
  { label: 'Streamable HTTP', value: 2 },
];

export function getMcpTypeOptions(
  isSuperuser: boolean,
  currentType?: AIMcpType | number,
) {
  if (isSuperuser || currentType === MCP_STDIO_TYPE) {
    return MCP_TYPE_OPTIONS;
  }
  return MCP_TYPE_OPTIONS.filter((item) => item.value !== MCP_STDIO_TYPE);
}

export function getMcpTypeLabel(type: AIMcpType | number) {
  return (
    MCP_TYPE_OPTIONS.find((item) => item.value === type)?.label ??
    `Type ${type}`
  );
}

export const queryMcpSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: 'MCP 名称',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: MCP_TYPE_OPTIONS,
    },
    fieldName: 'type',
    label: 'MCP 类型',
  },
];

export function useMcpColumns(
  onActionClick?: OnActionClickFn<AIMcpResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    { field: 'name', title: '名称', width: 180, align: 'left' },
    {
      field: 'type',
      title: '类型',
      width: 140,
      formatter: ({ cellValue }) => getMcpTypeLabel(cellValue),
    },
    { field: 'description', title: '描述', align: 'left' },
    {
      field: 'created_time',
      title: $t('common.table.created_time'),
      width: 168,
    },
    {
      field: 'updated_time',
      title: $t('common.table.updated_time'),
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
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit', 'delete'],
      },
    },
  ];
}

export function createMcpSchema(
  isSuperuser: boolean,
  currentType?: AIMcpType | number,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        options: getMcpTypeOptions(isSuperuser, currentType),
      },
      defaultValue: getDefaultMcpType(isSuperuser),
      fieldName: 'type',
      label: '类型',
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '描述',
    },
    {
      component: 'Input',
      dependencies: {
        show: (values) => values.type === 0,
        required: (values) => values.type === 0,
        triggerFields: ['type'],
      },
      fieldName: 'command',
      label: '命令',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '空格分隔参数',
      },
      dependencies: {
        show: (values) => values.type === 0,
        triggerFields: ['type'],
      },
      fieldName: 'argsText',
      label: '参数',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '{"KEY":"VALUE"}',
      },
      dependencies: {
        show: (values) => values.type === 0,
        triggerFields: ['type'],
      },
      fieldName: 'envText',
      label: '环境变量',
    },
    {
      component: 'Input',
      dependencies: {
        show: (values) => values.type !== 0,
        required: (values) => values.type !== 0,
        triggerFields: ['type'],
      },
      fieldName: 'url',
      label: '端点链接',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '{"Authorization":"Bearer xxx"}',
      },
      dependencies: {
        show: (values) => values.type !== 0,
        triggerFields: ['type'],
      },
      fieldName: 'headersText',
      label: '请求头',
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        min: 0,
        step: 1,
      },
      defaultValue: 5,
      fieldName: 'timeout',
      label: '初始化超时（秒）',
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        min: 0,
        step: 1,
      },
      defaultValue: 300,
      fieldName: 'read_timeout',
      label: '读取超时（秒）',
    },
    {
      component: 'Input',
      fieldName: 'tool_prefix',
      label: '工具前缀',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: [
          { label: '是', value: true },
          { label: '否', value: false },
        ],
      },
      defaultValue: false,
      fieldName: 'include_instructions',
      label: '注入服务说明',
    },
  ];
}

export const mcpSchema = createMcpSchema(true);

export const importMcpSchema: VbenFormSchema[] = [
  {
    component: 'Textarea',
    componentProps: {
      autoSize: { minRows: 12, maxRows: 20 },
      class: 'font-mono',
      placeholder: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_TOKEN"
      }
    }
  }
}`,
    },
    fieldName: 'jsonText',
    help: '支持 Claude Desktop、Cursor 等标准 mcpServers JSON',
    label: 'MCP JSON',
    rules: 'required',
  },
];
