import type { AIOnnxOption } from '../../api';

export const DEFAULT_EMBEDDING_ONNX_MODELS: AIOnnxOption[] = [
  {
    downloaded: false,
    id: 'BAAI/bge-small-zh-v1.5',
    name: 'BAAI/bge-small-zh-v1.5',
    size_gb: 0.09,
  },
  {
    downloaded: false,
    id: 'jinaai/jina-embeddings-v2-base-zh',
    name: 'jinaai/jina-embeddings-v2-base-zh',
    size_gb: 0.32,
  },
  {
    downloaded: false,
    id: 'intfloat/multilingual-e5-large',
    name: 'intfloat/multilingual-e5-large',
    size_gb: 1.2,
  },
  {
    downloaded: false,
    id: 'BAAI/bge-small-en-v1.5',
    name: 'BAAI/bge-small-en-v1.5',
    size_gb: 0.13,
  },
  {
    downloaded: false,
    id: 'sentence-transformers/all-MiniLM-L6-v2',
    name: 'sentence-transformers/all-MiniLM-L6-v2',
    size_gb: 0.09,
  },
];

export const DEFAULT_OCR_ONNX_MODELS: AIOnnxOption[] = [
  {
    downloaded: false,
    id: 'rapidocr',
    name: 'RapidOCR',
    size_gb: 0.02,
  },
];

export const DEFAULT_PADDLEOCR_MODELS: AIOnnxOption[] = [
  {
    downloaded: false,
    id: 'paddleocr',
    name: 'PaddleOCR 中文检测识别',
    size_gb: 0.08,
  },
];
