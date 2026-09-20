<script setup lang="ts">
import type {
  AIDefaultModelParams,
  AIDefaultModelResult,
  AIModelKind,
  AIModelResult,
  AIProviderResult,
} from '../../api';

import { computed, h, onActivated, onMounted, reactive, ref, watch } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';
import { CircleHelp } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import {
  getAIDefaultModelOptionalApi,
  getAllAIModelApi,
  getAllAIProviderApi,
  updateAIDefaultModelApi,
} from '../../api';
import { getProviderTypeLabel } from '../model-service/data';

interface DefaultModelKindForm {
  fetchId: number;
  modelId?: string;
  models: AIModelResult[];
  modelsLoading: boolean;
  providerId?: number;
}

const KIND_LIST: AIModelKind[] = ['chat', 'embedding', 'image'];

function createKindForm(): DefaultModelKindForm {
  return {
    fetchId: 0,
    models: [],
    modelsLoading: false,
  };
}

const providers = ref<AIProviderResult[]>([]);
const loading = ref(false);
const saving = ref(false);
const activeKind = ref<AIModelKind>('chat');
const kindForms = {
  chat: reactive(createKindForm()),
  embedding: reactive(createKindForm()),
  image: reactive(createKindForm()),
};

let hasInitialized = false;

const enabledProviders = computed(() => {
  return providers.value.filter((item) => Number(item.status) === 1);
});

const providerOptions = computed(() => {
  return enabledProviders.value.map((item) => ({
    label: `${item.name} · ${getProviderTypeLabel(item.type)}`,
    value: item.id,
  }));
});

const activeForm = computed(() => kindForms[activeKind.value]);

const activeModelOptions = computed(() => {
  return enabledModels(activeForm.value).map((item) => ({
    label:
      item.name && item.name !== item.model_id
        ? `${item.name} · ${item.model_id}`
        : item.model_id,
    value: item.model_id,
  }));
});

const tabItems = computed(() =>
  KIND_LIST.map((kind) => ({
    icon: () =>
      h('span', {
        class: `${kindTabIconClass(kind)} -mb-1 size-5`,
      }),
    key: kind,
    label: $t(`ai-buddy.defaultModelManage.${kind}Tab`),
  })),
);

function kindTabIconClass(kind: AIModelKind) {
  if (kind === 'embedding') {
    return 'icon-[carbon--data-base]';
  }
  if (kind === 'image') {
    return 'icon-[carbon--image]';
  }
  return 'icon-[carbon--chat]';
}

function enabledModels(form: DefaultModelKindForm) {
  return form.models.filter((item) => Number(item.status) === 1);
}

function applyDefaultModel(
  form: DefaultModelKindForm,
  model: AIDefaultModelResult | null,
) {
  form.providerId = model?.provider_id;
  form.modelId = model?.model_id;
}

async function fetchProviders() {
  providers.value = await getAllAIProviderApi();
}

async function fetchDefaultModel(kind: AIModelKind) {
  const form = kindForms[kind];
  let model: AIDefaultModelResult | null;
  try {
    model = await getAIDefaultModelOptionalApi(kind);
  } catch (error) {
    message.error((error as Error).message);
    throw error;
  }

  applyDefaultModel(form, model);
}

async function fetchModelsByProvider(kind: AIModelKind) {
  const form = kindForms[kind];
  const fetchId = ++form.fetchId;
  const providerId = form.providerId;

  if (!providerId) {
    form.models = [];
    form.modelId = undefined;
    return;
  }

  form.modelsLoading = true;
  try {
    const data = await getAllAIModelApi({ kind, provider_id: providerId });

    if (fetchId !== form.fetchId) {
      return;
    }

    form.models = data;

    if (
      form.modelId &&
      !enabledModels(form).some((item) => item.model_id === form.modelId)
    ) {
      form.modelId = undefined;
    }
  } finally {
    if (fetchId === form.fetchId) {
      form.modelsLoading = false;
    }
  }
}

async function refreshPage() {
  loading.value = true;
  try {
    await fetchProviders();
    await Promise.all(
      KIND_LIST.map(async (kind) => {
        await fetchDefaultModel(kind);
        await fetchModelsByProvider(kind);
      }),
    );
  } finally {
    loading.value = false;
  }
}

watch(
  () => [activeKind.value, kindForms[activeKind.value].providerId] as const,
  async ([kind, providerId], previous) => {
    if (!hasInitialized || !previous) {
      return;
    }
    const [previousKind, previousProviderId] = previous;
    if (kind !== previousKind || providerId === previousProviderId) {
      return;
    }
    kindForms[kind].modelId = undefined;
    await fetchModelsByProvider(kind);
  },
);

async function submitDefaultModel() {
  const kind = activeKind.value;
  const form = kindForms[kind];
  if (!form.providerId || !form.modelId) {
    message.warning($t('ai-buddy.defaultModelManage.selectRequired'));
    return;
  }

  if (!enabledModels(form).some((item) => item.model_id === form.modelId)) {
    message.warning($t('ai-buddy.defaultModelManage.selectRequired'));
    return;
  }

  const payload: AIDefaultModelParams = {
    model_id: form.modelId,
    provider_id: form.providerId,
    status: 1,
  };

  saving.value = true;
  try {
    await updateAIDefaultModelApi(kind, payload);
    message.success($t(`ai-buddy.defaultModelManage.${kind}Updated`));
    await fetchDefaultModel(kind);
    await fetchModelsByProvider(kind);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await refreshPage();
  hasInitialized = true;
});

onActivated(async () => {
  if (!hasInitialized) {
    return;
  }

  await refreshPage();
});
</script>

<template>
  <Page auto-content-height>
    <a-card
      class="h-full overflow-y-auto rounded-[var(--radius)]"
      variant="borderless"
    >
      <a-tabs
        class="h-full"
        v-model:active-key="activeKind"
        animated
        destroy-on-hidden
        tab-placement="start"
        :items="tabItems"
        :tab-bar-style="{ width: '16%' }"
      >
        <template #contentRender>
          <a-spin :spinning="loading">
            <div class="flex flex-col gap-4">
              <div class="flex items-center">
                <div
                  class="mr-2 flex w-[140px] shrink-0 items-center justify-start pl-2 text-sm leading-6"
                >
                  {{ $t('ai-buddy.defaultModelManage.provider') }}
                  <a-tooltip
                    :title="$t(`ai-buddy.defaultModelManage.${activeKind}Help`)"
                  >
                    <CircleHelp
                      class="ml-1 size-3.5 cursor-help text-foreground/80 hover:text-foreground"
                    />
                  </a-tooltip>
                </div>
                <a-select
                  v-model:value="activeForm.providerId"
                  allow-clear
                  class="w-full max-w-80"
                  :disabled="saving"
                  :options="providerOptions"
                  :placeholder="
                    $t('ai-buddy.defaultModelManage.providerPlaceholder')
                  "
                />
              </div>

              <div class="flex items-center">
                <div
                  class="mr-2 flex w-[140px] shrink-0 items-center justify-start pl-2 text-sm leading-6"
                >
                  {{ $t('ai-buddy.defaultModelManage.model') }}
                </div>
                <a-select
                  v-model:value="activeForm.modelId"
                  allow-clear
                  class="w-full max-w-80"
                  :disabled="saving || !activeForm.providerId"
                  :loading="activeForm.modelsLoading"
                  :options="activeModelOptions"
                  :placeholder="
                    $t('ai-buddy.defaultModelManage.modelPlaceholder')
                  "
                />
              </div>

              <VbenButton
                class="ml-1.5 mt-1 w-fit"
                :loading="saving"
                type="primary"
                @click="submitDefaultModel"
              >
                {{ $t('common.save') }}
              </VbenButton>
            </div>
          </a-spin>
        </template>
      </a-tabs>
    </a-card>
  </Page>
</template>

<style lang="scss" scoped>
:deep(.ant-card-body) {
  height: 100%;
  min-height: 100%;
}
</style>
