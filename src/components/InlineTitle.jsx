import React, { useEffect, useRef, useState } from 'react';
export default function InlineTitle({ task, onSave, onSelect, autoEdit = false }) {
  const [editing, setEditing] = useState(autoEdit);
  const [draft, setDraft] = useState(task.title);
  const input = useRef(null);
  const cancelled = useRef(false);
  useEffect(() => { if (editing) { input.current?.focus(); input.current?.select(); } }, [editing]);
  function finish() {
    setEditing(false);
    if (!cancelled.current && draft.trim() && draft.trim() !== task.title) onSave({ ...task, title: draft.trim() });
    cancelled.current = false;
  }
  return editing ? <input ref={input} className="inline-title-input" aria-label={`${task.title} 이름 수정`} value={draft} maxLength={100} onClick={e => e.stopPropagation()} onChange={e => setDraft(e.target.value)} onBlur={finish} onKeyDown={e => { if (e.nativeEvent.isComposing) return; if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } if (e.key === 'Escape') { cancelled.current = true; e.currentTarget.blur(); } }}/> : <button className="inline-title" title={task.title} onClick={() => { setDraft(task.title); onSelect(task); setEditing(true); }}>{task.title}</button>;
}
