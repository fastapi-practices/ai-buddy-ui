<script setup lang="ts">
import type { AIProviderResult } from '../../api';

import { computed, ref } from 'vue';

import { ColPage } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { syncAIModelsArchitectureApi } from '../../api';
import ModelPane from './components/model-pane.vue';
import ProviderPane from './components/provider-pane.vue';
import { pickActiveProviderId } from './data';

const providers = ref<AIProviderResult[]>([]);
const activeProviderId = ref<number>();
const modelPaneRef = ref<InstanceType<typeof ModelPane>>();
const architectureLoading = ref(false);

const activeProvider = computed(() => {
  return providers.value.find((item) => item.id === activeProviderId.value);
});

function handleProvidersChange(nextProviders: AIProviderResult[]) {
  providers.value = nextProviders;
  activeProviderId.value = pickActiveProviderId(
    nextProviders,
    activeProviderId.value,
  );
}

function handleProviderSelect(providerId: number) {
  activeProviderId.value = providerId;
}

async function syncArchitecture() {
  if (architectureLoading.value) return;
  architectureLoading.value = true;
  try {
    const result = await syncAIModelsArchitectureApi();
    if (result.skipped.length > 0) {
      message.warning(
        $t('ai-buddy.modelManage.architectureSkipped', [
          result.updated_count,
          result.skipped.length,
        ]),
      );
    } else {
      message.success(
        $t('ai-buddy.modelManage.architectureUpdated', [result.updated_count]),
      );
    }
    modelPaneRef.value?.refresh();
  } catch (error) {
    message.error(
      (error as Error).message || $t('ai-buddy.modelManage.architectureFailed'),
    );
  } finally {
    architectureLoading.value = false;
  }
}
</script>

<template>
  <ColPage
    auto-content-height
    content-class="h-full"
    :left-width="24"
    :resizable="false"
    :right-width="76"
  >
    <template #left>
      <div class="h-full">
        <ProviderPane
          :active-provider-id="activeProviderId"
          :sync-architecture-loading="architectureLoading"
          @providers-change="handleProvidersChange"
          @select="handleProviderSelect"
          @sync-architecture="syncArchitecture"
        />
      </div>
    </template>

    <ModelPane
      :key="activeProviderId ?? 'empty'"
      ref="modelPaneRef"
      :provider="activeProvider"
    />
  </ColPage>
</template>
