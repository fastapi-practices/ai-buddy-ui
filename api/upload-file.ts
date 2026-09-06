export function getUploadFilename(file: File): string {
  return file.webkitRelativePath.replaceAll('\\', '/').trim() || file.name;
}

export function takeInputFiles(input: HTMLInputElement): File[] {
  const files = Array.from(input.files ?? []);
  input.value = '';
  return files;
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
