import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',          icon: '◈', label: 'Dashboard' },
  { to: '/products',  icon: '⬡', label: 'Products'  },
  { to: '/customers', icon: '◉', label: 'Customers' },
  { to: '/orders',    icon: '◷', label: 'Orders'    },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Invent<span>IQ</span></h1>
        <p>Management System</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-label">Navigation</div>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            <span className="icon">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p>InventIQ v1.0</p>
      </div>
    </aside>
  );
}
