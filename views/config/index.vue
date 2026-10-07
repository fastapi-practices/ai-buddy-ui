<script setup lang="ts">
import { computed, h, nextTick, onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

import Jev from './jev.vue';
import Rag from './rag.vue';
import Runtime from './runtime.vue';
import SearchEngine from './search-engine.vue';

const activeKey = ref('0');
const isMobile = useBreakpoints(breakpointsTailwind).smaller('md');

const searchEngineRef = ref();
const ragRef = ref();
const runtimeRef = ref();
const jevRef = ref();

const tabItems = computed(() => [
  {
    key: '0',
    label: $t('ai-buddy.searchEngine'),
    icon: () => h('span', { class: 'icon-[carbon--search] -mb-1 size-5' }),
  },
  {
    key: '1',
    label: $t('ai-buddy.rag'),
    icon: () => h('span', { class: 'icon-[carbon--data-base] -mb-1 size-5' }),
  },
  {
    key: '2',
    label: $t('ai-buddy.runtime'),
    icon: () => h('span', { class: 'icon-[carbon--settings] -mb-1 size-5' }),
  },
  {
    key: '3',
    label: $t('ai-buddy.jev'),
    icon: () => h('span', { class: 'icon-[carbon--security] -mb-1 size-5' }),
  },
]);

watch(activeKey, async (newValue) => {
  if (newValue === '0') {
    await nextTick();
    if (searchEngineRef.value) {
      await searchEngineRef.value.fetchConfigList();
    }
  }
  if (newValue === '1') {
    await nextTick();
    if (ragRef.value) {
      await ragRef.value.fetchConfigList();
    }
  }
  if (newValue === '2') {
    await nextTick();
    if (runtimeRef.value) {
      await runtimeRef.value.fetchConfigList();
    }
  }
  if (newValue === '3') {
    await nextTick();
    if (jevRef.value) {
      await jevRef.value.fetchConfigList();
    }
  }
});

onMounted(async () => {
  await nextTick();
  if (searchEngineRef.value) {
    await searchEngineRef.value.fetchConfigList();
  }
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
        v-model:active-key="activeKey"
        :tab-placement="isMobile ? 'top' : 'start'"
        animated
        :tab-bar-style="isMobile ? undefined : { width: '16%' }"
        :items="tabItems"
      >
        <template #contentRender="{ item }">
          <SearchEngine
            v-if="item.key === '0'"
            ref="searchEngineRef"
            :is-mobile="isMobile"
          />
          <Rag
            v-else-if="item.key === '1'"
            ref="ragRef"
            :is-mobile="isMobile"
          />
          <Runtime
            v-else-if="item.key === '2'"
            ref="runtimeRef"
            :is-mobile="isMobile"
          />
          <Jev
            v-else-if="item.key === '3'"
            ref="jevRef"
            :is-mobile="isMobile"
          />
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
