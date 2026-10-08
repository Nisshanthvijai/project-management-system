import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import FormField, { inputClass, primaryButton } from '../components/FormField.jsx';
import { errorText } from '../lib/format.js';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!values.fullName.trim()) v.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(values.email)) v.email = 'Enter a valid email address';
    if (values.password.length < 8) v.password = 'Password must be at least 8 characters';
    else if (!/[A-Za-z]/.test(values.password) || !/[0-9]/.test(values.password)) {
      v.password = 'Password needs at least one letter and one number';
    }
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    setServerError('');
    try {
      await register({ ...values, fullName: values.fullName.trim() });
      navigate('/');
    } catch (err) {
      setServerError(errorText(err));
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Create account</h1>
        <ErrorMessage error={serverError} />
        <FormField label="Full name" error={errors.fullName}>
          <input className={inputClass} value={values.fullName} onChange={set('fullName')} />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <input type="email" className={inputClass} value={values.email} onChange={set('email')} />
        </FormField>
        <FormField label="Password" error={errors.password}>
          <input type="password" className={inputClass} value={values.password} onChange={set('password')} />
        </FormField>
        <button type="submit" disabled={saving} className={`${primaryButton} w-full`}>
          {saving ? 'Creating account...' : 'Register'}
        </button>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
