import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { formatDate } from '../data';
const MEMO_KEY = 'flatpoint-planner-memos-v2';
const LEGACY_KEY = 'flatpoint-planner-memo-v1';
function loadNotes(date) {
  try {
    const raw = localStorage.getItem(MEMO_KEY);
    if (raw !== null) {
      const notes = JSON.parse(raw);
      if (!notes || Array.isArray(notes) || typeof notes !== 'object' || !Object.entries(notes).every(([day, text]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && typeof text === 'string')) throw new Error('Invalid notes');
      return { notes, error: '', migrate: false };
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    return { notes: legacy ? { [date]: legacy } : {}, error: '', migrate: Boolean(legacy) };
  } catch { return { notes: {}, error: '메모를 불러올 수 없습니다. 브라우저 저장 설정을 확인해 주세요.', migrate: false }; }
}

function plainText(text) { return text.split('\n').map(line => line.replace(/^· ?/, '')).join('\n'); }
function bulletText(text) { return text.split('\n').map(line => `· ${line.replace(/^· ?/, '')}`).join('\n'); }
export default function Memo({ date }) {
  const [stored, setStored] = useState(() => loadNotes(date));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const editor = useRef(null);
  const composing = useRef(false);
  const selection = useRef(null);
  useLayoutEffect(() => {
    if (selection.current && editor.current) { editor.current.setSelectionRange(...selection.current); selection.current = null; }
  });
  useEffect(() => { setEditing(false); }, [date]);
  useEffect(() => {
    if (!stored.migrate) return;
    try { localStorage.setItem(MEMO_KEY, JSON.stringify(stored.notes)); setStored(current => ({ ...current, migrate: false, error: '' })); }
    catch { setStored(current => ({ ...current, migrate: false, error: '메모를 저장하지 못했습니다. 현재 화면에만 유지됩니다.' })); }
  }, [stored.migrate, stored.notes]);
  function update(text) {
    const notes = { ...stored.notes, [date]: text };
    try { localStorage.setItem(MEMO_KEY, JSON.stringify(notes)); setStored({ notes, error: '', migrate: false }); }
    catch { setStored({ notes, error: '메모를 저장하지 못했습니다. 현재 화면에만 유지됩니다.', migrate: false }); }
  }
  function startEditing() {
    const value = bulletText(stored.notes[date] || '');
    setDraft(value); selection.current = [value.length, value.length];
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
  const text = stored.notes[date] || '';
  return <section className="memo-panel" aria-labelledby="memo-heading">
    <div className="memo-heading"><h2 id="memo-heading">메모</h2><span>{formatDate(date, { month: 'long', day: 'numeric' })}</span></div>
    {editing ? <textarea ref={editor} className="memo-editor" aria-label="메모 작성" autoFocus rows={7} value={draft} placeholder="메모 입력" onChange={change} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={e => { composing.current = false; change(e); }} onBlur={() => { update(plainText(draft)); setEditing(false); }} onKeyDown={e => { if (e.key === 'Escape' && !e.nativeEvent.isComposing) e.currentTarget.blur(); }}/> : <button type="button" className={`memo-content ${text ? '' : 'memo-placeholder'}`} aria-label="메모 편집" onClick={startEditing}>{text ? <span className="memo-list" role="list">{text.split('\n').map((line, index) => <span className="memo-list-item" role="listitem" key={index}><span aria-hidden="true">·</span><span>{line.replace(/^· ?/, '') || '\u00a0'}</span></span>)}</span> : '클릭하여 메모 작성'}</button>}
    {stored.error && <p className="memo-error" role="status">{stored.error}</p>}
  </section>;
}
