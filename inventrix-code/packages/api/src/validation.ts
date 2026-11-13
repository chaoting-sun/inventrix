export const isPositiveInteger = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
};

export const MAX_INT4 = 2147483647;

// PostgreSQL rejects a non-numeric or out-of-range value for an INTEGER column with an error, not an empty result.
export const parseId = (raw: string): number | null => {
  if (!/^\d+$/.test(raw)) {
    return null;
  }
  const id = Number(raw);
  return id > 0 && id <= MAX_INT4 ? id : null;
};
