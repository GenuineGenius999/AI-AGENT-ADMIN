import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function DashboardLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">Bot Service</span>
          <p className="muted tiny">{user?.email}</p>
        </div>
        <nav>
          <NavLink to="/keys">API Keys & Usage</NavLink>
          <NavLink to="/profile">Bot Profile</NavLink>
          <NavLink to="/playground">Playground</NavLink>
        </nav>
        <button type="button" className="btn ghost sidebar-out" onClick={() => signOut()}>
          Sign out
        </button>
      </aside>
      <main className="main-pane">
        <Outlet />
      </main>
    </div>
  );
}
