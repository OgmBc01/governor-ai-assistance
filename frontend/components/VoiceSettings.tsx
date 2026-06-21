'use client';

import React, { useState, useEffect } from 'react';
import { getVoiceService } from '../lib/voice.service';

interface VoiceSettingsProps {
  className?: string;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({ className = '' }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(0.9);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  const voiceService = getVoiceService();

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = voiceService.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [voiceService, selectedVoice]);

  const handleTestVoice = () => {
    const text = 'This is a test of the voice system for Bauchi AI Governor Assistant.';
    voiceService.speak(text, 'en', { rate, pitch, volume, voiceName: selectedVoice });
  };

  return (
    <div className={`p-4 rounded-xl border border-[#C9A03D]/25 bg-[#FFFDF9]/80 ${className}`}>
      <h4 className="font-heading text-sm font-semibold text-[#2C2418] mb-4">Voice Settings</h4>

      {/* Voice Selection */}
      <div className="mb-3">
        <label className="text-xs text-[#5C5543] font-ui block mb-1">Voice</label>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full p-2 rounded-lg border border-[#C9A03D]/30 bg-[#FFFDF9] text-sm"
        >
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Speed */}
      <div className="mb-3">
        <label className="text-xs text-[#5C5543] font-ui block mb-1">Speed: {rate.toFixed(1)}x</label>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="w-full accent-[#3A6B4B]"
        />
      </div>

      {/* Pitch */}
      <div className="mb-3">
        <label className="text-xs text-[#5C5543] font-ui block mb-1">Pitch: {pitch.toFixed(1)}</label>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={pitch}
          onChange={(e) => setPitch(parseFloat(e.target.value))}
          className="w-full accent-[#3A6B4B]"
        />
      </div>

      {/* Test Button */}
      <button
        onClick={handleTestVoice}
        className="w-full mt-2 p-2 rounded-xl bg-gradient-to-r from-[#3A6B4B] to-[#C9A03D] text-white text-sm font-ui hover:shadow-lg transition"
      >
        Test Voice
      </button>
    </div>
  );
};