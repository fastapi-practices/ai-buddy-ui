export function formatOnnxSize(sizeGb: number | null | undefined): string {
  if (sizeGb == null || Number.isNaN(Number(sizeGb))) {
    return '大小未知';
  }
  const gb = Number(sizeGb);
  if (gb >= 1) {
    const text = Number.isInteger(gb)
      ? String(gb)
      : String(Number(gb.toFixed(2)));
    return `约 ${text} G`;
  }
  return `约 ${Math.round(gb * 1024)} MB`;
}
