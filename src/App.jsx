import React from "react";
import { useEffect, useState } from 'react';
import { initialTasks, STORAGE_KEY, validTasks, localDate, weekDates } from './data';
import DayAgenda from './components/DayAgenda';
import Calendar from './components/Calendar';

export default function App() {
  const [storageError, setStorageError] = useState('');
  const [tasks, setTasks] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw === null) return initialTasks(); const data = JSON.parse(raw); return validTasks(data) ? data : initialTasks(); } catch { return initialTasks(); }
  });
  const [today, setToday] = useState(localDate);
  const [viewDate, setViewDate] = useState(localDate);
  const [selected, setSelected] = useState(localDate);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [newTaskId, setNewTaskId] = useState(null);
  const [notice, setNotice] = useState('');
  const [deleted, setDeleted] = useState([]);
  useEffect(() => {
    if (!deleted.length) return;
    const timer = setTimeout(() => setDeleted(current => current.filter(item => item.expires > Date.now())), Math.max(0, Math.min(...deleted.map(item => item.expires)) - Date.now()));
    return () => clearTimeout(timer);
  }, [deleted]);
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
    setViewDate(task.date); setSelected(task.date);
    setNotice('일정을 수정했습니다.');
  }
  function remove(task) {
    setDeleted(current => [...current, { token: crypto.randomUUID(), task, index: tasks.findIndex(t => t.id === task.id), expires: Date.now() + 10000 }]);
    setTasks(current => current.filter(t => t.id !== task.id));
    setEditing(null); setNotice('');
  }
  function restore(item) {
    setDeleted(current => current.filter(entry => entry.token !== item.token));
    if (item.expires <= Date.now()) return;
    setTasks(current => {
      if (current.some(task => task.id === item.task.id)) return current;
      const restored = [...current]; restored.splice(Math.max(0, item.index), 0, item.task); return restored;
    });
    setNotice('');
  }
  function updateMemo(id, memo) { setTasks(current => current.map(task => task.id === id ? { ...task, memo } : task)); }
  function toggle(id) { setTasks(current => current.map(t => t.id === id ? { ...t, completed: !t.completed } : t)); }
  function openTask(task) { setEditing(task.id); setSelected(task.date); setViewDate(task.date); }
  function navigate(offset) {
    const date = new Date(`${viewDate}T12:00:00`);
    date.setDate(date.getDate() + offset * 7);
    const next = localDate(date);
    setViewDate(next); setSelected(next); setEditing(null);
  }
  function selectDate(date) { setSelected(date); setViewDate(date); setEditing(null); }
  function addTask(date) {
    const task = { id: crypto.randomUUID(), title: '새 일정', date, completed: false, memo: '' };
    setTasks(current => [...current, task]); setSelected(date); setViewDate(date);
    setEditing(task.id); setNewTaskId(task.id); setFilter('all'); setQuery(''); setNotice('');
  }
  const days = weekDates(viewDate);
  const weekTasks = visible.filter(task => task.date >= days[0] && task.date <= days[6]);
  const weekLabel = `${days[0].replaceAll('-', '.')} — ${days[6].replaceAll('-', '.')}`;
  return <div className="planner-shell">
    <main className="planner-main"><section className="planner-title"><h1>일정 캘린더</h1></section>
    <section className="summary-bar" aria-label="진행 현황"><div className="summary-progress"><span>전체 진행률 <strong>{percentage}%</strong></span><div className="progress-track" role="progressbar" aria-label="전체 진행률" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${percentage}%` }}/></div></div><div className="summary-progress"><span>오늘 진행률 <strong>{todayPercentage}%</strong></span><div className="progress-track" role="progressbar" aria-label="오늘 진행률" aria-valuenow={todayPercentage} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${todayPercentage}%` }}/></div><small className="progress-count">{todayCompleted} / {todayTasks.length} 완료</small></div><div><span>완료</span><strong>{completed}<small> / {tasks.length}</small></strong></div><div><span>남은 작업</span><strong>{tasks.length - completed}<small>개</small></strong></div><div className="today-summary"><div className="today-summary-heading"><span>오늘 일정</span><span>{todayTasks.length}개</span></div>{todayTasks.length ? <ul>{todayTasks.map(task => <li key={task.id}><input className="completion-checkbox" type="checkbox" checked={task.completed} onChange={() => toggle(task.id)} aria-label={`${task.title} 완료`}/><button className={task.completed ? 'today-completed' : ''} onClick={() => openTask(task)}>{task.title}<span>{task.completed ? '완료' : '미완료'}</span></button></li>)}</ul> : <p>오늘 일정이 없습니다.</p>}</div></section>
    <div className="calendar-layout"><section className="calendar-panel" aria-label="주간 일정"><div className="calendar-toolbar"><div className="month-controls"><h2>{weekLabel}</h2><button className="icon-button" aria-label="이전 주" onClick={() => navigate(-1)}>‹</button><button className="icon-button" aria-label="다음 주" onClick={() => navigate(1)}>›</button><button className="secondary today-button" onClick={() => selectDate(today)}>오늘</button></div><span className="month-count">이번 주 일정 {weekTasks.length}개</span></div>
    <div className="calendar-filters"><div className="tabs" aria-label="일정 필터">{[['all', '전체'], ['pending', '미완료'], ['done', '완료']].map(([value, label]) => <button key={value} aria-pressed={filter === value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div><label className="search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="작업 검색" aria-label="작업 검색"/></label></div>
    <Calendar viewDate={viewDate} tasks={visible} allTasks={tasks} today={today} selected={selected} onSelect={selectDate} activeTaskId={editing} onEdit={openTask} onSave={save} onDelete={remove} onAdd={addTask} newTaskId={newTaskId} onToggle={toggle}/>
    <div className="calendar-caption"><span><i/> 미완료 <i className="done-dot"/> 완료</span></div>
    </section><aside className="day-panel"><DayAgenda date={selected} tasks={tasks.filter(task => task.date === selected)} activeTaskId={editing} onSave={save} onSelect={openTask} onToggle={toggle} onDelete={remove} onMemo={updateMemo}/></aside></div>
    <div className="feedback" role="status">{storageError || notice}</div></main>
    {deleted.length > 0 && <div className="undo-stack" aria-label="삭제한 일정 복구">{deleted.map(item => <div className="undo-toast" key={item.token}><span role="status">‘{item.task.title}’ 삭제됨</span><button type="button" onClick={() => restore(item)} aria-label={`${item.task.title} 복구`}>복구</button></div>)}</div>}
  </div>;
}
