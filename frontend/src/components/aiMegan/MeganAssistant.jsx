// frontend/src/components/aiMegan/MeganAssistant.jsx (REMPLACER COMPLÈTEMENT)
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Loader2, NotebookPen, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MeganService from '../../services/meganService';

const MeganAssistant = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('chat'); // 'chat' ou 'notes'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = mode === 'chat' 
        ? `Bonjour ${user?.firstName || 'là'} ! Je suis Megan, votre assistante IA RH. Comment puis-je vous aider aujourd'hui ?`
        : `Mode prise de notes activé. Collez ici une transcription de réunion et je génèrerai des notes structurées pour vous.`;
      
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: greeting,
        timestamp: new Date()
      }]);
    }
  }, [open, user, mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Ajouter message utilisateur
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    // Message de chargement
    const loadingId = `loading-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: loadingId,
      role: 'assistant',
      content: 'Je réfléchis...',
      timestamp: new Date(),
      isLoading: true
    }]);

    try {
      let response;
      
      if (mode === 'chat') {
        // Utilise la route /chat
        response = await MeganService.sendMessage(userMessage, { type: 'general' });
        console.log("Réponse de Megan:", response);
        console.log("Tresponse.success:", response.success);
      } else {
        // Utilise la route /note-taking
        response = await MeganService.generateNotes(userMessage, { 
          meetingType: 'interview',
          userId: user?.id 
        });
      }

      if (response.success) {
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === loadingId 
              ? {
                  ...msg,
                  content: mode === 'chat' 
                    ? `${response.data.message}\n\n${response.data.source ? `🔍 Source: ${response.data.source}` : ''}` 
                    : `**Notes générées :**\n\n**Résumé :** ${response.data.notes.summary}\n\n**Points clés :**\n${response.data.notes.keyPoints.map(point => `• ${point}`).join('\n')}\n\n**Actions à suivre :**\n${response.data.notes.actionItems.map(action => `• ${action}`).join('\n')}\n\n${response.data.source ? `🔍 Source: ${response.data.source}` : ''}`,
                  isLoading: false
                }
              : msg
          ));
        }, 1000);
      }

    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? {
              ...msg,
              content: `Erreur: ${error.message}`,
              isLoading: false,
              error: true
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setMessages([]); // Reset messages when switching mode
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-40 w-16 h-16 rounded-full shadow-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #C084FC 0%, #7C3AED 100%)' }}
      >
        {open ? <X size={24} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
      </button>

      {/* Panel de chat */}
      {open && (
        <div className="fixed bottom-24 left-6 z-40 w-96 h-96 bg-white rounded-lg shadow-2xl border overflow-hidden">
          
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Megan AI</div>
                <div className="text-purple-100 text-sm">
                  {mode === 'chat' ? 'Assistant RH' : 'Prise de notes'}
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white hover:text-purple-200">
                <X size={20} />
              </button>
            </div>
            
            {/* Mode selector */}
            <div className="flex mt-2 bg-white/20 rounded-lg p-1">
              <button
                onClick={() => switchMode('chat')}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-1 rounded text-xs transition-colors ${
                  mode === 'chat' ? 'bg-white text-purple-600' : 'text-white/80 hover:text-white'
                }`}
              >
                <MessageSquare size={14} />
                Chat
              </button>
              <button
                onClick={() => switchMode('notes')}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-1 rounded text-xs transition-colors ${
                  mode === 'notes' ? 'bg-white text-purple-600' : 'text-white/80 hover:text-white'
                }`}
              >
                <NotebookPen size={14} />
                Notes
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 h-52 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  message.role === 'assistant'
                    ? message.error 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                    : 'bg-purple-500 text-white'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.isLoading && <Loader2 size={14} className="animate-spin mt-1" />}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={mode === 'chat' ? "Tapez votre message..." : "Collez la transcription de réunion..."}
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
                rows={mode === 'notes' ? 3 : 1}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:opacity-50 flex items-center gap-1 self-end"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MeganAssistant;