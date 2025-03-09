import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);


export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'fr',
    notificationsEnabled: true,
    dashboardLayout: 'default',
  });
  
  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);
  
  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('settings', JSON.stringify(updatedSettings));
  };
  
  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};