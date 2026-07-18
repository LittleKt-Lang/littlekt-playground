/**
 * LittleKt Playground — Application controller.
 *
 * Imports the interpreter from JsKt via CDN, the code examples,
 * and the editor module that provides syntax highlighting and completion.
 */
import { createPlaygroundRuntime } from 'https://cdn.jsdelivr.net/gh/LittleKt-Lang/JsKt@main/src/browser.js';
import { examples } from './examples.js';
import { initEditor } from './editor.js';

// ── DOM refs ──────────────────────────────────────────────────
const editor     = document.getElementById('editor');
const lineNums   = document.getElementById('line-numbers');
const outputWrap = document.getElementById('output-wrap');
const btnRun     = document.getElementById('btn-run');
const btnClear   = document.getElementById('btn-clear');
const selExample = document.getElementById('sel-example');
const statusInd  = document.getElementById('status-indicator');
const statusTime = document.getElementById('status-time');
const completion = document.getElementById('completion-menu');

// ── Init editor module ────────────────────────────────────────
const ed = initEditor(editor, lineNums, completion,
  document.getElementById('status-lines'));

// ── Default code ──────────────────────────────────────────────
const defaultCode = `fun main(): Unit {
    println("Hello, LittleKt!")
    println("Welcome to the playground.")
}

main()
`;
ed.setSource(defaultCode);

// ── Escape HTML ───────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Run ───────────────────────────────────────────────────────
btnRun.addEventListener('click', runCode);

function runCode() {
  const source = ed.getSource();
  if (!source.trim()) return;

  outputWrap.innerHTML = '';
  statusInd.textContent = '● Running…'; statusInd.className = '';
  statusTime.textContent = ''; btnRun.disabled = true;

  requestAnimationFrame(() => {
    const t0 = performance.now();
    const rt = createPlaygroundRuntime();
    rt.run(source.endsWith('\n') ? source : source + '\n', 'playground');
    const elapsed = (performance.now() - t0).toFixed(1);

    if (rt.hadError) {
      outputWrap.innerHTML = `<div class="error">${escHtml(rt.errorMessage)}</div>`;
      statusInd.textContent = '● Error'; statusInd.className = 'status-err';
    } else {
      const text = rt.getOutputText();
      outputWrap.innerHTML = text
        ? text.split('\n').map(l => `<div class="line">${escHtml(l)}</div>`).join('')
        : '<div class="info">// Program ran with no output</div>';
      statusInd.textContent = '● Ready'; statusInd.className = 'status-ok';
    }

    statusTime.textContent = `${elapsed} ms`;
    btnRun.disabled = false;
    ed.updateLineNumbers();
  });
}

// ── Clear ─────────────────────────────────────────────────────
btnClear.addEventListener('click', () => {
  outputWrap.innerHTML = '<div class="info">// Output cleared</div>';
  statusInd.textContent = '● Ready'; statusInd.className = 'status-ok';
  statusTime.textContent = '';
});

// ── Examples dropdown ─────────────────────────────────────────
for (const [name] of Object.entries(examples)) {
  const opt = document.createElement('option');
  opt.value = name;
  opt.textContent = name;
  selExample.appendChild(opt);
}

selExample.addEventListener('change', () => {
  const name = selExample.value;
  if (name && examples[name]) {
    ed.setSource(examples[name]);
    outputWrap.innerHTML = '<div class="info">// Output cleared</div>';
    statusInd.textContent = '● Ready'; statusInd.className = 'status-ok';
    statusTime.textContent = '';
  }
});

// ── Global keyboard shortcut: Ctrl+Enter to run ───────────────
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runCode();
  }
});
