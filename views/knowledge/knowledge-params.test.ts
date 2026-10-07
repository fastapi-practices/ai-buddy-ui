import type { AIKnowledgeBaseFormValues } from './knowledge-params';

import { describe, expect, it } from 'vitest';

import {
  createAIKnowledgeBasePayload,
  getKnowledgeEmbeddingIssue,
  resetKnowledgeEmbeddingBinding,
  toAIKnowledgeBaseFormValues,
} from './knowledge-params';

const availableBindings = {
  localModels: [
    { id: 'BAAI/bge-small-zh-v1.5', downloaded: true },
    { id: 'intfloat/multilingual-e5-large', downloaded: false },
  ],
  modelIds: ['text-embedding-3-small'],
  providerIds: [7],
};

const remoteValues: AIKnowledgeBaseFormValues = {
  name: '  Project docs  ',
  description: '  Reference material  ',
  embedding_mode: 'remote',
  provider_id: 7,
  model_id: ' text-embedding-3-small ',
  local_model_id: 'BAAI/bge-small-zh-v1.5',
};

const localValues: AIKnowledgeBaseFormValues = {
  ...remoteValues,
  embedding_mode: 'local',
};

describe('knowledge base payloads', () => {
  it('uses the default by clearing both binding fields and excluding UI state', () => {
    expect(
      createAIKnowledgeBasePayload({
        ...remoteValues,
        embedding_mode: 'default',
        description: '  ',
      }),
    ).toEqual({
      name: 'Project docs',
      description: null,
      provider_id: null,
      model_id: null,
    });
  });

  it('sends the remote pair without a stale local selection', () => {
    expect(createAIKnowledgeBasePayload(remoteValues)).toEqual({
      name: 'Project docs',
      description: 'Reference material',
      provider_id: 7,
      model_id: 'text-embedding-3-small',
    });
  });

  it('sends the local model with a null provider despite a stale remote pair', () => {
    expect(
      createAIKnowledgeBasePayload({
        ...localValues,
        local_model_id: ' BAAI/bge-small-zh-v1.5 ',
      }),
    ).toEqual({
      name: 'Project docs',
      description: 'Reference material',
      provider_id: null,
      model_id: 'BAAI/bge-small-zh-v1.5',
    });
  });
});

describe('editing and resetting knowledge bindings', () => {
  it.each([
    { provider_id: null, model_id: null, mode: 'default' },
    { provider_id: null, model_id: '', mode: 'default' },
    { provider_id: null, model_id: 'BAAI/bge-small-zh-v1.5', mode: 'local' },
    { provider_id: 7, model_id: 'text-embedding-3-small', mode: 'remote' },
    { provider_id: 7, model_id: null, mode: 'remote' },
  ])('infers $mode when editing $provider_id / $model_id', (binding) => {
    const values = toAIKnowledgeBaseFormValues({
      name: 'Project docs',
      provider_id: binding.provider_id,
      model_id: binding.model_id,
    });
    expect(values.embedding_mode).toBe(binding.mode);
    expect(createAIKnowledgeBasePayload(values)).toEqual({
      name: 'Project docs',
      description: null,
      provider_id: binding.provider_id,
      model_id: binding.model_id || null,
    });
  });

  it('opens a new base with clean defaults after editing a local base', () => {
    const edited = toAIKnowledgeBaseFormValues({
      name: 'Project docs',
      model_id: 'BAAI/bge-small-zh-v1.5',
    });
    const reopened = { ...edited, ...toAIKnowledgeBaseFormValues() };
    expect(reopened).toEqual({
      name: '',
      description: '',
      embedding_mode: 'default',
      provider_id: undefined,
      model_id: undefined,
      local_model_id: undefined,
    });
  });

  it('clears remote selections when switching to local and requires a new local choice', () => {
    const changed = {
      ...remoteValues,
      ...resetKnowledgeEmbeddingBinding('local'),
    };
    expect(changed.name).toBe(remoteValues.name);
    expect(changed.description).toBe(remoteValues.description);
    expect(createAIKnowledgeBasePayload(changed)).toMatchObject({
      provider_id: null,
      model_id: null,
    });
    expect(getKnowledgeEmbeddingIssue(changed, availableBindings)).toBe(
      'localModelRequired',
    );
  });

  it('clears the local selection when returning to default', () => {
    const changed = {
      ...localValues,
      ...resetKnowledgeEmbeddingBinding('default'),
    };
    expect(changed.local_model_id).toBeUndefined();
    expect(createAIKnowledgeBasePayload(changed)).toMatchObject({
      provider_id: null,
      model_id: null,
    });
    expect(
      getKnowledgeEmbeddingIssue(changed, availableBindings),
    ).toBeUndefined();
  });

  it.each([8, undefined])(
    'requires a new model after changing the provider to %s',
    (providerId) => {
      const changed = {
        ...remoteValues,
        ...resetKnowledgeEmbeddingBinding('remote', providerId),
      };
      expect(changed.provider_id).toBe(providerId);
      expect(changed.model_id).toBeUndefined();
      expect(changed.local_model_id).toBeUndefined();
      expect(getKnowledgeEmbeddingIssue(changed, availableBindings)).toBe(
        'remotePairRequired',
      );
    },
  );
});

describe('knowledge binding validation', () => {
  it.each([
    { local_model_id: undefined, issue: 'localModelRequired' },
    { local_model_id: ' ', issue: 'localModelRequired' },
    { local_model_id: 'removed/model', issue: 'localModelUnavailable' },
    {
      local_model_id: 'intfloat/multilingual-e5-large',
      issue: 'localModelUndownloaded',
    },
  ])('rejects a local selection with $issue', ({ local_model_id, issue }) => {
    expect(
      getKnowledgeEmbeddingIssue(
        { ...localValues, local_model_id },
        availableBindings,
      ),
    ).toBe(issue);
  });

  it('allows a local model only after the catalog confirms its download', () => {
    const values = {
      ...localValues,
      local_model_id: 'intfloat/multilingual-e5-large',
    };
    expect(getKnowledgeEmbeddingIssue(values, availableBindings)).toBe(
      'localModelUndownloaded',
    );
    const refreshed = {
      ...availableBindings,
      localModels: [{ id: 'intfloat/multilingual-e5-large', downloaded: true }],
    };
    expect(getKnowledgeEmbeddingIssue(values, refreshed)).toBeUndefined();
  });

  it.each([
    { provider_id: undefined, model_id: 'text-embedding-3-small' },
    { provider_id: 7, model_id: undefined },
    { provider_id: 7, model_id: '  ' },
  ])(
    'rejects an incomplete remote pair: $provider_id / $model_id',
    (binding) => {
      expect(
        getKnowledgeEmbeddingIssue(
          { ...remoteValues, ...binding },
          availableBindings,
        ),
      ).toBe('remotePairRequired');
    },
  );

  it.each([
    { provider_id: 8, model_id: 'text-embedding-3-small' },
    { provider_id: 7, model_id: 'disabled-or-chat-model' },
  ])(
    'rejects a remote binding absent from the enabled embedding options',
    (binding) => {
      expect(
        getKnowledgeEmbeddingIssue(
          { ...remoteValues, ...binding },
          availableBindings,
        ),
      ).toBe('remoteBindingUnavailable');
    },
  );

  it('accepts an enabled remote embedding pair', () => {
    expect(
      getKnowledgeEmbeddingIssue(remoteValues, availableBindings),
    ).toBeUndefined();
  });
});
