import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-indigo-700">Project Manager</span>
            <nav className="flex gap-1">
              <NavLink to="/" end className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/projects" className={linkClass}>
                Projects
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">{user.fullName}</span>
            <button onClick={handleLogout} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
