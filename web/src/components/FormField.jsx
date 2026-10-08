export default function FormField({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';
export const primaryButton =
  'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60';
export const secondaryButton =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50';
