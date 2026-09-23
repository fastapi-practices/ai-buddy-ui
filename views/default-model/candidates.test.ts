import { describe, expect, it } from 'vitest';

import { filterDefaultCandidates } from './candidates';

describe('filterDefaultCandidates', () => {
  it('only lists enabled models accepted by the backend', () => {
    const models = [
      { id: 1, status: 1, model_id: 'supported' },
      { id: 2, status: 1, model_id: 'unsupported' },
      { id: 3, status: 0, model_id: 'disabled' },
    ];

    expect(filterDefaultCandidates(models, [1, 3])).toEqual([models[0]]);
    expect(filterDefaultCandidates(models, [])).toEqual([]);
  });
});
