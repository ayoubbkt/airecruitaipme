import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Outlet />
    </div>
  );
};

export default AuthLayout;