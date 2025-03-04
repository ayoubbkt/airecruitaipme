import React from 'react';
import { Link } from 'react-router-dom';
import { useUsers } from '../../contexts/UserContext.jsx'; // Update the import
import { DashboardIcon, FileTextIcon } from '@heroicons/react/outline'; // Example icons

const Sidebar = ({ collapsed }) => {
  const { user } = useUsers(); // Safely access user

  const navItems = [
    {
      path: '/',
      label: 'Tableau de bord',
      icon: <DashboardIcon size={20} />,
    },
    {
      path: '/cv-analysis',
      label: 'Analyse des CV',
      icon: <FileTextIcon size={20} />,
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