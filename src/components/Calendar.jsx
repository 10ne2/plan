import React from 'react';
import { localDate } from '../data';
export default function Calendar({ month, tasks, today, selected, onSelect, onEdit, activeTaskId }) {
  const [year, number] = month.split('-').map(Number);
  const first = new Date(year, number - 1, 1, 12);
  const start = new Date(year, number - 1, 1 - first.getDay(), 12);
  const weeks = Math.ceil((first.getDay() + new Date(year, number, 0).getDate()) / 7);
  const days = Array.from({ length: weeks * 7 }, (_, i) => { const day = new Date(start); day.setDate(start.getDate() + i); return { day, key: localDate(day) }; });
  const rowSizes = Array.from({ length: weeks }, (_, week) => {
    const dates = new Set(days.slice(week * 7, week * 7 + 7).map(item => item.key));
    return tasks.some(task => dates.has(task.date)) ? 'minmax(76px, 1fr)' : '76px';
  });
  const hasTasks = rowSizes.some(size => size !== '76px');
  return <div className="calendar" data-has-tasks={hasTasks} style={{ '--weeks': weeks, '--calendar-rows': rowSizes.join(' ') }}><div className="weekdays">{['일', '월', '화', '수', '목', '금', '토'].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{days.map(({ day, key }) => {
    const items = tasks.filter(t => t.date === key);
    return <section key={key} onClick={e => { if (!e.target.closest("button")) onSelect(key); }} aria-label={key} className={`calendar-day ${key.slice(0, 7) !== month ? 'outside' : ''} ${key === today ? 'is-today' : ''} ${key === selected ? 'is-selected' : ''}`}>
      <div className="day-heading"><button aria-label={`${key} 선택`} aria-pressed={key === selected} onClick={() => onSelect(key)}><span>{day.getDate()}</span>{key === today && <small>오늘</small>}</button></div>
      <div className="day-tasks">{items.map(task => <div className={`calendar-task ${task.completed ? 'completed' : ''}`} key={task.id}><button aria-pressed={activeTaskId === task.id} onClick={() => onEdit(task)} title={task.title}>{task.title}</button></div>)}</div>
    </section>;
  })}</div></div>;
}
