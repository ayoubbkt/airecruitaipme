import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { User, Mail, Building, Phone, Lock, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsProvider';

const Settings = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();


  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    companyName: user?.companyName || '',
    phoneNumber: user?.phoneNumber || ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [appSettings, setAppSettings] = useState({
    theme: settings.theme || 'light',
    language: settings.language || 'fr',
    notificationsEnabled: settings.notificationsEnabled !== false,
    emailNotifications: settings.emailNotifications !== false
  });
  
  const [activeTab, setActiveTab] = useState('profile');
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSettingsChange = (e) => {
    const { name, type, checked, value } = e.target;
    setAppSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // Simuler mise à jour du profil
    toast.success('Profil mis à jour avec succès');
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    // Simuler changement de mot de passe
    toast.success('Mot de passe mis à jour avec succès');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };
  
  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    updateSettings(appSettings);
    toast.success('Paramètres mis à jour avec succès');
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Paramètres</h1>
        <p className="text-slate-500 mt-1">Gérez votre compte et vos préférences</p>
      </div>
      
      <div className="flex">
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3 py-2 mb-1 rounded-lg ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Profil
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-3 py-2 mb-1 rounded-lg ${activeTab === 'security' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Sécurité
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`w-full text-left px-3 py-2 mb-1 rounded-lg ${activeTab === 'preferences' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Préférences
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-3 py-2 mb-1 rounded-lg ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Notifications
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 ml-6">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 pb-3 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Informations personnelles</h2>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Prénom
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={profileForm.firstName}
                        onChange={handleProfileChange}
                        className="pl-10 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileForm.lastName}
                      onChange={handleProfileChange}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="pl-10 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Entreprise
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="companyName"
                      value={profileForm.companyName}
                      onChange={handleProfileChange}
                      className="pl-10 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profileForm.phoneNumber}
                      onChange={handleProfileChange}
                      className="pl-10 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 pb-3 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Changer le mot de passe</h2>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="pl-10 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="pl-10 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Le mot de passe doit contenir au moins 8 caractères
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="pl-10 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Mettre à jour
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 pb-3 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Préférences de l'application</h2>
              </div>
              
              <form onSubmit={handleSettingsSubmit} className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Thème
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={appSettings.theme === 'light'}
                        onChange={handleSettingsChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="ml-2 text-sm text-slate-700">Clair</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={appSettings.theme === 'dark'}
                        onChange={handleSettingsChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="ml-2 text-sm text-slate-700">Sombre</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="theme"
                        value="system"
                        checked={appSettings.theme === 'system'}
                        onChange={handleSettingsChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="ml-2 text-sm text-slate-700">Système</span>
                    </label>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Langue
                  </label>
                  <select
                    name="language"
                    value={appSettings.language}
                    onChange={handleSettingsChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 pb-3 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Paramètres de notification</h2>
              </div>
              
              <form onSubmit={handleSettingsSubmit} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Notifications dans l'application</p>
                      <p className="text-xs text-slate-500">Recevoir des notifications dans l'application</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="notificationsEnabled"
                        checked={appSettings.notificationsEnabled}
                        onChange={handleSettingsChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Notifications par email</p>
                      <p className="text-xs text-slate-500">Recevoir des notifications par email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="emailNotifications"
                        checked={appSettings.emailNotifications}
                        onChange={handleSettingsChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-700 mb-3">Notifications à recevoir</p>
                    
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={true}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <span className="ml-2 text-sm text-slate-700">Nouveaux CV analysés</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={true}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <span className="ml-2 text-sm text-slate-700">Entretiens planifiés</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={true}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <span className="ml-2 text-sm text-slate-700">Nouvelles candidatures</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={false}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <span className="ml-2 text-sm text-slate-700">Rapports hebdomadaires</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button 
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;