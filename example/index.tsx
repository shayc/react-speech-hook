import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useSpeech, SpeechProvider } from '../.';

const App = () => {
  const { voices, setVoice, speak } = useSpeech();

  return (
    <div>
      {voices.length && (
        <select
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

      <button
        onClick={() => {
          speak('hello');
        }}
        type="button"
      >
        Hello
      </button>
    </div>
  );
};

ReactDOM.render(
  <SpeechProvider>
    <App />
  </SpeechProvider>,
  document.getElementById('root')
);
