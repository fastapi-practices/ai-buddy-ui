<script setup lang="ts">
import type { AIConfigResult } from '../../api';

import { ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsEdit } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';

import { getAllAIConfigApi, updateAIConfigApi } from '../../api';
import { pickEditableAIConfigs } from './config-keys';
import { aiConfigSchema } from './data';

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  schema: aiConfigSchema,
  commonConfig: {
    controlClass: 'w-full max-w-80',
    disabled: true,
    labelClass: 'justify-start ml-2',
    labelWidth: 140,
    hideRequiredMark: true,
  },
});

const editButtonShow = ref<boolean>(true);
const loading = ref<boolean>(false);
const saveLoading = ref<boolean>(false);
const configData = ref<AIConfigResult[]>([]);

async function fetchConfigList() {
  loading.value = true;
  try {
    configData.value = pickEditableAIConfigs(await getAllAIConfigApi());
    configData.value.forEach((config) => {
      formApi.setState((prev: any) => {
        return {
          schema: prev.schema?.map((item: any) => {
            if (item.fieldName === config.key) {
              return {
                ...item,
                label: config.name,
              };
            }
            return item;
          }),
        };
      });
      formApi.setValues({ [config.key]: config.value });
    });
  } finally {
    loading.value = false;
  }
}

async function saveConfig() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }

  const data: Record<string, any> = await formApi.getValues();
  configData.value.forEach((config) => {
    if (Object.prototype.hasOwnProperty.call(data, config.key)) {
      config.value = data[config.key];
    }
  });

  saveLoading.value = true;
  try {
    await updateAIConfigApi(configData.value);
    message.success($t('ui.actionMessage.operationSuccess'));
    editButtonShow.value = true;
    formApi.setState({ commonConfig: { disabled: true } });
    await fetchConfigList();
  } finally {
    saveLoading.value = false;
  }
}

fetchConfigList();
</script>

<template>
  <Page auto-content-height>
    <a-card :loading="loading" title="AI 配置">
      <Form />
      <VbenButton
        v-show="editButtonShow"
        class="ml-1.5 mt-3"
        @click="
          () => {
            editButtonShow = false;
            formApi.setState({ commonConfig: { disabled: false } });
          }
        "
      >
        <MaterialSymbolsEdit class="mr-1" />
        修改
      </VbenButton>
      <VbenButton
        v-show="!editButtonShow"
        class="ml-1.5 mt-3"
        :loading="saveLoading"
        @click="saveConfig"
      >
        <MaterialSymbolsEdit class="mr-1" />
        保存
      </VbenButton>
      <VbenButton
        v-show="!editButtonShow"
        class="ml-3 mt-3"
        :disabled="saveLoading"
        variant="outline"
        @click="
          () => {
            editButtonShow = true;
            formApi.setState({ commonConfig: { disabled: true } });
            fetchConfigList();
          }
        "
      >
        取消
      </VbenButton>
    </a-card>
  </Page>
</template>
