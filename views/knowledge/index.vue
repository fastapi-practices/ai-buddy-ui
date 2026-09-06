<script setup lang="ts">
import type { AIKnowledgeResult } from '../../api';

import type { VbenFormProps } from '#/adapter/form';
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  createAIKnowledgeApi,
  deleteAIKnowledgeApi,
  getAIKnowledgeListApi,
} from '../../api';
import { takeInputFiles } from '../../api/upload-file';
import { queryKnowledgeSchema, useKnowledgeColumns } from './data';

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: queryKnowledgeSchema,
};

const gridOptions: VxeTableGridOptions<AIKnowledgeResult> = {
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
  columns: useKnowledgeColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getAIKnowledgeListApi({
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

const fileInputRef = ref<HTMLInputElement>();
const zipInputRef = ref<HTMLInputElement>();
const dirInputRef = ref<HTMLInputElement>();
const uploading = ref(false);

function onRefresh() {
  gridApi.query();
}

function triggerFileSelect() {
  fileInputRef.value?.click();
}

function triggerZipSelect() {
  zipInputRef.value?.click();
}

function triggerDirSelect() {
  dirInputRef.value?.click();
}

async function handleFileChange(event: Event) {
  const files = takeInputFiles(event.target as HTMLInputElement);
  if (files.length === 0) {
    return;
  }

  uploading.value = true;
  try {
    await createAIKnowledgeApi(files);
    message.success($t('ui.actionMessage.operationSuccess'));
    onRefresh();
  } catch (error) {
    message.error((error as Error).message);
  } finally {
    uploading.value = false;
  }
}

function onActionClick({ code, row }: OnActionClickParams<AIKnowledgeResult>) {
  if (code === 'delete') {
    deleteAIKnowledgeApi(row.id).then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.title]),
        key: 'action_process_msg',
      });
      onRefresh();
    });
  }
}
</script>

<template>
  <Page auto-content-height>
    <input
      ref="fileInputRef"
      accept=".md,.markdown,.txt,.text"
      class="hidden"
      multiple
      type="file"
      @change="handleFileChange"
    />
    <input
      ref="zipInputRef"
      accept=".zip"
      class="hidden"
      type="file"
      @change="handleFileChange"
    />
    <input
      ref="dirInputRef"
      class="hidden"
      directory
      multiple
      type="file"
      webkitdirectory
      @change="handleFileChange"
    />
    <Grid>
      <template #toolbar-actions>
        <VbenButton :loading="uploading" @click="() => triggerFileSelect()">
          <IconifyIcon class="size-5" icon="material-symbols:upload" />
          {{ $t('ai-buddy.knowledgeManage.uploadFile') }}
        </VbenButton>
        <VbenButton
          class="ml-2"
          :loading="uploading"
          variant="outline"
          @click="() => triggerZipSelect()"
        >
          <IconifyIcon class="size-5" icon="material-symbols:folder-zip" />
          {{ $t('ai-buddy.knowledgeManage.uploadZip') }}
        </VbenButton>
        <VbenButton
          class="ml-2"
          :loading="uploading"
          variant="outline"
          @click="triggerDirSelect"
        >
          <IconifyIcon class="size-5" icon="material-symbols:folder-open" />
          {{ $t('ai-buddy.knowledgeManage.uploadDir') }}
        </VbenButton>
      </template>
    </Grid>
  </Page>
</template>
