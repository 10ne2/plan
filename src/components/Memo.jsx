import React, { useState } from 'react';
const MEMO_KEY = 'flatpoint-planner-memo-v1';
export default function Memo() {
  const [stored, setStored] = useState(() => {
    try { return { text: localStorage.getItem(MEMO_KEY) || '', error: '' }; }
    catch { return { text: '', error: '메모를 불러올 수 없습니다. 브라우저 저장 설정을 확인해 주세요.' }; }
  });
  const [editing, setEditing] = useState(false);
  function update(text) {
    try { localStorage.setItem(MEMO_KEY, text); setStored({ text, error: '' }); }
    catch { setStored({ text, error: '메모를 저장하지 못했습니다. 현재 화면에만 유지됩니다.' }); }
  }
  return <section className="memo-panel" aria-labelledby="memo-heading">
    <h2 id="memo-heading">메모</h2>
    {editing ? <textarea className="memo-editor" aria-label="메모 작성" autoFocus rows={7} value={stored.text} placeholder="메모 입력" onChange={e => update(e.target.value)} onBlur={() => setEditing(false)} onKeyDown={e => { if (e.key === 'Escape') e.currentTarget.blur(); }}/> : <button type="button" className={`memo-content ${stored.text ? '' : 'memo-placeholder'}`} aria-label="메모 편집" onClick={() => setEditing(true)}>{stored.text || '클릭하여 메모 작성'}</button>}
    {stored.error && <p className="memo-error" role="status">{stored.error}</p>}
  </section>;
}
