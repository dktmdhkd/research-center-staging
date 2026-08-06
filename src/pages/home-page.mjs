import { REPORT_CATEGORIES } from '../content/report-content.mjs';

export function buildHomeMetrics({ reports, newsItems, marketSnapshot }) {
  const reportTypeCounts = Object.fromEntries(REPORT_CATEGORIES.map((category) => [category, 0]));
  reports.forEach((report) => {
    if (report.category in reportTypeCounts) reportTypeCounts[report.category] += 1;
  });
  return {
    reportCount: reports.length,
    reportTypeCounts,
    newsCount: newsItems.length,
    marketIndicatorCount: marketSnapshot.overview.length,
    marketStatus: marketSnapshot.status,
  };
}

function overviewCardTemplate(card, metrics) {
  const status = card.id === 'market'
    ? `${metrics.marketIndicatorCount}개 지표 · ${metrics.marketStatus.toUpperCase()}`
    : card.id === 'report'
      ? `${metrics.reportCount}건 · ${REPORT_CATEGORIES.map((category) => `${category} ${metrics.reportTypeCounts[category]}건`).join(' · ')}`
      : `${metrics.newsCount}건`;
  return `<article class="overview-card">
    <span>${card.title}</span>
    <h3>${card.description}</h3>
    <p>${card.process}</p>
    <strong>${status}</strong>
  </article>`;
}

function flowLaneTemplate(lane) {
  return `<article class="flow-lane">
    <h3>${lane.title}</h3>
    <ol>${lane.steps.map((step) => `<li>${step}</li>`).join('')}</ol>
  </article>`;
}

export function renderHome(root, { content, reports, newsItems, marketSnapshot }) {
  const metrics = buildHomeMetrics({ reports, newsItems, marketSnapshot });
  root.querySelector('#home-hero').innerHTML = `<div class="hero shell">
    <div class="hero-copy">
      <h1 id="home-title">${content.primaryCopy}</h1>
      <p>${content.secondaryCopy}</p>
    </div>
  </div>`;
  root.querySelector('#center-overview').innerHTML = `
    <article class="purpose-block"><h3>${content.purpose.title}</h3><p>${content.purpose.body}</p></article>
    <div class="overview-grid">${content.overviewCards.map((card) => overviewCardTemplate(card, metrics)).join('')}</div>`;
  root.querySelector('#center-flow').innerHTML =
    `<div class="flow-grid">${content.flowLanes.map(flowLaneTemplate).join('')}</div>`;
}
