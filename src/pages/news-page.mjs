export const NEWS_PAGE_SIZE = 10;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function filterNews(items, { category = 'all', industry = 'all', dateFrom = null, dateTo = null } = {}) {
  return items.filter((item) => {
    const itemDate = item.date.replaceAll('.', '-');
    return (category === 'all' || item.category === category)
      && (industry === 'all' || item.industry === industry)
      && (!dateFrom || itemDate >= dateFrom)
      && (!dateTo || itemDate <= dateTo);
  });
}

export function sortNews(items, order = 'newest') {
  const direction = order === 'oldest' ? 1 : -1;
  return [...items].sort((a, b) => a.date.localeCompare(b.date) * direction);
}

export function buildPaginationButtons(current, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, totalPages];
  }
  if (current >= totalPages - 2) {
    return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, current - 1, current, current + 1, totalPages];
}

export function createNewsListController(items) {
  const state = { category: 'all', industry: 'all', dateFrom: null, dateTo: null, order: 'newest', page: 1 };
  const getFiltered = () => sortNews(filterNews(items, state), state.order);
  const getTotalPages = () => Math.ceil(getFiltered().length / NEWS_PAGE_SIZE);
  return {
    getItems: () => getFiltered(),
    getPageItems: () => {
      const start = (state.page - 1) * NEWS_PAGE_SIZE;
      return getFiltered().slice(start, start + NEWS_PAGE_SIZE);
    },
    getTotalPages,
    getPage: () => state.page,
    setPage: (page) => { state.page = Math.min(Math.max(1, page), Math.max(1, getTotalPages())); },
    setFilters: (patch) => { Object.assign(state, patch); state.page = 1; },
  };
}

export function newsMainContentHtml(paragraphs) {
  return paragraphs.map((paragraph, index) =>
    `<div class="news-paragraph"><span class="news-paragraph-number">${index + 1}.</span><p>${escapeHtml(paragraph)}</p></div>`)
    .join('');
}

function newsItemTemplate(item) {
  const link = item.sourceUrl
    ? `<a href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">원문 링크</a>`
    : '<span class="source-unavailable">원문 링크 미연결</span>';
  const sampleBadge = item.status === 'sample' ? '<b>SAMPLE</b>' : '';
  const industryMeta = item.industry ? `<span>${item.industry}</span>` : '';

  return `<article class="news-item">
    <div class="news-item-meta"><span>${item.category}</span>${industryMeta}<span>${escapeHtml(item.source)}</span><time>${item.date}</time>${sampleBadge}</div>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${item.oneLineSummary}</p>
    <button type="button" data-news-toggle="${item.id}" aria-expanded="false" aria-controls="news-detail-${item.id}">본문 보기</button>
    <div id="news-detail-${item.id}" class="news-detail" hidden>
      ${newsMainContentHtml(item.mainContentParagraphs)}
      ${link}
    </div>
  </article>`;
}

function paginationHtml(current, totalPages) {
  if (totalPages <= 1) return '';
  const pages = buildPaginationButtons(current, totalPages);
  const pageButtons = pages
    .map((page) => `<button type="button" data-news-page="${page}"${page === current ? ' aria-current="page"' : ''}>${page}</button>`)
    .join('');
  const prevDisabled = current <= 1 ? ' disabled' : '';
  const nextDisabled = current >= totalPages ? ' disabled' : '';
  return `<button type="button" data-news-page="${current - 1}" class="pagination-arrow" aria-label="이전 페이지"${prevDisabled}>이전</button>${pageButtons}<button type="button" data-news-page="${current + 1}" class="pagination-arrow" aria-label="다음 페이지"${nextDisabled}>다음</button>`;
}

export function createNewsPage(root, { categories, industries, items }) {
  const controller = createNewsListController(items);

  root.querySelector('#news-category-filter').innerHTML = ['all', ...categories]
    .map((category) => `<option value="${category}">${category === 'all' ? '전체' : category}</option>`).join('');
  root.querySelector('#news-industry-filter').innerHTML = ['all', ...industries]
    .map((industry) => `<option value="${industry}">${industry === 'all' ? '전체' : industry}</option>`).join('');

  function render() {
    const filtered = controller.getItems();
    const count = root.querySelector('#news-count');
    count.setAttribute('aria-live', 'polite');
    count.textContent = `${filtered.length}건`;

    const totalPages = controller.getTotalPages();
    const currentPage = controller.getPage();
    const pagination = paginationHtml(currentPage, totalPages);
    root.querySelector('#news-pagination-top').innerHTML = pagination;
    root.querySelector('#news-pagination-bottom').innerHTML = pagination;

    root.querySelector('#news-list').innerHTML = controller.getPageItems().map(newsItemTemplate).join('');

    root.querySelectorAll('[data-news-page]').forEach((button) => button.addEventListener('click', () => {
      controller.setPage(Number(button.dataset.newsPage));
      render();
      root.querySelector('#news-list-title')?.focus();
    }));

    root.querySelectorAll('[data-news-toggle]').forEach((button) => button.addEventListener('click', () => {
      const panel = root.querySelector(`#news-detail-${button.dataset.newsToggle}`);
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      button.textContent = expanded ? '본문 보기' : '본문 닫기';
      panel.hidden = expanded;
    }));
  }

  root.querySelector('#news-category-filter').addEventListener('change', (event) => { controller.setFilters({ category: event.target.value }); render(); });
  root.querySelector('#news-industry-filter').addEventListener('change', (event) => { controller.setFilters({ industry: event.target.value }); render(); });
  root.querySelector('#news-date-from').addEventListener('change', (event) => { controller.setFilters({ dateFrom: event.target.value || null }); render(); });
  root.querySelector('#news-date-to').addEventListener('change', (event) => { controller.setFilters({ dateTo: event.target.value || null }); render(); });
  root.querySelector('#news-sort').addEventListener('change', (event) => { controller.setFilters({ order: event.target.value }); render(); });

  render();
  return { render };
}
