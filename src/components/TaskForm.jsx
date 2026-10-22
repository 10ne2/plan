import React from "react";
import { useEffect, useRef } from 'react';
export default function TaskForm({ task, defaultDate, onSave, onClose }) {
  const dialog = useRef(null);
  useEffect(() => { const el = dialog.current; el.showModal(); return () => el.close(); }, []);
  function submit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = data.get('title').trim();
    if (!title) { e.currentTarget.elements.title.setCustomValidity('작업 이름을 입력해 주세요.'); e.currentTarget.elements.title.reportValidity(); return; }
    onSave({ ...task, title, date: data.get('date') });
  }
  return <dialog ref={dialog} className="modal" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><form onSubmit={submit}>
    <div className="modal-heading"><div><span className="eyebrow">MAKE A LITTLE PROGRESS</span><h2>{task ? '일정 수정' : '새로운 일정'}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="닫기">×</button></div>
    <label>작업 이름<input name="title" autoFocus required maxLength={100} defaultValue={task?.title || ''} placeholder="어떤 작업을 계획하고 있나요?" onInput={e => e.target.setCustomValidity('')}/></label>
    <label>작업 날짜<input name="date" type="date" required min="0001-01-01" max="9999-12-31" defaultValue={task?.date || defaultDate}/></label>
    <div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>취소</button><button className="primary" type="submit">{task ? '변경 저장' : '일정 추가'} <span>↗</span></button></div>
  </form></dialog>;
}
