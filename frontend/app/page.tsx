"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Globe, Menu, X, History, Volume2, VolumeX, Sparkles, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ha'>('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Mock response - will be replaced with Gemini
    setTimeout(() => {
      const mockResponse = language === 'en' 
        ? "Assalamu Alaikum. Thank you for your question about Bauchi State. Under my administration, we have prioritized infrastructure development, healthcare reform, and educational advancement. Our Bauchi Development Agenda 2050 has seen the construction of over 500km of roads, renovation of 150 primary healthcare centers, and digital transformation of our civil service. Would you like specific details about any of these achievements?"
        : "Assalamu Alaikum. Na gode da tambayar ku game da Jihar Bauchi. A karkashin gwamnatinmu, mun ba da fifiko ga ci gaban ababen more rayuwa, sake fasalin kiwon lafiya, da ci gaban ilimi. Manufarmu ta Bauchi Development Agenda 2050 ta ga gina hanyoyi sama da kilomita 500, sake gyara cibiyoyin kiwon lafiya na farko 150, da sauya fasalin aikin gwamnati. Kuna son cikakkun bayanai game da kowane ɗayan waɗannan nasarorin?";
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-heritage-sand via-heritage-ivory to-heritage-sand">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M30 5 L55 20 L55 40 L30 55 L5 40 L5 20 Z\" fill=\"none\" stroke=\"%23C9A03D\" stroke-width=\"1\"/%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || !isMobile) && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed md:relative z-40 w-80 h-full bg-heritage-ivory/98 backdrop-blur-xl border-r border-heritage-gold/30 shadow-2xl"
          >
            <div className="p-6 border-b border-heritage-gold/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="font-heading text-lg font-bold text-heritage-brown">Bauchi State</h1>
                    <p className="text-xs text-heritage-charcoal">AI Governor Assistant</p>
                  </div>
                </div>
                {isMobile && (
                  <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-heritage-sand rounded-lg">
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <button 
                onClick={() => {
                  setMessages([]);
                  setInput('');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-heritage-terracotta/10 hover:bg-heritage-terracotta/20 rounded-xl transition-all duration-200 border border-heritage-gold/30"
              >
                <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <span className="font-ui font-medium text-heritage-brown">New Conversation</span>
              </button>
            </div>

            <div className="px-4 py-2">
              <div className="flex items-center gap-2 px-4 py-2">
                <History size={16} className="text-heritage-gold" />
                <span className="text-xs font-ui uppercase tracking-wider text-heritage-charcoal">Recent Chats</span>
              </div>
              <div className="space-y-1 mt-2">
                {[1, 2, 3].map((i) => (
                  <button key={i} className="w-full text-left px-4 py-2 rounded-lg hover:bg-heritage-sand transition-colors">
                    <p className="text-sm font-body text-heritage-brown truncate">Conversation about Bauchi development</p>
                    <p className="text-xs text-heritage-charcoal mt-1">2 hours ago</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="bg-heritage-ivory/70 backdrop-blur-md border-b border-heritage-gold/20 sticky top-0 z-20">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-heritage-sand rounded-lg transition-colors"
              >
                <Menu size={22} className="text-heritage-brown" />
              </button>
              <div className="hidden md:block">
                <h2 className="font-heading text-xl font-semibold bg-gradient-to-r from-heritage-brown to-heritage-terracotta bg-clip-text text-transparent">
                  AI Governor Assistant
                </h2>
                <p className="text-xs text-heritage-charcoal mt-0.5">Powered by Bauchi State Government</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-heritage-gold/10 hover:bg-heritage-gold/20 transition-colors"
              >
                <ChevronDown size={16} className={`transition-transform ${showSources ? 'rotate-180' : ''}`} />
                <span className="text-sm font-ui">Sources</span>
              </button>
              
              <button
                onClick={() => setLanguage(language === 'en' ? 'ha' : 'en')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-heritage-terracotta/10 hover:bg-heritage-terracotta/20 transition-colors"
              >
                <Globe size={18} className="text-heritage-terracotta" />
                <span className="font-ui text-sm font-medium">
                  {language === 'en' ? 'English' : 'Hausa'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Governor Avatar Section - Prominent */}
        <div className="relative px-6 pt-8 pb-4 border-b border-heritage-gold/10">
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Animated rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-heritage-gold/20"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-heritage-gold/40"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              
              {/* Avatar */}
              <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden ring-4 ring-heritage-gold shadow-2xl">
                <img
                  src="/governor.png"
                  alt="Governor Bala Mohammed"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/144x144/B84A2C/FFFFFF?text=Governor';
                  }}
                />
              </div>
              
              {/* Status indicator */}
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full ring-2 ring-heritage-ivory animate-pulse" />
            </div>
            
            <h3 className="mt-4 font-heading text-2xl font-bold text-heritage-brown">
              Alh. Dr. Bala Mohammed
            </h3>
            <p className="text-sm font-ui text-heritage-gold font-medium mt-1">
              Executive Governor, Bauchi State
            </p>
            <div className="mt-3 flex gap-2">
              <span className="px-3 py-1 bg-heritage-gold/10 rounded-full text-xs font-ui text-heritage-brown">
                ɗan Adam ne
              </span>
              <span className="px-3 py-1 bg-heritage-terracotta/10 rounded-full text-xs font-ui text-heritage-terracotta">
                AI Representative
              </span>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px] text-center"
            >
              <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Sparkles size={40} className="text-white" />
              </div>
              <h4 className="font-heading text-2xl font-bold text-heritage-brown mb-3">
                Welcome to Bauchi AI Governor Assistant
              </h4>
              <p className="text-heritage-charcoal max-w-md font-body leading-relaxed">
                {language === 'en' 
                  ? 'Ask me anything about Bauchi State - history, government policies, development projects, or compare with other states.'
                  : 'Tambaye ni komai game da Jihar Bauchi - tarihi, manufofin gwamnati, ayyukan ci gaba, ko kwatanta da sauran jihohi.'}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                {['Education reforms', 'Healthcare projects', 'Infrastructure', 'Investment opportunities'].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setInput(topic)}
                    className="px-4 py-2 bg-heritage-ivory border border-heritage-gold/30 rounded-full text-sm font-ui text-heritage-brown hover:border-heritage-gold hover:shadow-md transition-all"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.role === 'user' ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-2xl px-6 py-4 shadow-lg ${
                    msg.role === 'user'
                      ? 'terracotta-gradient text-white'
                      : 'bg-heritage-ivory border border-heritage-gold/30'
                  }`}
                >
                  <p className="font-body leading-relaxed whitespace-pre-wrap text-[15px]">
                    {msg.content}
                  </p>
                </div>
                {msg.role === 'assistant' && showSources && (
                  <div className="mt-2 px-4 py-2 bg-heritage-sand/50 rounded-lg border border-heritage-gold/20">
                    <p className="text-xs font-ui text-heritage-gold font-semibold mb-1">📚 Source References</p>
                    <p className="text-xs text-heritage-charcoal">• Bauchi State Development Plan 2025</p>
                    <p className="text-xs text-heritage-charcoal">• Official Governor's Speech, March 2025</p>
                  </div>
                )}
                <p className="text-xs text-heritage-charcoal/60 mt-1 px-2">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-start"
            >
              <div className="bg-heritage-ivory border border-heritage-gold/30 rounded-2xl px-6 py-4 shadow-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-heritage-gold rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 bg-heritage-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-heritage-gold rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
                <p className="text-xs text-heritage-charcoal mt-2">Governor is typing...</p>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Elegant */}
        <div className="border-t border-heritage-gold/20 bg-heritage-ivory/90 backdrop-blur-sm p-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative flex items-end gap-3 bg-heritage-sand/30 rounded-2xl border border-heritage-gold/30 focus-within:border-heritage-gold focus-within:shadow-lg transition-all duration-200">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={language === 'en' ? 'Ask His Excellency...' : 'Tambayi Mai Girma Gwamna...'}
                className="flex-1 resize-none bg-transparent rounded-2xl p-4 font-body text-heritage-brown placeholder:text-heritage-charcoal/50 focus:outline-none min-h-[60px] max-h-[120px]"
                rows={1}
                style={{ height: 'auto' }}
              />
              <div className="flex gap-2 p-3">
                <button className="p-2 rounded-full hover:bg-heritage-terracotta/10 transition-colors">
                  <Mic size={20} className="text-heritage-terracotta" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-full gold-gradient disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105"
                >
                  <Send size={20} className="text-white" />
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-heritage-charcoal/60 mt-3 font-ui">
              {language === 'en' ? 'AI-generated responses based on official government documents' : 'Amsoshin AI sun dogara ne akan takardun gwamnati na hukuma'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}