import { getMarketSnapshot } from './market-data.mjs';
import { homeContent } from './content/home-content.mjs';
import { reports } from './content/report-content.mjs';
import { briefs } from './content/brief-content.mjs';
import { NEWS_CATEGORIES, NEWS_INDUSTRIES, newsItems } from './content/news-content.mjs';
import { renderHome } from './pages/home-page.mjs';
import { createSparklineGeometry, formatMarketValue, renderMarket } from './pages/market-page.mjs';
import { createReportPage, sortReports } from './pages/report-page.mjs';
import { createBriefPage } from './pages/brief-page.mjs';
import { createNewsPage } from './pages/news-page.mjs';

export { createSparklineGeometry, formatMarketValue, sortReports };

const PRIMARY_ROUTES = new Set(['home', 'market', 'brief', 'report', 'news']);
const DETAIL_ROUTES = new Set(['report', 'brief']);

let reportPage;
let briefPage;

export function parseRoute(hash) {
  const value = hash.replace(/^#/, '');
  const segments = value.split('/');
  const page = segments[0];
  if (!PRIMARY_ROUTES.has(page)) return { page: 'home', detailId: null };
  if (!DETAIL_ROUTES.has(page)) {
    return segments.length === 1 ? { page, detailId: null } : { page: 'home', detailId: null };
  }
  if (segments.length === 1) return { page, detailId: null };
  if (segments.length === 2 && segments[1]) return { page, detailId: segments[1] };
  return { page: 'home', detailId: null };
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
  if (route.page === 'report') {
    route.detailId ? reportPage.showDetail(route.detailId) : reportPage.showList();
  } else if (route.page === 'brief') {
    route.detailId ? briefPage.showDetail(route.detailId) : briefPage.showList();
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
  briefPage = createBriefPage(document.querySelector('#brief'), {
    briefs,
    navigate: (route) => { location.hash = route; },
  });
  briefPage.showList();
  createNewsPage(document.querySelector('#news'), {
    categories: NEWS_CATEGORIES,
    industries: NEWS_INDUSTRIES,
    items: newsItems,
  });
  bindRouteButtons();
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}

if (typeof document !== 'undefined') init();
