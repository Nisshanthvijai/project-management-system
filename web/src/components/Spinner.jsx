export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 p-8 text-slate-500" role="status">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      <span>{label}</span>
    </div>
  );
}
