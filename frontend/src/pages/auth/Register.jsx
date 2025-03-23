import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      setLoading(true);
      
      const data = {
        ...formData,
        // Remove confirmPassword as the backend doesn't need it
        confirmPassword: undefined
      };
      
      await register(data);
      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Échec de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RecrutPME</h1>
        <p className="mt-3 text-slate-500">Créer votre compte</p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Prénom"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nom"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">Entreprise</label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom de votre entreprise"
            value={formData.companyName}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </div>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          Vous avez déjà un compte? <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;