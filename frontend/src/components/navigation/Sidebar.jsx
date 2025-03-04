import React from 'react';
import { Link } from 'react-router-dom';
import { useUsers } from '../../contexts/UserContext.jsx';
import { ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline'; // Updated import path

const Sidebar = ({ collapsed }) => {
  const { user } = useUsers();

  const navItems = [
    {
      path: '/',
      label: 'Tableau de bord',
      icon: <ChartBarIcon className="h-5 w-5" />, // Updated icon name
    },
    {
      path: '/cv-analysis',
      label: 'Analyse des CV',
      icon: <DocumentTextIcon className="h-5 w-5" />, // Updated icon name
    },
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>RecruitPME</h2>
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        {user ? (
          <p>Logged in as: {user.name}</p>
        ) : (
          <p>Not logged in</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;