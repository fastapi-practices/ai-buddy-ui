<script setup lang="ts">
import type { AIMcpOAuthConfigResult, AIMcpResult } from '../../api';
import type { AIMcpOAuthFormValues } from './mcp-oauth-params';

import { computed, ref } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { useClipboard } from '@vueuse/core';
import { Input, message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';

import { getAIMcpOAuthConfigApi, updateAIMcpOAuthConfigApi } from '../../api';
import {
  canConfigureMcpOAuth,
  createAIMcpOAuthPayload,
  getMcpOAuthConfigIssue,
  toAIMcpOAuthFormValues,
} from './mcp-oauth-params';
import { createMcpOAuthSchema } from './oauth-data';

const userStore = useUserStore();
const isSuperuser = computed(() =>
  Boolean(
    (userStore.userInfo as null | { is_superuser?: boolean })?.is_superuser,
  ),
);
const row = ref<AIMcpResult>();
const config = ref<AIMcpOAuthConfigResult>();
const loading = ref(false);
const loadFailed = ref(false);
const saving = ref(false);
let requestVersion = 0;

const { copy } = useClipboard({ legacy: true });
const label = (key: string) => $t(`ai-buddy.mcpManage.oauth.${key}`);

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: createMcpOAuthSchema(),
  showDefaultActions: false,
});

async function loadConfig() {
  const currentRow = row.value;
  if (!currentRow || loading.value) {
    return;
  }
  const version = ++requestVersion;
  loading.value = true;
  loadFailed.value = false;
  modalApi.setState({ confirmDisabled: true, loading: true });
  try {
    const result = await getAIMcpOAuthConfigApi(currentRow.id);
    if (version !== requestVersion) {
      return;
    }
    formApi.setState({
      schema: createMcpOAuthSchema(result.has_client_secret),
    });
    await formApi.setValues(toAIMcpOAuthFormValues(result));
    config.value = result;
  } catch {
    if (version === requestVersion) {
      loadFailed.value = true;
    }
  } finally {
    if (version === requestVersion) {
      loading.value = false;
      modalApi.setState({
        confirmDisabled: !config.value,
        loading: false,
      });
    }
  }
}

async function copyRedirectUri() {
  if (!config.value?.redirect_uri) {
    return;
  }
  try {
    await copy(config.value.redirect_uri);
    message.success(label('copied'));
  } catch {
    message.error(label('copyFailed'));
  }
}

const [Modal, modalApi] = useVbenModal({
  confirmDisabled: true,
  confirmText: $t('common.save'),
  async onConfirm() {
    const currentRow = row.value;
    const currentConfig = config.value;
    if (!currentRow || !currentConfig || loading.value || saving.value) {
      return;
    }
    const version = requestVersion;
    const rowId = currentRow.id;
    if (!canConfigureMcpOAuth(currentRow, isSuperuser.value)) {
      message.warning(label('unavailable'));
      return;
    }

    saving.value = true;
    modalApi.lock();
    try {
      const { valid } = await formApi.validate();
      if (!valid) {
        return;
      }
      const values = await formApi.getValues<AIMcpOAuthFormValues>();
      const issue = getMcpOAuthConfigIssue(
        values,
        currentConfig.has_client_secret,
      );
      if (issue) {
        message.warning(label(`validation.${issue}`));
        return;
      }
      if (version !== requestVersion || row.value?.id !== rowId) {
        return;
      }
      await updateAIMcpOAuthConfigApi(
        currentRow.id,
        createAIMcpOAuthPayload(values),
      );
      if (version !== requestVersion || row.value?.id !== rowId) {
        return;
      }
      await formApi.setValues({ client_secret: '' });
      config.value = undefined;
      message.success($t('ui.actionMessage.operationSuccess'));
      if (version !== requestVersion || row.value?.id !== rowId) {
        return;
      }
      await loadConfig();
    } catch {
      // 请求错误由统一拦截器提示，保存失败时保留草稿
    } finally {
      saving.value = false;
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    ++requestVersion;
    config.value = undefined;
    loadFailed.value = false;
    loading.value = false;
    modalApi.setState({ confirmDisabled: true, loading: false });
    await formApi.resetForm();
    await formApi.setValues(toAIMcpOAuthFormValues());
    if (!isOpen) {
      row.value = undefined;
      return;
    }
    row.value = modalApi.getData<AIMcpResult>();
    if (!row.value || !canConfigureMcpOAuth(row.value, isSuperuser.value)) {
      message.warning(label('unavailable'));
      modalApi.close();
      return;
    }
    await loadConfig();
  },
});
</script>

<template>
  <Modal content-class="px-4 py-4 md:px-5 md:py-5" :title="label('title')">
    <div v-if="loadFailed" class="flex items-center gap-3 py-4">
      <span>{{ label('loadFailed') }}</span>
      <VbenButton variant="outline" :loading="loading" @click="loadConfig">
        {{ label('retry') }}
      </VbenButton>
    </div>
    <Form v-show="config">
      <template #redirect_uri="slotProps">
        <Input
          :id="slotProps.id"
          readonly
          :placeholder="label('redirectMissing')"
          :value="config?.redirect_uri"
        >
          <template #suffix>
            <button
              type="button"
              class="flex text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              :aria-label="label('copyRedirectUri')"
              :title="label('copyRedirectUri')"
              :disabled="!config?.redirect_uri"
              @click="copyRedirectUri"
            >
              <IconifyIcon class="size-4" icon="lucide:copy" />
            </button>
          </template>
        </Input>
      </template>
    </Form>
  </Modal>
</template>
