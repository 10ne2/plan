import React from "react";
import { useEffect, useState } from 'react';
import { initialTasks, STORAGE_KEY, validTasks, localDate, formatDate } from './data';
import TaskForm from './components/TaskForm';
import TaskRow from './components/TaskRow';
import Calendar from './components/Calendar';

export default function App() {
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
  const sorted = [...tasks].sort((a, b) => a.date.localeCompare(b.date));
  const visible = sorted.filter(t => (filter === 'all' || (filter === 'done' ? t.completed : !t.completed)) && t.title.toLowerCase().includes(query.toLowerCase().trim()));
  function save(task) {
    setTasks(current => editing.task ? current.map(t => t.id === task.id ? task : t) : [...current, { ...task, id: crypto.randomUUID(), completed: false }]);
    setMonth(task.date.slice(0, 7)); setSelected(task.date);
    setNotice(editing.task ? '일정을 수정했습니다.' : '새 일정을 추가했습니다.'); setEditing(null);
  }
  function remove(task) { if (window.confirm(`‘${task.title}’ 일정을 삭제할까요?`)) { setTasks(current => current.filter(t => t.id !== task.id)); setNotice('일정을 삭제했습니다.'); } }
  function reset() { if (window.confirm('추가·수정한 일정과 완료 상태를 지우고, 2026년 기본 일정 14개로 되돌릴까요?')) { setTasks(initialTasks()); setMonth('2026-10'); setSelected('2026-10-22'); setFilter('all'); setQuery(''); setNotice('기본 일정으로 초기화했습니다.'); } }
  const rowProps = { today, onToggle: id => setTasks(current => current.map(t => t.id === id ? { ...t, completed: !t.completed } : t)), onEdit: task => setEditing({ task }), onDelete: remove };
  function navigate(offset) {
    const [year, number] = month.split('-').map(Number);
    const date = new Date(year, number - 1 + offset, 1, 12);
    setMonth(localDate(date).slice(0, 7));
  }
  function selectDate(date) { setSelected(date); setMonth(date.slice(0, 7)); }
  function addDate(date) { setEditing({ task: null, date }); }
  const selectedTasks = visible.filter(t => t.date === selected);
  const monthTasks = visible.filter(t => t.date.startsWith(month));
  return <div className="planner-shell">
    <header className="planner-header"><a href="#" className="brand"><span className="brand-mark">F.</span> FLATPOINT<span className="brand-dot">®</span></a><span className="header-project">신제품 상세페이지 & 포트폴리오</span><span className="workspace-badge">PERSONAL WORKSPACE</span></header>
    <main className="planner-main"><section className="planner-title"><div><span className="eyebrow">PLAN WITH PURPOSE · 2026 PROJECT</span><h1>나의 프로젝트 캘린더<span>.</span></h1><p>작은 계획을 모아, 하나의 완성으로.</p></div><button className="primary" onClick={() => addDate(selected)}>＋ 일정 추가</button></section>
    <section className="summary-bar" aria-label="진행 현황"><div className="summary-progress"><span>전체 진행률 <strong>{percentage}%</strong></span><div className="progress-track" role="progressbar" aria-label="전체 진행률" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${percentage}%` }}/></div></div><div><span>완료</span><strong>{completed}<small> / {tasks.length}</small></strong></div><div><span>남은 작업</span><strong>{tasks.length - completed}<small>개</small></strong></div><button className="today-summary" onClick={() => selectDate(today)}><span>오늘의 작업 ↗</span><strong>{todayTasks.filter(t => !t.completed).length}<small>개</small></strong></button></section>
    <div className="calendar-layout"><section className="calendar-panel" aria-label="월간 일정"><div className="calendar-toolbar"><div className="month-controls"><h2>{Number(month.slice(0, 4))}년 {Number(month.slice(5))}월</h2><button className="icon-button" aria-label="이전 달" onClick={() => navigate(-1)}>‹</button><button className="icon-button" aria-label="다음 달" onClick={() => navigate(1)}>›</button><button className="secondary today-button" onClick={() => selectDate(today)}>오늘</button></div><span className="month-count">이달의 일정 {monthTasks.length}개</span></div>
    <div className="calendar-filters"><div className="tabs" aria-label="일정 필터">{[['all', '전체'], ['pending', '미완료'], ['done', '완료']].map(([value, label]) => <button key={value} aria-pressed={filter === value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div><label className="search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="작업 검색" aria-label="작업 검색"/></label></div>
    <Calendar month={month} tasks={visible} today={today} selected={selected} onSelect={selectDate} onAdd={addDate} onEdit={task => setEditing({ task })} onToggle={rowProps.onToggle}/>
    <div className="calendar-caption"><span><i/> 미완료 <i className="done-dot"/> 완료</span><span>날짜 선택 · 작업 이름을 눌러 수정</span></div>
    </section><aside className="day-panel"><div className="day-panel-heading"><span className="eyebrow">DAILY FOCUS</span><h2>{formatDate(selected, { month: 'long', day: 'numeric' })}</h2><p>{formatDate(selected, { weekday: 'long' })}{selected === today ? ' · 오늘' : ''}</p></div><div className="selected-count">선택한 날의 일정 <span>{selectedTasks.length}</span></div><div className="selected-tasks">{selectedTasks.length ? selectedTasks.map(task => <TaskRow key={task.id} task={task} {...rowProps}/>) : <div className="day-empty"><span>＋</span><p>{query || filter !== 'all' ? '조건에 맞는 일정이 없어요.' : '예정된 일정이 없어요.'}</p><small>하루의 작은 목표를 더해 보세요.</small></div>}</div><button className="secondary add-selected" onClick={() => addDate(selected)}>＋ 이 날짜에 일정 추가</button><div className="project-note"><span className="eyebrow">ONE STEP AT A TIME</span><p>오늘의 작은 진전이<br/>내일의 완성을 만듭니다.</p><span>기본 프로젝트 · 10.22 — 11.04</span></div><button className="reset-button" onClick={reset}>↻ 전체 일정 초기화</button></aside></div>
    <div className="feedback" role="status">{storageError || notice}</div><footer><span>FLATPOINT <b>PROJECT PLANNER</b></span><span>변경 내용은 이 브라우저에 자동 저장됩니다.</span></footer></main>
    {editing && <TaskForm task={editing.task} defaultDate={editing.date || selected} onSave={save} onClose={() => setEditing(null)}/>}
  </div>;
}
