import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setLoading(true);
      await login(email, password);
      toast.success('Connexion réussie');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RecrutPME</h1>
        <p className="mt-3 text-slate-500">Connexion à votre compte</p>
      </div>
      
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Mot de passe</label>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">Mot de passe oublié?</Link>
          </div>
          <input
            id="password"
            type="password"
            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </div>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          Vous n'avez pas de compte? <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;