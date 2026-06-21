'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, VolumeX, Pause, Play, Loader2 } from 'lucide-react';
import { getVoiceService } from '../lib/voice.service';

interface VoiceControlsProps {
  onTranscript: (text: string) => void;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  language?: 'en' | 'ha';
  className?: string;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  onTranscript,
  onSpeakStart,
  onSpeakEnd,
  language = 'en',
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onSpeakStartRef = useRef(onSpeakStart);
  const onSpeakEndRef = useRef(onSpeakEnd);

  const voiceService = getVoiceService();

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onSpeakStartRef.current = onSpeakStart;
    onSpeakEndRef.current = onSpeakEnd;
  }, [onTranscript, onSpeakStart, onSpeakEnd]);

  useEffect(() => {
    // Load voices
    const loadVoices = () => {
      const voices = voiceService.getVoices();
      if (voices.length > 0) {
        setIsLoadingVoices(false);
      }
    };

    // Some browsers need a delay to load voices
    const timeout = setTimeout(() => {
      loadVoices();
    }, 500);

    // Set up voice loading event
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      clearTimeout(timeout);
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [voiceService]);

  // Set up voice service event handlers
  useEffect(() => {
    voiceService.onSpeechStart(() => {
      setIsSpeaking(true);
      setIsPaused(false);
      onSpeakStartRef.current?.();
    });

    voiceService.onSpeechEnd(() => {
      setIsSpeaking(false);
      setIsPaused(false);
      onSpeakEndRef.current?.();
    });

    voiceService.onTranscript((text: string) => {
      setIsListening(false);
      onTranscriptRef.current(text);
    });

    voiceService.onError((errorMsg: string) => {
      setIsListening(false);
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    });
  }, [voiceService]);

  const handleToggleListening = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setError(null);
      voiceService.startListening(language);
      setIsListening(voiceService.isListeningActive);
    }
  };

  const handleTogglePause = () => {
    if (isPaused) {
      voiceService.resume();
      setIsPaused(false);
    } else {
      voiceService.pause();
      setIsPaused(true);
    }
  };

  const handleStopSpeaking = () => {
    voiceService.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Speech-to-Text Button */}
      <button
        onClick={handleToggleListening}
        disabled={isLoadingVoices}
        className={`p-2.5 rounded-xl transition-all duration-200 ${
          isListening
            ? 'bg-emerald-500/80 text-white animate-pulse shadow-[0_0_0_1px_rgba(110,231,183,0.5)]'
            : 'bg-[#11261E] border border-emerald-300/35 text-emerald-100 hover:border-emerald-200 hover:bg-[#173227]'
        } ${isLoadingVoices ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? <Mic size={18} /> : <MicOff size={18} />}
      </button>

      {/* Text-to-Speech Controls */}
      {isSpeaking && (
        <>
          <button
            onClick={handleTogglePause}
            className="p-2.5 rounded-xl bg-[#173227] border border-emerald-300/30 hover:bg-[#1D3C2E] transition"
            title={isPaused ? 'Resume speech' : 'Pause speech'}
          >
            {isPaused ? <Play size={18} className="text-emerald-200" /> : <Pause size={18} className="text-emerald-200" />}
          </button>

          <button
            onClick={handleStopSpeaking}
            className="p-2.5 rounded-xl bg-[#3B1F1A] border border-[#B84A2C]/35 hover:bg-[#51261D] transition"
            title="Stop speech"
          >
            <VolumeX size={18} className="text-[#F58D70]" />
          </button>
        </>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="flex items-center gap-1 ml-1">
          <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-1.5 h-2 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-1.5 h-3 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      )}

      {/* Loading Indicator */}
      {isLoadingVoices && (
        <Loader2 size={16} className="animate-spin text-emerald-300" />
      )}

      {/* Error Message */}
      {error && (
        <span className="text-xs text-[#F58D70] font-ui animate-fade-in">
          ⚠️ {error}
        </span>
      )}

      {/* Status Text */}
      {isListening && (
        <span className="text-xs text-emerald-200 font-ui animate-pulse">
          Listening...
        </span>
      )}
    </div>
  );
};

export default VoiceControls;