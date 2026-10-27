import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
function plainText(text) { return text.split('\n').map(line => line.replace(/^· ?/, '')).join('\n'); }
function bulletText(text) { return text.split('\n').map(line => `· ${line.replace(/^· ?/, '')}`).join('\n'); }
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
    const normalized = bulletText(raw);
    if (normalized !== raw) selection.current = [bulletText(raw.slice(0, input.selectionStart)).length, bulletText(raw.slice(0, input.selectionEnd)).length];
    setDraft(normalized);
    update(plainText(normalized));
  }
  const text = value;
  return <section className="memo-panel" aria-label={label}>
    {editing ? <textarea ref={editor} className="memo-editor" aria-label={label === '하루 메모' ? '하루 메모 작성' : '메모 작성'} autoFocus rows={1} value={draft} placeholder="메모 입력" onChange={change} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={e => { composing.current = false; change(e); }} onBlur={() => { update(plainText(draft)); setEditing(false); }} onKeyDown={e => { if (e.key === 'Escape' && !e.nativeEvent.isComposing) e.currentTarget.blur(); }}/> : <button type="button" className={`memo-content ${text ? '' : 'memo-placeholder'}`} aria-label={label === '하루 메모' ? '하루 메모 편집' : '메모 편집'} onClick={startEditing}>{text ? <span className="memo-list" role="list">{text.split('\n').map((line, index) => <span className="memo-list-item" role="listitem" key={index}><span aria-hidden="true">·</span><span>{line.replace(/^· ?/, '') || '\u00a0'}</span></span>)}</span> : label === '하루 메모' ? '클릭하여 하루 메모 작성' : '클릭하여 메모 작성'}</button>}
  </section>;
}
