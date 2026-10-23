import React, { useState } from 'react';
export default function QuickAdd({ date, onDateChange, onAdd, inputRef }) {
  const [title, setTitle] = useState('');
  function submit(event) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      inputRef.current.setCustomValidity('일정 이름을 입력해 주세요.');
      inputRef.current.reportValidity();
      return;
    }
    onAdd({ title: trimmed, date });
    setTitle('');
    inputRef.current.focus();
  }
  return <form className="quick-add" onSubmit={submit}>
    <h2>일정 추가</h2>
    <label htmlFor="quick-title">일정 이름</label>
    <input ref={inputRef} id="quick-title" name="title" required maxLength={100} value={title} placeholder="일정 입력" onChange={e => { setTitle(e.target.value); e.target.setCustomValidity(''); }}/>
    <label htmlFor="quick-date">날짜</label>
    <input id="quick-date" name="date" type="date" required min="0001-01-01" max="9999-12-31" value={date} onChange={e => { if (e.target.value) onDateChange(e.target.value); }}/>
    <button className="primary" type="submit">추가</button>
  </form>;
}
