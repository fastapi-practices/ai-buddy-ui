<script setup lang="ts">
import type { AIExpertParams, AIExpertResult } from '../../api';
import type { ResourceOption } from './data';

import type { VbenFormProps } from '#/adapter/form';
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { Page, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  createAIExpertApi,
  deleteAIExpertApi,
  getAIExpertListApi,
  getAllAIKnowledgeBaseApi,
  getAllAIMcpApi,
  getAllAISkillApi,
  updateAIExpertApi,
} from '../../api';
import {
  AI_ASSISTANT_STARTER_MAX,
  AI_ASSISTANT_STARTER_TEXT_MAX,
  normalizeStarters,
} from '../assistant/assistant-params';
import {
  createExpertSchema,
  queryExpertSchema,
  useExpertColumns,
} from './data';

interface AIExpertFormValues extends AIExpertParams {
  starters?: string[];
}

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: queryExpertSchema,
};

const gridOptions: VxeTableGridOptions<AIExpertResult> = {
  rowConfig: {
    keyField: 'id',
  },
  checkboxConfig: {
    highlight: true,
  },
  height: 'auto',
  exportConfig: {},
  printConfig: {},
  toolbarConfig: {
    custom: true,
    refresh: true,
    refreshOptions: {
      code: 'query',
    },
    zoom: true,
  },
  columns: useExpertColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getAIExpertListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const formData = ref<AIExpertResult>();
const starters = ref<string[]>([]);
const mcpOptions = ref<ResourceOption[]>([]);
const skillOptions = ref<ResourceOption[]>([]);
const knowledgeOptions = ref<ResourceOption[]>([]);

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('ai-buddy.expert')])
    : $t('ui.actionTitle.create', [$t('ai-buddy.expert')]);
});

const canAddStarter = computed(
  () => starters.value.length < AI_ASSISTANT_STARTER_MAX,
);

function onRefresh() {
  gridApi.query();
}

function addStarter() {
  if (!canAddStarter.value) {
    return;
  }
  starters.value.push('');
}

function removeStarter(index: number) {
  starters.value.splice(index, 1);
}

function toResourceOptions(
  items: { id: number; name: string }[],
): ResourceOption[] {
  return items.map((item) => ({
    label: item.name,
    value: item.id,
  }));
}

async function loadResourceOptions() {
  const [mcps, skills, knowledgeBases] = await Promise.all([
    getAllAIMcpApi(),
    getAllAISkillApi(),
    getAllAIKnowledgeBaseApi(),
  ]);
  mcpOptions.value = toResourceOptions(mcps);
  skillOptions.value = toResourceOptions(skills);
  knowledgeOptions.value = toResourceOptions(knowledgeBases);
}

function onActionClick({ code, row }: OnActionClickParams<AIExpertResult>) {
  switch (code) {
    case 'delete': {
      deleteAIExpertApi(row.id).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.name]),
          key: 'action_process_msg',
        });
        onRefresh();
      });
      break;
    }
    case 'edit': {
      modalApi.setData(row).open();
      break;
    }
  }
}

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: createExpertSchema([], [], []),
});

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    modalApi.lock();
    try {
      const values = await formApi.getValues<AIExpertFormValues>();
      const data: AIExpertParams = {
        name: values.name.trim(),
        prompt: values.prompt.trim(),
        description: values.description?.trim() || null,
        starters: normalizeStarters(starters.value),
        mcp_ids: values.mcp_ids ?? [],
        skill_ids: values.skill_ids ?? [],
        knowledge_ids: values.knowledge_ids ?? [],
        sort: values.sort ?? 0,
      };
      await (formData.value?.id
        ? updateAIExpertApi(formData.value.id, data)
        : createAIExpertApi(data));
      message.success($t('ui.actionMessage.operationSuccess'));
      await modalApi.close();
      onRefresh();
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }
    const data = modalApi.getData<AIExpertResult>();
    await loadResourceOptions();
    formApi.resetForm();
    formApi.setState({
      schema: createExpertSchema(
        mcpOptions.value,
        skillOptions.value,
        knowledgeOptions.value,
      ),
    });
    starters.value = [...(data?.starters ?? [])];
    if (data) {
      formData.value = data;
      formApi.setValues({
        name: data.name,
        prompt: data.prompt,
        description: data.description ?? '',
        mcp_ids: data.mcp_ids ?? [],
        skill_ids: data.skill_ids ?? [],
        knowledge_ids: data.knowledge_ids ?? [],
        sort: data.sort ?? 0,
      });
    } else {
      formData.value = undefined;
    }
  },
});
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="() => modalApi.setData(null).open()">
          <MaterialSymbolsAdd class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('ai-buddy.expert')]) }}
        </VbenButton>
      </template>
    </Grid>
    <Modal content-class="px-4 py-4 md:px-5 md:py-5" :title="modalTitle">
      <Form />
      <div class="mt-4">
        <div class="mb-2 text-sm">
          {{ $t('ai-buddy.expertManage.starters') }}
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="(_, index) in starters"
            :key="index"
            class="flex items-center gap-2"
          >
            <a-input
              v-model:value="starters[index]"
              :maxlength="AI_ASSISTANT_STARTER_TEXT_MAX"
              :placeholder="$t('ai-buddy.expertManage.starterPlaceholder')"
            />
            <VbenButton variant="outline" @click="removeStarter(index)">
              {{ $t('common.delete') }}
            </VbenButton>
          </div>
          <VbenButton
            v-if="canAddStarter"
            variant="outline"
            @click="addStarter"
          >
            <MaterialSymbolsAdd class="size-4" />
            {{ $t('ai-buddy.expertManage.addStarter') }}
          </VbenButton>
        </div>
      </div>
    </Modal>
  </Page>
</template>
