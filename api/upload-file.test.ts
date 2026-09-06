import { describe, expect, it } from 'vitest';

import {
  createUploadFormData,
  getUploadFilename,
  takeInputFiles,
} from './upload-file';

function createFile(name: string, relativePath = ''): File {
  const file = new File(['ok'], name, { type: 'text/plain' });
  Object.defineProperty(file, 'webkitRelativePath', {
    value: relativePath,
  });
  return file;
}

describe('getUploadFilename', () => {
  it('prefers the directory relative path', () => {
    expect(
      getUploadFilename(createFile('SKILL.md', 'code-review/SKILL.md')),
    ).toBe('code-review/SKILL.md');
    expect(getUploadFilename(createFile('notes.md'))).toBe('notes.md');
  });
});

describe('takeInputFiles', () => {
  it('copies files before the input is reset', () => {
    const file = createFile('接口规范.md');
    const input = {
      files: { 0: file, length: 1 },
      value: '接口规范.md',
    } as unknown as HTMLInputElement;

    expect(takeInputFiles(input)).toEqual([file]);
    expect(input.value).toBe('');
  });
});

describe('createUploadFormData', () => {
  it('repeats the file field and keeps relative names', () => {
    const formData = createUploadFormData(
      [
        createFile('接口规范.md', 'docs/接口规范.md'),
        createFile('请假制度.txt', 'docs/请假制度.txt'),
      ],
      { title: '文档' },
    );

    expect(formData.getAll('file').map((item) => (item as File).name)).toEqual([
      'docs/接口规范.md',
      'docs/请假制度.txt',
    ]);
    expect(formData.get('title')).toBe('文档');
  });
});
