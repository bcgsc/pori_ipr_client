const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `"${key}":${stableStringify(
      (value as Record<string, unknown>)[key],
    )}`)
    .join(',')}}`;
};
export const deepRemoveDuplicate = <T>(arr: T[]): T[] => [...new Map(arr.map((item) => [stableStringify(item), item])).values()];
