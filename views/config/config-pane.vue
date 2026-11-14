<script setup lang="ts">
import type { AIConfigResult } from '../../api';
import type { AIConfigMenu } from './config-menu';

import { computed, onMounted, ref } from 'vue';

import { VbenButton } from '@vben/common-ui';
import { MaterialSymbolsEdit } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';

import { getAllAIConfigApi, updateAIConfigApi } from '../../api';
import { normalizeAIConfigValue, pickConfigsByKeys } from './config-keys';
import OnnxModelDrawer from './onnx-model-drawer.vue';
import OnnxModelPicker from './onnx-model-picker.vue';
import { useOnnxPickers } from './use-onnx-pickers';

const props = defineProps<{
  isMobile?: boolean;
  menu: AIConfigMenu;
}>();

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  schema: props.menu.schema,
  wrapperClass: 'grid-cols-1',
  commonConfig: {
    controlClass: 'w-full max-w-80',
    disabled: true,
    hideRequiredMark: true,
    labelClass: 'justify-start ml-2 self-start',
    labelWidth: 180,
  },
});

const {
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
} = useOnnxPickers(formApi, () => Boolean(props.menu.usesOnnx));

const editButtonShow = ref<boolean>(true);
const loading = ref<boolean>(false);
const saveLoading = ref<boolean>(false);
const configData = ref<AIConfigResult[]>([]);

const numericFields = computed(() => {
  return new Set(
    props.menu.schema
      .filter((item) => item.component === 'InputNumber')
      .map((item) => item.fieldName),
  );
});

function toFormValue(config: AIConfigResult) {
  const value = normalizeAIConfigValue(config.key, config.value);
  if (!numericFields.value.has(config.key)) {
    return value;
  }
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : value;
}

function applyConfigLabels() {
  const labels = new Map(
    configData.value.map((config) => [config.key, config.name]),
  );
  formApi.setState((prev: any) => {
    return {
      schema: prev.schema?.map((item: any) => {
        return labels.has(item.fieldName)
          ? { ...item, label: labels.get(item.fieldName) }
          : item;
      }),
    };
  });
}

const fetchConfigList = async () => {
  loading.value = true;
  try {
    const [configs] = await Promise.all([getAllAIConfigApi(), loadCatalog()]);
    configData.value = pickConfigsByKeys(configs, props.menu.keys);
    applyConfigLabels();
    const values: Record<string, unknown> = {};
    configData.value.forEach((config) => {
      values[config.key] = toFormValue(config);
    });
    // 其他菜单负责的配置只读入表单用于条件显示，不参与本菜单保存
    for (const key of props.menu.contextKeys ?? []) {
      const config = configs.find((item) => item.key === key);
      if (config) {
        values[key] = normalizeAIConfigValue(config.key, config.value);
      }
    }
    await formApi.setValues(values);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const saveConfig = async () => {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }

  const values = await formApi.getValues<Record<string, any>>();
  const selectionError = validateSelection(values);
  if (selectionError) {
    message.warning(selectionError);
    return;
  }

  configData.value.forEach((config) => {
    if (Object.prototype.hasOwnProperty.call(values, config.key)) {
      const value = values[config.key];
      config.value = value === null || value === undefined ? '' : String(value);
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

function startEdit() {
  editButtonShow.value = false;
  formApi.setState({ commonConfig: { disabled: false } });
}

function cancelEdit() {
  editButtonShow.value = true;
  formApi.setState({ commonConfig: { disabled: true } });
  fetchConfigList();
}

function bindPickerValue(slotProps: Record<string, any>, modelId: string) {
  slotProps['onUpdate:value']?.(modelId);
  slotProps.handleChange?.(modelId);
  slotProps.setValue?.(modelId);
}

onMounted(async () => {
  await fetchConfigList();
});

defineExpose({
  fetchConfigList,
});
</script>

<template>
  <a-spin :spinning="loading">
    <div>
      <Form :layout="isMobile ? 'vertical' : 'horizontal'">
        <template #AI_BUDDY_ONNX_EMBEDDING_MODEL="slotProps">
          <div class="w-full">
            <OnnxModelDrawer
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
              :key="`ocr-${catalogVersion}`"
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
              :key="`paddleocr-${catalogVersion}`"
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
        @click="startEdit"
      >
        <MaterialSymbolsEdit class="mr-1" />
        {{ $t('common.edit') }}
      </VbenButton>
      <VbenButton
        v-show="!editButtonShow"
        class="ml-1.5 mt-3"
        :loading="saveLoading"
        @click="saveConfig"
      >
        <MaterialSymbolsEdit class="mr-1" />
        {{ $t('common.save') }}
      </VbenButton>
      <VbenButton
        v-show="!editButtonShow"
        class="ml-3 mt-3"
        :disabled="saveLoading"
        variant="outline"
        @click="cancelEdit"
      >
        {{ $t('common.cancel') }}
      </VbenButton>
    </div>
  </a-spin>
</template>
