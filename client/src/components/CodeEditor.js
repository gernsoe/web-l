import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import * as api from '../api/index.js';

function App() {
  const [value, setValue] = React.useState('');
  const [result, setResult] = React.useState('');
  const onChange = React.useCallback((value, viewUpdate) => {
    setValue(value);
  }, []);

  const checkOptions = React.useCallback((editor, data, value) => {
      console.log(editor.options);
  }, []);

  const handleButtonClick = async () => {
    console.log('value:', value);
    const post = { code: value };
    try {
      const response = await api.createPost(post);
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
            value={value}
            height="200px"
            options={{
              readOnly: "nocursor"
            }}
            onChange={checkOptions}
          />
        </div>
      </div>
      <button onClick={handleButtonClick}>
        Run Code!
      </button>
      <p>Result:</p>
      <pre>{result}</pre>
  </>
  );
}

export default App;