import React from "react";
import { useEffect, useState } from 'react';
import { initialTasks, STORAGE_KEY, validTasks, localDate, formatDate } from './data';
import TaskForm from './components/TaskForm';
import TaskRow from './components/TaskRow';

export default function App() {
  const [storageError, setStorageError] = useState('');
  const [tasks, setTasks] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw === null) return initialTasks(); const data = JSON.parse(raw); return validTasks(data) ? data : initialTasks(); } catch { return initialTasks(); }
  });
  const [today, setToday] = useState(localDate);
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
  const upcoming = sorted.find(t => !t.completed && t.date >= today);
  function save(task) {
    setTasks(current => editing.task ? current.map(t => t.id === task.id ? task : t) : [...current, { ...task, id: crypto.randomUUID(), completed: false }]);
    setNotice(editing.task ? '일정을 수정했습니다.' : '새 일정을 추가했습니다.'); setEditing(null);
  }
  function remove(task) { if (window.confirm(`‘${task.title}’ 일정을 삭제할까요?`)) { setTasks(current => current.filter(t => t.id !== task.id)); setNotice('일정을 삭제했습니다.'); } }
  function reset() { if (window.confirm('추가·수정한 일정과 완료 상태를 지우고, 2026년 기본 일정 14개로 되돌릴까요?')) { setTasks(initialTasks()); setFilter('all'); setQuery(''); setNotice('기본 일정으로 초기화했습니다.'); } }
  const rowProps = { today, onToggle: id => setTasks(current => current.map(t => t.id === id ? { ...t, completed: !t.completed } : t)), onEdit: task => setEditing({ task }), onDelete: remove };
  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#"><span className="brand-mark">F<span>↗</span></span> FLATPOINT<span className="brand-dot">®</span></a><div className="workspace-label">PERSONAL WORKSPACE</div><a className="nav-item active" href="#overview"><span>▦</span> 프로젝트 대시보드 <span className="nav-arrow">↗</span></a><a className="nav-item" href="#schedule"><span>▤</span> 전체 일정 <span className="nav-count">{tasks.length}</span></a><div className="sidebar-project"><div className="project-symbol">F.</div><span className="eyebrow">CURRENT PROJECT</span><h3>작은 디테일에서,<br/>새로운 가능성으로.</h3><p>신제품 상세페이지 & 포트폴리오</p><span className="project-tag"><i/> PERSONAL PROJECT</span></div><div className="sidebar-bottom"><span className="avatar">FP</span><div>나의 워크스페이스<small>매일 조금씩, 꾸준하게</small></div><span>⌘</span></div></aside>
    <main id="overview"><header className="topbar"><span>워크스페이스 <span className="breadcrumb">/</span> <strong>프로젝트 플래너</strong></span><span className="today-date">{formatDate(today, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</span></header>
    <div className="main-content"><section className="page-heading"><div><div className="eyebrow"><span className="tiny-square"/> PLAN WITH PURPOSE</div><h1>Project Planner<span>.</span></h1><p>아이디어가 완성되는 순간까지, 한 걸음씩 기록하세요.</p></div><button className="primary" onClick={() => setEditing({ task: null })}><span className="plus">＋</span> 일정 추가</button></section>
    <section className="project-banner"><div><span className="banner-label">2026 · FLATPOINT PROJECT</span><h2>좋은 결과는,<br/>차곡차곡 쌓인 하루에서.</h2><p>가상 신제품 상세페이지 및 포트폴리오 제작</p><span className="banner-dates">2026.10.22 <span>—</span> 2026.11.04 <span className="banner-pill">기본 프로젝트 일정</span></span></div><div className="banner-art" aria-hidden="true"><div className="art-outline"/><div className="art-block"/><div className="art-ball"/><span>FORM FOLLOWS<br/>YOUR PLAN.</span><b>↗</b></div></section>
    <section className="stats-grid" aria-label="진행 현황"><article className="stat-card progress-card"><div className="stat-label">전체 진행률 <span>↗</span></div><div className="stat-value">{percentage}<span>%</span><small>{completed} / {tasks.length} 완료</small></div><div className="progress-track" role="progressbar" aria-label="전체 진행률" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${percentage}%` }}/></div><p>{percentage === 100 ? '모든 작업을 완성했어요. 수고하셨습니다!' : '하나의 완료가, 다음 가능성을 만듭니다.'}</p></article><article className="stat-card"><div className="stat-label">남은 작업 <span>▤</span></div><div className="stat-value">{tasks.length - completed}<span>개</span></div><p>전체 {tasks.length}개의 작업 중 {completed}개 완료</p></article><article className="stat-card"><div className="stat-label">오늘의 작업 <span>☀</span></div><div className="stat-value">{todayTasks.filter(t => !t.completed).length}<span>개</span></div><p>{todayTasks.length ? `오늘 예정된 작업 ${todayTasks.length}개` : '오늘은 다음 단계를 준비하는 날'}</p></article></section>
    <section className="today-panel"><div className="section-title"><h2><span className="olive-dot"/> 오늘의 포커스</h2><span>{formatDate(today, { month: '2-digit', day: '2-digit', weekday: 'short' })}</span></div>{todayTasks.length ? todayTasks.map(task => <TaskRow key={task.id} task={task} {...rowProps}/>) : <div className="today-empty"><div className="empty-icon">✓</div><div><strong>오늘 예정된 작업이 없어요.</strong><p>{upcoming ? `다음 일정은 ${formatDate(upcoming.date, { month: 'long', day: 'numeric' })}, ‘${upcoming.title}’입니다.` : '잠시 숨을 고르고, 다음 아이디어를 계획해 보세요.'}</p></div><button className="text-button" onClick={() => setEditing({ task: null })}>오늘 일정 추가 ↗</button></div>}</section>
    <section id="schedule" className="schedule-panel"><div className="schedule-heading"><div><div className="eyebrow">YOUR ROADMAP</div><h2>프로젝트 일정 <span>{tasks.length}</span></h2></div><button className="reset-button" onClick={reset}>↻ 전체 초기화</button></div><div className="toolbar"><div className="tabs" aria-label="일정 필터">{[['all', '전체'], ['pending', '미완료'], ['done', '완료']].map(([value, label]) => <button key={value} aria-pressed={filter === value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}<span>{value === 'all' ? tasks.length : value === 'done' ? completed : tasks.length - completed}</span></button>)}</div><label className="search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="작업 검색" aria-label="작업 검색"/></label></div><div className="list-header"><span>작업 / 일정</span><span>상태 · 관리</span></div><div className="task-list">{visible.length ? visible.map(task => <TaskRow key={task.id} task={task} {...rowProps}/>) : <div className="list-empty">{query ? '검색 결과가 없습니다.' : '표시할 일정이 없습니다.'}</div>}</div><div className="list-footer"><span>총 {visible.length}개의 일정</span><span>날짜순 정렬 ↑</span></div></section>
    <div className="feedback" role="status">{storageError || notice}</div><footer><span>FLATPOINT <b>PROJECT PLANNER</b></span><span>작은 계획이 만드는 큰 변화.</span><span>© 2026 FLATPOINT</span></footer></div></main>
    {editing && <TaskForm task={editing.task} defaultDate={today} onSave={save} onClose={() => setEditing(null)}/>}
  </div>;
}
