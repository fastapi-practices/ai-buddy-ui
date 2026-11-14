import type { ExtendedFormApi } from '@vben/common-ui';

import type { Ref } from 'vue';

import type { AIOnnxDownloadStatus, AIOnnxOption } from '../../api';

import { provide, ref } from 'vue';

import { message, Modal } from 'antdv-next';

import {
  downloadAIOcrOnnxModelApi,
  downloadAIOnnxModelApi,
  downloadAIPaddleocrModelApi,
  getAIOcrOnnxDownloadStatusApi,
  getAIOnnxDownloadStatusApi,
  getAIOnnxOptionsApi,
  getAIPaddleocrDownloadStatusApi,
} from '../../api';
import {
  AI_BUDDY_EMBEDDING_BACKEND,
  AI_BUDDY_OCR_BACKEND,
  AI_BUDDY_ONNX_EMBEDDING_MODEL,
  AI_BUDDY_PADDLEOCR_API_URL,
} from './config-keys';
import {
  DEFAULT_EMBEDDING_ONNX_MODELS,
  DEFAULT_OCR_ONNX_MODELS,
  DEFAULT_PADDLEOCR_MODELS,
} from './onnx-catalog';
import {
  OCR_ONNX_PICKER_KEY,
  ONNX_PICKER_KEY,
  PADDLEOCR_PICKER_KEY,
} from './onnx-picker-context';
import { formatOnnxSize } from './onnx-size';

const POLL_INTERVAL_SECONDS = 1000;
const POLL_MAX_ATTEMPTS = 1800;

type DownloadResult = {
  error?: string;
  state: 'done' | 'failed' | 'timeout';
};

async function pollDownload(
  statusApi: () => Promise<AIOnnxDownloadStatus>,
  modelId: string,
): Promise<DownloadResult> {
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i += 1) {
    const status = await statusApi();
    if (status.model_id !== modelId) {
      await new Promise((resolve) => {
        setTimeout(resolve, POLL_INTERVAL_SECONDS);
      });
      continue;
    }
    if (status.status === 'done') {
      return { state: 'done' };
    }
    if (status.status === 'failed') {
      return { state: 'failed', error: status.error ?? undefined };
    }
    await new Promise((resolve) => {
      setTimeout(resolve, POLL_INTERVAL_SECONDS);
    });
  }
  return { state: 'timeout' };
}

function markDownloaded(models: Ref<AIOnnxOption[]>, modelId: string) {
  models.value = models.value.map((item) =>
    item.id === modelId ? { ...item, downloaded: true } : item,
  );
}

/**
 * ONNX 模型选择器的数据、下载与校验逻辑。
 * 仅在 enabled 为 true 的菜单中拉取模型目录，避免无谓请求。
 */
export function useOnnxPickers(
  formApi: ExtendedFormApi,
  enabled: () => boolean,
) {
  const catalogVersion = ref(0);
  const onnxModels = ref<AIOnnxOption[]>([...DEFAULT_EMBEDDING_ONNX_MODELS]);
  const onnxCacheDir = ref('');
  const downloadingModel = ref('');
  const ocrOnnxModels = ref<AIOnnxOption[]>([...DEFAULT_OCR_ONNX_MODELS]);
  const ocrOnnxCacheDir = ref('');
  const ocrDownloadingModel = ref('');
  const paddleocrModels = ref<AIOnnxOption[]>([...DEFAULT_PADDLEOCR_MODELS]);
  const paddleocrCacheDir = ref('');
  const paddleocrDownloadingModel = ref('');

  async function loadCatalog() {
    if (!enabled()) {
      return;
    }
    const catalog = await getAIOnnxOptionsApi().catch((error) => {
      console.error(error);
      return null;
    });
    if (!catalog) {
      return;
    }
    onnxModels.value =
      catalog.embedding.length > 0
        ? catalog.embedding
        : [...DEFAULT_EMBEDDING_ONNX_MODELS];
    onnxCacheDir.value = catalog.cache_dir ?? '';
    ocrOnnxModels.value =
      catalog.ocr.length > 0 ? catalog.ocr : [...DEFAULT_OCR_ONNX_MODELS];
    ocrOnnxCacheDir.value = catalog.ocr_cache_dir ?? '';
    paddleocrModels.value =
      catalog.paddleocr.length > 0
        ? catalog.paddleocr
        : [...DEFAULT_PADDLEOCR_MODELS];
    paddleocrCacheDir.value = catalog.paddleocr_cache_dir ?? '';
    catalogVersion.value += 1;
    // 目录数据变化后强制表单重渲染，避免插槽保留旧的模型下载状态
    formApi.setState((prev: any) => {
      return {
        schema: prev.schema ? [...prev.schema] : prev.schema,
      };
    });
  }

  /**
   * 校验当前表单所选的 ONNX / PaddleOCR 模型是否已下载。
   * 返回错误提示，校验通过返回 undefined。
   */
  function validateSelection(values: Record<string, any>): string | undefined {
    if (!enabled()) {
      return undefined;
    }
    if (values[AI_BUDDY_EMBEDDING_BACKEND] === 'onnx') {
      const selected = onnxModels.value.find(
        (item) => item.id === values[AI_BUDDY_ONNX_EMBEDDING_MODEL],
      );
      if (!selected?.downloaded) {
        return '所选模型尚未下载，请先下载后再保存';
      }
    }
    if (values[AI_BUDDY_OCR_BACKEND] === 'onnx') {
      const selected = ocrOnnxModels.value.find(
        (item) => item.id === 'rapidocr',
      );
      if (!selected?.downloaded) {
        return 'RapidOCR 模型尚未下载，请先下载后再保存';
      }
    }
    if (
      values[AI_BUDDY_OCR_BACKEND] === 'paddleocr' &&
      !String(values[AI_BUDDY_PADDLEOCR_API_URL] || '').trim()
    ) {
      const selected = paddleocrModels.value.find(
        (item) => item.id === 'paddleocr',
      );
      if (!selected?.downloaded) {
        return 'PaddleOCR 模型尚未下载，请先下载后再保存';
      }
    }
    return undefined;
  }

  async function downloadOnnxModel(item: AIOnnxOption) {
    if (downloadingModel.value || item.downloaded) {
      return;
    }
    downloadingModel.value = item.id;
    try {
      await formApi.setValues({ [AI_BUDDY_ONNX_EMBEDDING_MODEL]: item.id });
      await downloadAIOnnxModelApi(item.id);
      const result = await pollDownload(getAIOnnxDownloadStatusApi, item.id);
      if (result.state === 'done') {
        markDownloaded(onnxModels, item.id);
        await loadCatalog();
        message.success('模型已下载');
      } else if (result.state === 'failed') {
        message.error(result.error || '模型下载失败');
      } else {
        message.warning('下载仍在后台进行，稍后刷新查看状态');
      }
    } catch (error) {
      console.error(error);
    } finally {
      downloadingModel.value = '';
    }
  }

  async function downloadOcrOnnxModel(item: AIOnnxOption) {
    Modal.confirm({
      title: '下载 ONNX OCR 模型',
      content: `${item.name} · ${formatOnnxSize(item.size_gb)}`,
      okText: '下载',
      cancelText: '取消',
      onOk: async () => {
        ocrDownloadingModel.value = item.id;
        await formApi.setValues({ ocr_onnx_model: item.id });
        try {
          await downloadAIOcrOnnxModelApi(item.id);
          const result = await pollDownload(
            getAIOcrOnnxDownloadStatusApi,
            item.id,
          );
          if (result.state === 'done') {
            markDownloaded(ocrOnnxModels, item.id);
            await loadCatalog();
            message.success('OCR 模型已下载');
          } else if (result.state === 'failed') {
            message.error(result.error || 'OCR 模型下载失败');
          } else {
            message.warning('下载仍在后台进行，稍后刷新查看状态');
          }
        } catch (error) {
          console.error(error);
        } finally {
          ocrDownloadingModel.value = '';
        }
      },
    });
  }

  function downloadPaddleocrModel(item: AIOnnxOption) {
    Modal.confirm({
      title: '下载 PaddleOCR 模型',
      content: `${item.name} · ${formatOnnxSize(item.size_gb)}`,
      okText: '下载',
      cancelText: '取消',
      onOk: async () => {
        paddleocrDownloadingModel.value = item.id;
        await formApi.setValues({ paddleocr_model: item.id });
        try {
          await downloadAIPaddleocrModelApi(item.id);
          const result = await pollDownload(
            getAIPaddleocrDownloadStatusApi,
            item.id,
          );
          if (result.state === 'done') {
            markDownloaded(paddleocrModels, item.id);
            await loadCatalog();
            message.success('PaddleOCR 模型已下载');
          } else if (result.state === 'failed') {
            message.error(result.error || 'PaddleOCR 模型下载失败');
          } else {
            message.warning('下载仍在后台进行，稍后刷新查看状态');
          }
        } catch (error) {
          console.error(error);
        } finally {
          paddleocrDownloadingModel.value = '';
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

  return {
    catalogVersion,
    downloadOnnxModel,
    downloadOcrOnnxModel,
    downloadPaddleocrModel,
    downloadingModel,
    loadCatalog,
    ocrDownloadingModel,
    ocrOnnxCacheDir,
    ocrOnnxModels,
    onnxCacheDir,
    onnxModels,
    paddleocrCacheDir,
    paddleocrDownloadingModel,
    paddleocrModels,
    validateSelection,
  };
}
