// frontend/src/components/aiMegan/NoteTakingAssistant.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Play, StopCircle, Save, Download, Loader2 } from 'lucide-react';
import MeganService from '../../services/meganService';

const NoteTakingAssistant = ({ meetingId, onNotesGenerated }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [config, setConfig] = useState(null);

  const loadConfig = useCallback(async () => {
    try {
      const response = await MeganService.getNoteTakingConfig(meetingId);
      setConfig(response.config);
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    }
  }, [meetingId]);

  useEffect(() => {
    if (meetingId) {
      loadConfig();
    }
  }, [meetingId, loadConfig]);

  const handleStartRecording = () => {
    setIsRecording(true);
    // Ici vous pouvez intégrer une API de reconnaissance vocale comme Web Speech API
    console.log('Démarrage de l\'enregistrement...');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    console.log('Arrêt de l\'enregistrement...');
  };

  const generateNotes = async () => {
    if (!transcription.trim()) {
      alert('Veuillez saisir ou enregistrer une transcription');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await MeganService.executeNoteTaking(meetingId, transcription);
      setGeneratedNotes(response.notes);
      if (onNotesGenerated) {
        onNotesGenerated(response.notes);
      }
    } catch (error) {
      console.error('Erreur lors de la génération des notes:', error);
      alert('Erreur lors de la génération des notes');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadNotes = () => {
    if (!generatedNotes) return;

    const blob = new Blob([generatedNotes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-reunion-${meetingId}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!config?.isEnabled) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-600">La prise de notes automatique n'est pas activée pour cette réunion.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Assistant de Prise de Notes</h3>
      </div>

      {/* Recording Controls */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-medium mb-3">Enregistrement</h4>
        <div className="flex items-center space-x-3">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <Play className="h-4 w-4" />
              <span>Démarrer l'enregistrement</span>
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <StopCircle className="h-4 w-4" />
              <span>Arrêter l'enregistrement</span>
            </button>
          )}
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm">Enregistrement en cours...</span>
            </div>
          )}
        </div>
      </div>

      {/* Transcription Input */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-medium mb-3">Transcription</h4>
        <textarea
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          placeholder="La transcription apparaîtra ici automatiquement, ou vous pouvez saisir le contenu manuellement..."
          className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {transcription.length} caractères
          </span>
          <button
            onClick={generateNotes}
            disabled={!transcription.trim() || isProcessing}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Génération...</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>Générer les notes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Notes */}
      {generatedNotes && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Notes générées par Megan</h4>
            <div className="flex space-x-2">
              <button
                onClick={downloadNotes}
                className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger</span>
              </button>
              <button
                className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                <span>Sauvegarder</span>
              </button>
            </div>
          </div>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border">
              {generatedNotes}
            </pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Comment utiliser l'assistant</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Démarrez l'enregistrement pour capturer automatiquement l'audio</li>
          <li>• Ou saisissez manuellement la transcription de la réunion</li>
          <li>• Cliquez sur "Générer les notes" pour que Megan crée un résumé structuré</li>
          <li>• Téléchargez ou sauvegardez les notes pour les partager avec l'équipe</li>
        </ul>
      </div>
    </div>
  );
};

export default NoteTakingAssistant;