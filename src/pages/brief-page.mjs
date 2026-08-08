export function sortBriefs(items, order = 'newest') {
  const direction = order === 'oldest' ? 1 : -1;
  return [...items].sort((a, b) => a.date.localeCompare(b.date) * direction);
}

export function filterBriefsByDate(items, { dateFrom = null, dateTo = null } = {}) {
  return items.filter((item) => {
    const itemDate = item.date.replaceAll('.', '-');
    return (!dateFrom || itemDate >= dateFrom) && (!dateTo || itemDate <= dateTo);
  });
}

export function createBriefListController(briefs) {
  const state = { dateFrom: null, dateTo: null, order: 'newest' };
  return {
    getItems: () => sortBriefs(filterBriefsByDate(briefs, state), state.order),
    setFilters: (patch) => Object.assign(state, patch),
  };
}

function isLocalPdfPath(pdfUrl) {
  if (typeof pdfUrl !== 'string') return false;
  if (pdfUrl.includes('..') || /[\\%?#:*"<>|\x00-\x1f]/.test(pdfUrl)) return false;
  return /^(?:\.\/|\/)?briefs\/(?:[\p{L}\p{N}][\p{L}\p{N}._-]*\/)*[\p{L}\p{N}][\p{L}\p{N}._-]*\.pdf$/u.test(pdfUrl);
}

export function getPdfState(brief) {
  const available = brief.pdfStatus === 'published' && isLocalPdfPath(brief.pdfUrl);
  return { available, reason: available ? '' : '승인 PDF 연결 전' };
}

export function briefDetailTemplate(brief) {
  const pdf = getPdfState(brief);
  const controls = pdf.available
    ? `<a class="primary-action" href="${brief.pdfUrl}" target="_blank" rel="noopener">PDF 열기</a>
       <a class="secondary-action" href="${brief.pdfUrl}" download>PDF 다운로드</a>`
    : `<button class="disabled-action" type="button" disabled>${pdf.reason}</button>`;
  const viewer = pdf.available
    ? `<iframe class="pdf-viewer" src="${brief.pdfUrl}" title="${brief.title} PDF"></iframe>`
    : `<div class="pdf-unavailable" role="status">${pdf.reason}</div>`;

  return `<button class="brief-back" type="button" data-brief-back>← 목록으로 돌아가기</button>
    <header class="brief-detail-header">
      <h1 tabindex="-1">${brief.title}</h1>
      <div class="brief-meta"><time datetime="${brief.date.replaceAll('.', '-')}">${brief.date}</time></div>
    </header>
    <div class="brief-actions">${controls}</div>
    ${viewer}`;
}

export function focusBriefDetail(detailView) {
  detailView.querySelector('h1, [role="alert"]')?.focus();
}

export function restoreBriefListFocus(listView, briefId) {
  listView.querySelector(`[data-brief-detail-id="${briefId}"]`)?.focus();
}

function briefListItem(brief) {
  return `<article class="brief-list-item">
    <time datetime="${brief.date.replaceAll('.', '-')}">${brief.date}</time>
    <button type="button" data-brief-detail-id="${brief.id}">${brief.title}</button>
  </article>`;
}

export function createBriefPage(root, { briefs, navigate }) {
  const controller = createBriefListController(briefs);
  const listView = root.querySelector('#brief-list-view');
  const detailView = root.querySelector('#brief-detail-view');
  let pendingFocusId = null;

  function bindDetailButtons(container) {
    container.querySelectorAll('[data-brief-detail-id]').forEach((button) => {
      button.addEventListener('click', () => {
        pendingFocusId = button.dataset.briefDetailId;
        navigate(`brief/${pendingFocusId}`);
      });
    });
  }

  function renderList() {
    const items = controller.getItems();
    const count = root.querySelector('#brief-count');
    if (count) {
      count.setAttribute('aria-live', 'polite');
      count.textContent = `${items.length}건`;
    }
    const container = root.querySelector('#brief-list');
    container.innerHTML = items.map(briefListItem).join('');
    bindDetailButtons(container);
  }

  root.querySelector('#brief-date-from').addEventListener('change', (event) => { controller.setFilters({ dateFrom: event.target.value || null }); renderList(); });
  root.querySelector('#brief-date-to').addEventListener('change', (event) => { controller.setFilters({ dateTo: event.target.value || null }); renderList(); });
  root.querySelector('#brief-sort').addEventListener('change', (event) => { controller.setFilters({ order: event.target.value }); renderList(); });

  function showList() {
    listView.hidden = false;
    detailView.hidden = true;
    renderList();
    if (pendingFocusId) {
      restoreBriefListFocus(listView, pendingFocusId);
      pendingFocusId = null;
    }
  }

  function showDetail(briefId) {
    const brief = briefs.find((item) => item.id === briefId);
    listView.hidden = true;
    detailView.hidden = false;
    detailView.innerHTML = brief
      ? briefDetailTemplate(brief)
      : `<button class="brief-back" type="button" data-brief-back>← 목록으로 돌아가기</button>
         <p role="alert" tabindex="-1">요청한 시황 노트를 찾을 수 없습니다.</p>`;
    detailView.querySelector('[data-brief-back]').addEventListener('click', () => {
      location.hash = 'brief';
    });
    focusBriefDetail(detailView);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  return { showList, showDetail };
}
