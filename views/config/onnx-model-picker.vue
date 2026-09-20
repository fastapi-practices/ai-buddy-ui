<script setup lang="ts">
import type { AIOnnxOption } from '../../api';

import { computed, inject } from 'vue';

import { VbenButton } from '@vben/common-ui';

import {
  OCR_ONNX_PICKER_KEY,
  ONNX_PICKER_KEY,
  PADDLEOCR_PICKER_KEY,
  type OnnxPickerContext,
} from './onnx-picker-context';
import { formatOnnxSize } from './onnx-size';

const props = withDefaults(
  defineProps<{
    cacheDir?: string;
    disabled?: boolean;
    download?: (item: AIOnnxOption) => void;
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

const ctx = inject<OnnxPickerContext | null>(
  props.source === 'ocr'
    ? OCR_ONNX_PICKER_KEY
    : props.source === 'paddleocr'
      ? PADDLEOCR_PICKER_KEY
      : ONNX_PICKER_KEY,
  null,
);
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

const selectedId = computed(
  () => props.value || props.modelValue || '',
);

function selectModel(modelId: string) {
  if (props.disabled) {
    return;
  }
  emit('update:value', modelId);
  emit('update:modelValue', modelId);
  emit('change', modelId);
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
      class="flex cursor-pointer items-center justify-between rounded-md border px-3 py-2"
      :class="selectedId === item.id ? 'border-primary' : 'border-border'"
      @click="selectModel(item.id)"
    >
      <div class="min-w-0">
        <div class="truncate text-sm">{{ item.name }}</div>
        <div class="text-muted-foreground truncate text-xs">
          {{ meta(item) }}
        </div>
      </div>
      <VbenButton
        v-if="!item.downloaded"
        size="sm"
        :disabled="disabled || Boolean(downloading)"
        :loading="downloading === item.id"
        @click.stop="downloadModel(item)"
      >
        下载
      </VbenButton>
    </div>
    <div v-if="cacheDir" class="text-muted-foreground text-xs">
      保存目录 {{ cacheDir }}
    </div>
  </div>
</template>
