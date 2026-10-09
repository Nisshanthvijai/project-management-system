export const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '—');

// ISO timestamp -> "YYYY-MM-DD" for the date text input.
export const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '');

// True for an empty string or a real calendar date written as YYYY-MM-DD.
export function isValidDateInput(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export const errorText = (err) =>
  err?.details?.length ? err.details.map((d) => d.message).join('. ') : err?.message || 'Something went wrong';
