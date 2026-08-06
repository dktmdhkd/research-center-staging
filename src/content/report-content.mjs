import { reportData } from './report-content.data.mjs';

export const REPORT_CATEGORIES = reportData.categories;

export const reports = reportData.records.map((report) => ({
  pdfUrl: null,
  pdfStatus: 'unavailable',
  ...report,
  category: reportData.categoryById[report.id],
  thumbnailKind: report.coverImageUrl ? 'cover-image' : 'generated-cover',
}));
