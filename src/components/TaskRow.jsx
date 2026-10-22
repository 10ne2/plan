import React from "react";
import { formatDate } from '../data';
export default function TaskRow({ task, today, onToggle, onEdit, onDelete }) {
  return <div className={`task-row ${task.completed ? 'is-complete' : ''}`}>
    <input className="task-check" type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} aria-label={`${task.title} 완료`}/>
    <div className="task-info"><span className="task-title">{task.title}</span><span className="task-date">{formatDate(task.date)}{task.date === today ? ' · 오늘' : ''}</span></div>
    <span className={`status ${task.completed ? 'done' : task.date < today ? 'late' : ''}`}>{task.completed ? '완료' : task.date < today ? '기한 지남' : '진행 예정'}</span>
    <div className="row-actions"><button onClick={() => onEdit(task)} aria-label={`${task.title} 수정`}>수정</button><button onClick={() => onDelete(task)} aria-label={`${task.title} 삭제`}>삭제</button></div>
  </div>;
}
