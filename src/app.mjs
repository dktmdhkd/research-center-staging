import { getMarketSnapshot } from './market-data.mjs';
import { homeContent } from './content/home-content.mjs';
import { reports } from './content/report-content.mjs';
import { NEWS_CATEGORIES, newsItems } from './content/news-content.mjs';
import { renderHome } from './pages/home-page.mjs';
import { createSparklineGeometry, formatMarketValue, renderMarket } from './pages/market-page.mjs';
import { createReportPage, sortReports } from './pages/report-page.mjs';
import { createNewsPage } from './pages/news-page.mjs';

export { createSparklineGeometry, formatMarketValue, sortReports };

const PRIMARY_ROUTES = new Set(['home', 'market', 'report', 'news']);

let reportPage;

export function parseRoute(hash) {
  const value = hash.replace(/^#/, '');
  const [page, reportId] = value.split('/');
  if (!PRIMARY_ROUTES.has(page)) return { page: 'home', reportId: null };
  const segments = value.split('/');
  if (page !== 'report') {
    return segments.length === 1 ? { page, reportId: null } : { page: 'home', reportId: null };
  }
  if (segments.length === 1) return { page, reportId: null };
  if (segments.length === 2 && reportId) return { page, reportId };
  return { page: 'home', reportId: null };
}

function showRoute(route, updateHash = true) {
  document.querySelectorAll('[data-page]').forEach((page) => {
    page.hidden = page.dataset.page !== route;
    page.classList.toggle('is-active', page.dataset.page === route);
  });
  document.querySelectorAll('.nav-link').forEach((link) => {
    const active = link.dataset.route === route;
    link.classList.toggle('is-active', active);
    active ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current');
  });
  if (updateHash) location.hash = route;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderRoute() {
  const route = parseRoute(location.hash);
  showRoute(route.page, false);
  if (route.page === 'report' && route.reportId) {
    reportPage.showDetail(route.reportId);
  } else if (route.page === 'report') {
    reportPage.showList();
  }
}

function bindRouteButtons() {
  document.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => showRoute(button.dataset.route));
  });
}

function init() {
  const snapshot = getMarketSnapshot();
  renderHome(document.querySelector('#home'), { content: homeContent, reports, newsItems, marketSnapshot: snapshot });
  renderMarket(document.querySelector('#market'), snapshot);
  reportPage = createReportPage(document.querySelector('#report'), {
    reports,
    navigate: (route) => { location.hash = route; },
  });
  reportPage.showList();
  createNewsPage(document.querySelector('#news'), {
    categories: NEWS_CATEGORIES,
    items: newsItems,
  });
  bindRouteButtons();
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}

if (typeof document !== 'undefined') init();
