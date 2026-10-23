import React, { useState } from 'react';
export default function TaskDetails({ task, onSave, onDelete, onToggle }) {
  const [title, setTitle] = useState(task.title);
  const [date, setDate] = useState(task.date);
  function submit(event) {
    event.preventDefault();
    if (!title.trim()) { event.currentTarget.elements.title.setCustomValidity('일정 이름을 입력해 주세요.'); event.currentTarget.elements.title.reportValidity(); return; }
    onSave({ ...task, title: title.trim(), date });
  }
  return <div className="task-details"><div className="details-heading"><h2>일정 상세</h2></div>
    <form className="quick-add" onSubmit={submit}>
      <label htmlFor="detail-title">일정 이름</label><textarea id="detail-title" name="title" required maxLength={100} rows={4} value={title} onChange={e => { setTitle(e.target.value); e.target.setCustomValidity(''); }}/>
      <label htmlFor="detail-date">날짜</label><input id="detail-date" type="date" required min="0001-01-01" max="9999-12-31" value={date} onChange={e => setDate(e.target.value)}/>
      <div className="completion-control"><span>상태</span><button className="secondary" type="button" onClick={() => onToggle(task.id)}>{task.completed ? '완료됨 · 미완료로 변경' : '미완료 · 완료로 변경'}</button></div>
      <button className="primary" type="submit">변경 저장</button>
    </form><div className="detail-actions"><button className="delete-button" onClick={() => onDelete(task)}>삭제</button></div>
  </div>;
}
