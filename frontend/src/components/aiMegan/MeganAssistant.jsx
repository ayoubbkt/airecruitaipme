// frontend/src/components/aiMegan/MeganAssistant.jsx (REMPLACER COMPLÈTEMENT)
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MeganService from '../../services/meganService';

const MeganAssistant = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: `Bonjour ${user?.firstName || 'là'} ! Je suis Megan, votre assistante IA RH. Comment puis-je vous aider aujourd'hui ?`,
        timestamp: new Date()
      }]);
    }
  }, [open, user]);

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
      const response = await MeganService.sendMessage(userMessage, { type: 'general' });

      if (response.success) {
        // Simuler une réponse (en réalité elle viendrait d'Intercom)
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === loadingId 
              ? {
                  ...msg,
                  content: `Votre demande est en cours de traitement. Conversation ID: ${response.data.conversationId}. Je vous fournirai une réponse détaillée dans quelques instants.`,
                  isLoading: false
                }
              : msg
          ));
        }, 2000);
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
                <div className="text-purple-100 text-sm">Assistant RH</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white hover:text-purple-200">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 h-64 space-y-3">
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
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:opacity-50 flex items-center gap-1"
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