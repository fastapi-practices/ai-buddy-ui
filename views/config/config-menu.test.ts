import { describe, expect, it, vi } from 'vitest';

import { AI_DYNAMIC_CONFIG_KEYS, isEditableAIConfigKey } from './config-keys';
import { AI_CONFIG_MENU_MAX_ITEMS, aiConfigMenus } from './config-menu';

// 菜单 schema 里引用了带接口请求的表单组件，测试中只需菜单元数据。
vi.mock('../../api', () => ({
  getAIModelOptionsApi: vi.fn(),
}));

describe('aiConfigMenus', () => {
  it('keeps every menu at or below the item limit', () => {
    expect(AI_CONFIG_MENU_MAX_ITEMS).toBe(10);
    for (const menu of aiConfigMenus) {
      expect(menu.schema.length).toBeLessThanOrEqual(AI_CONFIG_MENU_MAX_ITEMS);
      expect(menu.keys.length).toBeLessThanOrEqual(AI_CONFIG_MENU_MAX_ITEMS);
    }
  });

  it('does not render the same config item in two menus', () => {
    const fieldNames = aiConfigMenus.flatMap((menu) =>
      menu.schema.map((item) => item.fieldName),
    );
    expect(new Set(fieldNames).size).toBe(fieldNames.length);
  });

  it('assigns every editable config key to exactly one menu', () => {
    const keys = aiConfigMenus.flatMap((menu) => menu.keys);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.toSorted()).toEqual([...AI_DYNAMIC_CONFIG_KEYS].toSorted());
  });

  it('derives only editable config keys from the schema', () => {
    const editableKeys = aiConfigMenus
      .flatMap((menu) => menu.keys)
      .filter((key) => !isEditableAIConfigKey(key));
    expect(editableKeys).toEqual([]);
  });

  it('只把 contextKeys 用于条件显示，不交给本菜单保存', () => {
    const menu = aiConfigMenus.find((item) => item.key === 'ocr');
    expect(menu?.contextKeys).toContain('AI_BUDDY_DOCUMENT_EXTRACT_BACKEND');
    for (const contextKey of menu?.contextKeys ?? []) {
      expect(menu?.keys).not.toContain(contextKey);
    }
  });

  it('marks the menus that contain ONNX model pickers', () => {
    expect(
      aiConfigMenus.filter((menu) => menu.usesOnnx).map((menu) => menu.key),
    ).toEqual(['rag-retrieval', 'ocr']);
  });
});
