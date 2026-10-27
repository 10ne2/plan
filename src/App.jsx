import React from "react";
import { useEffect, useState, useRef } from 'react';
import { initialTasks, STORAGE_KEY, validTasks, localDate } from './data';
import TaskDetails from './components/TaskDetails';
import Calendar from './components/Calendar';
import QuickAdd from './components/QuickAdd';
import Memo from './components/Memo';

export default function App() {
  const quickInput = useRef(null);
  const [storageError, setStorageError] = useState('');
  const [tasks, setTasks] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw === null) return initialTasks(); const data = JSON.parse(raw); return validTasks(data) ? data : initialTasks(); } catch { return initialTasks(); }
  });
  const [today, setToday] = useState(localDate);
  const [month, setMonth] = useState(() => localDate().slice(0, 7));
  const [selected, setSelected] = useState(localDate);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); setStorageError(''); } catch { setStorageError('브라우저 저장 공간에 접근할 수 없습니다. 변경 내용은 현재 화면에만 유지됩니다.'); } }, [tasks]);
  useEffect(() => { const timer = setInterval(() => setToday(localDate()), 30000); return () => clearInterval(timer); }, []);
  const completed = tasks.filter(t => t.completed).length;
  const percentage = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const todayTasks = tasks.filter(t => t.date === today);
  const todayCompleted = todayTasks.filter(t => t.completed).length;
  const todayPercentage = todayTasks.length ? Math.round(todayCompleted / todayTasks.length * 100) : 0;
  const sorted = [...tasks].sort((a, b) => a.date.localeCompare(b.date));
  const visible = sorted.filter(t => (filter === 'all' || (filter === 'done' ? t.completed : !t.completed)) && t.title.toLowerCase().includes(query.toLowerCase().trim()));
  function save(task) {
    setTasks(current => current.map(t => t.id === task.id ? task : t));
    setMonth(task.date.slice(0, 7)); setSelected(task.date);
    setNotice('일정을 수정했습니다.');
  }
  function remove(task) { if (window.confirm(`‘${task.title}’ 일정을 삭제할까요?`)) { setTasks(current => current.filter(t => t.id !== task.id)); setEditing(null); setNotice('일정을 삭제했습니다.'); } }
  function toggle(id) { setTasks(current => current.map(t => t.id === id ? { ...t, completed: !t.completed } : t)); }
  function openTask(task) { setEditing(task.id); setSelected(task.date); setMonth(task.date.slice(0, 7)); }
  function navigate(offset) {
    const [year, number] = month.split('-').map(Number);
    const date = new Date(year, number - 1 + offset, 1, 12);
    setMonth(localDate(date).slice(0, 7)); setEditing(null);
  }
  function selectDate(date) { setSelected(date); setMonth(date.slice(0, 7)); setEditing(null); }
  function quickAdd(task) {
    setTasks(current => [...current, { ...task, id: crypto.randomUUID(), completed: false }]);
    selectDate(task.date); setFilter('all'); setQuery('');
    setNotice('일정을 추가했습니다.');
  }
  const activeTask = tasks.find(t => t.id === editing);
  const monthTasks = visible.filter(t => t.date.startsWith(month));
  return <div className="planner-shell">
    <main className="planner-main"><section className="planner-title"><h1>일정 캘린더</h1></section>
    <section className="summary-bar" aria-label="진행 현황"><div className="summary-progress"><span>전체 진행률 <strong>{percentage}%</strong></span><div className="progress-track" role="progressbar" aria-label="전체 진행률" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${percentage}%` }}/></div></div><div className="summary-progress"><span>오늘 진행률 <strong>{todayPercentage}%</strong></span><div className="progress-track" role="progressbar" aria-label="오늘 진행률" aria-valuenow={todayPercentage} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${todayPercentage}%` }}/></div><small className="progress-count">{todayCompleted} / {todayTasks.length} 완료</small></div><div><span>완료</span><strong>{completed}<small> / {tasks.length}</small></strong></div><div><span>남은 작업</span><strong>{tasks.length - completed}<small>개</small></strong></div><div className="today-summary"><div className="today-summary-heading"><span>오늘 일정</span><span>{todayTasks.length}개</span></div>{todayTasks.length ? <ul>{todayTasks.map(task => <li key={task.id}><input className="completion-checkbox" type="checkbox" checked={task.completed} onChange={() => toggle(task.id)} aria-label={`${task.title} 완료`}/><button className={task.completed ? 'today-completed' : ''} onClick={() => openTask(task)}>{task.title}<span>{task.completed ? '완료' : '미완료'}</span></button></li>)}</ul> : <p>오늘 일정이 없습니다.</p>}</div></section>
    <div className="calendar-layout"><section className="calendar-panel" aria-label="월간 일정"><div className="calendar-toolbar"><div className="month-controls"><h2>{Number(month.slice(0, 4))}년 {Number(month.slice(5))}월</h2><button className="icon-button" aria-label="이전 달" onClick={() => navigate(-1)}>‹</button><button className="icon-button" aria-label="다음 달" onClick={() => navigate(1)}>›</button><button className="secondary today-button" onClick={() => selectDate(today)}>오늘</button></div><span className="month-count">이달의 일정 {monthTasks.length}개</span></div>
    <div className="calendar-filters"><div className="tabs" aria-label="일정 필터">{[['all', '전체'], ['pending', '미완료'], ['done', '완료']].map(([value, label]) => <button key={value} aria-pressed={filter === value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div><label className="search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="작업 검색" aria-label="작업 검색"/></label></div>
    <Calendar month={month} tasks={visible} today={today} selected={selected} onSelect={selectDate} activeTaskId={editing} onEdit={openTask}/>
    <div className="calendar-caption"><span><i/> 미완료 <i className="done-dot"/> 완료</span><span>일정을 누르면 상세 보기</span></div>
    </section><aside className="day-panel">{activeTask ? <TaskDetails key={`${activeTask.id}-${activeTask.title}-${activeTask.date}`} task={activeTask} onSave={save} onDelete={remove} onToggle={toggle}/> : <QuickAdd date={selected} onDateChange={selectDate} onAdd={quickAdd} inputRef={quickInput}/>}<Memo/></aside></div>
    <div className="feedback" role="status">{storageError || notice}</div></main>
  </div>;
}
