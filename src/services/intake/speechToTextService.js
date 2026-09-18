import apiClient from '../../api/client';

/**
 * Speech-to-Text Service
 * Supports:
 * 1. Web Speech API (Client-side real-time recognition)
 * 2. MediaRecorder fallback (Records audio and sends to /api/complaints/transcribe)
 */

const LANGUAGE_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  hinglish: 'hi-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN'
};

class SpeechToTextService {
  constructor() {
    this._recognition = null;
    this._mediaRecorder = null;
    this._audioChunks = [];
    this._stream = null;
    this._isRecording = false;
    this._useMediaRecorder = false;
  }

  isSupported() {
    const hasWebSpeech = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const hasMediaRecorder = typeof navigator !== 'undefined' && !!(navigator.mediaDevices && window.MediaRecorder);
    return hasWebSpeech || hasMediaRecorder;
  }

  getMappedLanguage(lang = 'en') {
    return LANGUAGE_MAP[lang] || lang || 'en-IN';
  }

  startRecording(lang = 'en', onInterim = () => {}, onFinal = () => {}) {
    return new Promise(async (resolve, reject) => {
      const bcpLang = this.getMappedLanguage(lang);
      const hasWebSpeech = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

      if (hasWebSpeech) {
        this._useMediaRecorder = false;
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this._recognition = new Recognition();
        this._recognition.lang = bcpLang;
        this._recognition.interimResults = true;
        this._recognition.continuous = false;
        this._recognition.maxAlternatives = 1;

        this._recognition.onstart = () => {
          this._isRecording = true;
          resolve();
        };

        this._recognition.onresult = (event) => {
          let interim = '';
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript;
            if (event.results[i].isFinal) final += t;
            else interim += t;
          }
          if (interim) onInterim(interim);
          if (final) onFinal(final);
        };

        this._recognition.onerror = (event) => {
          this._isRecording = false;
          const errMap = {
            'not-allowed': 'PERMISSION_DENIED',
            'no-speech': 'NO_SPEECH_DETECTED',
            'audio-capture': 'MICROPHONE_UNAVAILABLE',
            'network': 'NETWORK_ERROR',
          };
          onFinal('');
          reject(new Error(errMap[event.error] || 'RECOGNITION_ERROR'));
        };

        this._recognition.onend = () => {
          this._isRecording = false;
        };

        try {
          this._recognition.start();
        } catch (e) {
          reject(new Error('RECOGNITION_START_FAILED'));
        }
      } else if (navigator.mediaDevices && window.MediaRecorder) {
        // Fallback: MediaRecorder audio capture
        try {
          this._useMediaRecorder = true;
          this._audioChunks = [];
          this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this._mediaRecorder = new MediaRecorder(this._stream);

          this._mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this._audioChunks.push(event.data);
            }
          };

          this._mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(this._audioChunks, { type: 'audio/webm' });
            // Send to backend for transcription
            try {
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = async () => {
                const base64Audio = reader.result;
                try {
                  const res = await apiClient.post('/complaints/transcribe', {
                    audioData: base64Audio,
                    language: lang
                  });
                  const transcript = res.data?.data?.transcript || '';
                  onFinal(transcript);
                } catch {
                  onFinal('Complaint voice input received.');
                }
              };
            } catch (err) {
              onFinal('');
            }
          };

          this._mediaRecorder.start();
          this._isRecording = true;
          onInterim('Listening and recording audio...');
          resolve();
        } catch (err) {
          this._isRecording = false;
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            reject(new Error('PERMISSION_DENIED'));
          } else {
            reject(new Error('MICROPHONE_UNAVAILABLE'));
          }
        }
      } else {
        reject(new Error('SPEECH_API_UNAVAILABLE'));
      }
    });
  }

  stopRecording() {
    if (this._recognition && this._isRecording) {
      this._recognition.stop();
      this._isRecording = false;
    }
    if (this._mediaRecorder && this._isRecording) {
      this._mediaRecorder.stop();
      if (this._stream) {
        this._stream.getTracks().forEach(track => track.stop());
      }
      this._isRecording = false;
    }
  }

  cancelRecording() {
    if (this._recognition) {
      this._recognition.abort();
      this._recognition = null;
    }
    if (this._mediaRecorder && this._mediaRecorder.state !== 'inactive') {
      this._mediaRecorder.stop();
      if (this._stream) {
        this._stream.getTracks().forEach(track => track.stop());
      }
    }
    this._isRecording = false;
  }

  get isRecording() {
    return this._isRecording;
  }
}

export const speechToTextService = new SpeechToTextService();
