import { useState } from 'react';
import { PRIORITIES, TASK_STATUSES } from '../lib/constants.js';
import { errorText, toDateInput } from '../lib/format.js';
import ErrorMessage from './ErrorMessage.jsx';
import FormField, { inputClass, primaryButton, secondaryButton } from './FormField.jsx';

export default function TaskForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    priority: initial?.priority ?? 'MEDIUM',
    status: initial?.status ?? 'PENDING',
    dueDate: toDateInput(initial?.dueDate),
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setErrors({ name: 'Task name is required' });
      return;
    }
    setErrors({});
    setSaving(true);
    setServerError('');
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim() || null,
        priority: values.priority,
        status: values.status,
        dueDate: values.dueDate || null,
      });
    } catch (err) {
      setServerError(errorText(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <ErrorMessage error={serverError} />
      <FormField label="Task name" error={errors.name}>
        <input className={inputClass} value={values.name} onChange={set('name')} maxLength={200} />
      </FormField>
      <FormField label="Description">
        <textarea className={inputClass} rows={3} value={values.description} onChange={set('description')} />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Priority">
          <select className={inputClass} value={values.priority} onChange={set('priority')}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Status">
          <select className={inputClass} value={values.status} onChange={set('status')}>
            {TASK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Due date">
        <input type="date" className={inputClass} value={values.dueDate} onChange={set('dueDate')} />
      </FormField>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? 'Saving...' : 'Save task'}
        </button>
      </div>
    </form>
  );
}
