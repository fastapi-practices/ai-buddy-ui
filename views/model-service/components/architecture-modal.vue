<script setup lang="ts">
import type {
  AIModelArchitectureSuggestion,
  AIModelResult,
  AIThinkingLevel,
  AIThinkingPolicy,
} from '../../../api';
import type { ArchitectureField } from '../architecture';

import { computed, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { message } from 'antdv-next';

import {
  getAIModelArchitectureApi,
  getAIModelDetailApi,
  updateAIModelApi,
} from '../../../api';
import { architecturePayload } from '../architecture';
import { getModelKindLabel, getModelModalityLabel } from '../data';
import {
  THINKING_LEVEL_OPTIONS,
  validateModelModalities,
} from '../model-params';

const emit = defineEmits<{ saved: [] }>();
const current = ref<AIModelResult>();
const suggestion = ref<AIModelArchitectureSuggestion>();
const selected = ref<ArchitectureField[]>([]);
const applyPolicy = ref(false);
const policyEnabled = ref(false);
const policyLevels = ref<AIThinkingLevel[]>([]);
const policyDefault = ref<AIThinkingLevel>();
const policyCanDisable = ref(false);
const sourceLabel = computed(() => suggestion.value?.source ?? '-');

function formatPolicy(policy: AIThinkingPolicy): string {
  const levels = policy.levels
    .map(
      (level) =>
        THINKING_LEVEL_OPTIONS.find((option) => option.value === level)
          ?.label ?? level,
    )
    .join('、');
  const parts = [levels || '无可调档位'];
  if (policy.default_level) {
    parts.push(
      `默认 ${THINKING_LEVEL_OPTIONS.find((option) => option.value === policy.default_level)?.label ?? policy.default_level}`,
    );
  }
  if (policy.can_disable) parts.push('可关闭');
  return parts.join(' · ');
}

watch(selected, (values) => {
  if (values.includes('thinking_policy')) applyPolicy.value = false;
});

function onManualPolicyChange() {
  if (applyPolicy.value) {
    selected.value = selected.value.filter(
      (field) => field !== 'thinking_policy',
    );
  }
}

const fields = computed(() => {
  const model = current.value;
  const candidate = suggestion.value;
  if (!model || !candidate) return [];
  const entries: {
    key: ArchitectureField;
    label: string;
    previous: string;
    proposed: string;
  }[] = [];
  if (candidate.kind && candidate.kind !== model.kind) {
    entries.push({
      key: 'kind',
      label: '模型类型',
      previous: getModelKindLabel(model.kind),
      proposed: getModelKindLabel(candidate.kind),
    });
  }
  if (
    candidate.input_modalities &&
    JSON.stringify(candidate.input_modalities) !==
      JSON.stringify(model.input_modalities)
  ) {
    entries.push({
      key: 'input_modalities',
      label: '输入模态',
      previous:
        model.input_modalities?.map(getModelModalityLabel).join('、') || '-',
      proposed: candidate.input_modalities
        .map(getModelModalityLabel)
        .join('、'),
    });
  }
  for (const key of ['tools', 'thinking'] as const) {
    if (
      candidate[key] !== null &&
      candidate[key] !== model.capabilities.includes(key)
    ) {
      entries.push({
        key,
        label: key === 'tools' ? '工具调用' : '思考能力',
        previous: model.capabilities.includes(key) ? '支持' : '不支持',
        proposed: candidate[key] ? '支持' : '不支持',
      });
    }
  }
  if (
    candidate.thinking_policy &&
    JSON.stringify(candidate.thinking_policy) !==
      JSON.stringify(model.thinking_policy)
  ) {
    entries.push({
      key: 'thinking_policy',
      label: '思考策略',
      previous: model.thinking_policy
        ? formatPolicy(model.thinking_policy)
        : '未配置',
      proposed: formatPolicy(candidate.thinking_policy),
    });
  }
  for (const key of ['context_window', 'max_output_tokens'] as const) {
    if (candidate[key] !== null && candidate[key] !== model[key]) {
      entries.push({
        key,
        label: key === 'context_window' ? '上下文窗口' : '最大输出',
        previous: model[key]?.toLocaleString() || '-',
        proposed: candidate[key].toLocaleString(),
      });
    }
  }
  return entries;
});

const pending = computed(() =>
  current.value && suggestion.value
    ? architecturePayload(current.value, suggestion.value, selected.value)
    : null,
);
const thinkingAvailable = computed(
  () =>
    pending.value?.kind === 'chat' &&
    pending.value.capabilities?.includes('thinking'),
);
const availableLevels = computed(() =>
  THINKING_LEVEL_OPTIONS.filter((option) =>
    policyLevels.value.includes(option.value),
  ),
);

const [Modal, modalApi] = useVbenModal({
  class: 'w-[min(760px,calc(100vw-24px))]',
  destroyOnClose: true,
  async onConfirm() {
    if (!current.value || !suggestion.value) return;
    if (selected.value.length === 0 && !applyPolicy.value) {
      message.warning('请选择要更新的字段');
      return;
    }
    if (
      (selected.value.includes('thinking_policy') ||
        (applyPolicy.value && policyEnabled.value)) &&
      !thinkingAvailable.value
    ) {
      message.warning('请先启用对话模型的思考能力');
      return;
    }
    if (
      applyPolicy.value &&
      policyEnabled.value &&
      policyDefault.value &&
      !policyLevels.value.includes(policyDefault.value)
    ) {
      message.warning('默认思考档位必须包含在支持的档位中');
      return;
    }
    let policy: AIThinkingPolicy | null | undefined;
    if (applyPolicy.value) {
      policy = policyEnabled.value
        ? {
            levels: policyLevels.value,
            default_level: policyDefault.value || null,
            can_disable: policyCanDisable.value,
          }
        : null;
    }
    const payload = architecturePayload(
      current.value,
      suggestion.value,
      selected.value,
      policy,
    );
    const modalityError = validateModelModalities(payload);
    if (modalityError) {
      message.warning(modalityError);
      return;
    }
    modalApi.lock();
    try {
      await updateAIModelApi(current.value.id, payload);
      message.success('模型架构已更新');
      await modalApi.close();
      emit('saved');
    } finally {
      modalApi.unlock();
    }
  },
});

async function open(row: AIModelResult) {
  try {
    const [model, candidate] = await Promise.all([
      getAIModelDetailApi(row.id),
      getAIModelArchitectureApi(row.id),
    ]);
    current.value = model;
    suggestion.value = candidate;
    selected.value = [];
    applyPolicy.value = false;
    policyEnabled.value = model.thinking_policy !== null;
    policyLevels.value = [...(model.thinking_policy?.levels ?? [])];
    policyDefault.value = model.thinking_policy?.default_level ?? undefined;
    policyCanDisable.value = model.thinking_policy?.can_disable ?? false;
    modalApi.open();
  } catch (error) {
    message.error((error as Error).message || '获取模型架构建议失败');
  }
}

defineExpose({ open });
</script>

<template>
  <Modal :title="`同步架构 · ${current?.name || current?.model_id || ''}`">
    <div v-if="current && suggestion" class="space-y-5">
      <div class="border-b border-border pb-3 text-xs text-muted-foreground">
        {{ sourceLabel }}
        <span v-if="suggestion.last_updated">
          · 更新于 {{ suggestion.last_updated }}</span
        >
        <span> · 能力以当前供应商实际调用为准</span>
      </div>
      <a-checkbox-group v-model:value="selected" class="block overflow-x-auto">
        <table class="w-full min-w-[560px] text-left text-sm">
          <thead class="border-b border-border text-xs text-muted-foreground">
            <tr>
              <th class="w-9 py-2"></th>
              <th class="py-2">字段</th>
              <th class="py-2">当前</th>
              <th class="py-2">建议</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="field in fields"
              :key="field.key"
              class="border-b border-border/70"
            >
              <td class="py-2"><a-checkbox :value="field.key" /></td>
              <td class="py-2 font-medium">{{ field.label }}</td>
              <td class="py-2 text-muted-foreground">{{ field.previous }}</td>
              <td class="py-2">{{ field.proposed }}</td>
            </tr>
          </tbody>
        </table>
        <a-empty
          v-if="fields.length === 0"
          description="没有可同步的架构差异"
        />
      </a-checkbox-group>
      <div
        v-if="thinkingAvailable"
        class="space-y-3 border-t border-border pt-4"
      >
        <a-checkbox v-model:checked="applyPolicy" @change="onManualPolicyChange"
          >手动更新思考策略</a-checkbox
        >
        <div v-if="applyPolicy" class="space-y-3 pl-6">
          <a-checkbox v-model:checked="policyEnabled">配置可选强度</a-checkbox>
          <template v-if="policyEnabled">
            <div class="text-sm font-medium">支持的思考档位</div>
            <a-checkbox-group
              v-model:value="policyLevels"
              :options="THINKING_LEVEL_OPTIONS"
            />
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-sm">默认档位</span>
              <a-select
                v-model:value="policyDefault"
                allow-clear
                class="w-36"
                placeholder="供应商默认"
                :options="availableLevels"
              />
              <a-checkbox v-model:checked="policyCanDisable"
                >允许关闭思考</a-checkbox
              >
            </div>
            <div class="text-xs text-muted-foreground">
              档位与关闭能力需按该供应商实际接口确认
            </div>
          </template>
        </div>
      </div>
    </div>
  </Modal>
</template>
