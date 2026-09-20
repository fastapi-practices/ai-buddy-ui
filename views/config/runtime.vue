<script setup lang="ts">
import type { AIConfigResult } from '../../api';

import { ref } from 'vue';

import { VbenButton } from '@vben/common-ui';
import { MaterialSymbolsEdit } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';

import { getAllAIConfigApi, updateAIConfigApi } from '../../api';
import { pickRuntimeConfigs } from './config-keys';
import { runtimeSchema } from './data';

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  schema: runtimeSchema,
  commonConfig: {
    controlClass: 'w-full max-w-80',
    disabled: true,
    labelClass: 'justify-start ml-2',
    labelWidth: 180,
    hideRequiredMark: true,
  },
});

const editButtonShow = ref<boolean>(true);
const loading = ref<boolean>(false);
const saveLoading = ref<boolean>(false);
const configData = ref<AIConfigResult[]>([]);

const fetchConfigList = async () => {
  loading.value = true;
  try {
    configData.value = pickRuntimeConfigs(await getAllAIConfigApi());
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
      const numericValue = Number(config.value);
      formApi.setValues({
        [config.key]: Number.isFinite(numericValue)
          ? numericValue
          : config.value,
      });
    });
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const saveRuntimeConfig = async () => {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }

  const data: Record<string, any> = await formApi.getValues();
  configData.value.forEach((config) => {
    if (Object.prototype.hasOwnProperty.call(data, config.key)) {
      const value = data[config.key];
      config.value = value === null || value === undefined ? '' : String(value);
    }
  });

  saveLoading.value = true;
  try {
    await updateAIConfigApi(configData.value);
    message.success($t('ui.actionMessage.operationSuccess'));
    editButtonShow.value = true;
    formApi.setState({ commonConfig: { disabled: true } });
    await fetchConfigList();
  } catch (error) {
    console.error(error);
  } finally {
    saveLoading.value = false;
  }
};

defineExpose({
  fetchConfigList,
});
</script>

<template>
  <a-spin :spinning="loading">
    <div>
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
        {{ $t('common.edit') }}
      </VbenButton>
      <VbenButton
        v-show="!editButtonShow"
        class="ml-1.5 mt-3"
        :loading="saveLoading"
        @click="saveRuntimeConfig"
      >
        <MaterialSymbolsEdit class="mr-1" />
        {{ $t('common.save') }}
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
        {{ $t('common.cancel') }}
      </VbenButton>
    </div>
  </a-spin>
</template>
