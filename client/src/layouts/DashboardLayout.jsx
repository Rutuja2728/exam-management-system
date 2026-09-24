import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ title, links, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <strong>Exam Desk</strong>
          <span>Timetable Manager</span>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="btn btn-ghost logout" onClick={logout}>
          Logout
        </button>
      </aside>
      <div className="main">
        <header className="topbar">
          <h1>{title}</h1>
          <div className="user-chip">
            <span>{user?.name}</span>
            <small>{user?.role}</small>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
