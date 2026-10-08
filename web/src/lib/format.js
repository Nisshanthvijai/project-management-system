export const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '—');

// Converts an ISO timestamp to the "YYYY-MM-DD" string a date input expects.
export const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '');

// Turns an API error into one readable sentence (includes field-level details if present).
export const errorText = (err) =>
  err?.details?.length ? err.details.map((d) => d.message).join('. ') : err?.message || 'Something went wrong';
