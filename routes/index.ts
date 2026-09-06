import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'PluginAIBuddy',
    path: '/plugins/ai_buddy',
    redirect: '/plugins/ai_buddy/model-service',
    meta: {
      title: $t('ai_buddy.menu'),
      icon: 'tabler:robot',
    },
  },
  {
    name: 'AIBuddyModelService',
    path: '/plugins/ai_buddy/model-service',
    component: () => import('../views/model-service/index.vue'),
    meta: {
      title: $t('ai_buddy.model'),
      icon: 'carbon:model-alt',
    },
  },
  {
    name: 'AIBuddyDefaultModel',
    path: '/plugins/ai_buddy/default-model',
    component: () => import('../views/default-model/index.vue'),
    meta: {
      title: $t('ai_buddy.default_model'),
      icon: 'carbon:model-alt',
    },
  },
  {
    name: 'AIBuddyQuickPhraseManage',
    path: '/plugins/ai_buddy/quick-phrase',
    component: () => import('../views/quick-phrase/index.vue'),
    meta: {
      title: $t('ai_buddy.quick_phrase'),
      icon: 'mdi:lightning-bolt-outline',
    },
  },
  {
    name: 'AIBuddyMcpManage',
    path: '/plugins/ai_buddy/mcp',
    component: () => import('../views/mcp/index.vue'),
    meta: {
      title: $t('ai_buddy.mcp'),
      icon: 'simple-icons:modelcontextprotocol',
    },
  },
  {
    name: 'AIBuddyKnowledgeManage',
    path: '/plugins/ai_buddy/knowledge',
    component: () => import('../views/knowledge/index.vue'),
    meta: {
      title: $t('ai_buddy.knowledge'),
      icon: 'mdi:book-open-variant-outline',
    },
  },
  {
    name: 'AIBuddySkillManage',
    path: '/plugins/ai_buddy/skill',
    component: () => import('../views/skill/index.vue'),
    meta: {
      title: $t('ai_buddy.skill'),
      icon: 'mdi:puzzle-outline',
    },
  },
  {
    name: 'AIBuddyAssistantManage',
    path: '/plugins/ai_buddy/assistant',
    component: () => import('../views/assistant/index.vue'),
    meta: {
      title: $t('ai_buddy.assistant'),
      icon: 'mdi:account-tie-outline',
    },
  },
  {
    name: 'AIBuddyConfigManage',
    path: '/plugins/ai_buddy/config',
    component: () => import('../views/config/index.vue'),
    meta: {
      title: $t('ai_buddy.config'),
      icon: 'codicon:symbol-parameter',
    },
  },
];

export default routes;
