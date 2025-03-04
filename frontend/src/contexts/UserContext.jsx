import React, { createContext, useState, useContext } from 'react';

const UsersContext = createContext({
  user: null,
  setUser: () => {},
});

export const UsersProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Guest', // Temporary user for testing
    email: 'guest@example.com',
  });

  return (
    <UsersContext.Provider value={{ user, setUser }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);