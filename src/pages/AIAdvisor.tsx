import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  RefreshCw,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { getGeminiResponse } from '../lib/gemini';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Biosecurity Advisor. I can help you with disease prevention strategies, sanitation protocols, and farm health insights. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (customPrompt?: string) => {
    const messageText = customPrompt || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const response = await getGeminiResponse(messageText);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error while processing your request. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "How to prevent Swine Flu in pig farms?",
    "What are the best sanitation protocols for poultry?",
    "Checklist for visitor biosecurity compliance",
    "Early signs of Newcastle disease in chickens"
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Sparkles className="text-emerald-400" />
            AI Biosecurity Advisor
          </h1>
          <p className="text-slate-500 mt-1">Intelligent insights and recommendations powered by Gemini 3 Flash</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">System Active</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 glass-card flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {messages.map((msg, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'assistant' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                    : 'bg-white/10 text-slate-300'
                }`}>
                  {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'assistant' 
                    ? 'bg-white/5 text-slate-200 border border-white/10' 
                    : 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/10'
                }`}>
                  <div className="markdown-body">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center animate-pulse">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/5 bg-white/[0.02]">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about biosecurity protocols..."
                className="w-full glass-input pr-16 py-4"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Suggestions */}
        <div className="w-full md:w-80 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Info size={16} className="text-emerald-400" />
              Quick Suggestions
            </h3>
            <div className="space-y-3">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{s}</span>
                    <ArrowRight size={14} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 bg-amber-500/5 border-amber-500/20">
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
              <ShieldAlert size={16} />
              Critical Notice
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI recommendations are based on general biosecurity standards. Always consult with a local veterinarian for specific farm health concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
