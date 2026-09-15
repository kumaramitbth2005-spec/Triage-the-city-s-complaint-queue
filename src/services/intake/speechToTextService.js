/**
 * Speech-to-Text Service
 * Wraps the browser's Web Speech API (webkitSpeechRecognition / SpeechRecognition).
 * Designed for easy replacement with a production API (Whisper, Google Speech, etc.)
 *
 * Public API:
 *   speechToTextService.isSupported()
 *   speechToTextService.startRecording(lang, onInterim, onFinal)
 *   speechToTextService.stopRecording()
 *   speechToTextService.cancelRecording()
 */

class SpeechToTextService {
  constructor() {
    this._recognition = null;
    this._isRecording = false;
  }

  /**
   * Returns true if the browser supports speech recognition.
   */
  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Start recording. Calls onInterim with live partial results and onFinal when done.
   * @param {string} lang  — BCP-47 language tag e.g. 'en-IN', 'hi-IN'
   * @param {(text: string) => void} onInterim
   * @param {(text: string) => void} onFinal
   * @returns {Promise<void>} resolves when recording starts, rejects on error
   */
  startRecording(lang = 'en-IN', onInterim = () => {}, onFinal = () => {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('SPEECH_API_UNAVAILABLE'));
        return;
      }
      if (this._isRecording) {
        this.stopRecording();
      }

      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this._recognition = new Recognition();
      this._recognition.lang = lang;
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
    });
  }

  /**
   * Stop the active recording session gracefully.
   */
  stopRecording() {
    if (this._recognition && this._isRecording) {
      this._recognition.stop();
      this._isRecording = false;
    }
  }

  /**
   * Cancel without processing the result.
   */
  cancelRecording() {
    if (this._recognition) {
      this._recognition.abort();
      this._isRecording = false;
      this._recognition = null;
    }
  }

  get isRecording() {
    return this._isRecording;
  }
}

export const speechToTextService = new SpeechToTextService();
