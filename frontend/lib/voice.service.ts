// Voice Service for Bauchi AI Governor Assistant
// Uses Web Speech API for text-to-speech and speech-to-text

export class VoiceService {
  private synthesis: SpeechSynthesis | null = null;
  private recognition: {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
  } | null = null;
  private isSpeaking: boolean = false;
  private isListening: boolean = false;
  private utterance: SpeechSynthesisUtterance | null = null;
  private speechEndHandler: (() => void) | null = null;
  private speechStartHandler: (() => void) | null = null;
  private transcriptHandler: ((text: string) => void) | null = null;
  private errorHandler: ((error: string) => void) | null = null;
  private lastFinalTranscript: string = '';
  private lastFinalTranscriptAt: number = 0;
  private intentionallyStopped: boolean = false;
  private recognitionStarting: boolean = false;

  constructor() {
    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }

    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const speechWindow = window as Window & {
        SpeechRecognition?: new () => {
          lang: string;
          continuous: boolean;
          interimResults: boolean;
          maxAlternatives: number;
          onresult: ((event: SpeechRecognitionEvent) => void) | null;
          onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
          onend: (() => void) | null;
          start: () => void;
          stop: () => void;
        };
        webkitSpeechRecognition?: new () => {
          lang: string;
          continuous: boolean;
          interimResults: boolean;
          maxAlternatives: number;
          onresult: ((event: SpeechRecognitionEvent) => void) | null;
          onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
          onend: (() => void) | null;
          start: () => void;
          stop: () => void;
        };
      };

      const SpeechRecognitionCtor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
      if (SpeechRecognitionCtor) {
        this.recognition = new SpeechRecognitionCtor();
        this.setupRecognition();
      } else {
        console.warn('Speech recognition not supported in this browser');
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    // Emit a single finalized phrase rather than interim chunks.
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }

      const cleanedTranscript = finalTranscript.trim();
      if (!cleanedTranscript || !this.transcriptHandler) return;

      // Guard against duplicate final events produced by some browsers.
      const now = Date.now();
      if (cleanedTranscript === this.lastFinalTranscript && now - this.lastFinalTranscriptAt < 2000) {
        return;
      }

      this.lastFinalTranscript = cleanedTranscript;
      this.lastFinalTranscriptAt = now;
      this.transcriptHandler(cleanedTranscript);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.recognitionStarting = false;
      if (this.errorHandler) {
        this.errorHandler(event.error);
      }
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.recognitionStarting = false;
      this.isListening = false;
    };
  }

  // ============ Text-to-Speech ============

  speak(
    text: string,
    language: 'en' | 'ha' = 'en',
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      voiceName?: string;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      if (!text || !text.trim()) {
        reject(new Error('Cannot speak empty text'));
        return;
      }

      // Cancel any ongoing speech
      this.intentionallyStopped = true;
      this.stop();
      this.intentionallyStopped = false;

      this.utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      this.utterance.lang = language === 'en' ? 'en-NG' : 'ha-NG';
      
      // Set options with reasonable defaults
      this.utterance.rate = options?.rate || 0.85;
      this.utterance.pitch = options?.pitch || 1;
      this.utterance.volume = options?.volume || 1;

      // Try to find a voice that matches the language
      const voices = this.synthesis.getVoices();
      if (voices && voices.length > 0) {
        // Try language-specific voice first
        let selectedVoice = voices.find(v => v.lang.startsWith(language === 'en' ? 'en' : 'ha'));
        // Fall back to any English/Hausa voice
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.includes(language === 'en' ? 'en' : 'ha'));
        }
        // Use first available voice if language match fails
        if (!selectedVoice && voices.length > 0) {
          selectedVoice = voices[0];
        }
        if (selectedVoice) {
          this.utterance.voice = selectedVoice;
        }
      }

      this.utterance.onstart = () => {
        console.log('Speech started');
        this.isSpeaking = true;
        if (this.speechStartHandler) this.speechStartHandler();
      };

      this.utterance.onend = () => {
        console.log('Speech ended');
        this.isSpeaking = false;
        this.utterance = null;
        if (this.speechEndHandler) this.speechEndHandler();
        resolve();
      };

      this.utterance.onerror = (event) => {
        // "interrupted" is expected when we intentionally stop speech, so treat it as a normal completion
        if (event.error === 'interrupted') {
          console.log('Speech was intentionally interrupted');
          this.isSpeaking = false;
          this.utterance = null;
          if (this.speechEndHandler) this.speechEndHandler();
          resolve();
        } else {
          console.error('Speech synthesis error:', event.error);
          this.isSpeaking = false;
          this.utterance = null;
          reject(new Error(`Speech error: ${event.error}`));
        }
      };

      // Start speaking
      console.log('Calling synthesis.speak() with text:', text.substring(0, 50) + '...');
      this.synthesis.speak(this.utterance);
    });
  }

  stop(): void {
    this.intentionallyStopped = true;
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.isSpeaking = false;
    this.utterance = null;
    this.intentionallyStopped = false;
  }

  pause(): void {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  get isSpeakingActive(): boolean {
    return this.isSpeaking;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  // ============ Speech-to-Text ============

  startListening(language: 'en' | 'ha' = 'en'): void {
    if (!this.recognition) {
      if (this.errorHandler) {
        this.errorHandler('Speech recognition not supported');
      }
      return;
    }

    if (this.isListening || this.recognitionStarting) {
      return;
    }

    this.recognition.lang = language === 'en' ? 'en-US' : 'ha-NG';
    this.recognitionStarting = true;

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      this.recognitionStarting = false;
      this.isListening = false;
      if (this.errorHandler) {
        this.errorHandler((error as Error).message || 'Failed to start speech recognition');
      }
    }
  }

  stopListening(): void {
    if (!this.recognition) return;

    try {
      if (this.isListening || this.recognitionStarting) {
        this.recognition.stop();
      }
    } catch {
      // Ignore stop errors from already-stopped recognizer state.
    } finally {
      this.recognitionStarting = false;
      this.isListening = false;
    }
  }

  get isListeningActive(): boolean {
    return this.isListening;
  }

  // ============ Event Handlers ============

  onSpeechStart(callback: () => void): void {
    this.speechStartHandler = callback;
  }

  onSpeechEnd(callback: () => void): void {
    this.speechEndHandler = callback;
  }

  onTranscript(callback: (text: string) => void): void {
    this.transcriptHandler = callback;
  }

  onError(callback: (error: string) => void): void {
    this.errorHandler = callback;
  }
}

// Singleton instance
let voiceServiceInstance: VoiceService | null = null;

export const getVoiceService = (): VoiceService => {
  if (!voiceServiceInstance) {
    voiceServiceInstance = new VoiceService();
  }
  return voiceServiceInstance;
};