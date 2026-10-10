/* eslint-disable vue/one-component-per-file */
import type { App } from 'vue';

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ModelService from './index.vue';

const mocks = vi.hoisted(() => ({
  error: vi.fn(),
  hasProvider: false,
  refresh: vi.fn(),
  success: vi.fn(),
  sync: vi.fn(),
  warning: vi.fn(),
}));

vi.mock('../../api', () => ({
  syncAIModelsArchitectureApi: mocks.sync,
}));
vi.mock('./data', () => ({
  pickActiveProviderId: () => 12,
}));
vi.mock('@vben/common-ui', () => ({
  ColPage: defineComponent({
    setup:
      (_, { slots }) =>
      () =>
        h('main', [
          slots.title?.(),
          slots.description?.(),
          slots.extra?.(),
          slots.left?.(),
          slots.default?.(),
        ]),
  }),
  VbenButton: defineComponent({
    props: { disabled: Boolean, loading: Boolean },
    setup:
      (props, { attrs, slots }) =>
      () =>
        h('button', { ...attrs, disabled: props.disabled }, slots.default?.()),
  }),
}));
vi.mock('@vben/icons', () => ({ RotateCw: () => null }));
vi.mock('@vben/locales', async () => {
  const { default: translations } =
    await import('../../langs/zh-CN/ai-buddy.json');
  return {
    $t: (key: string, values: unknown[] = []) => {
      const label =
        (translations.modelManage as Record<string, string>)[
          key.split('.').at(-1) ?? ''
        ] ?? translations.model;
      return label.replaceAll(/\{(\d+)\}/g, (_, index) =>
        String(values[index]),
      );
    },
  };
});
vi.mock('antdv-next', () => ({
  message: {
    error: mocks.error,
    success: mocks.success,
    warning: mocks.warning,
  },
}));
vi.mock('./components/model-pane.vue', () => ({
  default: defineComponent({
    setup: (_, { expose }) => {
      expose({ refresh: mocks.refresh });
      return () => h('div');
    },
  }),
}));
vi.mock('./components/provider-pane.vue', () => ({
  default: defineComponent({
    emits: ['providersChange', 'select'],
    setup: (_, { emit }) => {
      if (mocks.hasProvider) {
        emit('providersChange', [{ id: 12, status: 0 }]);
        emit('select', 12);
      }
      return () => h('div');
    },
  }),
}));

let app: App;
let container: HTMLDivElement;

function mountModelService() {
  container = document.createElement('div');
  document.body.append(container);
  app = createApp(ModelService);
  app.mount(container);
}

beforeEach(async () => {
  vi.clearAllMocks();
  mocks.sync.mockReset();
  mocks.hasProvider = false;
  mountModelService();
  await nextTick();
});

afterEach(() => {
  app.unmount();
  container.remove();
});

describe('platform model architecture synchronization', () => {
  it('syncs once without a selected provider and shows a summary message', async () => {
    mocks.sync.mockResolvedValue({
      updated_count: 3,
      skipped: [{ id: 91, model_id: 'custom-model', reason: '目录尚未收录' }],
    });

    container.querySelector('button')?.click();
    await nextTick();
    await nextTick();

    expect(mocks.sync).toHaveBeenCalledExactlyOnceWith();
    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(mocks.warning).toHaveBeenCalledExactlyOnceWith(
      '已更新 3 个平台模型的架构，跳过 1 个模型',
    );
    expect(mocks.success).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain('custom-model');
  });

  it('does not narrow synchronization to the selected disabled provider', async () => {
    app.unmount();
    container.remove();
    mocks.hasProvider = true;
    mountModelService();
    await nextTick();
    mocks.sync.mockResolvedValue({ updated_count: 0, skipped: [] });

    container.querySelector('button')?.click();
    await nextTick();
    await nextTick();

    expect(mocks.sync).toHaveBeenCalledExactlyOnceWith();
    expect(mocks.success).toHaveBeenCalledExactlyOnceWith(
      '已更新 0 个平台模型的架构',
    );
    expect(mocks.warning).not.toHaveBeenCalled();
  });

  it('blocks duplicate requests and restores the button after a failure', async () => {
    let rejectSync: (error: Error) => void = () => {};
    mocks.sync.mockReturnValue(
      new Promise((_, reject) => {
        rejectSync = reject;
      }),
    );
    const button = container.querySelector('button');

    button?.click();
    button?.click();
    await nextTick();

    expect(mocks.sync).toHaveBeenCalledOnce();
    expect(button?.disabled).toBe(true);
    rejectSync(new Error('模型目录服务暂时不可用'));
    await nextTick();
    await nextTick();

    expect(mocks.error).toHaveBeenCalledWith('模型目录服务暂时不可用');
    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(button?.disabled).toBe(false);
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.warning).not.toHaveBeenCalled();
  });
});
