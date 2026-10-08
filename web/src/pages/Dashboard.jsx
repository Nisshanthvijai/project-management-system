import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Spinner from '../components/Spinner.jsx';

const CARDS = [
  { key: 'totalProjects', label: 'Total Projects' },
  { key: 'totalTasks', label: 'Total Tasks' },
  { key: 'completedTasks', label: 'Completed Tasks' },
  { key: 'pendingTasks', label: 'Pending Tasks' },
  { key: 'projectsInProgress', label: 'Projects In Progress' },
];

export default function Dashboard() {
  const { data, loading, error, reload } = useApi(() => api.getDashboard(), []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <ErrorMessage error={error} onRetry={reload} />
      {loading && !data && <Spinner />}
      {data && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {CARDS.map((c) => (
            <div key={c.key} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="text-3xl font-bold text-indigo-700">{data.data[c.key]}</div>
              <div className="mt-1 text-sm text-slate-600">{c.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
