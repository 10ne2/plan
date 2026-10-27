import React, { useState } from 'react';
import { formatDate, shiftDate } from '../data';
import InlineTitle from './InlineTitle';
import Memo from './Memo';
function AgendaTask({ task, activeTaskId, onSave, onSelect, onToggle, onDelete, onMemo }) {
  const [showMemo, setShowMemo] = useState(Boolean(task.memo));
  const [editMemo, setEditMemo] = useState(false);
  return <article className={`agenda-task ${activeTaskId === task.id ? 'active' : ''}`} aria-label={`${task.title} 상세`}>
    <div className="agenda-task-heading"><input className="completion-checkbox" type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} aria-label={`${task.title} 완료`}/><div className={task.completed ? 'agenda-completed' : ''}><InlineTitle task={task} onSave={onSave} onSelect={onSelect}/></div><button className="agenda-delete" aria-label={`${task.title} 삭제`} onClick={() => onDelete(task)}>×</button></div>
    {showMemo && <Memo value={task.memo || ''} onChange={memo => onMemo(task.id, memo)} autoEdit={editMemo}/>}
    <div className="agenda-move"><button disabled={!shiftDate(task.date, -1)} onClick={() => onSave({ ...task, date: shiftDate(task.date, -1) })} aria-label={`${task.title} 전날로 이동`}>← 전날</button><button disabled={!shiftDate(task.date, 1)} onClick={() => onSave({ ...task, date: shiftDate(task.date, 1) })} aria-label={`${task.title} 다음날로 이동`}>다음날 →</button><button className="agenda-add-memo" aria-label={`${task.title} 메모 열기`} aria-expanded={showMemo} onClick={() => { setEditMemo(true); setShowMemo(current => !current); }}>＋</button></div>
  </article>;
}
export default function DayAgenda({ date, tasks, dayMemo, onDayMemo, activeTaskId, onSave, onSelect, onToggle, onDelete, onMemo }) {
  return <section className="day-agenda" aria-label="선택한 날짜 전체 일정">
    <header><h2>{formatDate(date, { month: 'long', day: 'numeric', weekday: 'short' })}</h2><span>{tasks.length}개 일정</span></header>
    <div className="daily-memo"><Memo key={date} value={dayMemo} onChange={onDayMemo} label="하루 메모"/></div>
    {tasks.length ? tasks.map(task => <AgendaTask key={task.id} task={task} activeTaskId={activeTaskId} onSave={onSave} onSelect={onSelect} onToggle={onToggle} onDelete={onDelete} onMemo={onMemo}/>) : <p className="agenda-empty">등록된 일정이 없습니다.<br/>날짜 칸 아래 ＋로 추가하세요.</p>}
  </section>;
}
