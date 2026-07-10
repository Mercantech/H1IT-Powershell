import { course } from '../../data/course';
import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

const navItems = [
  { to: '/', label: 'Forside', end: true },
  { to: '/dag-1', label: 'Dag 1', end: false },
  { to: '/dag-2', label: 'Dag 2', end: false },
  { to: '/projekt', label: 'Projektkobling', end: false },
  { to: '/ordbog', label: 'Ordbog', end: false },
  { to: '/lokalt', label: 'Lokale opgaver', end: false },
];

export function Layout() {
  return (
    <div className="layout">
      <header className="ps-header">
        <div className="ps-header-inner">
          <div className="ps-titlebar">
            <span className="ps-window-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </span>
            <span className="ps-title">
              {course.fullName} · {course.topic}
            </span>
          </div>
          <nav className="ps-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? 'ps-nav-link active' : 'ps-nav-link'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="ps-footer">
        <p>
          {course.fullName} · {course.program} · {course.teachingPeriod} ·
          Infrastrukturprojekt
        </p>
      </footer>
    </div>
  );
}
