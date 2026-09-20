<script setup lang="ts">
import type { AISubagentParams, AISubagentResult } from '../../api';

import type { VbenFormProps } from '#/adapter/form';
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { Page, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  createAISubagentApi,
  deleteAISubagentApi,
  getAISubagentListApi,
  updateAISubagentApi,
} from '../../api';
import {
  querySubagentSchema,
  subagentSchema,
  useSubagentColumns,
} from './data';

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySubagentSchema,
};

const formData = ref<AISubagentResult>();

const gridOptions: VxeTableGridOptions<AISubagentResult> = {
  rowConfig: {
    keyField: 'id',
  },
  checkboxConfig: {
    highlight: true,
  },
  height: 'auto',
  exportConfig: {},
  printConfig: {},
  toolbarConfig: {
    custom: true,
    refresh: true,
    refreshOptions: {
      code: 'query',
    },
    zoom: true,
  },
  columns: useSubagentColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getAISubagentListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('ai-buddy.subagent')])
    : $t('ui.actionTitle.create', [$t('ai-buddy.subagent')]);
});

function onRefresh() {
  gridApi.query();
}

function onActionClick({ code, row }: OnActionClickParams<AISubagentResult>) {
  switch (code) {
    case 'delete': {
      deleteAISubagentApi(row.id).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.name]),
          key: 'action_process_msg',
        });
        onRefresh();
      });
      break;
    }
    case 'edit': {
      modalApi.setData(row).open();
      break;
    }
  }
}

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: subagentSchema,
});

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    modalApi.lock();
    try {
      const values = await formApi.getValues<AISubagentParams>();
      const data: AISubagentParams = {
        name: values.name.trim(),
        description: values.description.trim(),
        prompt: values.prompt.trim(),
        sort: values.sort ?? 0,
      };
      await (formData.value?.id
        ? updateAISubagentApi(formData.value.id, data)
        : createAISubagentApi(data));
      message.success($t('ui.actionMessage.operationSuccess'));
      await modalApi.close();
      onRefresh();
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }
    const data = modalApi.getData<AISubagentResult>();
    formApi.resetForm();
    if (data) {
      formData.value = data;
      formApi.setValues({
        name: data.name,
        description: data.description,
        prompt: data.prompt,
        sort: data.sort ?? 0,
      });
    } else {
      formData.value = undefined;
    }
  },
});
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="() => modalApi.setData(null).open()">
          <MaterialSymbolsAdd class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('ai-buddy.subagent')]) }}
        </VbenButton>
      </template>
    </Grid>
    <Modal content-class="px-4 py-4 md:px-5 md:py-5" :title="modalTitle">
      <Form />
    </Modal>
  </Page>
</template>
