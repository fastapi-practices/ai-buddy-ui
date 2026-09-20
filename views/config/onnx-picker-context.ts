import type { InjectionKey, Ref } from 'vue';

import type { AIOnnxOption } from '../../api';

export type OnnxPickerContext = {
  cacheDir: Ref<string>;
  download: (item: AIOnnxOption) => void;
  downloading: Ref<string>;
  models: Ref<AIOnnxOption[]>;
};

export const ONNX_PICKER_KEY: InjectionKey<OnnxPickerContext> =
  Symbol('aiBuddyOnnxPicker');

export const OCR_ONNX_PICKER_KEY: InjectionKey<OnnxPickerContext> = Symbol(
  'aiBuddyOcrOnnxPicker',
);

export const PADDLEOCR_PICKER_KEY: InjectionKey<OnnxPickerContext> = Symbol(
  'aiBuddyPaddleocrPicker',
);
