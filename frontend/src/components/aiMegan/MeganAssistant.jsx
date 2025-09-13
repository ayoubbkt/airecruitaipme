import React, { useMemo, useState } from 'react';
import { X, Mic, Send, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * MeganAssistant
 * Floating Megan AI button (bottom-left) that opens a chat widget similar to the screenshots.
 * Pure frontend UI for now; hooks can call service later.
 */
const MeganAssistant = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => [
    {
      id: 'greeting',
      role: 'assistant',
      content: `${getGreeting()}, ${user?.firstName || 'there'}. What can I help with?`,
    },
  ]);

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', content: text },
      // Mock assistant thinking/placeholder
      { id: `a-${Date.now()}`, role: 'assistant', content: `Thanks! I received: “${text}”. (Demo response)` },
    ]);
    setInput('');
  };

  // Megan icon as inline SVG to match purple badge
  const MeganFace = useMemo(
    () => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#fff" opacity="0.85" />
        <path d="M7.5 10.5h1.5M15 10.5h1.5" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M7.8 14.2c1.2.9 2.6 1.3 4.2 1.3s3-.4 4.2-1.3" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    []
  );

  return (
    <>
      {/* Floating open/close button */}
      <button
        type="button"
        aria-label="Open Megan assistant"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full shadow-lg ring-4 ring-white/60 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #C084FC 0%, #7C3AED 100%)' }}
      >
        <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
          {open ? <X size={24} className="text-white"/> : MeganFace}
        </div>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 left-6 z-40 w-[360px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-white/90 flex items-center gap-2 border-b border-slate-100">
            <button
              className="p-1 rounded-md hover:bg-slate-100 text-slate-500"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C084FC 0%, #7C3AED 100%)' }}>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  {MeganFace}
                </div>
              </div>
              <div className="font-medium text-slate-800">New conversation</div>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 max-h-[50vh] overflow-y-auto space-y-3 bg-slate-50/60">
            {messages.map((m) => (
              <div key={m.id} className={`${m.role === 'assistant' ? 'justify-start' : 'justify-end'} flex`}>
                <div className={`${m.role === 'assistant' ? 'bg-white text-slate-800' : 'bg-indigo-600 text-white'} px-3 py-2 rounded-xl max-w-[80%] shadow-sm`}> 
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-white">
            <div className="relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message to Megan..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3 py-2 pr-28 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600" title="Voice (demo)">
                  <Mic size={16} />
                </button>
                <button
                  onClick={handleSend}
                  className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium flex items-center gap-1"
                >
                  <Send size={16} /> Reply
                </button>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Start your sentences with "Hey Megan"
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MeganAssistant;
