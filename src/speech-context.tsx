import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  FunctionComponent,
  ReactNode,
} from 'react';
import PropTypes from 'prop-types';

import {
  MIN_PITCH,
  MIN_RATE,
  MIN_VOLUME,
  MAX_PITCH,
  MAX_RATE,
  MAX_VOLUME,
  DEFAULT_PITCH,
  DEFAULT_RATE,
  DEFAULT_VOLUME,
  createAsyncSpeech,
} from '@shayc/async-speech';

interface SpeechContextInterface {
  boundary: any;
  isPaused: boolean;
  isSpeaking: boolean;
  options: SpeechOptions;
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
}

interface SpeechOptions {
  lang: string;
  pitch: number;
  rate: number;
  volume: number;
  [key: string]: string | number;
}

interface SpeechProviderProps {
  children?: ReactNode;
  lang?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

const asyncSpeech = createAsyncSpeech(window.speechSynthesis);
const SpeechContext = React.createContext<SpeechContextInterface | null>(null);

export function useSpeech() {
  const context = useContext(SpeechContext);

  if (!context) {
    throw new Error(`useSpeech must be used within a SpeechProvider`);
  }

  const {
    boundary,
    isPaused,
    isSpeaking,
    options,
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
  } = context;

  function getSpeechOptions() {
    const voice = voices.find(
      (v: SpeechSynthesisVoice) => v.voiceURI === voiceURI
    );

    const eventHandlers: Pick<SpeechSynthesisUtterance, 'onboundary'> = {
      onboundary(event) {
        const { charIndex, charLength, elapsedTime, name } = event;
        setBoundary({ charIndex, charLength, elapsedTime, name });
      },
    };

    return { ...options, ...eventHandlers, voice };
  }

  function speak(text: string) {
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
    options,
    pause,
    resume,
    setLang,
    setPitch,
    setRate,
    setVoiceURI,
    setVolume,
    speak,
    voices,
    voiceURI,
  };
}

export const SpeechProvider: FunctionComponent<SpeechProviderProps> = ({
  children,
  lang = 'en',
  pitch = DEFAULT_PITCH,
  rate = DEFAULT_RATE,
  volume = DEFAULT_VOLUME,
}) => {
  const optionsRef = useRef({ lang, pitch, rate, volume });
  const [options, setOptions] = useState({ lang, pitch, rate, volume });

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
    if (options.lang && voices.length) {
      const defaultVoice = getDefaultVoiceByLang(options.lang, voices);
      setVoiceURI(defaultVoice.voiceURI);
    }
  }, [options.lang, voices]);

  function getDefaultVoiceByLang(lang: string, voices: SpeechSynthesisVoice[]) {
    const voicesByLang = voices.filter(v => v.lang.includes(lang));

    const defaultVoice =
      voicesByLang.filter(v => v.default)[0] || voicesByLang[0];

    return defaultVoice;
  }

  function setOption(
    key: 'lang' | 'pitch' | 'rate' | 'volume',
    value: string | number
  ) {
    optionsRef.current = { ...optionsRef.current, [key]: value };

    setOptions(opts => ({ ...opts, [key]: value }));
  }

  function setLang(lang: string) {
    setOption('lang', lang);
  }

  function setPitch(pitch: number) {
    setOption('pitch', pitch);
  }

  function setRate(rate: number) {
    setOption('rate', rate);
  }

  function setVolume(volume: number) {
    setOption('volume', volume);
  }

  // TODO: Potential perf issue, new context ref on each render - use React.useMemo
  const value = {
    MAX_PITCH,
    MIN_PITCH,
    MAX_RATE,
    MIN_RATE,
    MAX_VOLUME,
    MIN_VOLUME,
    boundary,
    isPaused,
    isSpeaking,
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
    options: options,
  };

  return (
    <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>
  );
};

SpeechProvider.propTypes = {
  /**
   *
   */
  children: PropTypes.node,
  /**
   *
   */
  lang: PropTypes.string,
  /**
   * Speech pitch.
   */
  pitch: PropTypes.number,
  /**
   * Speech rate.
   */
  rate: PropTypes.number,
  /**
   * Speech volume.
   */
  volume: PropTypes.number,
};
