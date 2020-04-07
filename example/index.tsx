import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useSpeech, SpeechProvider } from '../.';

const App = () => {
  const {
    voices,
    setVoice,
    speak,
    boundary,
    cancel,
    isPaused,
    isSpeaking,
    languages,
    pause,
    resume,
    setLang,
    setPitch,
    setRate,
    setVolume,
    voiceURI,
  } = useSpeech();

  return (
    <div>
      <div>Is speaking: {isSpeaking.toString()}</div>
      <div>Is paused: {isPaused.toString()}</div>
      <div>
        Boundary: <pre>{JSON.stringify(boundary)}</pre>
      </div>
      <div>
        {!isSpeaking && (
          <button
            onClick={() => {
              speak('Hello everyone, how you doing?');
            }}
            type="button"
          >
            Speak
          </button>
        )}

        {isPaused && (
          <button onClick={resume} type="button">
            Resume
          </button>
        )}

        {!isPaused && isSpeaking && (
          <button onClick={pause} type="button">
            Pause
          </button>
        )}

        <button onClick={cancel} type="button">
          Cancel
        </button>
      </div>

      <div>
        Languages: {languages.length}
        {languages.length && (
          <ul>
            {languages.map(lang => (
              <li>{lang}</li>
            ))}
          </ul>
        )}
      </div>

      {voices.length && (
        <select
          value={voiceURI}
          onChange={event => {
            const voiceURI = event.target.value;
            setVoice(voiceURI);
          }}
        >
          {voices.map(voice => (
            <option value={voice.voiceURI} key={voice.voiceURI}>
              {voice.name}
            </option>
          ))}
        </select>
      )}

      {voices.length && (
        <div>
          Voices: {voices.length}
          <ul>
            {voices.map(voice => (
              <li key={voice.voiceURI}>
                <button
                  onClick={event => {
                    setVoice(voice.voiceURI);
                    speak('Hello');
                  }}
                >
                  {voice.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

ReactDOM.render(
  <SpeechProvider>
    <App />
  </SpeechProvider>,
  document.getElementById('root')
);
