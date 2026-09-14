<script setup lang="ts">
import type {
  AIDefaultModelParams,
  AIDefaultModelResult,
  AIDefaultModelScene,
  AIModelResult,
  AIProviderResult,
} from '../../api';

import { computed, onActivated, onMounted, reactive, ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import {
  getAIDefaultModelOptionalApi,
  getAllAIModelApi,
  getAllAIProviderApi,
  updateAIDefaultModelApi,
} from '../../api';
import { getProviderTypeLabel } from '../model-service/data';

interface DefaultModelSceneForm {
  fetchId: number;
  modelId?: string;
  models: AIModelResult[];
  modelsLoading: boolean;
  providerId?: number;
  saving: boolean;
}

const sceneMetas: { scene: AIDefaultModelScene }[] = [
  { scene: 'assistant' },
  { scene: 'embedding' },
];

function createSceneForm(): DefaultModelSceneForm {
  return {
    fetchId: 0,
    models: [],
    modelsLoading: false,
    saving: false,
  };
}

const providers = ref<AIProviderResult[]>([]);
const loading = ref(false);
const sceneForms = {
  assistant: reactive(createSceneForm()),
  embedding: reactive(createSceneForm()),
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

function enabledModels(form: DefaultModelSceneForm) {
  return form.models.filter((item) => Number(item.status) === 1);
}

function modelOptions(form: DefaultModelSceneForm) {
  return enabledModels(form).map((item) => ({
    label: item.model_id,
    value: item.model_id,
  }));
}

function applyDefaultModel(
  form: DefaultModelSceneForm,
  model: AIDefaultModelResult | null,
) {
  form.providerId = model?.provider_id;
  form.modelId = model?.model_id;
}

async function fetchProviders() {
  providers.value = await getAllAIProviderApi();
}

async function fetchDefaultModel(scene: AIDefaultModelScene) {
  const form = sceneForms[scene];
  let model: AIDefaultModelResult | null;
  try {
    model = await getAIDefaultModelOptionalApi(scene);
  } catch (error) {
    message.error((error as Error).message);
    throw error;
  }

  applyDefaultModel(form, model);
}

async function fetchModelsByProvider(scene: AIDefaultModelScene) {
  const form = sceneForms[scene];
  const fetchId = ++form.fetchId;
  const providerId = form.providerId;

  if (!providerId) {
    form.models = [];
    form.modelId = undefined;
    return;
  }

  form.modelsLoading = true;
  try {
    const data = await getAllAIModelApi({ provider_id: providerId });

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
      sceneMetas.map(async ({ scene }) => {
        await fetchDefaultModel(scene);
        await fetchModelsByProvider(scene);
      }),
    );
  } finally {
    loading.value = false;
  }
}

async function onProviderChange(scene: AIDefaultModelScene) {
  sceneForms[scene].modelId = undefined;
  await fetchModelsByProvider(scene);
}

async function submitDefaultModel(scene: AIDefaultModelScene) {
  const form = sceneForms[scene];
  if (!form.providerId || !form.modelId) {
    message.warning($t('ai-buddy.defaultModelManage.selectRequired'));
    return;
  }

  const payload: AIDefaultModelParams = {
    model_id: form.modelId,
    provider_id: form.providerId,
    status: 1,
  };

  form.saving = true;
  try {
    await updateAIDefaultModelApi(scene, payload);
    message.success(
      scene === 'assistant'
        ? $t('ai-buddy.defaultModelManage.assistantUpdated')
        : $t('ai-buddy.defaultModelManage.embeddingUpdated'),
    );
    await fetchDefaultModel(scene);
  } finally {
    form.saving = false;
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
    <div class="flex h-full flex-col gap-4">
      <a-card
        v-for="meta in sceneMetas"
        :key="meta.scene"
        :loading="loading"
        :title="
          meta.scene === 'assistant'
            ? $t('ai-buddy.defaultModelManage.assistantTitle')
            : $t('ai-buddy.defaultModelManage.embeddingTitle')
        "
      >
        <div class="flex flex-col gap-4">
          <a-alert show-icon type="info">
            <template #message>
              {{
                meta.scene === 'assistant'
                  ? $t('ai-buddy.defaultModelManage.assistantHelp')
                  : $t('ai-buddy.defaultModelManage.embeddingHelp')
              }}
            </template>
          </a-alert>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <div class="mb-2 text-sm font-medium text-foreground">
                {{ $t('ai-buddy.defaultModelManage.provider') }}
              </div>
              <a-select
                v-model:value="sceneForms[meta.scene].providerId"
                class="w-full"
                :disabled="sceneForms[meta.scene].saving"
                :options="providerOptions"
                :placeholder="
                  $t('ai-buddy.defaultModelManage.providerPlaceholder')
                "
                @change="() => onProviderChange(meta.scene)"
              />
            </div>
            <div>
              <div class="mb-2 text-sm font-medium text-foreground">
                {{ $t('ai-buddy.defaultModelManage.model') }}
              </div>
              <a-select
                v-model:value="sceneForms[meta.scene].modelId"
                class="w-full"
                :disabled="
                  sceneForms[meta.scene].saving ||
                  !sceneForms[meta.scene].providerId
                "
                :loading="sceneForms[meta.scene].modelsLoading"
                :options="modelOptions(sceneForms[meta.scene])"
                :placeholder="
                  $t('ai-buddy.defaultModelManage.modelPlaceholder')
                "
              />
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <VbenButton
              :loading="sceneForms[meta.scene].saving"
              type="primary"
              @click="submitDefaultModel(meta.scene)"
            >
              {{
                meta.scene === 'assistant'
                  ? $t('ai-buddy.defaultModelManage.saveAssistant')
                  : $t('ai-buddy.defaultModelManage.saveEmbedding')
              }}
            </VbenButton>
          </div>
        </div>
      </a-card>
    </div>
  </Page>
</template>
