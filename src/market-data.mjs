const REQUIRED_FIELDS = [
  'value',
  'id',
  'label',
  'instrument',
  'instrumentType',
  'unit',
  'changePct',
  'asOf',
  'source',
  'status',
  'points',
];

export function classifyFreshness(asOf, now = new Date(), thresholdMinutes = 30) {
  if (!asOf) return 'unavailable';
  const observedAt = new Date(asOf);
  if (Number.isNaN(observedAt.getTime())) return 'unavailable';
  const ageMinutes = (now.getTime() - observedAt.getTime()) / 60_000;
  return ageMinutes <= thresholdMinutes ? 'live' : 'delayed';
}

export function validateInstrument(instrument) {
  for (const field of REQUIRED_FIELDS) {
    if (instrument[field] === undefined || instrument[field] === null) {
      throw new TypeError(`missing required field: ${field}`);
    }
  }
  if (!['spot', 'index', 'yield', 'crypto', 'futures'].includes(instrument.instrumentType)) {
    throw new TypeError(`unsupported instrument type: ${instrument.instrumentType}`);
  }
  if (!Array.isArray(instrument.points) || instrument.points.length < 2) {
    throw new TypeError('points must contain at least two observations');
  }
  return instrument;
}

const overview = [
  {
    id: 'kospi', label: 'KOSPI', instrument: 'KOSPI Index', instrumentType: 'index',
    value: 2764.18, unit: 'pt', changePct: 0.72, asOf: '2026-07-23T06:30:00Z',
    source: 'KIS 연결 예정', status: 'sample',
    points: [2721, 2728, 2730, 2742, 2738, 2750, 2747, 2758, 2761, 2764],
  },
  {
    id: 'sp500', label: 'S&P 500', instrument: 'S&P 500 Index', instrumentType: 'index',
    value: 6382.44, unit: 'pt', changePct: 0.36, asOf: '2026-07-22T20:00:00Z',
    source: 'KIS 연결 예정', status: 'sample',
    points: [6336, 6343, 6339, 6354, 6362, 6356, 6368, 6371, 6378, 6382],
  },
  {
    id: 'kosdaq', label: 'KOSDAQ', instrument: 'KOSDAQ Index', instrumentType: 'index',
    value: 816.92, unit: 'pt', changePct: -0.18, asOf: '2026-07-23T06:30:00Z',
    source: 'KIS 연결 예정', status: 'sample',
    points: [820, 821, 819, 822, 820, 818, 819, 817, 818, 817],
  },
  {
    id: 'nasdaq', label: 'NASDAQ', instrument: 'NASDAQ Composite', instrumentType: 'index',
    value: 21212.74, unit: 'pt', changePct: 0.58, asOf: '2026-07-22T20:00:00Z',
    source: 'KIS 연결 예정', status: 'sample',
    points: [20920, 20980, 21010, 20990, 21070, 21120, 21090, 21160, 21190, 21213],
  },
  {
    id: 'kr10y', label: '한국 10년물', instrument: '국고채 10년 수익률', instrumentType: 'yield',
    value: 2.84, unit: '%', changePct: -0.03, asOf: '2026-07-23T06:30:00Z',
    source: 'KIS 연결 예정', status: 'sample',
    points: [2.91, 2.9, 2.89, 2.9, 2.88, 2.87, 2.86, 2.85, 2.86, 2.84],
  },
  {
    id: 'us10y', label: '미국 10년물', instrument: 'US Treasury 10Y Yield', instrumentType: 'yield',
    value: 4.39, unit: '%', changePct: 0.02, asOf: '2026-07-22T20:00:00Z',
    source: '보조 소스 연결 예정', status: 'sample',
    points: [4.34, 4.35, 4.33, 4.36, 4.37, 4.36, 4.38, 4.4, 4.38, 4.39],
  },
  {
    id: 'bitcoin', label: '비트코인', instrument: 'BTC/USD', instrumentType: 'crypto',
    value: 118420, unit: 'USD', changePct: -0.64, asOf: '2026-07-23T06:30:00Z',
    source: '시세 API 연결 예정', status: 'sample',
    points: [119800, 120100, 119400, 119900, 119200, 118900, 119100, 118700, 118500, 118420],
  },
].map(validateInstrument);

const snapshot = {
  status: 'sample',
  generatedAt: '2026-07-23T06:30:00Z',
  overview,
  kr: {
    sectors: [
      { name: '반도체', changePct: 1.8, weight: 36 },
      { name: '자동차', changePct: 1.1, weight: 18 },
      { name: '금융', changePct: 0.7, weight: 16 },
      { name: '바이오', changePct: -0.9, weight: 14 },
      { name: '2차전지', changePct: -1.4, weight: 16 },
    ],
    investorFlow: [
      { name: '개인', value: -1842 },
      { name: '외국인', value: 2268 },
      { name: '기관', value: -318 },
    ],
    movers: {
      gainers: [['한화오션', 5.82], ['SK하이닉스', 4.31], ['현대차', 3.18]],
      decliners: [['LG에너지솔루션', -3.44], ['셀트리온', -2.61], ['카카오', -2.08]],
    },
  },
  us: {
    sectors: [
      { name: 'Technology', changePct: 1.24, weight: 30 },
      { name: 'Financials', changePct: 0.63, weight: 18 },
      { name: 'Industrials', changePct: 0.31, weight: 16 },
      { name: 'Healthcare', changePct: -0.28, weight: 18 },
      { name: 'Energy', changePct: -0.72, weight: 18 },
    ],
    breadth: { advancers: 318, decliners: 178, unchanged: 7 },
    movers: {
      gainers: [['NVDA', 3.72], ['AVGO', 2.91], ['JPM', 2.14]],
      decliners: [['XOM', -2.08], ['PFE', -1.72], ['BA', -1.31]],
    },
  },
};

export function getMarketSnapshot() {
  return JSON.parse(JSON.stringify(snapshot));
}
