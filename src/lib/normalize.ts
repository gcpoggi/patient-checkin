export function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(-10);
}

export function isSameDate(a: string, b: string): boolean {
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDate.test(a) || !isoDate.test(b)) return false;

  const left = new Date(`${a}T00:00:00.000Z`);
  const right = new Date(`${b}T00:00:00.000Z`);
  return (
    !Number.isNaN(left.getTime()) &&
    !Number.isNaN(right.getTime()) &&
    left.toISOString().slice(0, 10) === a &&
    right.toISOString().slice(0, 10) === b &&
    left.getTime() === right.getTime()
  );
}
