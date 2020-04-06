import React, {
  useContext,
  useState,
  useEffect,
  FunctionComponent,
} from 'react';
import PropTypes from 'prop-types';

import {
  DEFAULT_PITCH,
  DEFAULT_RATE,
  DEFAULT_VOLUME,
  createAsyncSpeech,
} from '@shayc/async-speech';

export {
  MIN_PITCH,
  MIN_RATE,
  MIN_VOLUME,
  MAX_PITCH,
  MAX_RATE,
  MAX_VOLUME,
  DEFAULT_PITCH,
  DEFAULT_RATE,
  DEFAULT_VOLUME,
} from '@shayc/async-speech';

interface SpeechContext {
  boundary: any;
  isPaused: boolean;
  isSpeaking: boolean;
  lang: string;
  pitch: number;
  rate: number;
  setBoundary: Function;
  setIsPaused: Function;
  setIsSpeaking: Function;
  setLang: Function;
  setPitch: Function;
  setRate: Function;
  setVolume: Function;
  setVoiceURI: Function;
  voices: SpeechSynthesisVoice[];
  voiceURI: string;
  volume: number;
}

interface SpeechProviderProps {
  options?: {
    lang: string;
    pitch: number;
    rate: number;
    volume: number;
  };
}

const asyncSpeech = createAsyncSpeech(window.speechSynthesis);
const SpeechContext = React.createContext<SpeechContext | null>(null);

export function useSpeech() {
  const context = useContext(SpeechContext);

  if (!context) {
    throw new Error(`useSpeech must be used within a SpeechProvider`);
  }

  const {
    boundary,
    isPaused,
    isSpeaking,
    lang,
    pitch,
    rate,
    setBoundary,
    setIsPaused,
    setIsSpeaking,
    setLang,
    setPitch,
    setRate,
    setVolume,
    setVoiceURI,
    voices,
    voiceURI,
    volume,
  } = context;

  function getVoice(voiceURI: string): SpeechSynthesisVoice | null {
    return voices.find(v => v.voiceURI === voiceURI) || null;
  }

  function getSpeechOptions() {
    const voice = getVoice(voiceURI);

    function onBoundary(event: SpeechSynthesisEvent) {
      const { charIndex, charLength, elapsedTime, name } = event;
      setBoundary({ charIndex, charLength, elapsedTime, name });
    }

    return { lang, pitch, rate, onBoundary, voice, volume };
  }

  function speak(text: string): Promise<SpeechSynthesisEvent> {
    setIsSpeaking(true);
    const options = getSpeechOptions();

    return asyncSpeech.speak(text, options);
  }

  function cancel() {
    setIsSpeaking(false);
    setIsPaused(false);
    setBoundary({});
    asyncSpeech.cancel();
  }

  function pause() {
    setIsPaused(true);
    asyncSpeech.pause();
  }

  function resume() {
    setIsPaused(false);
    asyncSpeech.resume();
  }

  return {
    boundary,
    cancel,
    isPaused,
    isSpeaking,
    pause,
    resume,
    setLang,
    setPitch,
    setRate,
    setVoice: setVoiceURI,
    setVolume,
    speak,
    voices,
    voiceURI,
  };
}

export const SpeechProvider: FunctionComponent<SpeechProviderProps> = ({
  children,
  options = {
    lang: 'en',
    pitch: DEFAULT_PITCH,
    rate: DEFAULT_RATE,
    volume: DEFAULT_VOLUME,
  },
}) => {
  const [lang, setLang] = useState(options.lang);
  const [pitch, setPitch] = useState(options.pitch);
  const [rate, setRate] = useState(options.rate);
  const [volume, setVolume] = useState(options.volume);

  const [voices, setVoices] = useState([] as SpeechSynthesisVoice[]);
  const [voiceURI, setVoiceURI] = useState('');
  const [boundary, setBoundary] = useState({} as SpeechSynthesisEvent);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function getVoices() {
      const voices = await asyncSpeech.getVoices();
      const sortedVoices = voices.sort((a, b) => a.lang.localeCompare(b.lang));
      setVoices(sortedVoices);
    }

    getVoices();
  }, []);

  useEffect(() => {
    if (lang && voices.length) {
      const defaultVoice = getDefaultVoiceByLang(lang, voices);
      setVoiceURI(defaultVoice.voiceURI);
    }
  }, [lang, voices]);

  function getDefaultVoiceByLang(lang: string, voices: SpeechSynthesisVoice[]) {
    const voicesByLang = voices.filter(v => v.lang.includes(lang));

    const defaultVoice =
      voicesByLang.filter(v => v.default)[0] || voicesByLang[0];

    return defaultVoice;
  }

  // TODO: Potential perf issue, new context ref on each render - use React.useMemo
  const value = {
    boundary,
    isPaused,
    isSpeaking,
    lang,
    pitch,
    rate,
    setBoundary,
    setIsPaused,
    setIsSpeaking,
    setLang,
    setPitch,
    setRate,
    setVoiceURI,
    setVolume,
    voices,
    voiceURI,
    volume,
  };

  return (
    <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>
  );
};

SpeechProvider.propTypes = {
  options: PropTypes.shape({
    /**
     * Speech language
     */
    lang: PropTypes.string.isRequired,
    /**
     * Speech pitch
     */
    pitch: PropTypes.number.isRequired,
    /**
     * Speech rate
     */
    rate: PropTypes.number.isRequired,
    /**
     * Speech volume
     */
    volume: PropTypes.number.isRequired,
  }),
};
