<script setup lang="ts">
import type { AIOnnxOption } from '../../api';

import { computed } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import OnnxModelPicker from './onnx-model-picker.vue';
import { formatOnnxSize } from './onnx-size';

const props = withDefaults(
  defineProps<{
    cacheDir: string;
    disabled?: boolean;
    download: (item: AIOnnxOption) => void;
    downloading: string;
    models: AIOnnxOption[];
    value?: string;
  }>(),
  {
    disabled: false,
    value: '',
  },
);

const emit = defineEmits<{
  'update:value': [string];
}>();

const selectedModel = computed(() =>
  props.models.find((item) => item.id === props.value),
);

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-full sm:max-w-xl',
  footer: false,
});
</script>

<template>
  <div class="flex w-full flex-wrap items-center gap-2">
    <div class="min-w-0 flex-1">
      <div class="truncate text-sm" :title="selectedModel?.name || value">
        {{ selectedModel?.name || value || '未选择模型' }}
      </div>
      <div v-if="selectedModel" class="text-muted-foreground text-xs">
        {{ formatOnnxSize(selectedModel.size_gb) }} ·
        {{ selectedModel.downloaded ? '已下载' : '未下载' }}
      </div>
    </div>
    <VbenButton
      size="sm"
      variant="outline"
      :disabled="disabled"
      @click="drawerApi.open()"
    >
      选择和下载
    </VbenButton>
    <Drawer title="向量模型选择和下载">
      <OnnxModelPicker
        source="embedding"
        :value="value"
        :disabled="disabled"
        :models="models"
        :cache-dir="cacheDir"
        :downloading="downloading"
        :download="download"
        @update:value="(id) => emit('update:value', id)"
      />
    </Drawer>
  </div>
</template>
