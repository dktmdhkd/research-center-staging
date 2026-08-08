import { briefData } from './brief-content.data.mjs';

const WEEKDAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

export function deriveBriefTitle(date) {
  const [y, m, d] = date.split('.').map(Number);
  const weekday = WEEKDAY_KR[new Date(y, m - 1, d).getDay()];
  return `${date} (${weekday}) 시황노트`;
}

export const briefs = briefData.records.map((record) => ({
  pdfUrl: null,
  pdfStatus: 'unavailable',
  ...record,
  title: deriveBriefTitle(record.date),
}));
