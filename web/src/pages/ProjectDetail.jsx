import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { PRIORITIES, PROJECT_STATUSES, TASK_STATUSES, labelFor } from '../lib/constants.js';
import { errorText, formatDate } from '../lib/format.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Modal from '../components/Modal.jsx';
import Spinner from '../components/Spinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TaskForm from '../components/TaskForm.jsx';
import { inputClass, primaryButton } from '../components/FormField.jsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | task object
  const [actionError, setActionError] = useState('');
  const debouncedSearch = useDebounce(search);

  const project = useApi(() => api.getProject(id), [id]);
  const tasks = useApi(
    () => api.getTasks({ projectId: id, search: debouncedSearch, status, priority, limit: 100 }),
    [id, debouncedSearch, status, priority],
  );
  const taskList = tasks.data?.data ?? [];

  const runAction = async (fn) => {
    setActionError('');
    try {
      await fn();
      tasks.reload();
    } catch (err) {
      setActionError(errorText(err));
    }
  };

  const handleSave = async (values) => {
    if (editing === 'new') await api.createTask({ ...values, projectId: id });
    else await api.updateTask(editing.id, values);
    setEditing(null);
    tasks.reload();
  };

  const toggleComplete = (task) =>
    runAction(() => api.updateTask(task.id, { status: task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }));

  const handleDelete = (task) => {
    if (!window.confirm(`Delete task "${task.name}"?`)) return;
    runAction(() => api.deleteTask(task.id));
  };

  if (project.loading && !project.data) return <Spinner />;
  if (project.error) {
    return (
      <div className="space-y-3">
        <ErrorMessage error={project.error.status === 404 ? 'Project not found' : project.error} onRetry={project.reload} />
        <Link to="/projects" className="text-indigo-600 hover:underline">
          ← Back to projects
        </Link>
      </div>
    );
  }

  const p = project.data.data;

  return (
    <div className="space-y-4">
      <Link to="/projects" className="text-sm text-indigo-600 hover:underline">
        ← Back to projects
      </Link>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-2xl font-semibold">{p.name}</h1>
          <StatusBadge value={p.status} label={labelFor(PROJECT_STATUSES, p.status)} />
        </div>
        <p className="mt-2 text-slate-600">{p.description || 'No description'}</p>
        <p className="mt-3 text-sm text-slate-500">
          {formatDate(p.startDate)} → {formatDate(p.endDate)} · Created {formatDate(p.createdAt)}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <button onClick={() => setEditing('new')} className={primaryButton}>
          + New task
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className={inputClass}
          placeholder="Search tasks by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={`${inputClass} sm:w-44`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select className={`${inputClass} sm:w-44`} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <ErrorMessage error={actionError} />
      <ErrorMessage error={tasks.error} onRetry={tasks.reload} />
      {tasks.loading && !tasks.data && <Spinner />}
      {tasks.data && taskList.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-center text-slate-500">No tasks found.</p>
      )}

      <div className="grid gap-3">
        {taskList.map((t) => (
          <div key={t.id} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={t.status === 'COMPLETED'}
              onChange={() => toggleComplete(t)}
              aria-label={`Mark "${t.name}" as completed`}
            />
            <div className="flex-1">
              <div className={`font-medium ${t.status === 'COMPLETED' ? 'text-slate-400 line-through' : ''}`}>{t.name}</div>
              {t.description && <p className="mt-1 text-sm text-slate-600">{t.description}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <StatusBadge value={t.status} label={labelFor(TASK_STATUSES, t.status)} />
                <StatusBadge value={t.priority} label={`${labelFor(PRIORITIES, t.priority)} priority`} />
                <span>Due {formatDate(t.dueDate)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <button onClick={() => setEditing(t)} className="text-indigo-600 hover:underline">
                Edit
              </button>
              <button onClick={() => handleDelete(t)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'New task' : 'Edit task'} onClose={() => setEditing(null)}>
          <TaskForm initial={editing === 'new' ? null : editing} onSubmit={handleSave} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
