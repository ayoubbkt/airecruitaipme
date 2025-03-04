import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUsers } from '../../contexts/UserContext.jsx';

const PrivateRoute = () => {
  const { user } = useUsers();

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;