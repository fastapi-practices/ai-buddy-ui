import type { AIModelModality } from '../../api';

export const MODEL_MODALITY_OPTIONS: {
  color: string;
  icon: string;
  label: string;
  value: AIModelModality;
}[] = [
  { color: 'default', icon: 'carbon:text-font', label: '文本', value: 'text' },
  { color: 'green', icon: 'carbon:image', label: '图片', value: 'image' },
  { color: 'gold', icon: 'carbon:music', label: '音频', value: 'audio' },
  { color: 'magenta', icon: 'carbon:video', label: '视频', value: 'video' },
];

export function getModelModalityLabel(modality: AIModelModality | string) {
  return (
    MODEL_MODALITY_OPTIONS.find((item) => item.value === modality)?.label ??
    modality
  );
}

export function getModelModalityIcon(modality: AIModelModality | string) {
  return (
    MODEL_MODALITY_OPTIONS.find((item) => item.value === modality)?.icon ??
    'carbon:help'
  );
}

export function getModelModalityColor(modality: AIModelModality | string) {
  return (
    MODEL_MODALITY_OPTIONS.find((item) => item.value === modality)?.color ??
    'default'
  );
}
