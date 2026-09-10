import { describe, expect, it } from 'vitest';

import {
  collectDataTransferFiles,
  createUploadFormData,
  getKnowledgeUploadIssue,
  getSkillUploadIssue,
  getUploadFilename,
  getUploadPreviewNames,
  sanitizeUploadFiles,
  takeInputFiles,
  takeKnowledgeUploadFiles,
  withUploadRelativePath,
} from './upload-file';

function createFile(name: string, relativePath = ''): File {
  const file = new File(['ok'], name, { type: 'text/plain' });
  Object.defineProperty(file, 'webkitRelativePath', {
    value: relativePath,
  });
  return file;
}

function asFileList(files: File[]): FileList {
  const list = [...files] as File[] & {
    item: (index: number) => File | null;
  };
  list.item = (index) => list[index] ?? null;
  return list as unknown as FileList;
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
      files: asFileList([file]),
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

describe('sanitizeUploadFiles', () => {
  it('drops hidden and macos metadata files', () => {
    expect(
      sanitizeUploadFiles([
        createFile('.DS_Store', 'code-review/.DS_Store'),
        createFile('ignored.txt', '__MACOSX/ignored.txt'),
        createFile('SKILL.md', 'code-review/SKILL.md'),
      ]).map((file) => getUploadFilename(file)),
    ).toEqual(['code-review/SKILL.md']);
  });
});

describe('takeKnowledgeUploadFiles', () => {
  it('keeps markdown, text, and zip files', () => {
    expect(
      takeKnowledgeUploadFiles([
        createFile('notes.md', 'docs/notes.md'),
        createFile('readme.txt'),
        createFile('archive.zip'),
        createFile('image.png'),
        createFile('.DS_Store'),
      ]).map((file) => file.name),
    ).toEqual(['notes.md', 'readme.txt', 'archive.zip']);
  });
});

describe('upload issues', () => {
  it('requires a skill zip or a folder that contains SKILL.md', () => {
    expect(getSkillUploadIssue([])).toBe('empty');
    expect(getSkillUploadIssue([createFile('demo.zip')])).toBeUndefined();
    expect(
      getSkillUploadIssue([
        createFile('SKILL.md', 'code-review/SKILL.md'),
        createFile('lint.py', 'code-review/scripts/lint.py'),
      ]),
    ).toBeUndefined();
    expect(getSkillUploadIssue([createFile('SKILL.md')])).toBe(
      'missing-skill-md',
    );
  });

  it('rejects empty or unsupported knowledge files', () => {
    expect(getKnowledgeUploadIssue([])).toBe('empty');
    expect(getKnowledgeUploadIssue([createFile('notes.md')])).toBeUndefined();
    expect(getKnowledgeUploadIssue([createFile('image.png')])).toBe(
      'unsupported',
    );
  });
});

describe('getUploadPreviewNames', () => {
  it('keeps a short list and reports extra files', () => {
    expect(
      getUploadPreviewNames([
        createFile('a.md'),
        createFile('b.md'),
        createFile('c.md'),
      ]),
    ).toEqual({ extra: 0, names: ['a.md', 'b.md', 'c.md'] });
    expect(
      getUploadPreviewNames(
        [
          createFile('a.md'),
          createFile('b.md'),
          createFile('c.md'),
          createFile('d.md'),
          createFile('e.md'),
        ],
        3,
      ),
    ).toEqual({ extra: 2, names: ['a.md', 'b.md', 'c.md'] });
  });
});

describe('collectDataTransferFiles', () => {
  it('falls back to dataTransfer.files', async () => {
    const file = createFile('notes.md');
    const files = await collectDataTransferFiles({
      files: asFileList([file]),
      items: [],
    } as unknown as DataTransfer);

    expect(files).toEqual([file]);
  });

  it('reads dropped directories through webkit entries', async () => {
    const skill = createFile('SKILL.md');
    const files = await collectDataTransferFiles({
      files: asFileList([]),
      items: [
        {
          webkitGetAsEntry: () => ({
            createReader: () => {
              let remaining: Array<Record<string, unknown>> = [
                {
                  file: (success: (file: File) => void) => success(skill),
                  isDirectory: false,
                  isFile: true,
                  name: 'SKILL.md',
                },
              ];
              return {
                readEntries: (success: (entries: unknown[]) => void) => {
                  const batch = remaining;
                  remaining = [];
                  success(batch);
                },
              };
            },
            isDirectory: true,
            isFile: false,
            name: 'code-review',
          }),
        },
      ],
    } as unknown as DataTransfer);

    expect(files.map((file) => getUploadFilename(file))).toEqual([
      'code-review/SKILL.md',
    ]);
  });
});

describe('withUploadRelativePath', () => {
  it('writes the relative path used by directory uploads', () => {
    const file = createFile('SKILL.md');
    expect(
      getUploadFilename(withUploadRelativePath(file, 'code-review/SKILL.md')),
    ).toBe('code-review/SKILL.md');
  });
});
