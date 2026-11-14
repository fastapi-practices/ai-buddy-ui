<script setup lang="ts">
import { computed, h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

import ConfigPane from './config-pane.vue';
import { aiConfigMenus, findAIConfigMenu } from './config-menu';

const activeKey = ref(aiConfigMenus[0]?.key ?? '');
const isMobile = useBreakpoints(breakpointsTailwind).smaller('md');

const tabItems = computed(() =>
  aiConfigMenus.map((menu) => ({
    key: menu.key,
    label: $t(menu.labelKey),
    icon: () => h('span', { class: menu.icon }),
  })),
);

const activeMenu = computed(() => findAIConfigMenu(activeKey.value));
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
        <template #contentRender>
          <ConfigPane
            v-if="activeMenu"
            :key="activeMenu.key"
            :is-mobile="isMobile"
            :menu="activeMenu"
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
