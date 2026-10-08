import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { PROJECT_STATUSES, labelFor } from '../lib/constants.js';
import { errorText, formatDate } from '../lib/format.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Modal from '../components/Modal.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import Spinner from '../components/Spinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { inputClass, primaryButton } from '../components/FormField.jsx';

export default function Projects() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | project object
  const [actionError, setActionError] = useState('');
  const debouncedSearch = useDebounce(search);

  const { data, loading, error, reload } = useApi(
    () => api.getProjects({ search: debouncedSearch, status, limit: 100 }),
    [debouncedSearch, status],
  );
  const projects = data?.data ?? [];

  const handleSave = async (values) => {
    if (editing === 'new') await api.createProject(values);
    else await api.updateProject(editing.id, values);
    setEditing(null);
    reload();
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete "${project.name}" and all its tasks?`)) return;
    setActionError('');
    try {
      await api.deleteProject(project.id);
      reload();
    } catch (err) {
      setActionError(errorText(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <button onClick={() => setEditing('new')} className={primaryButton}>
          + New project
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className={inputClass}
          placeholder="Search projects by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={`${inputClass} sm:w-48`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <ErrorMessage error={actionError} />
      <ErrorMessage error={error} onRetry={reload} />
      {loading && !data && <Spinner />}
      {data && projects.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-center text-slate-500">No projects found.</p>
      )}

      <div className="grid gap-3">
        {projects.map((p) => (
          <div key={p.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link to={`/projects/${p.id}`} className="text-lg font-medium text-indigo-700 hover:underline">
                  {p.name}
                </Link>
                <p className="mt-1 text-sm text-slate-600">{p.description || 'No description'}</p>
              </div>
              <StatusBadge value={p.status} label={labelFor(PROJECT_STATUSES, p.status)} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
              <span>
                {formatDate(p.startDate)} → {formatDate(p.endDate)} · {p._count.tasks} task(s)
              </span>
              <span className="flex gap-3">
                <button onClick={() => setEditing(p)} className="text-indigo-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(p)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </span>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'New project' : 'Edit project'} onClose={() => setEditing(null)}>
          <ProjectForm
            initial={editing === 'new' ? null : editing}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}
