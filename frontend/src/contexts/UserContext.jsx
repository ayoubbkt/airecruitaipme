// import React, { createContext, useState, useContext, useEffect } from 'react';
// import axios from 'axios';



// const UsersContext = createContext({
//   user: null,
//   setUser: () => {},
//   login: () => {},
//   register: () => {},
//   logout: () => {},
// });

// export const UsersProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   const login = async (email, password) => {
//     try {
//       const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
//         email,
//         password,
//       });
//       const userData = response.data;
//       setUser(userData);
//       localStorage.setItem('user', JSON.stringify(userData));
//     } catch (error) {
//       console.error('Login failed:', error);
//       throw error;
//     }
//   };

//   const register = async (email, password, name) => {
//     try {
//       const response = await axios.post('http://localhost:5000/api/v1/auth/register', {
//         email,
//         password,
//         name,
//       });
//       const userData = response.data;
//       setUser(userData);
//       localStorage.setItem('user', JSON.stringify(userData));
//     } catch (error) {
//       console.error('Registration failed:', error);
//       throw error;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//   };

//   return (
//     <UsersContext.Provider value={{ user, setUser, login, register, logout }}>
//       {children}
//     </UsersContext.Provider>
//   );
// };

// export const useUsers = () => useContext(UsersContext);