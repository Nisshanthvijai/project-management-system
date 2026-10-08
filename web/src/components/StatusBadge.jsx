const COLORS = {
  NOT_STARTED: 'bg-slate-100 text-slate-700',
  PENDING: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ value, label }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[value] || COLORS.PENDING}`}>
      {label}
    </span>
  );
}
