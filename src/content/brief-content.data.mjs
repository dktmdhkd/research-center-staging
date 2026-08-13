// 순수 데이터 모듈 — 함수·계산식을 두지 않는다.
// brief/scripts/sync_to_homepage.mjs가 brief/data/brief.data.mjs 전체를 파싱해 status가
// sample/published인 항목만 골라 다시 직렬화하는 방식으로 갱신한다(정규식 텍스트 수술
// 아님). 이 파일을 직접 손으로 고치지 않는다 — 원본은 brief/data/brief.data.mjs다.
export const briefData = {
  "records": [
    {
      "id": "b1",
      "date": "2026.08.13",
      "pdfUrl": "briefs/260813_증시브리핑.pdf",
      "pdfStatus": "published",
      "status": "published"
    }
  ]
};
