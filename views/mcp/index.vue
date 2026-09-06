<script setup lang="ts">
import type { AIMcpResult } from '../../api';
import type { AIMcpFormValues } from './mcp-params';

import type { VbenFormProps } from '#/adapter/form';
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { Page, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  createAIMcpApi,
  deleteAIMcpApi,
  getAIMcpListApi,
  updateAIMcpApi,
} from '../../api';
import {
  createMcpSchema,
  importMcpSchema,
  queryMcpSchema,
  useMcpColumns,
} from './data';
import { parseStandardMcpJson } from './mcp-import';
import {
  createAIMcpPayload,
  getDefaultMcpType,
  toAIMcpFormValues,
} from './mcp-params';

const userStore = useUserStore();
const isSuperuser = computed(() =>
  Boolean(
    (userStore.userInfo as { is_superuser?: boolean } | null)?.is_superuser,
  ),
);

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: queryMcpSchema,
};

const gridOptions: VxeTableGridOptions<AIMcpResult> = {
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
  columns: useMcpColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getAIMcpListApi({
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

function onRefresh() {
  gridApi.query();
}

function onActionClick({ code, row }: OnActionClickParams<AIMcpResult>) {
  switch (code) {
    case 'delete': {
      deleteAIMcpApi(row.id).then(() => {
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
  schema: createMcpSchema(isSuperuser.value),
});

const formData = ref<AIMcpResult>();

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['MCP'])
    : $t('ui.actionTitle.create', ['MCP']);
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
      const values = await formApi.getValues<AIMcpFormValues>();
      const data = createAIMcpPayload(values, {
        isSuperuser: isSuperuser.value,
      });
      await (formData.value?.id
        ? updateAIMcpApi(formData.value.id, data)
        : createAIMcpApi(data));
      message.success($t('ui.actionMessage.operationSuccess'));
      await modalApi.close();
      onRefresh();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      modalApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<AIMcpResult>();
      formApi.resetForm();
      formApi.setState({
        schema: createMcpSchema(isSuperuser.value, data?.type),
      });
      if (data) {
        formData.value = data;
        formApi.setValues(toAIMcpFormValues(data));
      } else {
        formData.value = undefined;
        formApi.setValues(
          toAIMcpFormValues(undefined, {
            defaultType: getDefaultMcpType(isSuperuser.value),
          }),
        );
      }
    }
  },
});

const [ImportForm, importFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: importMcpSchema,
});

const [ImportModal, importModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await importFormApi.validate();
    if (!valid) {
      return;
    }

    importModalApi.lock();

    try {
      const { jsonText } = await importFormApi.getValues<{
        jsonText: string;
      }>();
      const payloads = parseStandardMcpJson(jsonText, {
        allowStdio: isSuperuser.value,
      });
      for (const payload of payloads) {
        await createAIMcpApi(payload);
      }
      message.success($t('ui.actionMessage.operationSuccess'));
      await importModalApi.close();
      onRefresh();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      importModalApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      importFormApi.resetForm();
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
          新增 MCP
        </VbenButton>
        <VbenButton
          class="ml-2"
          variant="outline"
          @click="() => importModalApi.setData(null).open()"
        >
          <MaterialSymbolsAdd class="size-5" />
          标准导入
        </VbenButton>
      </template>
    </Grid>
    <Modal content-class="px-4 py-4 md:px-5 md:py-5" :title="modalTitle">
      <Form />
    </Modal>
    <ImportModal content-class="px-4 py-4 md:px-5 md:py-5" title="导入 MCP">
      <ImportForm />
    </ImportModal>
  </Page>
</template>
