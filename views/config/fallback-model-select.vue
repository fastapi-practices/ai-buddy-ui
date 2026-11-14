<script setup lang="ts">
import type { AIProviderModelOptionResult } from '../../api';

import { computed, onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';

import { getAIModelOptionsApi } from '../../api';
import {
  fallbackModelValue,
  parseFallbackModels,
  serializeFallbackModels,
} from './fallback-models';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    modelValue?: string;
  }>(),
  {
    disabled: false,
    modelValue: '',
  },
);

const emit = defineEmits<{
  change: [string];
  'update:modelValue': [string];
}>();

const loading = ref(false);
const providers = ref<AIProviderModelOptionResult[]>([]);

const selected = computed(() => parseFallbackModels(props.modelValue));

const modelLabels = computed(() => {
  const labels = new Map<string, string>();
  for (const provider of providers.value) {
    for (const model of provider.models) {
      const name =
        model.name && model.name !== model.model_id
          ? `${model.name} · ${model.model_id}`
          : model.model_id;
      labels.set(
        fallbackModelValue(provider.id, model.model_id),
        `${provider.name} / ${name}`,
      );
    }
  }
  return labels;
});

const selectedItems = computed(() =>
  selected.value.map((value, index) => ({
    index,
    label: modelLabels.value.get(value) ?? `${value}（不可用）`,
    value,
  })),
);

const addableOptions = computed(() => {
  const picked = new Set(selected.value);
  const groups = providers.value
    .map((provider) => {
      const items = provider.models
        .filter((model) => model.status === 1 && model.kind === 'chat')
        .map((model) => {
          const value = fallbackModelValue(provider.id, model.model_id);
          return {
            label:
              model.name && model.name !== model.model_id
                ? `${model.name} · ${model.model_id}`
                : model.model_id,
            value,
          };
        })
        .filter((item) => !picked.has(item.value));
      return { label: provider.name, options: items };
    })
    .filter((group) => group.options.length > 0);
  return groups;
});

const hasAddable = computed(() =>
  addableOptions.value.some((group) => group.options.length > 0),
);

function update(values: string[]) {
  const next = serializeFallbackModels(values);
  emit('update:modelValue', next);
  emit('change', next);
}

function addModel(value: string) {
  if (!value || selected.value.includes(value)) {
    return;
  }
  update([...selected.value, value]);
}

function removeModel(index: number) {
  update(selected.value.filter((_, itemIndex) => itemIndex !== index));
}

function moveModel(index: number, offset: number) {
  const target = index + offset;
  const values = [...selected.value];
  if (target < 0 || target >= values.length) {
    return;
  }
  const current = values[index] as string;
  values[index] = values[target] as string;
  values[target] = current;
  update(values);
}

onMounted(async () => {
  loading.value = true;
  try {
    const result = await getAIModelOptionsApi();
    providers.value = result.providers.filter(
      (provider) => provider.status === 1,
    );
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="w-full space-y-2">
    <div
      v-if="selectedItems.length === 0"
      class="text-muted-foreground rounded-md border border-dashed px-3 py-2 text-xs"
    >
      未配置兜底模型
    </div>
    <div
      v-for="item in selectedItems"
      :key="item.value"
      class="flex items-center gap-2 rounded-md border border-border px-2 py-1.5"
    >
      <span class="text-muted-foreground w-4 shrink-0 text-xs">
        {{ item.index + 1 }}
      </span>
      <span class="min-w-0 flex-1 truncate text-sm" :title="item.label">
        {{ item.label }}
      </span>
      <button
        class="inline-flex rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="disabled || item.index === 0"
        type="button"
        @click="moveModel(item.index, -1)"
      >
        <IconifyIcon class="size-3.5" icon="carbon:arrow-up" />
      </button>
      <button
        class="inline-flex rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="disabled || item.index === selectedItems.length - 1"
        type="button"
        @click="moveModel(item.index, 1)"
      >
        <IconifyIcon class="size-3.5" icon="carbon:arrow-down" />
      </button>
      <button
        class="inline-flex rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="disabled"
        type="button"
        @click="removeModel(item.index)"
      >
        <IconifyIcon class="size-3.5" icon="carbon:close" />
      </button>
    </div>
    <a-select
      allow-clear
      class="w-full"
      :disabled="disabled || !hasAddable"
      :loading="loading"
      :options="addableOptions"
      option-filter-prop="label"
      :placeholder="hasAddable ? '添加兜底模型' : '可选模型已全部添加'"
      show-search
      :value="undefined"
      @change="addModel"
    />
  </div>
</template>
