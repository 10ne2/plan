import React from 'react';
import { weekDates, formatDate } from '../data';
export default function Calendar({ viewDate, tasks, allTasks, today, selected, onSelect, onEdit, activeTaskId }) {
  const days = weekDates(viewDate);
  return <div className="week-scroll" tabIndex={0} aria-label="주간 달력, 가로로 스크롤"><div className="week-grid">{days.map((date, index) => {
    const items = tasks.filter(task => task.date === date);
    const total = allTasks.filter(task => task.date === date);
    return <section key={date} onClick={event => { if (!event.target.closest('button')) onSelect(date); }} aria-label={date} className={`week-day ${date === today ? 'is-today' : ''} ${date === selected ? 'is-selected' : ''}`}>
      <button className={`week-day-heading ${index === 5 ? 'saturday' : index === 6 ? 'sunday' : ''}`} aria-label={`${date} 선택`} aria-pressed={date === selected} onClick={() => onSelect(date)}><span>{formatDate(date, { weekday: 'short' })}</span><strong>{formatDate(date, { month: 'numeric', day: 'numeric' })}</strong><small>{date === today ? '오늘 · ' : ''}{total.filter(task => task.completed).length} / {total.length} 완료</small></button>
      <div className="week-tasks" tabIndex={items.length ? 0 : undefined} aria-label={`${date} 일정 목록`}>{items.length ? items.map(task => <div className={`calendar-task ${task.completed ? 'completed' : ''}`} key={task.id}><button aria-pressed={activeTaskId === task.id} onClick={() => onEdit(task)} title={task.title}>{task.title}</button></div>) : <span className="week-empty">일정 없음</span>}</div>
    </section>;
  })}</div></div>;
}
