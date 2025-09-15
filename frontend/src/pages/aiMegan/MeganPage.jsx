// frontend/src/pages/aiMegan/MeganPage.jsx
import React, { useState } from 'react';
import { MessageCircle, FileText, Brain, Settings } from 'lucide-react';
import MeganAssistant from '../../components/aiMegan/MeganAssistant';
import NoteTakingAssistant from '../../components/aiMegan/NoteTakingAssistant';

const MeganPage = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);

  const tabs = [
    {
      id: 'chat',
      name: 'Chat avec Megan',
      icon: MessageCircle,
      description: 'Conversez avec votre assistante IA RH'
    },
    {
      id: 'notes',
      name: 'Prise de Notes',
      icon: FileText,
      description: 'Générez automatiquement des notes de réunion'
    },
    {
      id: 'screening',
      name: 'Screening IA',
      icon: Brain,
      description: 'Évaluation automatique des candidats'
    },
    {
      id: 'config',
      name: 'Configuration',
      icon: Settings,
      description: 'Paramètres et préférences Megan'
    }
  ];

  const handleNotesGenerated = (notes) => {
    console.log('Notes générées:', notes);
    // Ici vous pouvez implémenter la logique pour sauvegarder les notes
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Megan AI Assistant</h1>
                <p className="text-gray-600">Votre assistante IA pour optimiser vos processus RH</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Chat avec Megan</h2>
              <p className="text-gray-600">
                Posez vos questions RH à Megan et obtenez des réponses intelligentes basées sur vos données.
              </p>
            </div>
            <MeganAssistant />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Prise de Notes Automatique</h2>
              <p className="text-gray-600">
                Laissez Megan générer automatiquement des notes structurées de vos réunions.
              </p>
            </div>
            
            {/* Meeting Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner une réunion
              </label>
              <select
                value={selectedMeetingId || ''}
                onChange={(e) => setSelectedMeetingId(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choisir une réunion...</option>
                <option value="meeting-1">Entretien - John Doe - 14/09/2025</option>
                <option value="meeting-2">Réunion équipe - Recrutement Q4</option>
                <option value="meeting-3">Entretien - Jane Smith - 13/09/2025</option>
              </select>
            </div>

            {selectedMeetingId && (
              <NoteTakingAssistant
                meetingId={selectedMeetingId}
                onNotesGenerated={handleNotesGenerated}
              />
            )}
          </div>
        )}

        {activeTab === 'screening' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Screening IA</h2>
              <p className="text-gray-600">
                Configuration et résultats du screening automatique des candidats.
              </p>
            </div>
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Fonctionnalité de screening IA en cours de développement</p>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Configuration Megan</h2>
              <p className="text-gray-600">
                Personnalisez le comportement et les préférences de votre assistante IA.
              </p>
            </div>
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Panneau de configuration en cours de développement</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeganPage;