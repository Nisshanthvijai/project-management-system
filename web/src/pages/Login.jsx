import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import FormField, { inputClass, primaryButton } from '../components/FormField.jsx';
import { errorText } from '../lib/format.js';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  // Message left by the API client when a token expired.
  const [notice] = useState(() => {
    const msg = sessionStorage.getItem('authMessage');
    sessionStorage.removeItem('authMessage');
    return msg;
  });
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!/^\S+@\S+\.\S+$/.test(values.email)) v.email = 'Enter a valid email address';
    if (!values.password) v.password = 'Password is required';
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    setServerError('');
    try {
      await login(values);
      navigate('/');
    } catch (err) {
      setServerError(errorText(err));
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Log in</h1>
        {notice && <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{notice}</div>}
        <ErrorMessage error={serverError} />
        <FormField label="Email" error={errors.email}>
          <input
            type="email"
            className={inputClass}
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
          />
        </FormField>
        <FormField label="Password" error={errors.password}>
          <input
            type="password"
            className={inputClass}
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
          />
        </FormField>
        <button type="submit" disabled={saving} className={`${primaryButton} w-full`}>
          {saving ? 'Logging in...' : 'Log in'}
        </button>
        <p className="text-center text-sm text-slate-600">
          No account?{' '}
          <Link to="/register" className="font-medium text-indigo-600">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
