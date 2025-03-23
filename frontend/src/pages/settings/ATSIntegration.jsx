import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { CheckCircle, X, HelpCircle, PlusCircle } from 'lucide-react';

const ATSIntegration = () => {
  const [integrations, setIntegrations] = useState([
    { id: 1, name: 'Workable', status: 'connected', lastSync: '2023-02-09T14:30:00' },
    { id: 2, name: 'Greenhouse', status: 'disconnected', lastSync: null },
    { id: 3, name: 'Lever', status: 'disconnected', lastSync: null },
    { id: 4, name: 'SmartRecruiters', status: 'connected', lastSync: '2023-02-10T09:15:00' },
  ]);


  const [showModal, setShowModal] = useState(false);
  const [selectedAts, setSelectedAts] = useState(null);
  const [apiKey, setApiKey] = useState('');

  const handleConnect = (ats) => {
    setSelectedAts(ats);
    setApiKey('');
    setShowModal(true);
  };

  const handleDisconnect = (id) => {
    // Simuler déconnexion
    const updatedIntegrations = integrations.map(integration => 
      integration.id === id 
        ? { ...integration, status: 'disconnected', lastSync: null } 
        : integration
    );
    
    setIntegrations(updatedIntegrations);
    toast.success('Intégration déconnectée avec succès');
  };

  const handleSubmitConnection = (e) => {
    e.preventDefault();
    
    if (!apiKey) {
      toast.error('Veuillez entrer une clé API valide');
      return;
    }
    
    // Simuler connexion
    const updatedIntegrations = integrations.map(integration => 
      integration.id === selectedAts.id 
        ? { ...integration, status: 'connected', lastSync: new Date().toISOString() } 
        : integration
    );
    
    setIntegrations(updatedIntegrations);
    setShowModal(false);
    toast.success(`Intégration avec ${selectedAts.name} établie avec succès`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Intégrations ATS</h1>
        <p className="text-slate-500 mt-1">Gérez vos connexions avec les systèmes de suivi des candidatures</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 pb-3 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Vos intégrations</h2>
            <button className="flex items-center px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
              <HelpCircle className="w-4 h-4 mr-1" />
              <span>Documentation</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div 
                key={integration.id} 
                className="border border-slate-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="font-semibold text-slate-700">{integration.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">{integration.name}</h3>
                    <div className="flex items-center mt-1">
                      {integration.status === 'connected' ? (
                        <>
                          <span className="flex items-center text-xs text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connecté
                          </span>
                          <span className="mx-2 text-slate-300">•</span>
                          <span className="text-xs text-slate-500">
                            Dernière synchronisation: {new Date(integration.lastSync).toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="flex items-center text-xs text-slate-500">
                          <X className="w-3 h-3 mr-1" />
                          Non connecté
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  {integration.status === 'connected' ? (
                    <button 
                      onClick={() => handleDisconnect(integration.id)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm"
                    >
                      Déconnecter
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleConnect(integration)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Connecter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="flex items-center mt-6 text-blue-600 text-sm font-medium hover:text-blue-800">
            <PlusCircle className="w-4 h-4 mr-1" />
            Ajouter une nouvelle intégration
          </button>
        </div>
      </div>

      {/* Modal de connexion */}
      {showModal && selectedAts && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Connecter {selectedAts.name}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitConnection}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Clé API
                </label>
                <input 
                  type="text" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Entrez votre clé API"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Vous pouvez trouver votre clé API dans les paramètres de votre compte {selectedAts.name}.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Connecter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSIntegration;