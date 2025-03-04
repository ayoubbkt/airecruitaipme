import React, { createContext, useState, useContext } from 'react';

const UsersContext = createContext({
  user: null,
  setUser: () => {},
});

export const UsersProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin', // Example role
  });

  return (
    <UsersContext.Provider value={{ user, setUser }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);