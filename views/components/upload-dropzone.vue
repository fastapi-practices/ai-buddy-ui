<script setup lang="ts">
import { computed, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  collectDataTransferFiles,
  getUploadPreviewNames,
  takeInputFiles,
} from '../../api/upload-file';

const props = withDefaults(
  defineProps<{
    accept?: string;
    disabled?: boolean;
    files?: File[];
    requirements?: string[];
  }>(),
  {
    accept: '',
    disabled: false,
    files: () => [],
    requirements: () => [],
  },
);

const emit = defineEmits<{
  select: [files: File[]];
}>();

const fileInputRef = ref<HTMLInputElement>();
const dirInputRef = ref<HTMLInputElement>();
const dragging = ref(false);
const dragCount = ref(0);

const preview = computed(() => getUploadPreviewNames(props.files));

function emitFiles(files: File[]) {
  emit('select', files);
}

function onInputChange(event: Event) {
  emitFiles(takeInputFiles(event.target as HTMLInputElement));
}

function onPickFiles() {
  if (props.disabled) {
    return;
  }
  fileInputRef.value?.click();
}

function onPickDirectory(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  if (props.disabled) {
    return;
  }
  dirInputRef.value?.click();
}

function onDragEnter(event: DragEvent) {
  event.preventDefault();
  dragCount.value += 1;
  dragging.value = true;
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
}

function onDragLeave(event: DragEvent) {
  event.preventDefault();
  dragCount.value = Math.max(0, dragCount.value - 1);
  if (dragCount.value === 0) {
    dragging.value = false;
  }
}

async function onDrop(event: DragEvent) {
  event.preventDefault();
  dragCount.value = 0;
  dragging.value = false;
  if (props.disabled || !event.dataTransfer) {
    return;
  }
  emitFiles(await collectDataTransferFiles(event.dataTransfer));
}
</script>

<template>
  <div>
    <input
      ref="fileInputRef"
      :accept="accept"
      class="hidden"
      multiple
      type="file"
      @change="onInputChange"
    />
    <input
      ref="dirInputRef"
      class="hidden"
      directory
      multiple
      type="file"
      webkitdirectory
      @change="onInputChange"
    />
    <div
      class="flex min-h-[188px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors"
      :class="
        dragging
          ? 'border-primary bg-accent/40 text-foreground'
          : 'border-border text-muted-foreground hover:border-primary/50'
      "
      @click="onPickFiles"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @dragover="onDragOver"
      @drop="onDrop"
    >
      <IconifyIcon class="mb-4 size-10" icon="material-symbols:upload" />
      <div class="text-sm">
        {{ $t('ai-buddy.upload.dropHint') }}
      </div>
      <button
        class="mt-2 text-xs text-primary hover:underline"
        type="button"
        @click.stop="onPickDirectory"
      >
        {{ $t('ai-buddy.upload.selectFolder') }}
      </button>
    </div>
    <div
      v-if="files.length > 0"
      class="mt-3 space-y-1 text-sm text-muted-foreground"
    >
      <div v-for="name in preview.names" :key="name" class="truncate">
        {{ name }}
      </div>
      <div v-if="preview.extra > 0">
        {{ $t('ai-buddy.upload.moreFiles', [preview.extra]) }}
      </div>
    </div>
    <div v-if="requirements.length > 0" class="mt-5">
      <div class="mb-2 text-sm text-muted-foreground">
        {{ $t('ai-buddy.upload.fileRequirements') }}
      </div>
      <ul class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li v-for="item in requirements" :key="item">
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>
