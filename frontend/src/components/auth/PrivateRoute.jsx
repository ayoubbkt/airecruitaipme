import React from 'react';
import { Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // TODO: Implémenter la logique d'authentification réelle
  const isAuthenticated = true; // Simulation d'un utilisateur connecté
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default PrivateRoute;