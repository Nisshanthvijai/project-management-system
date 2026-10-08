import { useState } from 'react';
import { PROJECT_STATUSES } from '../lib/constants.js';
import { errorText, toDateInput } from '../lib/format.js';
import ErrorMessage from './ErrorMessage.jsx';
import FormField, { inputClass, primaryButton, secondaryButton } from './FormField.jsx';

export default function ProjectForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    status: initial?.status ?? 'NOT_STARTED',
    startDate: toDateInput(initial?.startDate),
    endDate: toDateInput(initial?.endDate),
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  const validate = () => {
    const e = {};
    if (!values.name.trim()) e.name = 'Project name is required';
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      e.endDate = 'End date cannot be before start date';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setServerError('');
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim() || null,
        status: values.status,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
      });
    } catch (err) {
      setServerError(errorText(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <ErrorMessage error={serverError} />
      <FormField label="Project name" error={errors.name}>
        <input className={inputClass} value={values.name} onChange={set('name')} maxLength={200} />
      </FormField>
      <FormField label="Description">
        <textarea className={inputClass} rows={3} value={values.description} onChange={set('description')} />
      </FormField>
      <FormField label="Status">
        <select className={inputClass} value={values.status} onChange={set('status')}>
          {PROJECT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Start date">
          <input type="date" className={inputClass} value={values.startDate} onChange={set('startDate')} />
        </FormField>
        <FormField label="End date" error={errors.endDate}>
          <input type="date" className={inputClass} value={values.endDate} onChange={set('endDate')} />
        </FormField>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? 'Saving...' : 'Save project'}
        </button>
      </div>
    </form>
  );
}
