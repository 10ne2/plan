import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
function plainText(text) { return text.split('\n').map(line => line.replace(/^· ?/, '')).join('\n'); }
function bulletText(text) { return text ? text.split('\n').map(line => line ? `· ${line.replace(/^· ?/, '')}` : '').join('\n') : '· '; }
function fitHeight(input) {
  if (!input) return;
  input.style.height = '0px';
  const style = getComputedStyle(input);
  input.style.height = `${input.scrollHeight + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)}px`;
}
export default function Memo({ value, onChange, autoEdit = false, label = '일정 메모' }) {
  const [editing, setEditing] = useState(autoEdit);
  const [draft, setDraft] = useState(() => autoEdit ? bulletText(value) : '');
  const editor = useRef(null);
  const composing = useRef(false);
  const selection = useRef(autoEdit ? [bulletText(value).length, bulletText(value).length] : null);
  useLayoutEffect(() => {
    if (selection.current && editor.current) { editor.current.setSelectionRange(...selection.current); selection.current = null; }
  });
  useLayoutEffect(() => { fitHeight(editor.current); }, [draft, editing]);
  useEffect(() => {
    const input = editor.current;
    if (!editing || !input) return;
    let width = input.getBoundingClientRect().width;
    let active = true;
    const observer = new ResizeObserver(entries => {
      const nextWidth = entries[0].contentRect.width;
      if (nextWidth !== width) { width = nextWidth; fitHeight(input); }
    });
    observer.observe(input);
    document.fonts?.ready.then(() => { if (active) fitHeight(input); });
    return () => { active = false; observer.disconnect(); };
  }, [editing]);
  function update(text) { onChange(text); }
  function startEditing() {
    const formatted = bulletText(value);
    setDraft(formatted); selection.current = [formatted.length, formatted.length];
    setEditing(true);
  }
  function change(event) {
    const input = event.currentTarget;
    const raw = input.value;
    if (composing.current || event.nativeEvent?.isComposing) { setDraft(raw); return; }
    // Add markers only for newly inserted newlines. Never recreate deleted markers.
    let start = 0;
    while (start < draft.length && start < raw.length && draft[start] === raw[start]) start++;
    let end = 0;
    while (end < draft.length - start && end < raw.length - start && draft[draft.length - 1 - end] === raw[raw.length - 1 - end]) end++;
    const insertedEnd = raw.length - end;
    const inserted = raw.slice(start, insertedEnd);
    const marked = inserted.replace(/\n(?!·(?: |$))/g, '\n· ');
    const normalized = raw.slice(0, start) + marked + raw.slice(insertedEnd);
    if (normalized !== raw) {
      const mapPosition = position => {
        if (position <= start) return position;
        if (position >= insertedEnd) return position + marked.length - inserted.length;
        return start + inserted.slice(0, position - start).replace(/\n(?!·(?: |$))/g, '\n· ').length;
      };
      selection.current = [mapPosition(input.selectionStart), mapPosition(input.selectionEnd)];
    }
    setDraft(normalized);
    update(plainText(normalized));
  }
  function keyDown(event) {
    if (event.nativeEvent.isComposing || composing.current) return;
    const input = event.currentTarget;
    if (event.key === 'Escape') { input.blur(); return; }
    if (event.key !== 'Backspace' || input.selectionStart !== input.selectionEnd) return;
    const cursor = input.selectionStart;
    const start = draft.lastIndexOf('\n', cursor - 1) + 1;
    const beforeCursor = draft.slice(start, cursor);
    if (beforeCursor === '· ' || beforeCursor === '·') {
      event.preventDefault();
      const next = draft.slice(0, start) + draft.slice(cursor);
      selection.current = [start, start]; setDraft(next); update(plainText(next));
    }
  }
  const text = value;
  return <section className="memo-panel" aria-label={label}>
    {editing ? <textarea ref={editor} className="memo-editor" aria-label={label === '하루 메모' ? '하루 메모 작성' : '메모 작성'} autoFocus rows={1} value={draft} placeholder="메모 입력" onChange={change} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={e => { composing.current = false; change(e); }} onBlur={() => { update(plainText(draft)); setEditing(false); }} onKeyDown={keyDown}/> : <button type="button" className={`memo-content ${text ? '' : 'memo-placeholder'}`} aria-label={label === '하루 메모' ? '하루 메모 편집' : '메모 편집'} onClick={startEditing}>{text ? <span className="memo-list" role="list">{text.split('\n').map((line, index) => <span className="memo-list-item" role="listitem" key={index}><span aria-hidden="true">{line ? '·' : '\u00a0'}</span><span>{line.replace(/^· ?/, '') || '\u00a0'}</span></span>)}</span> : label === '하루 메모' ? '클릭하여 하루 메모 작성' : '클릭하여 메모 작성'}</button>}
  </section>;
}
