import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import * as api from '../api/index.js';
import { createTheme } from '@uiw/codemirror-themes';

function App() {
  const [value, setValue] = React.useState('');
  const [pretty, setPretty] = React.useState('');
  const [result, setResult] = React.useState('');
  const [debug, setDebug] = React.useState('false');

  const myTheme = createTheme({
    theme: 'light',
    settings: {
      foreground: '#FF0000',
    },
  })

  const onChange = React.useCallback(async (value, viewUpdate) => {
    setValue(value);
    const code = { code: value };
    try {
      const response = await api.prettyPrint(code);
      if (response.data === '') {
        setPretty(value);
      } else {
        setPretty(response.data);
      }
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleRunClick = async () => {
    console.log('value:', value);
    const code = { code: value };
    try {
      const response = await api.executeAll(code);
      setDebug('false');
      setResult(response.data);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }; 

  const handleDebugClick = async () => {
    console.log('value:', value);
    const code = { code: value };
    try {
      const response = await api.debugMode(code);
      if (debug === 'true') {
        setDebug('false');
      } else if (debug === 'false') {
        setDebug('true');
      }
      setResult(response.data);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }; 

  const handleStepClick = async () => {
    console.log('value:', value);
    const code = { code: value };
    try {
      const response = await api.executeStep(code);
      setResult(response.data);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }; 

  return (
    <>
      <div id="wrapper">
        <div id="editor">
          <CodeMirror
            value={value}
            height="200px"
            onChange={onChange}
          />
        </div>
        <div id="pretty-print">
          <CodeMirror
            value={pretty}
            height="200px"
            editable={false}
          />
        </div>
      </div>
      <button onClick={handleRunClick}>
        Run Code
      </button>
      <button onClick={handleDebugClick}>
        Debug
      </button>
      <button onClick={handleStepClick}>
        Run Line
      </button>
      <p>Debug Mode: {debug}</p>
      <p>Result:</p>
      <pre>
      {result}
      </pre>
  </>
  );
}

export default App;