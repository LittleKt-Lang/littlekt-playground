/**
 * LittleKt Playground — Editor module.
 *
 * Provides syntax highlighting, code completion, undo/redo, smart input
 * handling, and caret management on a contenteditable div.
 */

// ══════════════════════════════════════════════════════════════
// Syntax highlighter
// ══════════════════════════════════════════════════════════════

const KW = new Set('val var fun class if else when for while in return break continue true false null init this is try catch finally throw open override super step to and or not'.split(' '));
const TY = new Set('Int Double String Boolean List Array Map Pair Function Unit Any Throwable Exception RuntimeException Error IntRange'.split(' '));
const BF = new Set('println print readLine arrayOf arrayOfNulls mapOf listOf'.split(' '));

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function hlString(src, start, end) {
  const o = []; let i = start;
  while (i < end) {
    if (src[i]==='$'&&src[i+1]==='$') { o.push('<span class=tm>$$</span>'); i+=2; continue; }
    if (src[i]==='$'&&src[i+1]==='{') {
      let d=1, s=i; i+=2;
      while (i<end && d>0) { if (src[i]==='{') d++; else if (src[i]==='}') d--; if (d>0) i++; }
      o.push('<span class=tm>', esc(src.slice(s, i+1)), '</span>'); i++; continue;
    }
    if (src[i]==='$'&&i+1<end && ((src[i+1]>='a'&&src[i+1]<='z')||(src[i+1]>='A'&&src[i+1]<='Z')||src[i+1]==='_')) {
      let s=i; i++;
      while (i<end && ((src[i]>='a'&&src[i]<='z')||(src[i]>='A'&&src[i]<='Z')||(src[i]>='0'&&src[i]<='9')||src[i]==='_')) i++;
      o.push('<span class=tm>', esc(src.slice(s, i)), '</span>'); continue;
    }
    if (src[i]==='\\'&&i+1<end) { o.push('<span class=te>', esc(src[i]), esc(src[i+1]), '</span>'); i+=2; continue; }
    o.push(esc(src[i])); i++;
  }
  return o.join('');
}

function highlightHTML(src) {
  const o = []; let i = 0, n = src.length;
  while (i < n) {
    if (src[i]==='/'&&src[i+1]==='/') { let s=i; while(i<n&&src[i]!=='\n')i++; o.push('<span class=c>',esc(src.slice(s,i)),'</span>'); if(i<n){o.push('\n');i++;} continue; }
    if (src[i]==='/'&&src[i+1]==='*') { let s=i,d=1;i+=2; while(i<n&&d>0){ if(src[i]==='/'&&src[i+1]==='*'){d++;i+=2;continue;} if(src[i]==='*'&&src[i+1]==='/'){d--;i+=2;continue;} if(src[i]==='\n'){i++;continue;} i++;} o.push('<span class=c>',esc(src.slice(s,i)),'</span>'); continue; }
    if (src[i]==='"'&&src[i+1]==='"'&&src[i+2]==='"') { let s=i;i+=3; while(i<n-2&&!(src[i]==='"'&&src[i+1]==='"'&&src[i+2]==='"'))i++; let e=i; i+=3; o.push('<span class=s>',hlString(src,s+3,e),'</span>'); continue; }
    if (src[i]==='"') { let s=i;i++; while(i<n&&src[i]!=='"'&&src[i]!=='\n'){ if(src[i]==='\\')i++;i++;} let closed=i<n&&src[i]==='"'; if(closed)i++; o.push('<span class=s>"',hlString(src,s+1,closed?i-1:i),closed?'"':'','</span>'); continue; }
    if (src[i]==="'"&&i+1<n&&src[i+1]!=="'") { let s=i;i++; while(i<n&&src[i]!=="'"&&src[i]!=='\n'){ if(src[i]==='\\')i++;i++;} let closed=i<n&&src[i]==="'"; if(closed)i++; o.push("<span class=s>'",hlString(src,s+1,closed?i-1:i),closed?"'":'','</span>'); continue; }
    if ((src[i]>='0'&&src[i]<='9')||(src[i]==='.'&&i+1<n&&src[i+1]>='0'&&src[i+1]<='9')) { let s=i; while(i<n&&((src[i]>='0'&&src[i]<='9')||src[i]==='.'||src[i]==='_'||src[i]==='e'||src[i]==='E'))i++; if((src[i-1]==='e'||src[i-1]==='E')&&(src[i]==='+'||src[i]==='-'))i++; while(i<n&&src[i]>='0'&&src[i]<='9')i++; o.push('<span class=n>',esc(src.slice(s,i)),'</span>'); continue; }
    if ((src[i]>='a'&&src[i]<='z')||(src[i]>='A'&&src[i]<='Z')||src[i]==='_') { let s=i; while(i<n&&((src[i]>='a'&&src[i]<='z')||(src[i]>='A'&&src[i]<='Z')||(src[i]>='0'&&src[i]<='9')||src[i]==='_'))i++; let w=src.slice(s,i); if(KW.has(w))o.push('<span class=kw>',esc(w),'</span>'); else if(TY.has(w))o.push('<span class=ty>',esc(w),'</span>'); else if(BF.has(w)||(i<n&&src[i]==='('))o.push('<span class=f>',esc(w),'</span>'); else o.push(esc(w)); continue; }
    o.push(esc(src[i])); i++;
  }
  return o.join('');
}

// ══════════════════════════════════════════════════════════════
// Caret (cursor) management
// ══════════════════════════════════════════════════════════════

function getCaret(editor) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return 0;
  const r = sel.getRangeAt(0);
  if (!editor.contains(r.startContainer)) return 0;
  const walk = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
  let pos = 0, node;
  while ((node = walk.nextNode())) {
    if (node === r.startContainer) { pos += r.startOffset; break; }
    pos += node.textContent.length;
  }
  return pos;
}

function setCaret(editor, pos) {
  const walk = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
  let node, rem = pos;
  while ((node = walk.nextNode())) {
    const len = node.textContent.length;
    if (rem <= len) { const r = document.createRange(); r.setStart(node, rem); r.collapse(true); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); return; }
    rem -= len;
  }
}

// ══════════════════════════════════════════════════════════════
// Completion data
// ══════════════════════════════════════════════════════════════

const COMPLETIONS = [
  ...['val','var','fun','class','if','else','when','for','while','in',
      'return','break','continue','true','false','null','init','this','is',
      'try','catch','finally','throw','open','override','super','step'].map(w => ({label:w, kind:'keyword'})),
  ...['Int','Double','String','Boolean','List','Array','Map','Pair',
      'Function','Unit','Any','Throwable','Exception','RuntimeException','Error'].map(w => ({label:w, kind:'type'})),
  {label:'fun main(): Unit {', kind:'snippet'},
  {label:'fun ${1:name}(${2:param}: ${3:Type}): ${4:Type} {', kind:'snippet'},
  {label:'class ${1:Name}(${2:params}) {', kind:'snippet'},
  {label:'class ${1:Name}(${2:params}) : ${3:Parent}(${4:args}) {', kind:'snippet'},
  {label:'open class ${1:Name} {', kind:'snippet'},
  {label:'for (${1:i} in ${2:1..10}) {', kind:'snippet'},
  {label:'when (${1:x}) {', kind:'snippet'},
  {label:'try {\n    $1\n} catch (${2:e}: ${3:Exception}) {\n    $4\n}', kind:'snippet'},
  {label:'if (${1:condition}) {\n    $2\n} else {\n    $3\n}', kind:'snippet'},
  {label:'init {', kind:'snippet'},
  {label:'override fun ${1:name}(${2:params}): ${3:Type} {', kind:'snippet'},
  ...['println','print','readLine','arrayOf','arrayOfNulls','mapOf','listOf'].map(w => ({label:w, kind:'builtin'})),
];

const DOT_METHODS = {
  String: ['length','isEmpty','isNotEmpty','substring','contains','startsWith','endsWith',
           'replace','toLowerCase','toUpperCase','trim','toInt','toIntOrNull','toDoubleOrNull','toDouble','toBoolean'],
  List:   ['size','isEmpty','isNotEmpty','add','removeAt','get','contains','indexOf',
           'map','filter','filterNotNull','forEach','any','all','none','find','first','firstOrNull','flatMap','fold','reduce'],
  Map:    ['size','isEmpty','get','put','containsKey','keys','values','remove','mapKeys','mapValues','filter','filterKeys','forEach'],
  Array:  ['size','get','set'],
};

const ALL_DOT_METHODS = [
  ...DOT_METHODS.String.map(m => ({label:m, kind:'String'})),
  ...DOT_METHODS.List.map(m => ({label:m, kind:'List'})),
  ...DOT_METHODS.Map.map(m => ({label:m, kind:'Map'})),
  ...DOT_METHODS.Array.map(m => ({label:m, kind:'Array'})),
];

function getWordAtCursor(text, pos) {
  let start = pos; while (start > 0 && /[a-zA-Z0-9_]/.test(text[start-1])) start--;
  let end = pos; while (end < text.length && /[a-zA-Z0-9_]/.test(text[end])) end++;
  return { word: text.slice(start, end), start, end };
}

function isDotContext(text, pos) {
  const { start } = getWordAtCursor(text, pos);
  return start > 0 && text[start - 1] === '.';
}

// ══════════════════════════════════════════════════════════════
// User-defined name scanner
// ══════════════════════════════════════════════════════════════

function scanUserNames(src, caretPos) {
  const names = new Map();
  const re = /\b(val|var|fun|class)\s+([A-Za-z_]\w*)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const kind = m[1] === 'fun' ? 'function' : m[1] === 'class' ? 'class' : 'variable';
    const line = src.slice(0, m.index).split('\n').length;
    names.set(m[2], {kind, line});
  }
  // Function params
  const fnRe = /\bfun\s+\w*\s*\(([^)]*)\)/g;
  while ((m = fnRe.exec(src)) !== null) {
    const fnLine = src.slice(0, m.index).split('\n').length;
    let bracePos = m.index + m[0].length;
    while (bracePos < src.length && src[bracePos] !== '{') bracePos++;
    let bodyEnd = src.length;
    if (bracePos < src.length) {
      let depth = 1, j = bracePos + 1;
      while (j < src.length && depth > 0) { if (src[j]==='{') depth++; else if (src[j]==='}') depth--; j++; }
      bodyEnd = j;
    }
    const bodyEndLine = src.slice(0, bodyEnd).split('\n').length;
    const params = m[1];
    const pRe = /(?:val|var\s+)?(\w+)(?:\s*:\s*\w+\??)?/g;
    let pm;
    while ((pm = pRe.exec(params)) !== null) {
      const pname = pm[1];
      if (KW.has(pname) || TY.has(pname)) continue;
      names.set(pname, {kind: 'variable', line: fnLine, scopeEnd: bodyEndLine});
    }
  }
  // Class constructor params
  const ctorRe = /\bclass\s+(\w*)\s*\(([^)]*)\)/g;
  while ((m = ctorRe.exec(src)) !== null) {
    const ctorLine = src.slice(0, m.index).split('\n').length;
    let bracePos = m.index + m[0].length;
    while (bracePos < src.length && src[bracePos] !== '{') bracePos++;
    let bodyEnd = src.length;
    if (bracePos < src.length) {
      let depth = 1, j = bracePos + 1;
      while (j < src.length && depth > 0) { if (src[j]==='{') depth++; else if (src[j]==='}') depth--; j++; }
      bodyEnd = j;
    }
    const bodyEndLine = src.slice(0, bodyEnd).split('\n').length;
    const clsName = m[1];
    if (clsName) names.set(clsName, {kind: 'class', line: ctorLine, scopeEnd: bodyEndLine});
    const params = m[2];
    const pRe = /(?:val|var\s+)?(\w+)(?:\s*:\s*\w+\??)?/g;
    let pm;
    while ((pm = pRe.exec(params)) !== null) {
      const pname = pm[1];
      if (KW.has(pname) || TY.has(pname)) continue;
      names.set(pname, {kind: 'property', line: ctorLine, scopeEnd: bodyEndLine});
    }
  }
  // val/var in function scopes
  const blockRe = /\b(val|var)\s+([A-Za-z_]\w*)/g;
  while ((m = blockRe.exec(src)) !== null) {
    const name = m[2];
    if (names.has(name)) continue;
    const declLine = src.slice(0, m.index).split('\n').length;
    let depth = 0, scopeStart = 0;
    for (let k = m.index - 1; k >= 0; k--) {
      if (src[k] === '}') depth++;
      else if (src[k] === '{') { if (depth === 0) { scopeStart = k; break; } depth--; }
    }
    if (scopeStart > 0) {
      let d = 1, j = scopeStart + 1;
      while (j < src.length && d > 0) { if (src[j]==='{') d++; else if (src[j]==='}') d--; j++; }
      const scopeEnd = src.slice(0, j).split('\n').length;
      names.set(name, {kind: 'variable', line: declLine, scopeEnd});
    }
  }
  // Filter by scope
  if (caretPos != null) {
    const caretLine = src.slice(0, caretPos).split('\n').length;
    const result = new Map();
    for (const [name, info] of names) {
      if (!info.scopeEnd || (caretLine >= info.line && caretLine <= info.scopeEnd)) {
        result.set(name, info.kind);
      } else if (!info.scopeEnd && caretLine >= info.line) {
        result.set(name, info.kind);
      }
    }
    return result;
  }
  const result = new Map();
  for (const [name, info] of names) result.set(name, info.kind);
  return result;
}

function userCompletions(editor) {
  const caret = getCaret(editor);
  const names = scanUserNames(editor.textContent, caret);
  return [...names.entries()].map(([name, kind]) => ({label: name, kind}));
}

// ══════════════════════════════════════════════════════════════
// Editor module state (per-editor)
// ══════════════════════════════════════════════════════════════

/**
 * Initialise the editor with syntax highlighting, completion, undo/redo,
 * and smart input handling.
 *
 * @param {HTMLElement} editor - contenteditable div
 * @param {HTMLElement} lineNums - line number display
 * @param {HTMLElement} completion - completion dropdown
 * @param {HTMLElement} statusLines - line count in status bar
 */
export function initEditor(editor, lineNums, completion, statusLines) {
  let completionActive = false, completionIdx = 0, completionItems = [];
  let undoStack = [], redoStack = [];
  const MAX_UNDO = 200;

  // ── Caret & highlight ──────────────────────────────────────

  function updateHighlight() {
    const text = editor.textContent || '';
    const pos = getCaret(editor);
    editor.innerHTML = highlightHTML(text);
    setCaret(editor, Math.min(pos, text.length));
  }

  // ── Line numbers ───────────────────────────────────────────

  function updateLineNumbers() {
    const lines = (editor.textContent || '').split('\n').length;
    let html = '';
    for (let i = 1; i <= lines; i++) html += i + '\n';
    lineNums.textContent = html || '1';
    statusLines.textContent = `${lines} line${lines !== 1 ? 's' : ''}`;
  }

  // ── Scroll sync ────────────────────────────────────────────

  editor.addEventListener('scroll', () => {
    lineNums.scrollTop = editor.scrollTop;
  });

  // ── Undo/Redo ──────────────────────────────────────────────

  function pushUndo() {
    const text = editor.textContent || '';
    if (undoStack.length && undoStack[undoStack.length - 1] === text) return;
    undoStack.push(text);
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    redoStack = [];
  }

  editor.addEventListener('focus', () => { if (!undoStack.length) pushUndo(); });

  // ── Completion helpers ─────────────────────────────────────

  function showCompletions(items) {
    completionItems = items;
    completionIdx = 0;
    completionActive = true;
    completion.style.display = 'block';
    completion.innerHTML = items.map((c, i) =>
      `<div class="item${i === 0 ? ' active' : ''}" data-idx="${i}"><span class="label">${esc(c.label)}</span><span class="kind">${c.kind}</span></div>`
    ).join('');
    const lineHeight = 22;
    const rect = editor.getBoundingClientRect();
    const lines = (editor.textContent || '').substring(0, getCaret(editor)).split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length;
    const scrollTop = editor.scrollTop;
    const top = Math.min(line * lineHeight - scrollTop + 4, rect.height - 200);
    const left = col * 8.4 + 60;
    completion.style.top = top + 'px';
    completion.style.left = left + 'px';
  }

  function hideCompletions() {
    completionActive = false;
    completion.style.display = 'none';
    completionItems = [];
  }

  function updateCompletionHighlight() {
    [...completion.children].forEach((el, i) => el.classList.toggle('active', i === completionIdx));
  }

  function applyCompletion(item) {
    const pos = getCaret(editor);
    const text = editor.textContent;
    const { word, start, end } = getWordAtCursor(text, pos);
    const label = item.label;
    editor.textContent = text.slice(0, start) + label + text.slice(end);
    let cursorPos = start + label.length;
    const re = /\$\{?(\d+)(?::([^}]*))?\}?/;
    const m = label.match(re);
    if (m) {
      const placeholder = m[2] || '';
      const fullMatch = m[0];
      const idx = label.indexOf(fullMatch);
      editor.textContent = text.slice(0, start) + label.slice(0, idx) + placeholder + label.slice(idx + fullMatch.length) + text.slice(end);
      cursorPos = start + idx + placeholder.length;
    }
    setCaret(editor, cursorPos);
    hideCompletions();
    updateHighlight();
    updateLineNumbers();
  }

  function triggerCompletion() {
    const pos = getCaret(editor);
    const { word } = getWordAtCursor(editor.textContent, pos);
    if (word.length >= 2) {
      let items;
      const dotCtx = isDotContext(editor.textContent, pos);
      if (dotCtx) {
        items = ALL_DOT_METHODS.filter(m => m.label.toLowerCase().startsWith(word.toLowerCase()));
        if (items.length === 0) items = ALL_DOT_METHODS.slice();
      } else {
        const user = userCompletions(editor).filter(c => c.label.toLowerCase().startsWith(word.toLowerCase()));
        items = [...user, ...COMPLETIONS.filter(c => c.label.toLowerCase().startsWith(word.toLowerCase()))];
      }
      if (items.length > 0) showCompletions(items);
      else hideCompletions();
    } else {
      hideCompletions();
    }
  }

  // ── Input events ───────────────────────────────────────────

  editor.addEventListener('input', () => {
    pushUndo();
    updateHighlight();
    updateLineNumbers();
    triggerCompletion();
  });

  editor.addEventListener('keydown', (e) => {
    // Ctrl+Z / Ctrl+Y undo/redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (undoStack.length <= 1) return;
      redoStack.push(undoStack.pop());
      const text = undoStack[undoStack.length - 1];
      editor.textContent = text;
      updateHighlight();
      setCaret(editor, Math.min(getCaret(editor), text.length));
      updateLineNumbers();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      if (!redoStack.length) return;
      const text = redoStack.pop();
      undoStack.push(text);
      editor.textContent = text;
      updateHighlight();
      setCaret(editor, Math.min(getCaret(editor), text.length));
      updateLineNumbers();
      return;
    }

    // Completion navigation
    if (completionActive) {
      if (e.key === 'ArrowDown') { e.preventDefault(); completionIdx = (completionIdx + 1) % completionItems.length; updateCompletionHighlight(); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); completionIdx = (completionIdx - 1 + completionItems.length) % completionItems.length; updateCompletionHighlight(); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); applyCompletion(completionItems[completionIdx]); return; }
      if (e.key === 'Escape') { hideCompletions(); return; }
    }

    // Ctrl+Space: force completion
    if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
      e.preventDefault();
      const pos = getCaret(editor);
      const { word } = getWordAtCursor(editor.textContent, pos);
      const dotCtx = isDotContext(editor.textContent, pos);
      let items;
      if (dotCtx) {
        items = ALL_DOT_METHODS.filter(m => m.label.toLowerCase().startsWith(word.toLowerCase()));
        if (items.length === 0) items = ALL_DOT_METHODS.slice();
      } else {
        const user = userCompletions(editor).filter(c => c.label.toLowerCase().startsWith(word.toLowerCase()));
        items = [...user, ...COMPLETIONS.filter(c => c.label.toLowerCase().startsWith(word.toLowerCase()))];
        if (items.length === 0) items = [...userCompletions(editor), ...COMPLETIONS];
      }
      if (items.length > 0) showCompletions(items);
      return;
    }

    // Auto-pair brackets & quotes
    const pairs = {'(' : ')', '[' : ']', '{' : '}', '"' : '"', "'" : "'"};
    if (e.key in pairs && !completionActive && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const pos = getCaret(editor);
      const text = editor.textContent;
      const sel = window.getSelection();
      if (!sel.isCollapsed) {
        const r = sel.getRangeAt(0);
        const selText = r.toString();
        editor.textContent = text.slice(0, pos) + e.key + selText + pairs[e.key] + text.slice(pos + selText.length);
        updateHighlight();
        setCaret(editor, pos + selText.length + 2);
        return;
      }
      editor.textContent = text.slice(0, pos) + e.key + pairs[e.key] + text.slice(pos);
      updateHighlight();
      setCaret(editor, pos + 1);
      updateLineNumbers();
      return;
    }

    // Tab: indent
    if (e.key === 'Tab' && !completionActive) {
      e.preventDefault();
      const pos = getCaret(editor);
      editor.textContent = editor.textContent.substring(0, pos) + '    ' + editor.textContent.substring(pos);
      setCaret(editor, pos + 4);
      updateHighlight();
      updateLineNumbers();
      return;
    }

    // Smart indent: Enter preserves indentation, auto-blocks after {
    if (e.key === 'Enter' && !completionActive) {
      e.preventDefault();
      const pos = getCaret(editor);
      const before = editor.textContent.slice(0, pos);
      const after = editor.textContent.slice(pos);
      const lineStart = before.lastIndexOf('\n') + 1;
      const indent = before.slice(lineStart).match(/^(\s*)/)[1];
      if (before.trimEnd().endsWith('{')) {
        const close = after.trimStart().startsWith('}') ? '' : '}';
        editor.textContent = before + '\n' + indent + '    \n' + indent + close + after;
        updateHighlight();
        setCaret(editor, pos + 1 + indent.length + 4);
      } else {
        editor.textContent = before + '\n' + indent + after;
        updateHighlight();
        setCaret(editor, pos + 1 + indent.length);
      }
      updateLineNumbers();
      return;
    }

    // Ctrl+Enter / Cmd+Enter: handled by app.js
  });

  // Completion click
  document.addEventListener('click', (e) => {
    if (!completion.contains(e.target) && e.target !== editor) hideCompletions();
  });
  completion.addEventListener('click', (e) => {
    const item = e.target.closest('.item');
    if (item) applyCompletion(completionItems[parseInt(item.dataset.idx)]);
  });

  // ══════════════════════════════════════════════════════════
  // Public API
  // ══════════════════════════════════════════════════════════

  return {
    /** @returns {string} current source code */
    getSource() { return editor.textContent || ''; },

    /** @param {string} text — set source and re-highlight */
    setSource(text) {
      editor.textContent = text;
      undoStack = [text];
      redoStack = [];
      updateHighlight();
      updateLineNumbers();
      editor.scrollTop = 0;
      lineNums.scrollTop = 0;
    },

    updateLineNumbers,
    updateHighlight,
  };
}
