<script setup lang="ts">
import { computed, h, nextTick, onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import Rag from './rag.vue';
import SearchEngine from './search-engine.vue';

const activeKey = ref('0');

const searchEngineRef = ref();
const ragRef = ref();

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
        tab-placement="start"
        animated
        :tab-bar-style="{ width: '16%' }"
        :items="tabItems"
      >
        <template #contentRender="{ item }">
          <SearchEngine v-if="item.key === '0'" ref="searchEngineRef" />
          <Rag v-else-if="item.key === '1'" ref="ragRef" />
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
