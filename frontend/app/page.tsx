"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Globe, Menu, X, History, Sparkles, ChevronDown, Crown, Shield, BookOpen, MapPin, TrendingUp } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) setSidebarOpen(true);
    else setSidebarOpen(false);
  }, [isMobile]);

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

    try {
      console.log('Sending request to backend...');
      
      const response = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          language: language,
          sessionId: sessionId || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Response received:', result);
      
      if (result.success && result.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data.response,
          sources: result.data.sources || [],
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        if (result.data.sessionId && !sessionId) {
          setSessionId(result.data.sessionId);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'en'
          ? '⚠️ Unable to connect to the AI service. Please ensure the backend is running on http://localhost:4000'
          : '⚠️ Na kasa haɗi da sabis na AI. Da fatan za a tabbatar da cewa uwar garken yana aiki a http://localhost:4000',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Premium Background with Multiple Layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#F5F0E8] via-[#FFFDF9] to-[#F0E8DC]" />
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(201, 160, 61, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(184, 74, 44, 0.05) 0%, transparent 50%)',
        }} />
      </div>
      
      {/* Decorative Patterns */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 5 L70 20 L70 60 L40 75 L10 60 L10 20 Z' fill='none' stroke='%23B84A2C' stroke-width='1.5'/%3E%3Ccircle cx='40' cy='40' r='8' fill='%23C9A03D' fill-opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Sidebar - Fixed Toggle Logic */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed md:relative z-50 w-80 h-full bg-[#FFFDF9]/98 backdrop-blur-xl border-r border-[#C9A03D]/30 shadow-2xl"
          >
            <div className="p-6 border-b border-[#C9A03D]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C9A03D] to-[#B84A2C] rounded-xl flex items-center justify-center shadow-lg">
                    <Crown size={22} className="text-white" />
                  </div>
                  <div>
                    <h1 className="font-heading text-xl font-bold tracking-tight text-[#2C2418]">Bauchi State</h1>
                    <p className="text-xs text-[#5C5543] font-ui">AI Governor Assistant</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-[#F5F0E8] rounded-lg transition-colors">
                  <X size={20} className="text-[#5C5543]" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <button 
                onClick={() => {
                  setMessages([]);
                  setInput('');
                  if (isMobile) setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#B84A2C]/10 to-[#C9A03D]/10 hover:from-[#B84A2C]/20 hover:to-[#C9A03D]/20 rounded-xl transition-all duration-300 border border-[#C9A03D]/30"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#C9A03D] to-[#B84A2C] rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <span className="font-ui font-semibold text-[#2C2418]">New Conversation</span>
              </button>
            </div>

            <div className="px-4 py-2">
              <div className="flex items-center gap-2 px-4 py-2">
                <History size={16} className="text-[#C9A03D]" />
                <span className="text-xs font-ui font-bold uppercase tracking-wider text-[#5C5543]">Recent Conversations</span>
              </div>
              <div className="space-y-2 mt-3">
                {['Bauchi Development Plan 2025', 'Healthcare Achievements', 'Infrastructure Projects'].map((chat, i) => (
                  <button key={i} className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#F5F0E8] transition-all duration-200 group">
                    <p className="text-sm font-body text-[#2C2418] group-hover:text-[#B84A2C] transition-colors">{chat}</p>
                    <p className="text-xs text-[#5C5543] mt-1">Today at {10 + i}:{30 + i * 15} AM</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Footer Stats */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#C9A03D]/20 bg-gradient-to-t from-[#FFFDF9] to-transparent">
              <div className="flex justify-between text-xs">
                <div className="text-center">
                  <p className="font-ui font-bold text-[#2C2418]">500+</p>
                  <p className="text-[#5C5543]">Projects</p>
                </div>
                <div className="text-center">
                  <p className="font-ui font-bold text-[#2C2418]">150+</p>
                  <p className="text-[#5C5543]">Schools Built</p>
                </div>
                <div className="text-center">
                  <p className="font-ui font-bold text-[#2C2418]">2000km</p>
                  <p className="text-[#5C5543]">Roads</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Enhanced Header */}
        <header className="bg-[#FFFDF9]/80 backdrop-blur-md border-b border-[#C9A03D]/20 sticky top-0 z-20">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 hover:bg-[#F5F0E8] rounded-xl transition-all duration-200 active:scale-95"
              >
                <Menu size={22} className="text-[#2C2418]" />
              </button>
              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-[#C9A03D]" />
                  <h2 className="font-heading text-xl font-bold bg-gradient-to-r from-[#2C2418] to-[#B84A2C] bg-clip-text text-transparent">
                    Official AI Governor Assistant
                  </h2>
                </div>
                <p className="text-xs text-[#5C5543] mt-0.5 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Verified by Bauchi State Government
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9A03D]/10 hover:bg-[#C9A03D]/20 transition-all duration-200"
              >
                <BookOpen size={16} className="text-[#C9A03D]" />
                <span className="text-sm font-ui font-medium text-[#2C2418]">Sources</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${showSources ? 'rotate-180' : ''}`} />
              </button>
              
              <button
                onClick={() => setLanguage(language === 'en' ? 'ha' : 'en')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#B84A2C]/10 to-[#C9A03D]/10 hover:from-[#B84A2C]/20 hover:to-[#C9A03D]/20 transition-all duration-200"
              >
                <Globe size={18} className="text-[#B84A2C]" />
                <span className="font-ui text-sm font-bold">
                  {language === 'en' ? 'English' : 'Hausa'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Enhanced Governor Avatar Section */}
        <div className="relative px-6 pt-10 pb-8 border-b border-[#C9A03D]/15 bg-gradient-to-b from-transparent to-[#F5F0E8]/30">
          <div className="flex flex-col items-center">
            <div className="relative group">
              {/* Enhanced Animated Rings */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C9A03D]/20 to-[#B84A2C]/20"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{ width: '100%', height: '100%' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#C9A03D]/30"
                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-[#B84A2C]/40"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
              />
              
              {/* Avatar with Premium Frame */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-[#C9A03D] shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/governor.png"
                  alt="Governor Bala Mohammed"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x160/B84A2C/FFFFFF?text=Gov+Bala';
                  }}
                />
              </div>
              
              {/* Premium Status Badge */}
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full p-1.5 ring-4 ring-[#FFFDF9]">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="mt-5 text-center">
              <h3 className="font-heading text-3xl font-bold bg-gradient-to-r from-[#2C2418] to-[#B84A2C] bg-clip-text text-transparent">
                Alh. Dr. Bala Mohammed
              </h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Crown size={14} className="text-[#C9A03D]" />
                <p className="text-sm font-ui text-[#C9A03D] font-bold uppercase tracking-wide">
                  Executive Governor, Bauchi State
                </p>
              </div>
              <div className="mt-4 flex gap-2 justify-center">
                <span className="px-4 py-1.5 bg-[#C9A03D]/10 rounded-full text-xs font-ui font-medium text-[#2C2418] border border-[#C9A03D]/20">
                  ɗan Adam ne
                </span>
                <span className="px-4 py-1.5 bg-gradient-to-r from-[#B84A2C]/10 to-[#C9A03D]/10 rounded-full text-xs font-ui font-medium text-[#B84A2C] border border-[#B84A2C]/20">
                  AI Representative
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages Area - Enhanced Design */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center min-h-[400px] text-center"
            >
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-[#C9A03D] to-[#B84A2C] rounded-2xl flex items-center justify-center shadow-2xl transform rotate-6">
                  <Sparkles size={44} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#C9A03D] rounded-full flex items-center justify-center shadow-lg">
                  <TrendingUp size={14} className="text-white" />
                </div>
              </div>
              
              <h4 className="font-heading text-3xl font-bold text-[#2C2418] mt-8 mb-3">
                Welcome to Bauchi AI Governor Assistant
              </h4>
              <p className="text-[#5C5543] max-w-md font-body leading-relaxed text-lg">
                {language === 'en' 
                  ? 'Ask me anything about Bauchi State - history, government policies, development projects, or compare with other states.'
                  : 'Tambaye ni komai game da Jihar Bauchi - tarihi, manufofin gwamnati, ayyukan ci gaba, ko kwatanta da sauran jihohi.'}
              </p>
              
              <div className="mt-10 flex flex-wrap gap-3 justify-center max-w-2xl">
                {[
                  { icon: MapPin, text: 'History of Bauchi' },
                  { icon: Shield, text: 'Government Policies' },
                  { icon: TrendingUp, text: 'Development Projects' },
                  { icon: BookOpen, text: 'Compare with other States' }
                ].map(({ icon: Icon, text }) => (
                  <button
                    key={text}
                    onClick={() => setInput(text)}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-[#FFFDF9] border border-[#C9A03D]/30 rounded-full text-sm font-ui font-medium text-[#2C2418] hover:border-[#C9A03D] hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Icon size={16} className="text-[#C9A03D] group-hover:text-[#B84A2C] transition-colors" />
                    {text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.role === 'user' ? 60 : -60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: idx * 0.05, type: "spring", damping: 20 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-2xl px-6 py-4 shadow-xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#B84A2C] to-[#C9A03D] text-white'
                      : 'bg-[#FFFDF9] border-2 border-[#C9A03D]/20 shadow-lg'
                  }`}
                >
                  <p className="font-body leading-relaxed whitespace-pre-wrap text-[15px]">
                    {msg.content}
                  </p>
                </div>
                {msg.role === 'assistant' && showSources && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 px-5 py-3 bg-gradient-to-r from-[#F5F0E8] to-[#FFFDF9] rounded-xl border-l-4 border-[#C9A03D]"
                  >
                    <p className="text-xs font-ui font-bold text-[#C9A03D] mb-2 flex items-center gap-2">
                      <BookOpen size={12} /> SOURCE REFERENCES
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs text-[#5C5543]">• Bauchi State Development Plan 2025</p>
                      <p className="text-xs text-[#5C5543]">• Official Governor's Speech, March 2025</p>
                      <p className="text-xs text-[#5C5543]">• Ministry of Works Annual Report</p>
                    </div>
                  </motion.div>
                )}
                <p className="text-xs text-[#5C5543]/50 mt-2 px-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-start"
            >
              <div className="bg-[#FFFDF9] border-2 border-[#C9A03D]/30 rounded-2xl px-6 py-4 shadow-xl">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 bg-[#C9A03D] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2.5 h-2.5 bg-[#B84A2C] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2.5 h-2.5 bg-[#C9A03D] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
                <p className="text-xs text-[#5C5543] mt-2 font-ui font-medium">His Excellency is formulating a response...</p>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input Area */}
        <div className="border-t-2 border-[#C9A03D]/20 bg-[#FFFDF9]/95 backdrop-blur-md p-6 shadow-2xl">
          <div className="max-w-5xl mx-auto">
            <div className="relative flex items-end gap-3 bg-gradient-to-br from-[#F5F0E8] to-[#FFFDF9] rounded-2xl border-2 border-[#C9A03D]/30 focus-within:border-[#C9A03D] focus-within:shadow-2xl transition-all duration-300">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={language === 'en' ? 'Ask His Excellency a question...' : 'Tambayi Mai Girma Gwamna tambaya...'}
                className="flex-1 resize-none bg-transparent rounded-2xl p-4 font-body text-[#2C2418] placeholder:text-[#5C5543]/50 focus:outline-none min-h-[60px] max-h-[120px] text-[15px]"
                rows={1}
                style={{ height: 'auto' }}
              />
              <div className="flex gap-2 p-3">
                <button className="p-2 rounded-full hover:bg-[#B84A2C]/10 transition-all duration-200 group">
                  <Mic size={20} className="text-[#B84A2C] group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-full bg-gradient-to-r from-[#C9A03D] to-[#B84A2C] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 hover:shadow-xl"
                >
                  <Send size={20} className="text-white" />
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-[#5C5543]/60 mt-4 font-ui flex items-center justify-center gap-2">
              <Shield size={12} />
              {language === 'en' ? 'AI-generated responses based on official government documents' : 'Amsoshin AI sun dogara ne akan takardun gwamnati na hukuma'}
              <Shield size={12} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}