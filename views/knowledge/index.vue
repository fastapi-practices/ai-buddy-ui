<script setup lang="ts">
import type { AIKnowledgeResult } from '../../api';

import type { VbenFormProps } from '#/adapter/form';
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { Page, useVbenModal, VbenButton } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  createAIKnowledgeApi,
  deleteAIKnowledgeApi,
  getAIKnowledgeListApi,
} from '../../api';
import {
  getKnowledgeUploadIssue,
  takeKnowledgeUploadFiles,
} from '../../api/upload-file';
import UploadDropzone from '../components/upload-dropzone.vue';
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

const uploadFiles = ref<File[]>([]);
const knowledgeRequirements = computed(() => [
  $t('ai-buddy.knowledgeManage.requirementFiles'),
  $t('ai-buddy.knowledgeManage.requirementEncoding'),
]);

function onRefresh() {
  gridApi.query();
}

const [Modal, modalApi] = useVbenModal({
  class: 'w-[520px]',
  confirmDisabled: true,
  confirmText: $t('ai-buddy.upload.import'),
  destroyOnClose: true,
  async onConfirm() {
    const issue = getKnowledgeUploadIssue(uploadFiles.value);
    if (issue === 'empty') {
      message.warning($t('ai-buddy.upload.selectFiles'));
      return;
    }
    if (issue === 'unsupported') {
      message.warning($t('ai-buddy.knowledgeManage.unsupported'));
      return;
    }

    modalApi.lock();
    try {
      await createAIKnowledgeApi(uploadFiles.value);
      message.success($t('ui.actionMessage.operationSuccess'));
      await modalApi.close();
      onRefresh();
    } finally {
      modalApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      uploadFiles.value = [];
      modalApi.setState({ confirmDisabled: true });
    }
  },
});

function onSelectUploadFiles(files: File[]) {
  const nextFiles = takeKnowledgeUploadFiles(files);
  uploadFiles.value = nextFiles;
  modalApi.setState({ confirmDisabled: nextFiles.length === 0 });
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
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="() => modalApi.open()">
          <IconifyIcon class="size-5" icon="material-symbols:upload" />
          {{ $t('ai-buddy.knowledgeManage.import') }}
        </VbenButton>
      </template>
    </Grid>
    <Modal
      content-class="px-4 py-4 md:px-5 md:py-5"
      :title="$t('ai-buddy.knowledgeManage.import')"
    >
      <UploadDropzone
        accept=".md,.markdown,.txt,.text,.zip,application/zip"
        :files="uploadFiles"
        :requirements="knowledgeRequirements"
        @select="onSelectUploadFiles"
      />
    </Modal>
  </Page>
</template>
