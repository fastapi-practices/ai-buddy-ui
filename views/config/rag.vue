<script setup lang="ts">
import type { AIConfigResult, AIOnnxOption } from '../../api';

import { provide, ref } from 'vue';

import { VbenButton } from '@vben/common-ui';
import { MaterialSymbolsEdit } from '@vben/icons';
import { $t } from '@vben/locales';

import { Modal, message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';

import {
  downloadAIOcrOnnxModelApi,
  downloadAIOnnxModelApi,
  downloadAIPaddleocrModelApi,
  getAIOcrOnnxDownloadStatusApi,
  getAIOnnxDownloadStatusApi,
  getAIOnnxOptionsApi,
  getAIPaddleocrDownloadStatusApi,
  getAllAIConfigApi,
  updateAIConfigApi,
} from '../../api';
import {
  AI_EMBEDDING_BACKEND,
  AI_OCR_BACKEND,
  AI_ONNX_EMBEDDING_MODEL,
  AI_PADDLEOCR_API_URL,
  AI_RAG_CHUNK_CHARS,
  AI_RAG_CHUNK_OVERLAP,
  AI_RAG_TOP_K,
  pickRagConfigs,
} from './config-keys';
import { ragSchema } from './data';
import {
  DEFAULT_EMBEDDING_ONNX_MODELS,
  DEFAULT_OCR_ONNX_MODELS,
  DEFAULT_PADDLEOCR_MODELS,
} from './onnx-catalog';
import OnnxModelPicker from './onnx-model-picker.vue';
import {
  OCR_ONNX_PICKER_KEY,
  ONNX_PICKER_KEY,
  PADDLEOCR_PICKER_KEY,
} from './onnx-picker-context';
import { formatOnnxSize } from './onnx-size';

const numericKeys = new Set([
  AI_RAG_CHUNK_CHARS,
  AI_RAG_CHUNK_OVERLAP,
  AI_RAG_TOP_K,
]);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  schema: ragSchema,
  wrapperClass: 'grid-cols-1',
  commonConfig: {
    controlClass: 'w-full max-w-80',
    disabled: true,
    labelClass: 'justify-start ml-2 self-start',
    labelWidth: 180,
    hideRequiredMark: true,
  },
});

const editButtonShow = ref<boolean>(true);
const loading = ref<boolean>(false);
const saveLoading = ref<boolean>(false);
const configData = ref<AIConfigResult[]>([]);
const onnxModels = ref<AIOnnxOption[]>([...DEFAULT_EMBEDDING_ONNX_MODELS]);
const onnxCacheDir = ref('');
const downloadingModel = ref('');
const ocrOnnxModels = ref<AIOnnxOption[]>([...DEFAULT_OCR_ONNX_MODELS]);
const ocrOnnxCacheDir = ref('');
const ocrDownloadingModel = ref('');
const paddleocrModels = ref<AIOnnxOption[]>([...DEFAULT_PADDLEOCR_MODELS]);
const paddleocrCacheDir = ref('');
const paddleocrDownloadingModel = ref('');

const fetchConfigList = async () => {
  loading.value = true;
  try {
    const [configs, catalog] = await Promise.all([
      getAllAIConfigApi(),
      getAIOnnxOptionsApi().catch(() => null),
    ]);
    onnxModels.value = catalog?.embedding?.length
      ? catalog.embedding
      : [...DEFAULT_EMBEDDING_ONNX_MODELS];
    onnxCacheDir.value = catalog?.cache_dir ?? '';
    ocrOnnxModels.value = catalog?.ocr?.length
      ? catalog.ocr
      : [...DEFAULT_OCR_ONNX_MODELS];
    ocrOnnxCacheDir.value = catalog?.ocr_cache_dir ?? '';
    paddleocrModels.value = catalog?.paddleocr?.length
      ? catalog.paddleocr
      : [...DEFAULT_PADDLEOCR_MODELS];
    paddleocrCacheDir.value = catalog?.paddleocr_cache_dir ?? '';
    configData.value = pickRagConfigs(configs);
    const values: Record<string, unknown> = {};
    configData.value.forEach((config) => {
      if (numericKeys.has(config.key)) {
        const numericValue = Number(config.value);
        values[config.key] = Number.isFinite(numericValue)
          ? numericValue
          : config.value;
        return;
      }
      if (config.key === AI_OCR_BACKEND && config.value === 'off') {
        values[config.key] = 'system';
        return;
      }
      values[config.key] = config.value;
    });
    await formApi.setValues(values);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const saveRagConfig = async () => {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }

  const data: Record<string, any> = await formApi.getValues();
  if (data[AI_EMBEDDING_BACKEND] === 'onnx') {
    const selected = onnxModels.value.find(
      (item) => item.id === data[AI_ONNX_EMBEDDING_MODEL],
    );
    if (!selected?.downloaded) {
      message.warning('所选模型尚未下载，请先下载后再保存');
      return;
    }
  }
  if (data[AI_OCR_BACKEND] === 'onnx') {
    const selected = ocrOnnxModels.value.find((item) => item.id === 'rapidocr');
    if (!selected?.downloaded) {
      message.warning('RapidOCR 模型尚未下载，请先下载后再保存');
      return;
    }
  }
  if (
    data[AI_OCR_BACKEND] === 'paddleocr' &&
    !String(data[AI_PADDLEOCR_API_URL] || '').trim()
  ) {
    const selected = paddleocrModels.value.find(
      (item) => item.id === 'paddleocr',
    );
    if (!selected?.downloaded) {
      message.warning('PaddleOCR 模型尚未下载，请先下载后再保存');
      return;
    }
  }
  configData.value.forEach((config) => {
    if (Object.prototype.hasOwnProperty.call(data, config.key)) {
      const value = data[config.key];
      config.value = value == null ? '' : String(value);
    }
  });

  saveLoading.value = true;
  try {
    await updateAIConfigApi(configData.value);
    message.success($t('ui.actionMessage.operationSuccess'));
    editButtonShow.value = true;
    formApi.setState({ commonConfig: { disabled: true } });
    await fetchConfigList();
  } catch (error) {
    console.error(error);
  } finally {
    saveLoading.value = false;
  }
};

async function pollOnnxDownload(modelId: string) {
  for (let i = 0; i < 600; i += 1) {
    const status = await getAIOnnxDownloadStatusApi();
    if (status.model_id !== modelId) {
      continue;
    }
    if (status.status === 'done') {
      downloadingModel.value = '';
      const catalog = await getAIOnnxOptionsApi();
      onnxModels.value = catalog.embedding;
      onnxCacheDir.value = catalog.cache_dir;
      message.success('模型已下载');
      return;
    }
    if (status.status === 'failed') {
      downloadingModel.value = '';
      message.error(status.error || '模型下载失败');
      return;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }
  downloadingModel.value = '';
  message.warning('下载仍在后台进行，稍后刷新查看状态');
}

async function pollOcrOnnxDownload(modelId: string) {
  for (let i = 0; i < 600; i += 1) {
    const status = await getAIOcrOnnxDownloadStatusApi();
    if (status.model_id !== modelId) {
      continue;
    }
    if (status.status === 'done') {
      ocrDownloadingModel.value = '';
      const catalog = await getAIOnnxOptionsApi();
      ocrOnnxModels.value = catalog.ocr;
      ocrOnnxCacheDir.value = catalog.ocr_cache_dir;
      message.success('OCR 模型已下载');
      return;
    }
    if (status.status === 'failed') {
      ocrDownloadingModel.value = '';
      message.error(status.error || 'OCR 模型下载失败');
      return;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }
  ocrDownloadingModel.value = '';
  message.warning('下载仍在后台进行，稍后刷新查看状态');
}

async function pollPaddleocrDownload(modelId: string) {
  for (let i = 0; i < 600; i += 1) {
    const status = await getAIPaddleocrDownloadStatusApi();
    if (status.model_id !== modelId) {
      continue;
    }
    if (status.status === 'done') {
      paddleocrDownloadingModel.value = '';
      const catalog = await getAIOnnxOptionsApi().catch(() => null);
      paddleocrModels.value = catalog?.paddleocr?.length
        ? catalog.paddleocr
        : paddleocrModels.value.map((item) =>
            item.id === modelId ? { ...item, downloaded: true } : item,
          );
      paddleocrCacheDir.value =
        catalog?.paddleocr_cache_dir ?? paddleocrCacheDir.value;
      message.success('PaddleOCR 模型已下载');
      return;
    }
    if (status.status === 'failed') {
      paddleocrDownloadingModel.value = '';
      message.error(status.error || 'PaddleOCR 模型下载失败');
      return;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }
  paddleocrDownloadingModel.value = '';
  message.warning('下载仍在后台进行，稍后刷新查看状态');
}

function downloadPaddleocrModel(item: AIOnnxOption) {
  Modal.confirm({
    title: '下载 PaddleOCR 模型',
    content: `${item.name} · ${formatOnnxSize(item.size_gb)}`,
    okText: '下载',
    cancelText: $t('common.cancel'),
    onOk: async () => {
      paddleocrDownloadingModel.value = item.id;
      await formApi.setValues({ paddleocr_model: item.id });
      try {
        await downloadAIPaddleocrModelApi(item.id);
        await pollPaddleocrDownload(item.id);
      } catch (error) {
        paddleocrDownloadingModel.value = '';
        console.error(error);
      }
    },
  });
}

function downloadOcrOnnxModel(item: AIOnnxOption) {
  Modal.confirm({
    title: '下载 ONNX OCR 模型',
    content: `${item.name} · ${formatOnnxSize(item.size_gb)}`,
    okText: '下载',
    cancelText: $t('common.cancel'),
    onOk: async () => {
      ocrDownloadingModel.value = item.id;
      await formApi.setValues({ ocr_onnx_model: item.id });
      try {
        await downloadAIOcrOnnxModelApi(item.id);
        await pollOcrOnnxDownload(item.id);
      } catch (error) {
        ocrDownloadingModel.value = '';
        console.error(error);
      }
    },
  });
}

function downloadOnnxModel(item: AIOnnxOption) {
  Modal.confirm({
    title: '下载 ONNX 向量模型',
    content: `${item.name} · ${formatOnnxSize(item.size_gb)}`,
    okText: '下载',
    cancelText: $t('common.cancel'),
    onOk: async () => {
      downloadingModel.value = item.id;
      await formApi.setValues({ [AI_ONNX_EMBEDDING_MODEL]: item.id });
      try {
        await downloadAIOnnxModelApi(item.id);
        await pollOnnxDownload(item.id);
      } catch (error) {
        downloadingModel.value = '';
        console.error(error);
      }
    },
  });
}

function bindPickerValue(slotProps: Record<string, any>, modelId: string) {
  slotProps['onUpdate:value']?.(modelId);
  slotProps.handleChange?.(modelId);
  slotProps.setValue?.(modelId);
}

provide(ONNX_PICKER_KEY, {
  cacheDir: onnxCacheDir,
  download: downloadOnnxModel,
  downloading: downloadingModel,
  models: onnxModels,
});
provide(OCR_ONNX_PICKER_KEY, {
  cacheDir: ocrOnnxCacheDir,
  download: downloadOcrOnnxModel,
  downloading: ocrDownloadingModel,
  models: ocrOnnxModels,
});
provide(PADDLEOCR_PICKER_KEY, {
  cacheDir: paddleocrCacheDir,
  download: downloadPaddleocrModel,
  downloading: paddleocrDownloadingModel,
  models: paddleocrModels,
});

defineExpose({
  fetchConfigList,
});
</script>

<template>
  <a-spin :spinning="loading">
    <div>
      <Form>
        <template #AI_ONNX_EMBEDDING_MODEL="slotProps">
          <div class="w-full">
            <OnnxModelPicker
              source="embedding"
              :value="slotProps.value"
              :disabled="slotProps.disabled"
              :models="onnxModels"
              :cache-dir="onnxCacheDir"
              :downloading="downloadingModel"
              :download="downloadOnnxModel"
              @update:value="(id) => bindPickerValue(slotProps, id)"
            />
          </div>
        </template>
        <template #ocr_onnx_model="slotProps">
          <div class="w-full">
            <OnnxModelPicker
              source="ocr"
              :value="slotProps.value"
              :disabled="slotProps.disabled"
              :models="ocrOnnxModels"
              :cache-dir="ocrOnnxCacheDir"
              :downloading="ocrDownloadingModel"
              :download="downloadOcrOnnxModel"
              @update:value="(id) => bindPickerValue(slotProps, id)"
            />
          </div>
        </template>
        <template #paddleocr_model="slotProps">
          <div class="w-full">
            <OnnxModelPicker
              source="paddleocr"
              :value="slotProps.value"
              :disabled="slotProps.disabled"
              :models="paddleocrModels"
              :cache-dir="paddleocrCacheDir"
              :downloading="paddleocrDownloadingModel"
              :download="downloadPaddleocrModel"
              @update:value="(id) => bindPickerValue(slotProps, id)"
            />
          </div>
        </template>
      </Form>
      <VbenButton
        v-show="editButtonShow"
        class="ml-1.5 mt-3"
        @click="
          () => {
            editButtonShow = false;
            formApi.setState({ commonConfig: { disabled: false } });
          }
        "
      >
        <MaterialSymbolsEdit class="mr-1" />
        {{ $t('common.edit') }}
      </VbenButton>
      <VbenButton
        v-show="!editButtonShow"
        class="ml-1.5 mt-3"
        :loading="saveLoading"
        @click="saveRagConfig"
      >
        <MaterialSymbolsEdit class="mr-1" />
        {{ $t('common.save') }}
      </VbenButton>
      <VbenButton
        v-show="!editButtonShow"
        class="ml-3 mt-3"
        :disabled="saveLoading"
        variant="outline"
        @click="
          () => {
            editButtonShow = true;
            formApi.setState({ commonConfig: { disabled: true } });
            fetchConfigList();
          }
        "
      >
        {{ $t('common.cancel') }}
      </VbenButton>
    </div>
  </a-spin>
</template>
