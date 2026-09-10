<script setup lang="ts">
import type { AISkillResult } from '../../api';

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
  createAISkillApi,
  deleteAISkillApi,
  getAISkillListApi,
} from '../../api';
import { getSkillUploadIssue } from '../../api/upload-file';
import UploadDropzone from '../components/upload-dropzone.vue';
import { querySkillSchema, useSkillColumns } from './data';

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySkillSchema,
};

const gridOptions: VxeTableGridOptions<AISkillResult> = {
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
  columns: useSkillColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getAISkillListApi({
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
const skillRequirements = computed(() => [
  $t('ai-buddy.skillManage.requirementZip'),
  $t('ai-buddy.skillManage.requirementFrontmatter'),
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
    const issue = getSkillUploadIssue(uploadFiles.value);
    if (issue === 'empty') {
      message.warning($t('ai-buddy.upload.selectFiles'));
      return;
    }
    if (issue === 'missing-skill-md') {
      message.warning($t('ai-buddy.skillManage.needSkillMd'));
      return;
    }

    modalApi.lock();
    try {
      await createAISkillApi(uploadFiles.value);
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
  uploadFiles.value = files;
  modalApi.setState({ confirmDisabled: files.length === 0 });
}

function onActionClick({ code, row }: OnActionClickParams<AISkillResult>) {
  switch (code) {
    case 'delete': {
      deleteAISkillApi(row.id).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.name]),
          key: 'action_process_msg',
        });
        onRefresh();
      });
      break;
    }
  }
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="() => modalApi.open()">
          <IconifyIcon class="size-5" icon="material-symbols:upload" />
          {{ $t('ai-buddy.skillManage.import') }}
        </VbenButton>
      </template>
    </Grid>
    <Modal
      content-class="px-4 py-4 md:px-5 md:py-5"
      :title="$t('ai-buddy.skillManage.import')"
    >
      <UploadDropzone
        accept=".zip,application/zip"
        :files="uploadFiles"
        :requirements="skillRequirements"
        @select="onSelectUploadFiles"
      />
    </Modal>
  </Page>
</template>
