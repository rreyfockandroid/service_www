const API_URL = 'http://localhost:8000/api';
let sections = [];
let articles = [];
let currentView = 'section';
let isAdmin = false;
let authToken = localStorage.getItem('authToken');

async function checkAuth() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            isAdmin = data.is_admin;
            updateAuthUI(data.username);
        } else {
            localStorage.removeItem('authToken');
            authToken = null;
        }
    } catch (error) {
        console.error('Auth error:', error);
    }
}

function updateAuthUI(username) {
    const authSection = document.getElementById('authSection');
    if (isAdmin) {
        authSection.innerHTML = `
            <span style="margin-right: 1rem; color: #666;">👤 ${username}</span>
            <button onclick="logout()">Wyloguj</button>
        `;
    }
}

function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    isAdmin = false;
    document.getElementById('authSection').innerHTML = '<button onclick="showLoginModal()">Logowanie</button>';
    location.reload();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const messageDiv = document.getElementById('loginMessage');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (response.ok) {
            authToken = result.access_token;
            isAdmin = result.is_admin;
            localStorage.setItem('authToken', authToken);
            messageDiv.innerHTML = '<div class="message success">Zalogowano pomyślnie!</div>';
            updateAuthUI(data.username);
            setTimeout(() => {
                closeModal('loginModal');
                location.reload();
            }, 1000);
        } else {
            messageDiv.innerHTML = `<div class="message error">${result.detail}</div>`;
        }
    } catch (error) {
        messageDiv.innerHTML = '<div class="message error">Błąd logowania</div>';
    }
});

async function loadSections() {
    try {
        const response = await fetch(`${API_URL}/sections`);
        sections = await response.json();
        renderMenu();
        loadSection(sections[0].slug);
    } catch (error) {
        console.error('Błąd:', error);
        document.getElementById('content').innerHTML = '<div class="message error">Nie udało się załadować danych</div>';
    }
}

function renderMenu() {
    const menu = document.getElementById('menu');
    menu.innerHTML = sections.map(section => 
        `<li><a href="#${section.slug}" onclick="loadSection('${section.slug}'); return false;">${section.title}</a></li>`
    ).join('');
}

async function loadSection(slug) {
    currentView = 'section';
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`nav a[href="#${slug}"]`)?.classList.add('active');

    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading">Ładowanie...</div>';

    try {
        const response = await fetch(`${API_URL}/sections/${slug}`);
        const section = await response.json();
        
        if (slug === 'kontakt') {
            renderContactSection(section);
        } else if (slug === 'artykuly') {
            await loadArticles();
            renderArticlesSection(section);
        } else if (slug === 'szkola-podstawowa') {
            await loadArticles('podstawowa');
            renderLevelSection(section, 'podstawowa');
        } else if (slug === 'szkola-srednia') {
            await loadArticles('srednia');
            renderLevelSection(section, 'srednia');
        } else {
            renderSection(section);
        }
    } catch (error) {
        content.innerHTML = '<div class="message error">Nie udało się załadować sekcji</div>';
    }
}

async function loadArticles(level = null) {
    const url = level ? `${API_URL}/articles?level=${level}` : `${API_URL}/articles`;
    const response = await fetch(url);
    articles = await response.json();
}

function renderSection(section) {
    document.getElementById('content').innerHTML = `
        <section>
            <h1>${section.title}</h1>
            <p style="font-size: 1.1rem; line-height: 1.8;">${section.content}</p>
        </section>
    `;
}

function renderLevelSection(section, level) {
    const levelArticles = articles.filter(a => a.level === level);
    const levelName = level === 'podstawowa' ? 'Szkoły Podstawowej' : 'Szkoły Średniej';
    
    document.getElementById('content').innerHTML = `
        <section>
            ${isAdmin ? `<div class="admin-toolbar active">
                <button onclick="showArticleModal()">➕ Dodaj artykuł</button>
            </div>` : ''}
            <h1>${section.title}</h1>
            <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 2rem;">${section.content}</p>
            
            <h2>📚 Artykuły dla ${levelName} (${levelArticles.length})</h2>
            <div class="articles-grid">
                ${renderArticleCards(levelArticles)}
            </div>
        </section>
    `;
}

function renderArticlesSection(section) {
    document.getElementById('content').innerHTML = `
        <section>
            ${isAdmin ? `<div class="admin-toolbar active">
                <button onclick="showArticleModal()">➕ Dodaj artykuł</button>
            </div>` : ''}
            <h1>${section.title}</h1>
            <p style="font-size: 1.1rem; line-height: 1.8;">${section.content}</p>
            
            <div class="level-filter">
                <button class="active" onclick="filterArticles('all')">Wszystkie (${articles.length})</button>
                <button onclick="filterArticles('podstawowa')">Szkoła Podstawowa (${articles.filter(a => a.level === 'podstawowa').length})</button>
                <button onclick="filterArticles('srednia')">Szkoła Średnia (${articles.filter(a => a.level === 'srednia').length})</button>
            </div>
            
            <div class="articles-grid" id="articlesGrid">
                ${renderArticleCards(articles)}
            </div>
        </section>
    `;
}

function renderArticleCards(articlesToShow) {
    return articlesToShow.map(article => `
        <div class="article-card" onclick="loadArticleDetail('${article.slug}')">
            <div class="admin-actions ${isAdmin ? 'active' : ''}">
                <button class="edit-btn" onclick="event.stopPropagation(); editArticle(${article.id}, '${article.title}', '${article.content.replace(/'/g, "\\'")}', '${article.level}')">✏️</button>
                <button class="delete-btn" onclick="event.stopPropagation(); deleteArticle(${article.id})">🗑️</button>
            </div>
            <h3>${article.title}</h3>
            <p style="color: #666; margin-top: 0.5rem;">${article.content.substring(0, 100)}...</p>
            <span class="level-badge">${article.level === 'podstawowa' ? 'Podstawowa' : 'Średnia'}</span>
        </div>
    `).join('');
}

function filterArticles(level) {
    document.querySelectorAll('.level-filter button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    const filtered = level === 'all' ? articles : articles.filter(a => a.level === level);
    document.getElementById('articlesGrid').innerHTML = renderArticleCards(filtered);
}

function goBack() {
    // Jeśli przeszedłeś z artykułu → wróć do sekcji
    if (currentView === 'article') {
        const hash = location.hash.replace('#', '');
        loadSection(hash || 'artykuly');
        return;
    }

    // Domyślny fallback
    if (document.referrer !== "") {
        history.back();
    } else {
        loadSections();
    }
}

async function loadArticleDetail(slug) {
    currentView = 'article';
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading">Ładowanie artykułu...</div>';

    try {
        const response = await fetch(`${API_URL}/articles/${slug}`);
        const article = await response.json();
        
        document.getElementById('content').innerHTML = `
            <section>
                <button class="back-button" onclick="goBack()">← Powrót</button>
                ${isAdmin ? `<div class="admin-toolbar active">
                    <button onclick="editArticle(${article.id}, '${article.title}', '${article.content.replace(/'/g, "\\'")}', '${article.level}')">✏️ Edytuj</button>
                    <button class="delete" onclick="deleteArticle(${article.id})">🗑️ Usuń</button>
                </div>` : ''}
                <div class="article-detail">
                    <h2>${article.title}</h2>
                    <span class="level-badge" style="font-size: 1rem; padding: 0.5rem 1rem;">
                        ${article.level === 'podstawowa' ? 'Szkoła Podstawowa' : 'Szkoła Średnia'}
                    </span>
                    <p style="font-size: 1.1rem; line-height: 1.9; margin-top: 1.5rem; white-space: pre-line;">${article.content}</p>
                </div>
            </section>
        `;
    } catch (error) {
        content.innerHTML = '<div class="message error">Nie udało się załadować artykułu</div>';
    }
}

function showArticleModal() {
    document.getElementById('articleModalTitle').textContent = 'Dodaj artykuł';
    document.getElementById('articleForm').reset();
    document.querySelector('input[name="article_id"]').value = '';
    document.querySelector('input[name="slug"]').disabled = false;
    document.getElementById('articleModal').classList.add('active');
}

function editArticle(id, title, content, level) {
    document.getElementById('articleModalTitle').textContent = 'Edytuj artykuł';
    document.querySelector('input[name="article_id"]').value = id;
    document.querySelector('input[name="title"]').value = title;
    document.querySelector('textarea[name="content"]').value = content;
    document.querySelector('select[name="level"]').value = level;
    document.querySelector('input[name="slug"]').disabled = true;
    document.getElementById('articleModal').classList.add('active');
}

document.getElementById('articleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const messageDiv = document.getElementById('articleMessage');
    const articleId = data.article_id;

    try {
        let url = `${API_URL}/articles`;
        let method = 'POST';
        let body = {
            title: data.title,
            content: data.content,
            level: data.level
        };

        if (articleId) {
            url = `${API_URL}/articles/${articleId}`;
            method = 'PUT';
        } else {
            body.slug = data.slug;
            body.section_id = parseInt(data.section_id);
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            messageDiv.innerHTML = '<div class="message success">Artykuł zapisany!</div>';
            setTimeout(() => {
                closeModal('articleModal');
                location.reload();
            }, 1000);
        } else {
            const error = await response.json();
            messageDiv.innerHTML = `<div class="message error">${error.detail}</div>`;
        }
    } catch (error) {
        messageDiv.innerHTML = '<div class="message error">Błąd zapisu artykułu</div>';
    }
});

async function deleteArticle(id) {
    if (!confirm('Czy na pewno chcesz usunąć ten artykuł?')) return;

    try {
        const response = await fetch(`${API_URL}/articles/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            alert('Artykuł usunięty!');
            location.reload();
        } else {
            alert('Błąd usuwania artykułu');
        }
    } catch (error) {
        alert('Błąd usuwania artykułu');
    }
}

function renderContactSection(section) {
    document.getElementById('content').innerHTML = `
        <section>
            <h1>${section.title}</h1>
            <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 2rem;">${section.content}</p>
            <form id="contactForm">
                <input type="text" name="name" placeholder="Imię i nazwisko" required>
                <input type="email" name="email" placeholder="Email" required>
                <textarea name="message" placeholder="Twoje pytanie lub wiadomość" required></textarea>
                <button type="submit">Wyślij wiadomość</button>
            </form>
            <div id="formMessage"></div>
        </section>
    `;

    document.getElementById('contactForm').addEventListener('submit', handleContactSubmit);
}

async function handleContactSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const messageDiv = document.getElementById('formMessage');

    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            messageDiv.innerHTML = '<div class="message success">✓ Wiadomość została wysłana! Odpowiemy tak szybko jak to możliwe.</div>';
            e.target.reset();
        } else {
            messageDiv.innerHTML = '<div class="message error">Wystąpił błąd podczas wysyłania</div>';
        }
    } catch (error) {
        messageDiv.innerHTML = '<div class="message error">Nie udało się wysłać wiadomości</div>';
    }
}

checkAuth().then(() => loadSections());