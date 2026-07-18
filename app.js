/**
 * LittleKt Playground — UI logic.
 *
 * Imports the browser-adapted runtime from JsKt via jsDelivr CDN
 * and the example programs from examples.js.
 */
import { createPlaygroundRuntime } from 'https://cdn.jsdelivr.net/gh/LittleKt-Lang/JsKt@main/src/browser.js';
import { examples } from './examples.js';

// ---- DOM refs -----------------------------------------------------------
const editor     = document.getElementById('editor');
const lineNums   = document.getElementById('line-numbers');
const outputWrap = document.getElementById('output-wrap');
const btnRun     = document.getElementById('btn-run');
const btnClear   = document.getElementById('btn-clear');
const selExample = document.getElementById('sel-example');
const statusInd  = document.getElementById('status-indicator');
const statusTime = document.getElementById('status-time');
const statusLines= document.getElementById('status-lines');

// ---- Escape HTML --------------------------------------------------------
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---- Line numbers -------------------------------------------------------
function updateLineNumbers() {
  const lines = editor.value.split('\n').length;
  let html = '';
  for (let i = 1; i <= lines; i++) html += i + '\n';
  lineNums.textContent = html || '1';
  statusLines.textContent = `${lines} line${lines !== 1 ? 's' : ''}`;
}
editor.addEventListener('input', updateLineNumbers);

// ---- Sync scroll --------------------------------------------------------
editor.addEventListener('scroll', () => {
  lineNums.scrollTop = editor.scrollTop;
});

// ---- Tab key support ----------------------------------------------------
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = editor.selectionStart;
    const end   = editor.selectionEnd;
    editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + 4;
    updateLineNumbers();
  }
  // Ctrl+Enter or Cmd+Enter
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runCode();
  }
});

// ---- Buttons ------------------------------------------------------------
btnRun.addEventListener('click', runCode);
btnClear.addEventListener('click', clearOutput);

// ---- Clear output -------------------------------------------------------
function clearOutput() {
  outputWrap.innerHTML = '<div class="info">// Output cleared</div>';
  statusInd.textContent = '● Ready';
  statusInd.className = 'status-ok';
  statusTime.textContent = '';
}

// ---- Run ----------------------------------------------------------------
function runCode() {
  const source = editor.value;
  if (!source.trim()) return;

  outputWrap.innerHTML = '';
  statusInd.textContent = '● Running…';
  statusInd.className = '';
  statusTime.textContent = '';
  btnRun.disabled = true;

  // Use requestAnimationFrame so the UI updates before we block
  requestAnimationFrame(() => {
    const t0 = performance.now();
    const rt = createPlaygroundRuntime();

    rt.run(source, 'playground');

    const elapsed = (performance.now() - t0).toFixed(1);

    if (rt.hadError) {
      outputWrap.innerHTML = `<div class="error">${escapeHtml(rt.errorMessage)}</div>`;
      statusInd.textContent = '● Error';
      statusInd.className = 'status-err';
    } else {
      const text = rt.getOutputText();
      if (text) {
        outputWrap.innerHTML = text.split('\n').map(l =>
          `<div class="line">${escapeHtml(l)}</div>`
        ).join('');
      } else {
        outputWrap.innerHTML = '<div class="info">// Program ran with no output</div>';
      }
      statusInd.textContent = '● Ready';
      statusInd.className = 'status-ok';
    }

    statusTime.textContent = `${elapsed} ms`;
    btnRun.disabled = false;
    updateLineNumbers();
  });
}

// ---- Examples dropdown --------------------------------------------------
for (const [name] of Object.entries(examples)) {
  const opt = document.createElement('option');
  opt.value = name;
  opt.textContent = name;
  selExample.appendChild(opt);
}

selExample.addEventListener('change', () => {
  const name = selExample.value;
  if (name && examples[name]) {
    editor.value = examples[name];
    updateLineNumbers();
    clearOutput();
    // Scroll editor to top
    editor.scrollTop = 0;
    lineNums.scrollTop = 0;
  }
});

// ---- Init ---------------------------------------------------------------
updateLineNumbers();
