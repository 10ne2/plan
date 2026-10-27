export const STORAGE_KEY = 'flatpoint-planner-v1';
const titles = ['기획 확정', '상세페이지 원고', '디자인 가이드', '제품 대표 이미지', '제품 이미지 보정', '상세페이지 상단', '상세페이지 중단', '상세페이지 하단', '상세페이지 검수', '홍보 콘텐츠', '포트폴리오 구성', '포트폴리오 디자인', '최종 수정', '최종 완성'];
export function initialTasks() {
  return titles.map((title, i) => ({ id: `initial-${i}`, title, date: i < 10 ? `2026-10-${22 + i}` : `2026-11-0${i - 9}`, completed: false }));
}
export function localDate(date = new Date()) {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validTasks(value) {
  return Array.isArray(value) && value.every(t => t && typeof t.id === 'string' && typeof t.title === 'string' && t.title.trim() && typeof t.completed === 'boolean' && (t.memo === undefined || typeof t.memo === 'string') && /^\d{4}-\d{2}-\d{2}$/.test(t.date) && !Number.isNaN(new Date(`${t.date}T12:00:00`).getTime())) && new Set(value.map(t => t.id)).size === value.length;
}
export function formatDate(value, options = { month: 'long', day: 'numeric', weekday: 'long' }) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('ko-KR', options);
}
export function weekDates(value) {
  const start = new Date(`${value}T12:00:00`);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start); date.setDate(start.getDate() + index);
    return localDate(date);
  });
}

export function shiftDate(value, offset) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + offset);
  return date.getFullYear() >= 1 && date.getFullYear() <= 9999 ? localDate(date) : null;
}
