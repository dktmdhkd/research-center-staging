import { REPORT_CATEGORIES } from '../content/report-content.mjs';

export function sortReports(items, order = 'newest') {
  const direction = order === 'oldest' ? 1 : -1;
  return [...items].sort((a, b) => a.date.localeCompare(b.date) * direction);
}

export function countReportsByType(items) {
  const byType = Object.fromEntries(REPORT_CATEGORIES.map((category) => [category, 0]));
  items.forEach((report) => { byType[report.category] += 1; });
  return { total: items.length, byType };
}

export function filterReports(items, { category = 'all', industry = 'all' } = {}) {
  return items.filter((report) =>
    (category === 'all' || report.category === category)
    && (industry === 'all' || report.industry === industry));
}

function isLocalPdfPath(pdfUrl) {
  if (typeof pdfUrl !== 'string') return false;
  if (pdfUrl.includes('..') || /[\\%?#:*"<>|\x00-\x1f]/.test(pdfUrl)) return false;
  return /^(?:\.\/|\/)?reports\/(?:[\p{L}\p{N}][\p{L}\p{N}._-]*\/)*[\p{L}\p{N}][\p{L}\p{N}._-]*\.pdf$/u.test(pdfUrl);
}

export function getPdfState(report) {
  const available = report.pdfStatus === 'published' && isLocalPdfPath(report.pdfUrl);
  return { available, reason: available ? '' : '승인 PDF 연결 전' };
}

export function reportDetailTemplate(report) {
  const pdf = getPdfState(report);
  const controls = pdf.available
    ? `<a class="primary-action" href="${report.pdfUrl}" target="_blank" rel="noopener">PDF 열기</a>
       <a class="secondary-action" href="${report.pdfUrl}" download>PDF 다운로드</a>`
    : `<button class="disabled-action" type="button" disabled>${pdf.reason}</button>`;
  const viewer = pdf.available
    ? `<iframe class="pdf-viewer" src="${report.pdfUrl}" title="${report.title} PDF"></iframe>`
    : `<div class="pdf-unavailable" role="status">${pdf.reason}</div>`;

  return `<button class="report-back" type="button" data-report-back>← 목록으로 돌아가기</button>
    <header class="report-detail-header">
      <h1 tabindex="-1">${report.title}</h1>
      <div class="report-meta"><span>${report.industry}</span><span>${report.category}</span><time datetime="${report.date.replaceAll('.', '-')}">${report.date}</time></div>
    </header>
    <dl class="report-detail-summary">
      <div><dt>배경 및 의문</dt><dd>${report.backgroundQuestion}</dd></div>
      <div><dt>주요 내용</dt><dd>${report.mainContent}</dd></div>
      <div><dt>결론</dt><dd>${report.conclusion}</dd></div>
    </dl>
    <div class="report-actions">${controls}</div>
    ${viewer}`;
}

export function createReportListController(reports) {
  const state = { overviewOrder: 'newest', indepthOrder: 'newest', category: 'all', industry: 'all' };

  return {
    getOverviewItems: () => sortReports(reports, state.overviewOrder),
    getIndepthItems: () => sortReports(filterReports(reports, state), state.indepthOrder),
    setOverviewOrder: (order) => { state.overviewOrder = order; },
    setIndepth: ({ category, industry, order }) => {
      if (category !== undefined) state.category = category;
      if (industry !== undefined) state.industry = industry;
      if (order !== undefined) state.indepthOrder = order;
    },
  };
}

export function reportCover(report) {
  const isImage = report.thumbnailKind === 'cover-image' && Boolean(report.coverImageUrl);
  const media = isImage ? `<img src="${report.coverImageUrl}" alt="" />` : '';
  return `<div class="report-thumbnail">${media}<div class="report-thumbnail-scrim"><strong>${report.title}</strong></div></div>`;
}

export function focusReportDetail(detailView) {
  detailView.querySelector('h1, [role="alert"]')?.focus();
}

export function restoreReportListFocus(listView, reportId, source) {
  const sourceSelector = source ? `[data-report-detail-source="${source}"]` : '';
  listView.querySelector(`[data-report-detail-id="${reportId}"]${sourceSelector}`)?.focus();
}

function overviewCard(report) {
  return `<article class="report-card">${reportCover(report)}<div class="report-card-copy"><p>${report.industry} · ${report.category}</p><time datetime="${report.date.replaceAll('.', '-')}">${report.date}</time><button type="button" data-report-detail-id="${report.id}" data-report-detail-source="overview">전문 자세히 보기</button></div></article>`;
}

function indepthItem(report) {
  const pdfAvailable = getPdfState(report).available;
  const pdfActions = pdfAvailable
    ? `<a href="${report.pdfUrl}" target="_blank" rel="noopener">PDF 열기</a><a href="${report.pdfUrl}" download>PDF 다운로드</a>`
    : '<button class="disabled-action" type="button" disabled>승인 PDF 연결 전</button>';
  return `<article class="report-indepth-item"><div class="report-indepth-left">${reportCover(report)}</div><div class="report-indepth-copy"><div class="report-meta"><span>${report.industry}</span><span>${report.category}</span><time datetime="${report.date.replaceAll('.', '-')}">${report.date}</time></div><dl><div><dt>배경 및 의문</dt><dd>${report.backgroundQuestion}</dd></div><div><dt>주요 내용</dt><dd>${report.mainContent}</dd></div><div><dt>결론</dt><dd>${report.conclusion}</dd></div></dl><div class="report-actions"><button type="button" data-report-detail-id="${report.id}" data-report-detail-source="indepth">전문 자세히 보기</button>${pdfActions}</div></div></article>`;
}

export function createReportPage(root, { reports, navigate }) {
  const controller = createReportListController(reports);
  const listView = root.querySelector('#report-list-view');
  const detailView = root.querySelector('#report-detail-view');
  const categories = ['all', ...REPORT_CATEGORIES];
  const industries = ['all', ...new Set(reports.map((report) => report.industry))];
  let pendingFocus = null;

  root.querySelector('#report-category-filter').innerHTML = categories
    .map((category) => `<option value="${category}">${category === 'all' ? '전체' : category}</option>`).join('');
  root.querySelector('#report-industry-filter').innerHTML = industries
    .map((industry) => `<option value="${industry}">${industry === 'all' ? '전체' : industry}</option>`).join('');

  function bindDetailButtons(container) {
    container.querySelectorAll('[data-report-detail-id]').forEach((button) => {
      button.addEventListener('click', () => {
        pendingFocus = { id: button.dataset.reportDetailId, source: button.dataset.reportDetailSource };
        navigate(`report/${pendingFocus.id}`);
      });
    });
  }

  function renderOverview() {
    const counts = countReportsByType(reports);
    root.querySelector('#report-counts').innerHTML = [['전체', counts.total], ...REPORT_CATEGORIES.map((category) => [category, counts.byType[category]])]
      .map(([label, count]) => `<div><span>${label}</span><strong>${count}</strong></div>`).join('');
    const container = root.querySelector('#report-overview-list');
    container.innerHTML = controller.getOverviewItems().map(overviewCard).join('');
    bindDetailButtons(container);
  }

  function renderIndepth() {
    const container = root.querySelector('#report-indepth-list');
    container.innerHTML = controller.getIndepthItems().map(indepthItem).join('');
    bindDetailButtons(container);
  }

  root.querySelector('#report-overview-sort').addEventListener('change', (event) => { controller.setOverviewOrder(event.target.value); renderOverview(); });
  root.querySelector('#report-category-filter').addEventListener('change', (event) => { controller.setIndepth({ category: event.target.value }); renderIndepth(); });
  root.querySelector('#report-industry-filter').addEventListener('change', (event) => { controller.setIndepth({ industry: event.target.value }); renderIndepth(); });
  root.querySelector('#report-indepth-sort').addEventListener('change', (event) => { controller.setIndepth({ order: event.target.value }); renderIndepth(); });

  function showList() {
    listView.hidden = false;
    detailView.hidden = true;
    renderOverview();
    renderIndepth();
    if (pendingFocus) {
      restoreReportListFocus(listView, pendingFocus.id, pendingFocus.source);
      pendingFocus = null;
    }
  }

  function showDetail(reportId) {
    const report = reports.find((item) => item.id === reportId);
    listView.hidden = true;
    detailView.hidden = false;
    detailView.innerHTML = report
      ? reportDetailTemplate(report)
      : `<button class="report-back" type="button" data-report-back>← 보고서 목록으로 돌아가기</button>
         <p role="alert" tabindex="-1">요청한 보고서를 찾을 수 없습니다.</p>`;
    detailView.querySelector('[data-report-back]').addEventListener('click', () => {
      location.hash = 'report';
    });
    focusReportDetail(detailView);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  return { showList, showDetail };
}
