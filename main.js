import './style.css';
import 'xterm/css/xterm.css';
import { WebContainer } from '@webcontainer/api';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import * as monaco from 'monaco-editor';
import { files } from './files';

// Monaco Worker Setup for Vite
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;
let editor;
let terminal;
let fitAddon;

const statusText = document.getElementById('status-text');
const iframeEl = document.getElementById('preview-iframe');
const terminalContainer = document.getElementById('terminal-container');
const editorContainer = document.getElementById('editor-container');

window.addEventListener('load', async () => {
  // Initialize Terminal
  terminal = new Terminal({
    convertEol: true,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    fontSize: 12,
    theme: {
      background: '#000000'
    }
  });
  fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.open(terminalContainer);
  fitAddon.fit();

  // Initialize Monaco Editor
  editor = monaco.editor.create(editorContainer, {
    value: files['index.js'].file.contents,
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
  });

  editor.onDidChangeModelContent(() => {
    const content = editor.getValue();
    writeIndexJS(content);
  });

  terminal.writeln('Booting WebContainer...');
  statusText.innerText = 'Booting...';

  try {
    // Call only once
    webcontainerInstance = await WebContainer.boot();
    await webcontainerInstance.mount(files);

    statusText.innerText = 'Installing...';
    terminal.writeln('Installing dependencies...');
    
    const exitCode = await installDependencies();
    if (exitCode !== 0) {
      statusText.innerText = 'Error';
      terminal.writeln('\x1b[31mInstallation failed\x1b[0m');
      return;
    }

    statusText.innerText = 'Running';
    terminal.writeln('Starting dev server...');
    startDevServer();

  } catch (err) {
    console.error(err);
    terminal.writeln(`\x1b[31mError: ${err.message}\x1b[0m`);
    statusText.innerText = 'Failed';
  }
});

async function installDependencies() {
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);
  
  installProcess.output.pipeTo(new WritableStream({
    write(data) {
      terminal.write(data);
    }
  }));

  return installProcess.exit;
}

async function startDevServer() {
  const serverProcess = await webcontainerInstance.spawn('npm', ['run', 'start']);
  
  serverProcess.output.pipeTo(new WritableStream({
    write(data) {
      terminal.write(data);
    }
  }));

  // Wait for `server-ready` event
  webcontainerInstance.on('server-ready', (port, url) => {
    iframeEl.src = url;
    terminal.writeln(`\x1b[32mServer is ready at ${url}\x1b[0m`);
  });
}

async function writeIndexJS(content) {
  await webcontainerInstance.fs.writeFile('/index.js', content);
}

// Sidebar logic
document.querySelectorAll('.file-item').forEach(item => {
    item.addEventListener('click', async () => {
        document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        const fileName = item.getAttribute('data-file');
        document.querySelector('.editor-pane .pane-header').innerText = fileName;
        
        // Update editor content and language
        let content = '';
        if (fileName === 'index.js') {
            content = await webcontainerInstance.fs.readFile('/index.js', 'utf-8');
            monaco.editor.setModelLanguage(editor.getModel(), 'javascript');
        } else if (fileName === 'package.json') {
            content = await webcontainerInstance.fs.readFile('/package.json', 'utf-8');
            monaco.editor.setModelLanguage(editor.getModel(), 'json');
        }
        
        editor.setValue(content);
    });
});

window.addEventListener('resize', () => {
    fitAddon.fit();
});
