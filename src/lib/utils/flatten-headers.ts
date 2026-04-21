export function flattenHeaders(
  headers: Record<string, string | string[] | number | undefined>,
): string[] {
  const flat: string[] = [];
  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) flat.push(name, String(item));
    } else {
      flat.push(name, String(value));
    }
  }
  return flat;
}
