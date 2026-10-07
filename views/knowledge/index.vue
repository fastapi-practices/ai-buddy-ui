<script setup lang="ts">
import type {
  AIKnowledgeBaseResult,
  AIKnowledgeDocumentResult,
  AIModelResult,
  AIOnnxDownloadStatus,
  AIOnnxOption,
  AIProviderResult,
} from '../../api';
import type { AIKnowledgeBaseFormValues } from './knowledge-params';

import type { VbenFormProps } from '#/adapter/form';
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { computed, onBeforeUnmount, provide, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';
import { IconifyIcon, MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { Modal as AntModal, message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  createAIKnowledgeBaseApi,
  createAIKnowledgeDocumentApi,
  deleteAIKnowledgeBaseApi,
  deleteAIKnowledgeDocumentApi,
  downloadAIOnnxModelApi,
  getAIKnowledgeBaseListApi,
  getAIOnnxDownloadStatusApi,
  getAIOnnxOptionsApi,
  getAllAIKnowledgeDocumentApi,
  getAllAIModelApi,
  getAllAIProviderApi,
  updateAIKnowledgeBaseApi,
} from '../../api';
import {
  getKnowledgeUploadIssue,
  takeKnowledgeUploadFiles,
} from '../../api/upload-file';
import UploadDropzone from '../components/upload-dropzone.vue';
import { DEFAULT_EMBEDDING_ONNX_MODELS } from '../config/onnx-catalog';
import OnnxModelPicker from '../config/onnx-model-picker.vue';
import { ONNX_PICKER_KEY } from '../config/onnx-picker-context';
import { formatOnnxSize } from '../config/onnx-size';
import { getProviderTypeLabel } from '../model-service/data';
import {
  createKnowledgeBaseSchema,
  queryKnowledgeSchema,
  useKnowledgeColumns,
} from './data';
import {
  createAIKnowledgeBasePayload,
  getKnowledgeEmbeddingIssue,
  resetKnowledgeEmbeddingBinding,
  toAIKnowledgeBaseFormValues,
} from './knowledge-params';

interface SelectOption<T extends number | string = number> {
  label: string;
  value: T;
}

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: queryKnowledgeSchema,
};

const gridOptions: VxeTableGridOptions<AIKnowledgeBaseResult> = {
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
        return await getAIKnowledgeBaseListApi({
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

const formData = ref<AIKnowledgeBaseResult>();
const providerOptions = ref<SelectOption[]>([]);
const modelOptions = ref<SelectOption<string>[]>([]);
const onnxModels = ref<AIOnnxOption[]>([...DEFAULT_EMBEDDING_ONNX_MODELS]);
const onnxCacheDir = ref('');
const downloadingModel = ref('');
let embeddingModelRequest = 0;
let onnxDownloadSession = 0;
let onnxDownloadTimer: ReturnType<typeof setTimeout> | undefined;
const currentBase = ref<AIKnowledgeBaseResult>();
const documents = ref<AIKnowledgeDocumentResult[]>([]);
const documentsLoading = ref(false);
const uploadFiles = ref<File[]>([]);
const knowledgeRequirements = computed(() => [
  $t('ai-buddy.knowledgeManage.requirementFiles'),
  $t('ai-buddy.knowledgeManage.requirementEncoding'),
]);

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('ai-buddy.knowledge')])
    : $t('ui.actionTitle.create', [$t('ai-buddy.knowledge')]);
});

function onRefresh() {
  gridApi.query();
}

function providerLabel(item: AIProviderResult) {
  return `${item.name} · ${getProviderTypeLabel(item.type)}`;
}

function modelLabel(item: AIModelResult) {
  return item.name && item.name !== item.model_id
    ? `${item.name} · ${item.model_id}`
    : item.model_id;
}

async function loadEmbeddingModels(providerId?: number) {
  const request = ++embeddingModelRequest;
  modelOptions.value = [];
  if (providerId == null) {
    return;
  }
  const models = await getAllAIModelApi({
    kind: 'embedding',
    provider_id: providerId,
  });
  if (request !== embeddingModelRequest) {
    return;
  }
  modelOptions.value = models
    .filter(
      (item) =>
        Number(item.status) === 1 &&
        item.kind === 'embedding' &&
        item.provider_id === providerId,
    )
    .map((item) => ({
      label: modelLabel(item),
      value: item.model_id,
    }));
}

async function loadProviderOptions() {
  const providers = await getAllAIProviderApi();
  providerOptions.value = providers
    .filter((item) => Number(item.status) === 1)
    .map((item) => ({
      label: providerLabel(item),
      value: item.id,
    }));
}

async function loadOnnxOptions() {
  try {
    const catalog = await getAIOnnxOptionsApi();
    onnxModels.value = catalog.embedding;
    onnxCacheDir.value = catalog.cache_dir;
  } catch (error) {
    onnxModels.value = [...DEFAULT_EMBEDDING_ONNX_MODELS];
    onnxCacheDir.value = '';
    console.error(error);
  }
}

function stopOnnxDownloadPolling() {
  onnxDownloadSession += 1;
  clearTimeout(onnxDownloadTimer);
  onnxDownloadTimer = undefined;
  downloadingModel.value = '';
}

async function handleOnnxDownloadStatus(
  status: AIOnnxDownloadStatus,
  session: number,
  notify: boolean,
) {
  if (session !== onnxDownloadSession) {
    return;
  }
  downloadingModel.value =
    status.status === 'downloading' ? status.model_id : '';
  if (status.status === 'downloading') {
    onnxDownloadTimer = setTimeout(() => {
      void pollOnnxDownload(session, true);
    }, 1000);
  } else if (status.status === 'done' && notify) {
    await loadOnnxOptions();
    if (session === onnxDownloadSession) {
      message.success($t('ai-buddy.knowledgeManage.onnxDownloadComplete'));
    }
  } else if (status.status === 'failed' && notify) {
    message.error(
      status.error || $t('ai-buddy.knowledgeManage.onnxDownloadFailed'),
    );
  }
}

async function pollOnnxDownload(session: number, notify: boolean) {
  try {
    const status = await getAIOnnxDownloadStatusApi();
    await handleOnnxDownloadStatus(status, session, notify);
  } catch (error) {
    if (session === onnxDownloadSession) {
      downloadingModel.value = '';
      console.error(error);
    }
  }
}

function downloadOnnxModel(item: AIOnnxOption) {
  if (item.downloaded || downloadingModel.value) {
    return;
  }
  const session = onnxDownloadSession;
  AntModal.confirm({
    title: $t('ai-buddy.knowledgeManage.onnxDownloadTitle'),
    content: `${item.name} · ${formatOnnxSize(item.size_gb)}`,
    okText: $t('ai-buddy.knowledgeManage.onnxDownload'),
    cancelText: $t('common.cancel'),
    onOk: async () => {
      const values = await formApi.getValues<AIKnowledgeBaseFormValues>();
      if (
        session !== onnxDownloadSession ||
        values.embedding_mode !== 'local' ||
        downloadingModel.value
      ) {
        return;
      }
      stopOnnxDownloadPolling();
      const downloadSession = onnxDownloadSession;
      downloadingModel.value = item.id;
      await formApi.setFieldValue('local_model_id', item.id);
      try {
        const status = await downloadAIOnnxModelApi(item.id);
        await handleOnnxDownloadStatus(status, downloadSession, true);
      } catch (error) {
        if (downloadSession === onnxDownloadSession) {
          downloadingModel.value = '';
          console.error(error);
        }
      }
    },
  });
}

provide(ONNX_PICKER_KEY, {
  cacheDir: onnxCacheDir,
  download: downloadOnnxModel,
  downloading: downloadingModel,
  models: onnxModels,
});

onBeforeUnmount(stopOnnxDownloadPolling);

function applyKnowledgeSchema() {
  formApi.setState({
    schema: createKnowledgeBaseSchema(
      providerOptions.value,
      modelOptions.value,
      async (nextProviderId) => {
        await formApi.setValues(
          resetKnowledgeEmbeddingBinding('remote', nextProviderId),
        );
        const request = loadEmbeddingModels(nextProviderId);
        applyKnowledgeSchema();
        try {
          await request;
        } catch (error) {
          console.error(error);
        } finally {
          applyKnowledgeSchema();
        }
      },
      async (mode) => {
        await formApi.setValues(resetKnowledgeEmbeddingBinding(mode));
        await loadEmbeddingModels();
        applyKnowledgeSchema();
      },
    ),
  });
}

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: createKnowledgeBaseSchema([], []),
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
      const values = await formApi.getValues<AIKnowledgeBaseFormValues>();
      if (values.embedding_mode === 'local') {
        await loadOnnxOptions();
      }
      const issue = getKnowledgeEmbeddingIssue(values, {
        localModels: onnxModels.value,
        modelIds: modelOptions.value.map((item) => item.value),
        providerIds: providerOptions.value.map((item) => item.value),
      });
      if (issue) {
        message.warning($t(`ai-buddy.knowledgeManage.${issue}`));
        return;
      }
      const data = createAIKnowledgeBasePayload(values);
      await (formData.value?.id
        ? updateAIKnowledgeBaseApi(formData.value.id, data)
        : createAIKnowledgeBaseApi(data));
      message.success($t('ui.actionMessage.operationSuccess'));
      await modalApi.close();
      onRefresh();
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    stopOnnxDownloadPolling();
    if (!isOpen) {
      embeddingModelRequest += 1;
      return;
    }
    const data = modalApi.getData<AIKnowledgeBaseResult>();
    formData.value = data ?? undefined;
    providerOptions.value = [];
    modalApi.lock();
    try {
      await formApi.resetForm();
      await formApi.setValues(toAIKnowledgeBaseFormValues(data ?? undefined));
      const results = await Promise.allSettled([
        loadProviderOptions(),
        loadEmbeddingModels(data?.provider_id ?? undefined),
        loadOnnxOptions(),
        pollOnnxDownload(onnxDownloadSession, false),
      ]);
      for (const result of results) {
        if (result.status === 'rejected') {
          console.error(result.reason);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      applyKnowledgeSchema();
      modalApi.unlock();
    }
  },
});

async function loadDocuments() {
  if (!currentBase.value) {
    documents.value = [];
    return;
  }
  documentsLoading.value = true;
  try {
    documents.value = await getAllAIKnowledgeDocumentApi(currentBase.value.id);
  } finally {
    documentsLoading.value = false;
  }
}

const [UploadModal, uploadModalApi] = useVbenModal({
  class: 'w-[520px]',
  confirmDisabled: true,
  confirmText: $t('ai-buddy.upload.import'),
  destroyOnClose: true,
  async onConfirm() {
    if (!currentBase.value) {
      return;
    }
    const issue = getKnowledgeUploadIssue(uploadFiles.value);
    if (issue === 'empty') {
      message.warning($t('ai-buddy.upload.selectFiles'));
      return;
    }
    if (issue === 'unsupported') {
      message.warning($t('ai-buddy.knowledgeManage.unsupported'));
      return;
    }

    uploadModalApi.lock();
    try {
      await createAIKnowledgeDocumentApi(
        currentBase.value.id,
        uploadFiles.value,
      );
      message.success($t('ui.actionMessage.operationSuccess'));
      await uploadModalApi.close();
      await loadDocuments();
    } finally {
      uploadModalApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      uploadFiles.value = [];
      uploadModalApi.setState({ confirmDisabled: true });
    }
  },
});

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'ai-buddy-knowledge-drawer',
  showCancelButton: false,
  confirmText: $t('common.close'),
  contentClass: 'h-full overflow-hidden p-0',
  destroyOnClose: true,
  footerClass: 'px-5 py-3',
  title: $t('ai-buddy.knowledgeManage.documents'),
  async onConfirm() {
    await drawerApi.close();
  },
  onClosed() {
    currentBase.value = undefined;
    documents.value = [];
  },
});

function onSelectUploadFiles(files: File[]) {
  const nextFiles = takeKnowledgeUploadFiles(files);
  uploadFiles.value = nextFiles;
  uploadModalApi.setState({ confirmDisabled: nextFiles.length === 0 });
}

async function openDocuments(row: AIKnowledgeBaseResult) {
  currentBase.value = row;
  drawerApi
    .setState({
      title: $t('ai-buddy.knowledgeManage.documentsTitle', [row.name]),
    })
    .open();
  await loadDocuments();
}

function onActionClick({
  code,
  row,
}: OnActionClickParams<AIKnowledgeBaseResult>) {
  switch (code) {
    case 'delete': {
      deleteAIKnowledgeBaseApi(row.id).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.name]),
          key: 'action_process_msg',
        });
        onRefresh();
      });
      break;
    }
    case 'documents': {
      void openDocuments(row);
      break;
    }
    case 'edit': {
      modalApi.setData(row).open();
      break;
    }
  }
}

function onDeleteDocument(row: AIKnowledgeDocumentResult) {
  if (!currentBase.value) {
    return;
  }
  deleteAIKnowledgeDocumentApi(currentBase.value.id, row.id).then(() => {
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.title]),
      key: 'action_process_msg',
    });
    loadDocuments();
  });
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="() => modalApi.setData(null).open()">
          <MaterialSymbolsAdd class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('ai-buddy.knowledge')]) }}
        </VbenButton>
      </template>
    </Grid>
    <Modal content-class="px-4 py-4 md:px-5 md:py-5" :title="modalTitle">
      <Form>
        <template #local_model_id="slotProps">
          <OnnxModelPicker
            source="embedding"
            :value="slotProps.value"
            :disabled="slotProps.disabled"
            @update:value="(id) => formApi.setFieldValue('local_model_id', id)"
          />
        </template>
      </Form>
    </Modal>
    <Drawer>
      <div class="box-border flex h-full min-h-0 flex-col gap-4 p-5">
        <div class="flex justify-end">
          <VbenButton @click="() => uploadModalApi.open()">
            <IconifyIcon class="size-5" icon="material-symbols:upload" />
            {{ $t('ai-buddy.knowledgeManage.import') }}
          </VbenButton>
        </div>
        <section
          class="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-muted/20"
        >
          <div
            v-if="documentsLoading"
            class="flex h-full min-h-[360px] items-center justify-center"
          >
            <a-spin />
          </div>
          <div
            v-else-if="documents.length === 0"
            class="flex h-full min-h-[360px] items-center justify-center"
          >
            <a-empty
              :description="$t('ai-buddy.knowledgeManage.emptyDocuments')"
            />
          </div>
          <div v-else class="h-full w-full overflow-y-auto">
            <div class="w-full space-y-2 p-3">
              <div
                v-for="doc in documents"
                :key="doc.id"
                class="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card/70 px-3 py-2"
              >
                <div class="min-w-0">
                  <div class="truncate text-sm text-foreground">
                    {{ doc.title }}
                  </div>
                  <div class="mt-1 truncate text-xs text-muted-foreground">
                    {{ doc.file_type }}
                    <template v-if="doc.source"> · {{ doc.source }}</template>
                  </div>
                </div>
                <VbenButton
                  size="sm"
                  variant="outline"
                  @click="onDeleteDocument(doc)"
                >
                  {{ $t('common.delete') }}
                </VbenButton>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Drawer>
    <UploadModal
      content-class="px-4 py-4 md:px-5 md:py-5"
      :title="$t('ai-buddy.knowledgeManage.import')"
    >
      <UploadDropzone
        accept=".md,.markdown,.txt,.text,.pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tif,.tiff,.zip,application/zip"
        :files="uploadFiles"
        :requirements="knowledgeRequirements"
        @select="onSelectUploadFiles"
      />
    </UploadModal>
  </Page>
</template>

<style lang="scss">
.ai-buddy-knowledge-drawer {
  width: min(960px, calc(100vw - 48px)) !important;
  max-width: none !important;
}
</style>
