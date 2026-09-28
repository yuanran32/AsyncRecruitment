export function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', { hour12: false });
}

export function displayText(value?: string | number | boolean | null) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }
  return String(value);
}

export function formatPercent(rate?: number | null, digits = 1) {
  if (rate == null || Number.isNaN(Number(rate))) {
    return '0%';
  }
  return `${(Number(rate) * 100).toFixed(digits).replace(/\.0+$/, '')}%`;
}

export function formatBytes(size?: number | null) {
  if (size == null || Number.isNaN(Number(size))) {
    return '—';
  }
  const value = Number(size);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
