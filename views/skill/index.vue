<script setup lang="ts">
import type { AISkillResult } from '../../api';

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
  createAISkillApi,
  deleteAISkillApi,
  getAISkillListApi,
} from '../../api';
import { takeInputFiles } from '../../api/upload-file';
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

const zipInputRef = ref<HTMLInputElement>();
const dirInputRef = ref<HTMLInputElement>();
const uploading = ref(false);

function onRefresh() {
  gridApi.query();
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
    await createAISkillApi(files);
    message.success($t('ui.actionMessage.operationSuccess'));
    onRefresh();
  } catch (error) {
    message.error((error as Error).message);
  } finally {
    uploading.value = false;
  }
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
        <VbenButton :loading="uploading" @click="() => triggerZipSelect()">
          <IconifyIcon class="size-5" icon="material-symbols:upload" />
          {{ $t('ai-buddy.skillManage.uploadZip') }}
        </VbenButton>
        <VbenButton
          class="ml-2"
          :loading="uploading"
          variant="outline"
          @click="() => triggerDirSelect()"
        >
          <IconifyIcon class="size-5" icon="material-symbols:folder-open" />
          {{ $t('ai-buddy.skillManage.uploadDir') }}
        </VbenButton>
      </template>
    </Grid>
  </Page>
</template>
