<script setup lang="ts">
import type { AIAssistantResult } from '../../api';
import type { AIAssistantFormValues } from './assistant-params';
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
  createAIAssistantApi,
  deleteAIAssistantApi,
  getAIAssistantListApi,
  updateAIAssistantApi,
} from '../../api';
import {
  AI_ASSISTANT_STARTER_MAX,
  AI_ASSISTANT_STARTER_TEXT_MAX,
  createAIAssistantPayload,
  toAIAssistantFormValues,
} from './assistant-params';
import {
  assistantSchema,
  queryAssistantSchema,
  useAssistantColumns,
} from './data';

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: queryAssistantSchema,
};

const gridOptions: VxeTableGridOptions<AIAssistantResult> = {
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
  columns: useAssistantColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getAIAssistantListApi({
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

function onActionClick({ code, row }: OnActionClickParams<AIAssistantResult>) {
  switch (code) {
    case 'delete': {
      deleteAIAssistantApi(row.id).then(() => {
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
  schema: assistantSchema,
});

const formData = ref<AIAssistantResult>();
const starters = ref<string[]>([]);

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('ai-buddy.assistant')])
    : $t('ui.actionTitle.create', [$t('ai-buddy.assistant')]);
});

const canAddStarter = computed(
  () => starters.value.length < AI_ASSISTANT_STARTER_MAX,
);

function addStarter() {
  if (!canAddStarter.value) {
    return;
  }
  starters.value.push('');
}

function removeStarter(index: number) {
  starters.value.splice(index, 1);
}

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    modalApi.lock();

    try {
      const values = await formApi.getValues<AIAssistantFormValues>();
      const data = createAIAssistantPayload({
        ...values,
        starters: starters.value,
      });
      await (formData.value?.id
        ? updateAIAssistantApi(formData.value.id, data)
        : createAIAssistantApi(data));
      message.success($t('ui.actionMessage.operationSuccess'));
      await modalApi.close();
      onRefresh();
    } finally {
      modalApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<AIAssistantResult>();
      const values = toAIAssistantFormValues(data);
      formApi.resetForm();
      starters.value = values.starters ?? [];
      if (data) {
        formData.value = data;
        formApi.setValues(values);
      } else {
        formData.value = undefined;
        formApi.setValues(values);
      }
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
          {{ $t('ui.actionTitle.create', [$t('ai-buddy.assistant')]) }}
        </VbenButton>
      </template>
    </Grid>
    <Modal content-class="px-4 py-4 md:px-5 md:py-5" :title="modalTitle">
      <Form />
      <div class="mt-4">
        <div class="mb-2 text-sm">
          {{ $t('ai-buddy.assistantManage.starters') }}
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="(_, index) in starters"
            :key="index"
            class="flex items-center gap-2"
          >
            <a-input
              v-model:value="starters[index]"
              :maxlength="AI_ASSISTANT_STARTER_TEXT_MAX"
              :placeholder="$t('ai-buddy.assistantManage.starterPlaceholder')"
            />
            <VbenButton variant="outline" @click="removeStarter(index)">
              {{ $t('common.delete') }}
            </VbenButton>
          </div>
          <VbenButton
            v-if="canAddStarter"
            variant="outline"
            @click="addStarter"
          >
            <MaterialSymbolsAdd class="size-4" />
            {{ $t('ai-buddy.assistantManage.addStarter') }}
          </VbenButton>
        </div>
      </div>
    </Modal>
  </Page>
</template>
