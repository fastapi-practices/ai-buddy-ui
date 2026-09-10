const KNOWLEDGE_EXTS = new Set(['md', 'markdown', 'txt', 'text', 'zip']);
const uploadRelativePaths = new WeakMap<File, string>();

interface UploadFileSystemReader {
  readEntries: (
    successCallback: (entries: UploadFileSystemEntry[]) => void,
    errorCallback?: (error: DOMException) => void,
  ) => void;
}

interface UploadFileSystemEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  file?: (
    successCallback: (file: File) => void,
    errorCallback?: (error: DOMException) => void,
  ) => void;
  createReader?: () => UploadFileSystemReader;
}

export function getUploadFilename(file: File): string {
  const mapped = uploadRelativePaths.get(file);
  if (mapped) {
    return mapped;
  }
  return file.webkitRelativePath.replaceAll('\\', '/').trim() || file.name;
}

export function takeInputFiles(input: HTMLInputElement): File[] {
  const files = input.files ? [...input.files] : [];
  input.value = '';
  return sanitizeUploadFiles(files);
}

export function createUploadFormData(
  files: File[],
  fields?: Record<string, string>,
): FormData {
  const formData = new FormData();
  for (const file of files) {
    formData.append('file', file, getUploadFilename(file));
  }
  if (fields) {
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value);
    }
  }
  return formData;
}

export function withUploadRelativePath(file: File, relativePath: string): File {
  const path = relativePath.replaceAll('\\', '/').replace(/^\/+/u, '').trim();
  if (path) {
    uploadRelativePaths.set(file, path);
  }
  return file;
}

export function getUploadExtension(file: File): string {
  const base = getUploadFilename(file).split('/').pop() ?? '';
  const index = base.lastIndexOf('.');
  if (index <= 0 || index === base.length - 1) {
    return '';
  }
  return base.slice(index + 1).toLowerCase();
}

export function isZipUploadFile(file: File): boolean {
  return getUploadExtension(file) === 'zip';
}

export function isKnowledgeUploadFile(file: File): boolean {
  return KNOWLEDGE_EXTS.has(getUploadExtension(file));
}

export function shouldIgnoreUploadPath(path: string): boolean {
  return path
    .replaceAll('\\', '/')
    .split('/')
    .filter(Boolean)
    .some((part) => part === '__MACOSX' || part.startsWith('.'));
}

export function sanitizeUploadFiles(files: File[]): File[] {
  return files.filter(
    (file) => !shouldIgnoreUploadPath(getUploadFilename(file)),
  );
}

export function takeKnowledgeUploadFiles(files: File[]): File[] {
  return sanitizeUploadFiles(files).filter((file) =>
    isKnowledgeUploadFile(file),
  );
}

export type UploadFileIssue = 'empty' | 'missing-skill-md' | 'unsupported';

export function getKnowledgeUploadIssue(
  files: File[],
): Extract<UploadFileIssue, 'empty' | 'unsupported'> | undefined {
  if (files.length === 0) {
    return 'empty';
  }
  return files.every((file) => isKnowledgeUploadFile(file))
    ? undefined
    : 'unsupported';
}

export function getSkillUploadIssue(
  files: File[],
): Extract<UploadFileIssue, 'empty' | 'missing-skill-md'> | undefined {
  if (files.length === 0) {
    return 'empty';
  }
  const [onlyFile] = files;
  if (files.length === 1 && onlyFile && isZipUploadFile(onlyFile)) {
    return undefined;
  }
  const hasSkillMarkdown = files.some((file) => {
    const parts = getUploadFilename(file).split('/').filter(Boolean);
    return parts.length >= 2 && parts.at(-1)?.toLowerCase() === 'skill.md';
  });
  return hasSkillMarkdown ? undefined : 'missing-skill-md';
}

export function getUploadPreviewNames(
  files: File[],
  limit = 4,
): { extra: number; names: string[] } {
  const names = files.map((file) => getUploadFilename(file));
  if (names.length <= limit) {
    return { extra: 0, names };
  }
  return {
    extra: names.length - limit,
    names: names.slice(0, limit),
  };
}

export async function collectDataTransferFiles(
  dataTransfer: DataTransfer,
): Promise<File[]> {
  const items = dataTransfer.items ? [...dataTransfer.items] : [];
  const entries: UploadFileSystemEntry[] = [];
  for (const item of items) {
    const entry = item.webkitGetAsEntry?.() as null | UploadFileSystemEntry;
    if (entry) {
      entries.push(entry);
    }
  }

  if (entries.length > 0) {
    const files: File[] = [];
    for (const entry of entries) {
      files.push(...(await readFileSystemEntry(entry)));
    }
    return sanitizeUploadFiles(files);
  }

  return sanitizeUploadFiles(dataTransfer.files ? [...dataTransfer.files] : []);
}

async function readFileSystemEntry(
  entry: UploadFileSystemEntry,
  prefix = '',
): Promise<File[]> {
  if (entry.isFile) {
    const file = await readFileEntry(entry);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    return [withUploadRelativePath(file, relative)];
  }
  if (!entry.isDirectory || !entry.createReader) {
    return [];
  }
  const children = await readDirectoryEntries(entry.createReader());
  const nextPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
  const files: File[] = [];
  for (const child of children) {
    files.push(...(await readFileSystemEntry(child, nextPrefix)));
  }
  return files;
}

function readFileEntry(entry: UploadFileSystemEntry): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!entry.file) {
      reject(new Error('invalid file entry'));
      return;
    }
    entry.file(resolve, reject);
  });
}

function readDirectoryEntries(
  reader: UploadFileSystemReader,
): Promise<UploadFileSystemEntry[]> {
  const entries: UploadFileSystemEntry[] = [];
  return new Promise((resolve, reject) => {
    const readBatch = () => {
      reader.readEntries((batch) => {
        if (batch.length === 0) {
          resolve(entries);
          return;
        }
        entries.push(...batch);
        readBatch();
      }, reject);
    };
    readBatch();
  });
}
