export function filterNews(items, category = '전체') {
  return category === '전체' ? [...items] : items.filter((item) => item.category === category);
}

export function sortNewsNewest(items) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

function newsItemTemplate(item) {
  const link = item.sourceUrl
    ? `<a href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">원문 링크</a>`
    : '<span class="source-unavailable">원문 링크 미연결</span>';

  return `<article class="news-item">
    <div class="news-item-meta"><span>${item.category}</span><time>${item.date}</time><b>SAMPLE</b></div>
    <h3>${item.title}</h3>
    <p>${item.oneLineSummary}</p>
    <button type="button" data-news-toggle="${item.id}" aria-expanded="false" aria-controls="news-detail-${item.id}">상세 요약 보기</button>
    <div id="news-detail-${item.id}" class="news-detail" hidden>
      <p>${item.detailSummary}</p>
      ${link}
    </div>
  </article>`;
}

export function createNewsPage(root, { categories, items }) {
  let selectedCategory = '전체';

  function render() {
    const filtered = sortNewsNewest(filterNews(items, selectedCategory));
    const count = root.querySelector('#news-count');
    count.setAttribute('aria-live', 'polite');
    count.textContent = `${filtered.length}건`;
    root.querySelector('#news-filters').innerHTML = ['전체', ...categories]
      .map((category) => `<button type="button" data-news-category="${category}" aria-pressed="${category === selectedCategory}">${category}</button>`)
      .join('');
    root.querySelector('#news-list').innerHTML = filtered.map(newsItemTemplate).join('');

    root.querySelectorAll('[data-news-category]').forEach((button) => button.addEventListener('click', () => {
      selectedCategory = button.dataset.newsCategory;
      render();
    }));
    root.querySelectorAll('[data-news-toggle]').forEach((button) => button.addEventListener('click', () => {
      const panel = root.querySelector(`#news-detail-${button.dataset.newsToggle}`);
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      button.textContent = expanded ? '상세 요약 보기' : '상세 요약 닫기';
      panel.hidden = expanded;
    }));
  }

  render();
  return { render };
}
