"use client";

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AudioLines,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleDot,
  Crown,
  Globe,
  History,
  Menu,
  Mic,
  Newspaper,
  Send,
  Shield,
  Sparkles,
  TrendingUp,
  UserCircle2,
  Waves,
  X,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
  isStreaming?: boolean;
}

function RevealText({
  text,
  active,
  speed = 12,
  onDone,
}: {
  text: string;
  active: boolean;
  speed?: number;
  onDone?: () => void;
}) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!active || isComplete) return;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setDisplayText(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
        setIsComplete(true);
        onDone?.();
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [active, text, speed, onDone, isComplete]);

  useEffect(() => {
    if (!active) {
      setDisplayText(text);
      setIsComplete(true);
    }
  }, [active, text]);

  return (
    <p className="whitespace-pre-wrap text-[15px] leading-7 pl-3 border-l-2 border-[#3A6B4B]/25">
      {displayText || text}
      {active && !isComplete ? (
        <span className="inline-block w-2 h-5 ml-1 align-middle bg-[#3A6B4B] animate-pulse rounded-sm" />
      ) : null}
    </p>
  );
}

function SoundWavePlaceholder({ active }: { active: boolean }) {
  const bars = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="rounded-2xl border border-[#3A6B4B]/30 bg-gradient-to-br from-[#FFFDF9]/90 via-[#F7F3EB]/90 to-[#F1E9DD]/90 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#3A6B4B] font-ui font-semibold">Voice Sync Stage</p>
        <div className="flex items-center gap-2 text-[11px] text-[#5C5543]">
          <CircleDot size={10} className={active ? 'text-green-600' : 'text-[#C9A03D]'} />
          {active ? 'Listening Preview' : 'Standby'}
        </div>
      </div>

      <div className="h-16 flex items-end justify-between gap-1">
        {bars.map((bar) => (
          <motion.span
            key={bar}
            className="w-2 rounded-full bg-gradient-to-t from-[#3A6B4B] via-[#4E8A63] to-[#8EC29B]"
            animate={
              active
                ? { height: ['18%', '85%', '40%', '70%', '22%'] }
                : { height: ['18%', '35%', '22%'] }
            }
            transition={{
              duration: active ? 1.4 : 2.3,
              repeat: Infinity,
              delay: bar * 0.08,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ha'>('en');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSources, setShowSources] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [voicePreview, setVoicePreview] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [streamingId, setStreamingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage, isLoading]);

  useEffect(() => {
    if (!textAreaRef.current) return;
    textAreaRef.current.style.height = 'auto';
    textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 180)}px`;
  }, [input]);

  const startNewConversation = () => {
    setMessages([]);
    setInput('');
    setSessionId(null);
    setStreamingMessage('');
    setStreamingId(null);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const outboundText = input.trim();
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: outboundText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use relative path (rewrites will handle proxying to backend)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: outboundText,
          language,
          sessionId: sessionId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Chat request failed');
      }
      
      if (result.success && result.data) {
        const assistantMessage: Message = {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: result.data.response,
          sources: result.data.sources || ['Bauchi State Government Records'],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        if (result.data.sessionId && !sessionId) {
          setSessionId(result.data.sessionId);
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content:
          language === 'en'
            ? `⚠️ Unable to connect to AI service. Please confirm backend is running.`
            : `⚠️ An kasa hada sabis na AI. Tabbatar backend yana aiki.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-[#2C2418]">
      <div className="fixed inset-0 bg-gradient-to-br from-[#F4EEE4] via-[#FEFCF7] to-[#EEE3D2]" />
      <div
        className="fixed inset-0 opacity-35 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 20%, rgba(58,107,75,0.11) 0%, transparent 34%), radial-gradient(circle at 85% 12%, rgba(184,74,44,0.08) 0%, transparent 30%), radial-gradient(circle at 50% 85%, rgba(201,160,61,0.1) 0%, transparent 38%)',
        }}
      />

      <div className="relative z-10 flex min-h-screen">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
              className="fixed lg:relative z-40 h-screen w-[300px] border-r border-[#3A6B4B]/25 bg-[#FFFDF9]/95 backdrop-blur-xl shadow-[0_18px_50px_rgba(44,36,24,0.16)]"
            >
              <div className="p-5 border-b border-[#C9A03D]/25">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C9A03D] via-[#B84A2C] to-[#3A6B4B] text-white flex items-center justify-center shadow-lg">
                      <Crown size={20} />
                    </div>
                    <div>
                      <h1 className="font-heading text-lg font-semibold leading-tight">Bauchi State Command</h1>
                      <p className="text-xs text-[#5C5543] font-ui">Governor AI Interface</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 rounded-lg hover:bg-[#F1E8DA]"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <button
                  onClick={startNewConversation}
                  className="w-full rounded-xl border border-[#3A6B4B]/30 bg-gradient-to-r from-[#EAF2ED] to-[#F8F2E8] px-4 py-3 text-left hover:shadow-md transition"
                >
                  <p className="font-ui text-sm font-semibold">Start New Briefing</p>
                  <p className="text-xs text-[#5C5543] mt-1">Reset context and begin fresh</p>
                </button>

                <div className="rounded-xl border border-[#C9A03D]/25 bg-white/60 p-4">
                  <p className="text-xs font-ui tracking-[0.15em] uppercase text-[#3A6B4B] mb-3">Intelligence Snapshot</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-[#F3EFE6] p-2">
                      <p className="text-[#5C5543]">Messages</p>
                      <p className="font-ui font-semibold text-sm">{messages.length}</p>
                    </div>
                    <div className="rounded-lg bg-[#F3EFE6] p-2">
                      <p className="text-[#5C5543]">Session</p>
                      <p className="font-ui font-semibold text-sm truncate">{sessionId ? 'Active' : 'New'}</p>
                    </div>
                    <div className="rounded-lg bg-[#F3EFE6] p-2">
                      <p className="text-[#5C5543]">Language</p>
                      <p className="font-ui font-semibold text-sm">{language === 'en' ? 'English' : 'Hausa'}</p>
                    </div>
                    <div className="rounded-lg bg-[#F3EFE6] p-2">
                      <p className="text-[#5C5543]">Status</p>
                      <p className="font-ui font-semibold text-sm text-[#3A6B4B]">Secured</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#C9A03D]/25 bg-white/60 p-3">
                  <p className="text-xs font-ui tracking-[0.15em] uppercase text-[#5C5543] mb-2">Recent Briefings</p>
                  <div className="space-y-1.5">
                    {[
                      { title: 'Infrastructure Monitoring', time: 'Today · 09:40', icon: TrendingUp },
                      { title: 'Healthcare Milestones', time: 'Today · 08:10', icon: Activity },
                      { title: 'Policy Media Roundup', time: 'Yesterday', icon: Newspaper },
                    ].map((item) => (
                      <button
                        key={item.title}
                        className="w-full rounded-lg px-3 py-2 text-left hover:bg-[#F1E8DA]/80 transition"
                        onClick={() => setInput(item.title)}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon size={13} className="text-[#3A6B4B]" />
                          <p className="text-sm font-body">{item.title}</p>
                        </div>
                        <p className="text-[11px] text-[#5C5543] mt-1">{item.time}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 border-t border-[#C9A03D]/20 p-4 bg-gradient-to-t from-[#FFFDF9] to-transparent">
                <p className="text-xs text-[#5C5543] flex items-center gap-2">
                  <Shield size={12} className="text-[#3A6B4B]" /> Verified government channel
                </p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 z-20 border-b border-[#C9A03D]/20 bg-[#FFFDF9]/80 backdrop-blur-xl">
            <div className="px-4 md:px-7 py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  className="p-2.5 rounded-xl hover:bg-[#F3ECDD] transition"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h2 className="font-heading text-lg md:text-xl font-semibold">Official AI Governor Console</h2>
                  <p className="text-xs text-[#5C5543] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                    Intelligent civic assistant with live briefing support
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSources((prev) => !prev)}
                  className="hidden md:flex items-center gap-1.5 rounded-xl border border-[#C9A03D]/30 bg-[#FFF8EE] px-3 py-2 text-sm"
                >
                  <BookOpen size={14} className="text-[#C9A03D]" /> Sources
                  <ChevronDown size={14} className={showSources ? 'rotate-180 transition' : 'transition'} />
                </button>

                <button
                  onClick={() => setLanguage((prev) => (prev === 'en' ? 'ha' : 'en'))}
                  className="flex items-center gap-2 rounded-xl border border-[#3A6B4B]/30 bg-[#EAF2ED] px-3 py-2 text-sm font-ui"
                >
                  <Globe size={14} className="text-[#3A6B4B]" />
                  {language === 'en' ? 'English' : 'Hausa'}
                </button>
              </div>
            </div>
          </header>

          <section className="px-4 md:px-7 pt-5 pb-4 grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4 border-b border-[#C9A03D]/20 bg-gradient-to-b from-[#FFFDF9]/70 to-transparent">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-[#C9A03D]/30 bg-[#FFFDF9]/80 p-5 shadow-[0_10px_35px_rgba(44,36,24,0.08)]"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[#3A6B4B] font-ui">Governor Persona Node</p>
              <div className="mt-4 flex flex-col md:flex-row md:items-center gap-5">
                <div className="relative w-36 h-36 rounded-full border-2 border-dashed border-[#3A6B4B]/50 bg-gradient-to-br from-[#F4EEE2] to-[#FFFDF9] flex items-center justify-center mx-auto md:mx-0">
                  <motion.div
                    className="absolute inset-[-8px] rounded-full border border-[#3A6B4B]/30"
                    animate={{ scale: [1, 1.09, 1], opacity: [0.4, 0.15, 0.4] }}
                    transition={{ duration: 2.3, repeat: Infinity }}
                  />
                  <UserCircle2 size={68} className="text-[#3A6B4B]" />
                </div>

                <div className="text-center md:text-left">
                  <h3 className="font-heading text-2xl md:text-3xl font-semibold bg-gradient-to-r from-[#2C2418] via-[#3A6B4B] to-[#B84A2C] bg-clip-text text-transparent">
                    Governor Avatar Placeholder
                  </h3>
                  <p className="mt-2 text-sm text-[#5C5543] max-w-xl leading-6">
                    Reserved for official avatar feed. Lip-sync, voice modulation, and reactive facial cues will anchor here when voice mode is enabled.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EAF2ED] px-3 py-1 text-xs border border-[#3A6B4B]/30">
                    <AudioLines size={13} className="text-[#3A6B4B]" />
                    Ready for Voice Integration
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              <SoundWavePlaceholder active={voicePreview || isLoading} />
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded-xl bg-[#FFFDF9]/80 border border-[#C9A03D]/25 p-3">
                  <p className="text-[#5C5543]">Latency</p>
                  <p className="font-ui text-sm">~120ms</p>
                </div>
                <div className="rounded-xl bg-[#FFFDF9]/80 border border-[#C9A03D]/25 p-3">
                  <p className="text-[#5C5543]">Voice Layer</p>
                  <p className="font-ui text-sm">Planned</p>
                </div>
                <div className="rounded-xl bg-[#FFFDF9]/80 border border-[#C9A03D]/25 p-3">
                  <p className="text-[#5C5543]">Sync</p>
                  <p className="font-ui text-sm text-[#3A6B4B]">Preview</p>
                </div>
              </div>
            </motion.div>
          </section>

          <section className="flex-1 overflow-y-auto px-4 md:px-7 py-6 space-y-5">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-[#C9A03D]/25 bg-[#FFFDF9]/70 p-8 text-center shadow-[0_12px_45px_rgba(44,36,24,0.07)]"
              >
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C9A03D] via-[#B84A2C] to-[#3A6B4B] text-white flex items-center justify-center shadow-xl">
                  <Sparkles size={34} />
                </div>
                <h4 className="mt-5 text-2xl font-heading font-semibold">Welcome to the Executive AI Briefing Room</h4>
                <p className="mt-2 text-[#5C5543] max-w-2xl mx-auto leading-7">
                  {language === 'en'
                    ? 'Ask about governance, projects, policy analysis, strategic communication, and performance metrics across Bauchi State.'
                    : 'Tambayi game da mulki, ayyuka, nazarin manufofi, sadarwa, da ma aunin cigaban Jihar Bauchi.'}
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-2">
                  {[
                    { text: 'Summarize key achievements this quarter', icon: TrendingUp },
                    { text: 'Explain flagship healthcare interventions', icon: Activity },
                    { text: 'Prepare policy speech points', icon: Newspaper },
                    { text: 'List infrastructure milestones by zone', icon: CalendarDays },
                  ].map((chip) => (
                    <button
                      key={chip.text}
                      onClick={() => setInput(chip.text)}
                      className="rounded-full border border-[#C9A03D]/35 bg-[#FFFDF9] px-4 py-2 text-sm font-ui hover:border-[#3A6B4B]/45 hover:text-[#3A6B4B] transition"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <chip.icon size={14} />
                        {chip.text}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, x: msg.role === 'user' ? 36 : -36 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.35, delay: index * 0.03 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] md:max-w-[74%] ${msg.role === 'user' ? '' : 'mr-auto'}`}>
                  <div
                    className={`rounded-2xl px-5 py-4 shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-[#B84A2C] to-[#C9A03D] text-white'
                        : 'bg-[#FFFDF9]/95 border border-[#3A6B4B]/25'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <RevealText
                        text={msg.content}
                        active={msg.id === messages[messages.length - 1]?.id && !isLoading}
                        speed={13}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-[15px] leading-7">{msg.content}</p>
                    )}
                  </div>

                  {msg.role === 'assistant' && showSources && msg.sources && msg.sources.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 rounded-xl border-l-4 border-[#3A6B4B] bg-[#F1EFE7]/95 px-4 py-3"
                    >
                      <p className="text-xs uppercase tracking-[0.14em] text-[#3A6B4B] font-ui mb-2">Reference Sources</p>
                      <div className="space-y-1 text-xs text-[#5C5543]">
                        {msg.sources.map((source) => (
                          <p key={source}>• {source}</p>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}

                  <p className="text-[11px] text-[#5C5543]/75 mt-1 px-1 font-ui">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Streaming Message */}
            {streamingMessage && streamingId && (
              <motion.div
                initial={{ opacity: 0, x: -36 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[90%] md:max-w-[74%] mr-auto">
                  <div className="rounded-2xl px-5 py-4 shadow-lg bg-[#FFFDF9]/95 border border-[#3A6B4B]/25">
                    <RevealText
                      text={streamingMessage}
                      active={true}
                      speed={10}
                    />
                  </div>
                  <p className="text-[11px] text-[#5C5543]/75 mt-1 px-1 font-ui">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            )}

            {isLoading && !streamingMessage ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="rounded-2xl border border-[#3A6B4B]/30 bg-[#FFFDF9]/90 px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2 text-[#3A6B4B]">
                    <Waves size={16} />
                    <p className="text-xs font-ui">Generating executive response...</p>
                  </div>
                </div>
              </motion.div>
            ) : null}

            <div ref={messagesEndRef} />
          </section>

          <footer className="border-t border-[#C9A03D]/25 bg-[#FFFDF9]/90 backdrop-blur-xl px-4 md:px-7 py-4">
            <div className="max-w-6xl mx-auto">
              <div className="rounded-2xl border border-[#C9A03D]/35 bg-gradient-to-r from-[#F6EFE4] via-[#FFFDF9] to-[#EAF2ED] p-2 md:p-3 shadow-lg">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textAreaRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={language === 'en' ? 'Ask the Governor AI Assistant...' : 'Tambayi Mataimakin AI na Gwamna...'}
                    rows={1}
                    className="flex-1 max-h-[180px] resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 outline-none placeholder:text-[#5C5543]/55"
                  />

                  <div className="flex items-center gap-2 px-1 pb-1">
                    <button
                      onClick={() => setVoicePreview((prev) => !prev)}
                      className={`p-2.5 rounded-xl border transition ${
                        voicePreview
                          ? 'bg-[#EAF2ED] border-[#3A6B4B]/45 text-[#3A6B4B]'
                          : 'bg-[#FFFDF9] border-[#C9A03D]/35 text-[#5C5543]'
                      }`}
                      title="Toggle voice wave preview"
                    >
                      <Mic size={18} />
                    </button>

                    <button
                      onClick={() => void handleSend()}
                      disabled={!input.trim() || isLoading}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-[#3A6B4B] via-[#C9A03D] to-[#B84A2C] text-white shadow-md disabled:opacity-45 disabled:cursor-not-allowed"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#5C5543]">
                <p className="flex items-center gap-1.5">
                  <Shield size={12} className="text-[#3A6B4B]" />
                  AI responses are generated from curated government data and model reasoning.
                </p>
                <p className="font-ui">
                  <span className="inline-flex items-center gap-1">
                    <History size={12} /> Shift+Enter for new line
                  </span>
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}