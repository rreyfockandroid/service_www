let currentPage = 1;
let articlesInSection = 6;

function resetPagination() {
    currentPage = 1;
}

function paginate(items, page, perPage) {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
}

function renderPagination(total, level) {
    const pages = Math.ceil(total / articlesInSection);
    let html = '';

    for (let i = 1; i <= pages; i++) {
        html += `
            <button 
                class="${i === currentPage ? 'active' : ''}"
                onclick="_changePage(${i}, '${level}')">
                ${i}
            </button>
        `;
    }

    return html;
}

function _changePage(page, level) {
    currentPage = page;
    renderLevelSection(sections, level);
}