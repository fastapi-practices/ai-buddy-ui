<script setup lang="ts">
import type { AIConfigResult } from '../../api';

import { ref } from 'vue';

import { VbenButton } from '@vben/common-ui';
import { MaterialSymbolsEdit } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';

import { getAllAIConfigApi, updateAIConfigApi } from '../../api';
import { AI_JEV_INPUT_THRESHOLD, pickJevConfigs } from './config-keys';
import { jevSchema } from './data';

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  schema: jevSchema,
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

function formValue(config: AIConfigResult) {
  if (config.key !== AI_JEV_INPUT_THRESHOLD) {
    return config.value;
  }
  const numericValue = Number(config.value);
  return Number.isFinite(numericValue) ? numericValue : 0.75;
}

const fetchConfigList = async () => {
  loading.value = true;
  try {
    configData.value = pickJevConfigs(await getAllAIConfigApi());
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
      formApi.setValues({
        [config.key]: formValue(config),
      });
    });
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const saveJevConfig = async () => {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }

  const data: Record<string, any> = await formApi.getValues();
  configData.value.forEach((config) => {
    if (Object.prototype.hasOwnProperty.call(data, config.key)) {
      const value = data[config.key];
      config.value = value == null ? '' : String(value);
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
        @click="saveJevConfig"
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
