import { describe, expect, it } from 'vitest';

import { readOptionalDefaultModelResponse } from './response';

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status });
}

describe('readOptionalDefaultModelResponse', () => {
  it('returns data for a successful default model payload', async () => {
    await expect(
      readOptionalDefaultModelResponse(
        jsonResponse({ code: 200, data: { model_id: 'gpt' }, msg: 'ok' }),
      ),
    ).resolves.toEqual({ model_id: 'gpt' });
  });

  it('treats missing and disabled default models as empty', async () => {
    await expect(
      readOptionalDefaultModelResponse(jsonResponse({ code: 404 }, 404)),
    ).resolves.toBeNull();
    await expect(
      readOptionalDefaultModelResponse(
        jsonResponse({ code: 400, msg: '默认模型配置已停用' }, 400),
      ),
    ).resolves.toBeNull();
    await expect(
      readOptionalDefaultModelResponse(
        jsonResponse({ code: 400, msg: '默认模型供应商已停用' }),
      ),
    ).resolves.toBeNull();
  });

  it('still throws unexpected failures', async () => {
    await expect(
      readOptionalDefaultModelResponse(
        jsonResponse({ code: 500, msg: 'boom' }, 500),
      ),
    ).rejects.toThrow('boom');
  });
});
