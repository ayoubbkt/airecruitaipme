import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }
    
    try {
      setLoading(true);
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Instructions de réinitialisation envoyées à votre email');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi des instructions');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RecrutPME</h1>
          <p className="mt-3 text-slate-500">Réinitialisation de mot de passe</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-blue-800 mb-4">
            Si un compte est associé à l'email <strong>{email}</strong>, vous recevrez un email avec des instructions pour réinitialiser votre mot de passe.
          </p>
          <p className="text-blue-800 mb-4">
            Veuillez vérifier votre boîte de réception et suivre les instructions.
          </p>
          <Link to="/login" className="text-blue-600 font-medium hover:text-blue-800">
            Retourner à la page de connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RecrutPME</h1>
        <p className="mt-3 text-slate-500">Réinitialisation de mot de passe</p>
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
          <button
            type="submit"
            className="w-full p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer les instructions'}
          </button>
        </div>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Retourner à la connexion</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;