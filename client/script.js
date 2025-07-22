require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

let editor;

require(['vs/editor/editor.main'], () => {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: '// Start coding...\n',
    language: 'javascript',
    theme: 'vs-dark',
  });
});

async function sendCode() {
  const code = editor.getValue();
  const res = await fetch('/api/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: code })
  });
  const data = await res.json();
  document.getElementById('output').textContent = data.result;
}

document.getElementById('run').addEventListener('click', sendCode);

// Voice recording
let recording = false;
let recorder;
let audioChunks;

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recorder = new MediaRecorder(stream);
  audioChunks = [];
  recorder.ondataavailable = e => audioChunks.push(e.data);
  recorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob);
    const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
    const text = await res.text();
    editor.setValue(editor.getValue() + '\n' + text);
  };
  recorder.start();
}

function toggleRecording() {
  if (!recording) {
    startRecording();
    recording = true;
    document.getElementById('transcribe').textContent = 'Stop';
  } else {
    recorder.stop();
    recording = false;
    document.getElementById('transcribe').textContent = 'Voice to Code';
  }
}

document.getElementById('transcribe').addEventListener('click', toggleRecording);
