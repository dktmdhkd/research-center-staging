export const homeContent = {
  primaryCopy: '문구 1',
  secondaryCopy: '문구 2',
  purpose: { title: 'AI 리서치센터의 목적', body: '문구 3' },
  overviewCards: [
    { id: 'market', title: 'Market', description: '문구 4', process: '수집 → 상태·출처 확인 → Overview → KR·US Indepth' },
    { id: 'report', title: 'Report', description: '문구 5', process: '질문 정의 → 근거 수집 → 분석·검토 → 승인 → Overview·Indepth·Detail 공개' },
    { id: 'news', title: 'News', description: '문구 6', process: '기사 링크 입력 → LLM 분류 → 한줄요약·핵심 문단 발췌 → 사용자 검토 → 공개' },
  ],
  flowLanes: [
    { id: 'market', title: 'Market', steps: ['데이터 수집', '상태·출처 확인', 'Overview', 'KR·US Indepth', '공개'] },
    { id: 'report', title: 'Report', steps: ['질문 정의', '근거 수집', '분석·검토', '승인', 'Overview·Indepth·Detail 공개'] },
    { id: 'news', title: 'News', steps: ['기사 링크 입력', 'LLM 분류', '한줄요약·핵심 문단 발췌', '사용자 검토', '공개'] },
  ],
};
