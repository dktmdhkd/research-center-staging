export function createSparklineGeometry(points, width = 300, height = 55) {
  if (!Array.isArray(points) || points.length < 2) throw new TypeError('at least two points are required');
  const minimum = Math.min(...points);
  const maximum = Math.max(...points);
  const range = maximum - minimum;
  const coordinates = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = range === 0 ? height / 2 : height - ((point - minimum) / range) * height;
    return [Number(x.toFixed(2)), Number(y.toFixed(2))];
  });
  const line = coordinates.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  return { line, area: `${line} L ${width} ${height} L 0 ${height} Z` };
}

export function formatMarketValue(value, unit) {
  const decimals = unit === '%' || unit === 'pt' ? 2 : Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function formatDate(isoString) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(isoString));
}

function sparklineTemplate(item, className = 'sparkline') {
  const direction = item.changePct >= 0 ? 'up' : 'down';
  const geometry = createSparklineGeometry(item.points);
  const stroke = direction === 'up' ? '#B23A32' : '#315F9F';
  return `<svg class="${className}" viewBox="0 0 300 55" role="img" aria-label="${item.label} 샘플 추이"><path class="area" d="${geometry.area}" fill="${stroke}"></path><path d="${geometry.line}" fill="none" stroke="${stroke}" stroke-width="2" vector-effect="non-scaling-stroke"></path></svg>`;
}

function marketCardTemplate(item) {
  const direction = item.changePct >= 0 ? 'up' : 'down';
  const sign = item.changePct >= 0 ? '+' : '';
  return `<button class="market-card" type="button" data-market-card="${item.id}" aria-pressed="false"><div class="market-card-top"><div><h3>${item.label}</h3><p>${item.instrument}</p></div><span class="status-badge">SAMPLE</span></div><div class="market-value"><strong>${formatMarketValue(item.value, item.unit)}</strong><small>${item.unit}</small><span class="change ${direction}">${sign}${item.changePct.toFixed(2)}%</span></div>${sparklineTemplate(item)}<div class="market-meta"><span>${formatDate(item.asOf)} KST</span><span>${item.source}</span></div></button>`;
}

export function renderMarketCards(container, instruments) {
  container.innerHTML = instruments.map(marketCardTemplate).join('');
}

function renderMarketSelection(container, item) {
  const typeLabels = { index: '주가지수', yield: '채권 수익률', crypto: '암호자산', spot: '현물', futures: '선물' };
  const direction = item.changePct >= 0 ? 'up' : 'down';
  container.innerHTML = `<div><span class="section-number">SELECTED INDICATOR</span><h3>${item.label}</h3><p>${item.instrument} · ${typeLabels[item.instrumentType] ?? item.instrumentType}</p></div><div class="selection-value"><strong>${formatMarketValue(item.value, item.unit)}</strong><span class="change ${direction}">${item.changePct > 0 ? '+' : ''}${item.changePct.toFixed(2)}%</span></div><dl><div><dt>기준</dt><dd>${formatDate(item.asOf)} KST</dd></div><div><dt>출처</dt><dd>${item.source}</dd></div><div><dt>상태</dt><dd>SAMPLE</dd></div></dl>`;
}

function sectorTemplate(sector, index) {
  const direction = sector.changePct >= 0 ? 'up' : 'down';
  return `<button class="sector-cell ${direction}" type="button" data-sector="${index}" style="--weight:${sector.weight}" aria-pressed="false"><b>${sector.name}</b><span>${sector.changePct > 0 ? '+' : ''}${sector.changePct.toFixed(2)}%</span></button>`;
}

function moversTemplate(movers) {
  const list = (items, direction) => items.map(([name, value]) => `<li><span>${name}</span><b class="change ${direction}">${value > 0 ? '+' : ''}${value.toFixed(2)}%</b></li>`).join('');
  return `<div class="mover-tabs" role="group" aria-label="상승 하락 종목"><button class="mover-tab" type="button" data-mover-tab="gainers" aria-pressed="true">상승</button><button class="mover-tab" type="button" data-mover-tab="decliners" aria-pressed="false">하락</button></div><div class="mover-columns"><div data-mover-panel="gainers"><h4>상승 상위</h4><ul>${list(movers.gainers, 'up')}</ul></div><div data-mover-panel="decliners"><h4>하락 상위</h4><ul>${list(movers.decliners, 'down')}</ul></div></div>`;
}

function indexChartTemplate(item) {
  return `<article class="index-chart"><div><h4>${item.label}</h4><span>${formatMarketValue(item.value, item.unit)} ${item.unit}</span></div>${sparklineTemplate(item, 'index-sparkline')}</article>`;
}

function renderMarketDetail(container, region, data, overview) {
  const indices = region === 'kr' ? overview.filter((item) => ['kospi', 'kosdaq'].includes(item.id)) : overview.filter((item) => ['sp500', 'nasdaq'].includes(item.id));
  const title = region === 'kr' ? 'KR Sector Map' : 'US Sector Map';
  let flowPanel;
  if (region === 'kr') {
    const maxFlow = Math.max(...data.investorFlow.map((item) => Math.abs(item.value)));
    flowPanel = `<div class="detail-panel"><div class="panel-heading"><h3>투자자별 매매동향</h3><span>억원 · SAMPLE</span></div><div class="flow-list">${data.investorFlow.map((item) => `<div class="flow-row"><div><span>${item.name}</span><b class="change ${item.value >= 0 ? 'up' : 'down'}">${item.value > 0 ? '+' : ''}${item.value.toLocaleString('ko-KR')}</b></div><div class="flow-track"><div class="flow-bar ${item.value >= 0 ? 'positive' : ''}" style="width:${Math.max(8, Math.abs(item.value) / maxFlow * 100)}%"></div></div></div>`).join('')}</div></div>`;
  } else {
    flowPanel = `<div class="detail-panel"><div class="panel-heading"><h3>Market Breadth</h3><span>SAMPLE</span></div><div class="breadth"><div><b class="change up">${data.breadth.advancers}</b><span>상승</span></div><div><b class="change down">${data.breadth.decliners}</b><span>하락</span></div><div><b>${data.breadth.unchanged}</b><span>보합</span></div></div></div>`;
  }
  container.innerHTML = `<div class="index-strip">${indices.map(indexChartTemplate).join('')}</div><div class="treemap-panel"><div class="panel-heading"><h3>${title}</h3><span data-sector-readout>업종을 선택하면 상세를 확인합니다</span></div><div class="treemap">${data.sectors.map(sectorTemplate).join('')}</div></div><div class="side-stack">${flowPanel}<div class="detail-panel"><div class="panel-heading"><h3>Market Movers</h3><span>등락률 · SAMPLE</span></div>${moversTemplate(data.movers)}</div></div>`;
  container.querySelectorAll('[data-sector]').forEach((button) => button.addEventListener('click', () => {
    container.querySelectorAll('[data-sector]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    const sector = data.sectors[Number(button.dataset.sector)];
    container.querySelector('[data-sector-readout]').textContent = `${sector.name} ${sector.changePct > 0 ? '+' : ''}${sector.changePct.toFixed(2)}% · 비중 ${sector.weight}%`;
  }));
  container.querySelectorAll('[data-mover-tab]').forEach((button) => button.addEventListener('click', () => {
    const selected = button.dataset.moverTab;
    container.querySelectorAll('[data-mover-tab]').forEach((tab) => tab.setAttribute('aria-pressed', String(tab === button)));
    container.querySelectorAll('[data-mover-panel]').forEach((panel) => panel.classList.toggle('is-mobile-active', panel.dataset.moverPanel === selected));
  }));
  container.querySelector('[data-mover-panel="gainers"]')?.classList.add('is-mobile-active');
}

export function getMarketRegions(snapshot) {
  return [
    { id: 'kr', label: 'KR Market', data: snapshot.kr },
    { id: 'us', label: 'US Market', data: snapshot.us },
  ];
}

export function renderMarket(root, snapshot) {
  renderMarketCards(root.querySelector('#market-grid'), snapshot.overview);
  renderMarketSelection(root.querySelector('#market-selection'), snapshot.overview[0]);
  root.querySelector('[data-market-card="kospi"]')?.setAttribute('aria-pressed', 'true');
  root.querySelector('#market-updated').textContent = `${formatDate(snapshot.generatedAt)} KST · SAMPLE`;
  renderMarketDetail(root.querySelector('#market-detail-kr'), 'kr', snapshot.kr, snapshot.overview);
  renderMarketDetail(root.querySelector('#market-detail-us'), 'us', snapshot.us, snapshot.overview);

  root.querySelectorAll('[data-market-card]').forEach((button) => button.addEventListener('click', () => {
    root.querySelectorAll('[data-market-card]').forEach((card) => {
      card.setAttribute('aria-pressed', String(card === button));
    });
    const selected = snapshot.overview.find((item) => item.id === button.dataset.marketCard);
    renderMarketSelection(root.querySelector('#market-selection'), selected);
  }));
}
