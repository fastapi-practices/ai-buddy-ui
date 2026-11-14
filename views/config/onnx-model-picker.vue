<script setup lang="ts">
import type { AIOnnxOption } from '../../api';
import type { OnnxPickerContext } from './onnx-picker-context';

import { computed, inject } from 'vue';

import { VbenButton } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  OCR_ONNX_PICKER_KEY,
  ONNX_PICKER_KEY,
  PADDLEOCR_PICKER_KEY,
} from './onnx-picker-context';
import { formatOnnxSize } from './onnx-size';

const props = withDefaults(
  defineProps<{
    cacheDir?: string;
    disabled?: boolean;
    download?: (item: AIOnnxOption) => void;
    /** 是否允许在当前位置下载模型，下载入口统一放在 AI 配置页面 */
    downloadable?: boolean;
    downloading?: string;
    models?: AIOnnxOption[];
    modelValue?: string;
    source?: 'embedding' | 'ocr' | 'paddleocr';
    value?: string;
  }>(),
  {
    cacheDir: '',
    disabled: false,
    download: undefined,
    downloadable: true,
    downloading: '',
    modelValue: '',
    models: () => [],
    source: 'embedding',
    value: '',
  },
);

const emit = defineEmits<{
  change: [string];
  'update:modelValue': [string];
  'update:value': [string];
}>();

function pickerKey() {
  if (props.source === 'ocr') {
    return OCR_ONNX_PICKER_KEY;
  }
  if (props.source === 'paddleocr') {
    return PADDLEOCR_PICKER_KEY;
  }
  return ONNX_PICKER_KEY;
}

const ctx = inject<null | OnnxPickerContext>(pickerKey(), null);
const models = computed(() =>
  props.models?.length ? props.models : (ctx?.models.value ?? []),
);
const cacheDir = computed(() => props.cacheDir || ctx?.cacheDir.value || '');
const downloading = computed(
  () => props.downloading || ctx?.downloading.value || '',
);

function downloadModel(item: AIOnnxOption) {
  (props.download ?? ctx?.download)?.(item);
}

const selectedId = computed(() => props.value || props.modelValue || '');

function selectModel(item: AIOnnxOption) {
  if (props.disabled || (!props.downloadable && !item.downloaded)) {
    return;
  }
  emit('update:value', item.id);
  emit('update:modelValue', item.id);
  emit('change', item.id);
}

function meta(item: AIOnnxOption) {
  const size = formatOnnxSize(item.size_gb);
  return `${size} · ${item.downloaded ? '已下载' : '未下载'}`;
}
</script>

<template>
  <div class="w-full space-y-2">
    <div
      v-if="models.length === 0"
      class="text-muted-foreground rounded-md border border-dashed px-3 py-2 text-xs"
    >
      未获取到 ONNX 模型列表
    </div>
    <div
      v-for="item in models"
      :key="item.id"
      class="flex items-center justify-between rounded-md border px-3 py-2"
      :class="[
        selectedId === item.id ? 'border-primary' : 'border-border',
        disabled || (!downloadable && !item.downloaded)
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer',
      ]"
      @click="selectModel(item)"
    >
      <div class="min-w-0">
        <div class="truncate text-sm">{{ item.name }}</div>
        <div class="text-muted-foreground truncate text-xs">
          {{ meta(item) }}
        </div>
      </div>
      <VbenButton
        v-if="downloadable && !item.downloaded"
        size="sm"
        :disabled="disabled || Boolean(downloading)"
        :loading="downloading === item.id"
        @click.stop="downloadModel(item)"
      >
        下载
      </VbenButton>
    </div>
    <div v-if="!downloadable" class="text-muted-foreground text-xs">
      {{ $t('ai-buddy.onnxDownloadHint') }}
    </div>
    <div v-if="downloadable && cacheDir" class="text-muted-foreground text-xs">
      保存目录 {{ cacheDir }}
    </div>
  </div>
</template>
