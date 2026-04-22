// API Base URL
const API_BASE = 'http://localhost:6868/api';

// Глобальные переменные
let currentSection = 'dashboard';
let charts = {};
let currentUser = null;
let authToken = null;

let authModalInstance = null;
let topupModalInstance = null;
let authRequestInFlight = false;

// Theme management
const THEME_KEY = 'financeAppTheme';
const THEME_LABELS = {
    light: 'Светлая',
    dark: 'Темная',
    system: 'Системная'
};
const THEME_ICONS = {
    light: 'bi-sun',
    dark: 'bi-moon',
    system: 'bi-palette'
};

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    setTheme(savedTheme, false);
}

function setTheme(theme, save = true) {
    if (save) {
        localStorage.setItem(THEME_KEY, theme);
    }

    // Handle system theme - remove data-theme attribute to let OS preference take effect
    if (theme === 'system') {
        document.documentElement.setAttribute('data-theme', 'system');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // Update theme switcher UI
    const themeLabel = document.getElementById('themeLabel');
    const themeIcon = document.getElementById('themeIcon');
    if (themeLabel) themeLabel.textContent = THEME_LABELS[theme];
    if (themeIcon) {
        themeIcon.className = `bi ${THEME_ICONS[theme]} theme-icon`;
    }

    // Update active state in dropdown
    document.querySelectorAll('.theme-switcher .dropdown-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.theme === theme) {
            item.classList.add('active');
        }
    });

    // Update navbar class based on theme
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.remove('navbar-light', 'navbar-dark');
        if (theme === 'dark' || theme === 'system') {
            navbar.classList.add('navbar-dark');
        } else {
            navbar.classList.add('navbar-light');
        }
    }

    // Re-render charts with theme-aware colors
    if (currentSection === 'dashboard') {
        loadDashboardData();
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function () {
    // Initialize theme first
    initTheme();

    // Проверяем наличие токена в localStorage
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }

    showDashboard();
    loadDashboardData();

    // Кешируем инстансы модалок (чтобы не создавать новый каждый раз)
    const authModalEl = document.getElementById('authModal');
    if (authModalEl) {
        authModalInstance = bootstrap.Modal.getOrCreateInstance(authModalEl, {
            backdrop: 'static',
            keyboard: false
        });

        // Чистим состояние только при реальном закрытии модалки
        authModalEl.addEventListener('hidden.bs.modal', () => {
            authRequestInFlight = false;
            setAuthButtonLoading(false);
            clearAuthValidation();
        });
    }

    const topupModalEl = document.getElementById('topupModal');
    if (topupModalEl) {
        topupModalInstance = bootstrap.Modal.getOrCreateInstance(topupModalEl);
    }

    // Нормальные submit-обработчики (Enter тоже работает, и форма не “слетает”)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAuth();
        });
    }
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAuth();
        });
    }
});

function setAuthButtonLoading(isLoading) {
    const btn = document.getElementById('authSubmitBtn');
    if (!btn) return;
    btn.disabled = isLoading;
    btn.dataset.loading = isLoading ? '1' : '0';
    btn.innerHTML = isLoading
        ? '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Обработка…'
        : 'Далее';
}

function clearAuthValidation() {
    document.querySelectorAll('#authModal .is-invalid').forEach(el => el.classList.remove('is-invalid'));
}

function markInvalid(el) {
    if (!el) return;
    el.classList.add('is-invalid');
    el.focus();
}

function validateRegisterForm() {
    clearAuthValidation();

    const usernameEl = document.getElementById('registerUsername');
    const emailEl = document.getElementById('registerEmail');
    const passwordEl = document.getElementById('registerPassword');

    const username = (usernameEl?.value || '').trim();
    const email = (emailEl?.value || '').trim();
    const password = passwordEl?.value || '';

    if (username.length < 3) {
        markInvalid(usernameEl);
        showToast('Имя пользователя: минимум 3 символа', 'warning');
        return false;
    }
    if (!email.includes('@') || email.length < 5) {
        markInvalid(emailEl);
        showToast('Введите корректный email', 'warning');
        return false;
    }
    if (password.length < 6) {
        markInvalid(passwordEl);
        showToast('Пароль: минимум 6 символов', 'warning');
        return false;
    }

    return true;
}

function validateLoginForm() {
    clearAuthValidation();

    const usernameEl = document.getElementById('loginUsername');
    const passwordEl = document.getElementById('loginPassword');

    const username = (usernameEl?.value || '').trim();
    const password = passwordEl?.value || '';

    if (!username) {
        markInvalid(usernameEl);
        showToast('Введите имя пользователя', 'warning');
        return false;
    }
    if (!password) {
        markInvalid(passwordEl);
        showToast('Введите пароль', 'warning');
        return false;
    }

    return true;
}

// Функции навигации
function showSection(sectionId) {
    // Скрыть все секции
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Убрать активный класс с всех ссылок навигации
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Показать выбранную секцию
    document.getElementById(sectionId).style.display = 'block';

    // Добавить активный класс к текущей ссылке
    document.querySelector(`[onclick="show${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}()"]`).classList.add('active');

    currentSection = sectionId;
}

function showDashboard() {
    showSection('dashboard');
    loadDashboardData();
}

function showCrypto() {
    showSection('crypto');
    loadCryptoData();
}

function showWallets() {
    showSection('wallets');
    loadWalletsData();
}

function showTransactions() {
    showSection('transactions');
    loadTransactionsData();
    loadUsersForTransfer();
}

function showNews() {
    showSection('news');
    loadNewsData();
}

function showPredictions() {
    showSection('predictions');
    loadPredictionsData();
}

// Админ функции
function showAdminUsers() {
    showSection('adminUsers');
    loadAdminUsers();
}

function showAdminTopup() {
    showSection('adminTopup');
    loadAdminUsersForTopup();
}

async function loadAdminUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();

        const tbody = document.getElementById('adminUsersTableBody');
        tbody.innerHTML = users.map(u => {
            const coinRate = 0.5;
            const btcRate = 50000;
            const totalCoin = parseFloat(u.coinBalance || 0) +
                (parseFloat(u.btcBalance || 0) * (btcRate / coinRate)) +
                (parseFloat(u.usdBalance || 0) / coinRate);

            return `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.username}</td>
                    <td>${u.email}</td>
                    <td>${parseFloat(u.coinBalance || 0).toFixed(2)}</td>
                    <td>${parseFloat(u.btcBalance || 0).toFixed(4)}</td>
                    <td>${parseFloat(u.usdBalance || 0).toFixed(2)}</td>
                    <td><strong>${totalCoin.toFixed(2)}</strong></td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading admin users:', error);
        showToast('Ошибка загрузки пользователей', 'danger');
    }
}

async function loadAdminUsersForTopup() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();

        const select = document.getElementById('adminTopupUserId');
        select.innerHTML = '<option value="">Выберите пользователя...</option>' +
            users.map(u => `<option value="${u.id}">${u.username} (${u.email})</option>`).join('');
    } catch (error) {
        console.error('Error loading users for topup:', error);
        showToast('Ошибка загрузки пользователей', 'danger');
    }
}

async function adminTopupBalance() {
    try {
        const userIdElement = document.getElementById('adminTopupUserId');
        const currencyElement = document.getElementById('adminTopupCurrency');
        const amountElement = document.getElementById('adminTopupAmount');

        const userId = userIdElement ? userIdElement.value : null;
        const currency = currencyElement ? currencyElement.value : null;
        const amountValue = amountElement ? amountElement.value : null;
        const amount = parseFloat(amountValue);

        if (!userId || !currency || amountValue === '' || isNaN(amount) || amount <= 0) {
            showToast('Заполните все поля корректно', 'danger');
            return;
        }

        const response = await fetch(`${API_BASE}/users/${userId}/topup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ currency, amount })
        });

        if (response.ok) {
            showToast(`Баланс пользователя успешно пополнен на ${amount} ${currency}`, 'success');
            document.getElementById('adminTopupForm').reset();
            loadAdminUsers();
        } else {
            const error = await response.json();
            showToast(`Ошибка: ${error.message}`, 'danger');
        }
    } catch (error) {
        console.error('Error topping up balance:', error);
        showToast('Ошибка пополнения баланса', 'danger');
    }
}

async function exportUsersToPDF() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Заголовок
        doc.setFontSize(18);
        doc.text('Список пользователей', 14, 22);
        doc.setFontSize(11);
        doc.text(`Дата экспорта: ${new Date().toLocaleDateString('ru-RU')}`, 14, 30);

        // Подготовка данных для таблицы
        const tableData = users.map(u => {
            const coinRate = 0.5;
            const btcRate = 50000;
            const totalCoin = parseFloat(u.coinBalance || 0) +
                (parseFloat(u.btcBalance || 0) * (btcRate / coinRate)) +
                (parseFloat(u.usdBalance || 0) / coinRate);

            return [
                u.id,
                u.username,
                u.email,
                parseFloat(u.coinBalance || 0).toFixed(2),
                parseFloat(u.btcBalance || 0).toFixed(4),
                parseFloat(u.usdBalance || 0).toFixed(2),
                totalCoin.toFixed(2)
            ];
        });

        // Создание таблицы
        doc.autoTable({
            head: [['ID', 'Username', 'Email', 'COIN', 'BTC', 'USD', 'Сумма в COIN']],
            body: tableData,
            startY: 40,
            styles: {
                fontSize: 9,
                cellPadding: 3
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: 255,
                fontStyle: 'bold'
            }
        });

        // Сохранение PDF
        doc.save(`users_export_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('PDF успешно создан', 'success');
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        showToast('Ошибка экспорта в PDF', 'danger');
    }
}

async function submitTransfer() {
    try {
        const recipientUsername = document.getElementById('transferRecipient').value;
        const currency = document.getElementById('transferCurrency').value;
        const amount = parseFloat(document.getElementById('transferAmount').value);

        if (!recipientUsername || !currency || isNaN(amount) || amount <= 0) {
            showToast('Заполните все поля корректно', 'danger');
            return;
        }

        const response = await fetch(`${API_BASE}/transactions/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ toUsername: recipientUsername, currency, amount })
        });

        if (response.ok) {
            const data = await response.json();
            showToast(`Перевод ${amount} ${currency} успешно отправлен`, 'success');
            document.getElementById('transferForm').reset();
            loadTransactionsData();
        } else {
            const error = await response.json();
            showToast(`Ошибка: ${error.message}`, 'danger');
        }
    } catch (error) {
        console.error('Error submitting transfer:', error);
        showToast('Ошибка перевода', 'danger');
    }
}

async function submitExchange() {
    try {
        const fromCurrency = document.getElementById('exchangeFromCurrency').value;
        const toCurrency = document.getElementById('exchangeToCurrency').value;
        const amount = parseFloat(document.getElementById('exchangeAmount').value);

        if (!fromCurrency || !toCurrency || isNaN(amount) || amount <= 0) {
            showToast('Заполните все поля корректно', 'danger');
            return;
        }

        if (fromCurrency === toCurrency) {
            showToast('Выберите разные валюты', 'danger');
            return;
        }

        const response = await fetch(`${API_BASE}/transactions/exchange`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ fromCurrency, toCurrency, amount })
        });

        if (response.ok) {
            const data = await response.json();
            showToast(data.message || 'Обмен завершен', 'success');
            document.getElementById('exchangeForm').reset();
            loadTransactionsData();
            // Обновить баланс в UI если нужно
            if (currentUser) {
                const updatedUser = await fetch(`${API_BASE}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                }).then(r => r.json());
                if (updatedUser.user) {
                    currentUser = updatedUser.user;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    updateUIForLoggedInUser();
                }
            }
        } else {
            const error = await response.json();
            showToast(`Ошибка: ${error.message}`, 'danger');
        }
    } catch (error) {
        console.error('Error submitting exchange:', error);
        showToast('Ошибка обмена', 'danger');
    }
}

async function loadUsersForTransfer() {
    try {
        const response = await fetch(`${API_BASE}/users`, {
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
        });
        const users = await response.json();

        if (!Array.isArray(users)) {
            console.error('Expected array of users, got:', users);
            return;
        }

        const select = document.getElementById('transferRecipient');
        select.innerHTML = '<option value="">Выберите пользователя...</option>' +
            users.filter(u => u.username !== currentUser?.username)
                .map(u => `<option value="${u.username}">${u.username} (${u.email})</option>`)
                .join('');
    } catch (error) {
        console.error('Error loading users for transfer:', error);
    }
}

// Функции загрузки данных
async function loadDashboardData() {
    try {
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};

        // Загрузка глобальной статистики (публичный endpoint)
        const stats = await fetch(`${API_BASE}/analytics/global/stats`).then(r => r.json());

        // Обновление счетчиков
        document.getElementById('totalUsers').textContent = stats.total_users;
        document.getElementById('totalCrypto').textContent = stats.total_crypto;
        document.getElementById('totalWallets').textContent = stats.total_wallets;
        document.getElementById('totalTransactions').textContent = stats.total_transactions;

        // Загрузка данных для графиков
        const [crypto, transactions] = await Promise.all([
            fetch(`${API_BASE}/crypto-currencies`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${API_BASE}/transactions`, { headers }).then(r => r.ok ? r.json() : [])
        ]);

        loadCharts(Array.isArray(crypto) ? crypto : [], Array.isArray(transactions) ? transactions : []);

        // Загрузка дополнительных данных
        loadRecentTransactions();
        loadPopularCrypto();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Ошибка загрузки данных дашборда', 'danger');
    }
}

async function loadCryptoData() {
    try {
        const crypto = await fetch(`${API_BASE}/crypto-currencies`).then(r => r.json());
        renderCryptoTable(crypto);
    } catch (error) {
        console.error('Error loading crypto data:', error);
        showToast('Ошибка загрузки криптовалют', 'danger');
    }
}

async function loadWalletsData() {
    try {
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};

        // Если пользователь не авторизован, не загружаем кошельки
        if (!authToken) {
            renderWallets([]);
            return;
        }

        let wallets = await fetch(`${API_BASE}/crypto-wallets`, { headers }).then(r => r.json());

        renderWallets(wallets);
    } catch (error) {
        console.error('Error loading wallets data:', error);
        showToast('Ошибка загрузки кошельков', 'danger');
        renderWallets([]);
    }
}

// Создание кошелька по умолчанию если его нет
async function createDefaultWallet() {
    try {
        const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(`${API_BASE}/crypto-wallets`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                walletAddress: `COIN_${currentUser.id}_${Date.now()}`,
                walletType: 'internal',
                balance: 1000,
                currencyCode: 'COIN',
                isActive: true
            })
        });

        if (response.ok) {
            const wallet = await response.json();
            showToast('Кошелёк создан', 'success');
            return wallet;
        } else {
            throw new Error('Failed to create wallet');
        }
    } catch (error) {
        console.error('Error creating default wallet:', error);
        return null;
    }
}

async function loadTransactionsData() {
    try {
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};

        // Если пользователь не авторизован, не загружаем транзакции
        if (!authToken) {
            renderTransactions([]);
            return;
        }

        const transactions = await fetch(`${API_BASE}/transactions`, { headers }).then(r => r.json());
        renderTransactions(transactions);
    } catch (error) {
        console.error('Error loading transactions data:', error);
        showToast('Ошибка загрузки транзакций', 'danger');
        renderTransactions([]);
    }
}

async function loadNewsData() {
    try {
        const news = await fetch(`${API_BASE}/news-posts`).then(r => r.json());
        renderNews(news);
    } catch (error) {
        console.error('Error loading news data:', error);
        showToast('Ошибка загрузки новостей', 'danger');
    }
}

async function loadPredictionsData() {
    try {
        const predictions = await fetch(`${API_BASE}/user-predictions`).then(r => r.json());
        renderPredictions(predictions);
    } catch (error) {
        console.error('Error loading predictions data:', error);
        showToast('Ошибка загрузки прогнозов', 'danger');
    }
}

// Функции рендеринга
function renderCryptoTable(crypto) {
    const tbody = document.getElementById('cryptoTableBody');

    if (crypto.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Нет криптовалют</td></tr>';
        return;
    }

    tbody.innerHTML = crypto.map(c => `
        <tr>
            <td><strong>${c.symbol}</strong></td>
            <td>${c.name}</td>
            <td>$${parseFloat(c.currentPrice).toLocaleString()}</td>
            <td>$${parseFloat(c.marketCap).toLocaleString()}</td>
            <td>$${parseFloat(c.volume24h).toLocaleString()}</td>
            <td>
                <span class="badge ${c.isActive ? 'bg-success' : 'bg-secondary'}">
                    ${c.isActive ? 'Активна' : 'Неактивна'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editCrypto(${c.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCrypto(${c.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderWallets(wallets) {
    const container = document.getElementById('walletsContainer');

    if (wallets.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>Нет кошельков</p></div>';
        return;
    }

    container.innerHTML = wallets.map(w => {
        const balanceDisplay = w.balance === null ? '<span class="text-muted">Скрыто</span>' : parseFloat(w.balance).toFixed(8);
        const ownerName = w.user ? w.user.username : 'Неизвестно';
        return `
        <div class="col-md-4 mb-4">
            <div class="wallet-card">
                <h5>${w.currencyCode}</h5>
                <div class="wallet-balance">${balanceDisplay}</div>
                <div class="wallet-address">${w.walletAddress}</div>
                <div class="mt-3">
                    <small>Владелец: ${ownerName}</small><br>
                    <small>Тип: ${w.walletType}</small><br>
                    <small>ID: ${w.id}</small>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function renderTransactions(transactions) {
    const tbody = document.getElementById('transactionsTableBody');

    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Нет транзакций</td></tr>';
        return;
    }

    tbody.innerHTML = transactions.map(t => `
        <tr>
            <td>${t.id}</td>
            <td>${parseFloat(t.amount).toFixed(8)}</td>
            <td>${t.currencyCode}</td>
            <td>
                <span class="badge ${getTransactionTypeClass(t.transactionType)}">
                    ${t.transactionType}
                </span>
            </td>
            <td>
                <span class="status-badge status-${t.status}">
                    ${t.status}
                </span>
            </td>
            <td>${parseFloat(t.fee).toFixed(8)}</td>
            <td>${new Date(t.createdAt).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editTransaction(${t.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${t.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderNews(news) {
    const container = document.getElementById('newsContainer');

    if (news.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>Нет новостей</p></div>';
        return;
    }

    container.innerHTML = news.map(n => `
        <div class="col-md-6 mb-4">
            <div class="card news-card">
                <div class="card-body">
                    <h5 class="card-title">${n.title}</h5>
                    <p class="card-text">${n.content.substring(0, 150)}...</p>
                    <div class="news-meta">
                        <small>
                            <i class="bi bi-calendar"></i> ${new Date(n.createdAt).toLocaleDateString()}
                            <i class="bi bi-eye ms-2"></i> ${n.viewCount} просмотров
                            <i class="bi bi-tag ms-2"></i> ${n.postType}
                        </small>
                    </div>
                    <div class="mt-2">
                        <span class="badge ${n.isPublished ? 'bg-success' : 'bg-secondary'}">
                            ${n.isPublished ? 'Опубликовано' : 'Черновик'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderPredictions(predictions) {
    const container = document.getElementById('predictionsContainer');

    if (predictions.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>Нет прогнозов</p></div>';
        return;
    }

    container.innerHTML = predictions.map(p => `
        <div class="col-md-4 mb-4">
            <div class="card prediction-card prediction-${p.predictionType}">
                <div class="card-body">
                    <h5 class="card-title">
                        ${getPredictionIcon(p.predictionType)} ${p.predictionType.toUpperCase()}
                    </h5>
                    <p class="card-text">
                        <strong>Прогноз:</strong> $${parseFloat(p.predictedPrice).toFixed(2)}<br>
                        <strong>Цель:</strong> $${parseFloat(p.targetPrice).toFixed(2)}<br>
                        <strong>Дата цели:</strong> ${new Date(p.targetDate).toLocaleDateString()}
                    </p>
                    <div class="mt-2">
                        <span class="badge ${p.isActive ? 'bg-success' : 'bg-secondary'}">
                            ${p.isActive ? 'Активен' : 'Закрыт'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Графики
function loadCharts(crypto, transactions) {
    // Get theme-aware colors from CSS variables
    const computedStyle = getComputedStyle(document.documentElement);
    const accentPrimary = computedStyle.getPropertyValue('--accent-primary').trim();
    const accentSecondary = computedStyle.getPropertyValue('--accent-secondary').trim();
    const textPrimary = computedStyle.getPropertyValue('--text-primary').trim();

    // График рыночной капитализации
    const marketCapCtx = document.getElementById('marketCapChart').getContext('2d');

    if (charts.marketCap) {
        charts.marketCap.destroy();
    }

    charts.marketCap = new Chart(marketCapCtx, {
        type: 'bar',
        data: {
            labels: crypto.slice(0, 5).map(c => c.symbol),
            datasets: [{
                label: 'Рыночная капитализация',
                data: crypto.slice(0, 5).map(c => parseFloat(c.marketCap)),
                backgroundColor: accentPrimary + '99',
                borderColor: accentPrimary,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '$' + value.toLocaleString();
                        },
                        color: textPrimary
                    },
                    grid: {
                        color: accentSecondary + '33'
                    }
                },
                x: {
                    ticks: {
                        color: textPrimary
                    },
                    grid: {
                        color: accentSecondary + '33'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textPrimary
                    }
                }
            }
        }
    });

    // График типов транзакций
    const transactionCtx = document.getElementById('transactionChart').getContext('2d');

    if (charts.transaction) {
        charts.transaction.destroy();
    }

    const transactionTypes = {};
    transactions.forEach(t => {
        transactionTypes[t.transactionType] = (transactionTypes[t.transactionType] || 0) + 1;
    });

    const themeColors = [
        accentPrimary + '99',
        accentSecondary + '99',
        '#FF638499',
        '#36A2EB99',
        '#FFCE5699',
        '#4BC0C099'
    ];

    charts.transaction = new Chart(transactionCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(transactionTypes),
            datasets: [{
                data: Object.values(transactionTypes),
                backgroundColor: themeColors.slice(0, Object.keys(transactionTypes).length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textPrimary
                    }
                }
            }
        }
    });
}

// Вспомогательные функции
function getTransactionTypeClass(type) {
    const classes = {
        'buy': 'bg-success',
        'sell': 'bg-danger',
        'transfer': 'bg-primary',
        'deposit': 'bg-info',
        'withdraw': 'bg-warning'
    };
    return classes[type] || 'bg-secondary';
}

function getPredictionIcon(type) {
    const icons = {
        'bullish': '📈',
        'bearish': '📉',
        'neutral': '➡️'
    };
    return icons[type] || '❓';
}

// Модальные окна
function showAddCryptoModal() {
    const modal = new bootstrap.Modal(document.getElementById('addCryptoModal'));
    modal.show();
}

function showAddWalletModal() {
    const modal = new bootstrap.Modal(document.getElementById('addWalletModal'));
    modal.show();
}

function showAddTransactionModal() {
    const modal = new bootstrap.Modal(document.getElementById('addTransactionModal'));
    modal.show();
}

function showAddNewsModal() {
    const modal = new bootstrap.Modal(document.getElementById('addNewsModal'));
    modal.show();
}

function showAddPredictionModal() {
    const modal = new bootstrap.Modal(document.getElementById('addPredictionModal'));
    modal.show();
}

function showTopupModal() {
    // Показываем никнейм пользователя в инструкции
    const nicknameDisplay = document.getElementById('userNicknameDisplay');
    if (nicknameDisplay && currentUser) {
        nicknameDisplay.textContent = currentUser.username;
    }

    // Загружаем QR-код и ссылку из конфигурации (файл config.js не должен быть в git)
    // Создайте файл public/js/config.js с содержимым:
    // window.PAYMENT_CONFIG = {
    //     paymentLink: 'https://vtb.paymo.ru/collect-money/qr/?transaction=bb8719e1-386e-4680-9d36-84cd7e86ee2a',
    //     qrCodePath: 'qr.jpg'
    // };
    const paymentLink = window.PAYMENT_CONFIG?.paymentLink || '';
    const qrCodePath = window.PAYMENT_CONFIG?.qrCodePath || '';

    // Устанавливаем ссылку
    const linkElement = document.getElementById('paymentLink');
    if (linkElement && paymentLink) {
        linkElement.href = paymentLink;
        linkElement.textContent = paymentLink;
    }

    // Устанавливаем путь к QR-коду
    const qrImage = document.getElementById('qrCodeImage');
    if (qrImage && qrCodePath) {
        qrImage.src = qrCodePath;
    }

    // Сбрасываем видимость QR кода
    document.getElementById('topupInstruction').style.display = 'block';
    document.getElementById('qrCodeContainer').style.display = 'none';

    const modal = new bootstrap.Modal(document.getElementById('topupModal'));
    modal.show();
}

function showQRCode() {
    document.getElementById('topupInstruction').style.display = 'none';
    document.getElementById('qrCodeContainer').style.display = 'block';
}

function hideQRCode() {
    document.getElementById('topupInstruction').style.display = 'block';
    document.getElementById('qrCodeContainer').style.display = 'none';
}

// CRUD операции
async function addCrypto() {
    const form = document.getElementById('addCryptoForm');
    const formData = new FormData(form);

    const cryptoData = {
        symbol: document.getElementById('cryptoSymbol').value,
        name: document.getElementById('cryptoName').value,
        currentPrice: parseFloat(document.getElementById('cryptoPrice').value),
        marketCap: parseFloat(document.getElementById('cryptoMarketCap').value) || 0,
        volume24h: parseFloat(document.getElementById('cryptoVolume').value) || 0,
        description: document.getElementById('cryptoDescription').value,
        isActive: true
    };

    try {
        const response = await fetch(`${API_BASE}/crypto-currencies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cryptoData)
        });

        if (response.ok) {
            showToast('Криптовалюта успешно добавлена', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addCryptoModal')).hide();
            form.reset();
            loadCryptoData();
        } else {
            const error = await response.json();
            showToast(`Ошибка: ${error.message}`, 'danger');
        }
    } catch (error) {
        console.error('Error adding crypto:', error);
        showToast('Ошибка при добавлении криптовалюты', 'danger');
    }
}

// Уведомления
function showToast(message, type = 'info') {
    const toastElement = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;

    // Обновить классы toast
    toastElement.className = `toast align-items-center text-white bg-${type} border-0`;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// CRUD операции
async function addWallet() {
    const walletData = {
        userId: parseInt(document.getElementById('walletUserId').value),
        walletAddress: document.getElementById('walletAddress').value,
        walletType: document.getElementById('walletType').value,
        balance: parseFloat(document.getElementById('walletBalance').value) || 0,
        currencyCode: document.getElementById('walletCurrency').value
    };

    try {
        const response = await fetch(`${API_BASE}/crypto-wallets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(walletData)
        });

        if (response.ok) {
            showToast('Кошелек успешно добавлен', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addWalletModal')).hide();
            document.getElementById('addWalletForm').reset();
            loadWalletsData();
        } else {
            const error = await response.json();
            showToast(`Ошибка: ${error.message}`, 'danger');
        }
    } catch (error) {
        console.error('Error adding wallet:', error);
        showToast('Ошибка при добавлении кошелька', 'danger');
    }
}

async function addTransaction() {
    const transactionData = {
        amount: parseFloat(document.getElementById('transactionAmount').value),
        currencyCode: document.getElementById('transactionCurrency').value,
        transactionType: document.getElementById('transactionType').value,
        status: document.getElementById('transactionStatus').value,
        fee: parseFloat(document.getElementById('transactionFee').value) || 0,
        transactionHash: document.getElementById('transactionHash').value,
        fromWalletId: null,
        toWalletId: null
    };

    try {
        const response = await fetch(`${API_BASE}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        });

        if (response.ok) {
            showToast('Транзакция успешно добавлена', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addTransactionModal')).hide();
            document.getElementById('addTransactionForm').reset();
            loadTransactionsData();
        } else {
            const error = await response.json();
            showToast(`Ошибка: ${error.message}`, 'danger');
        }
    } catch (error) {
        console.error('Error adding transaction:', error);
        showToast('Ошибка при добавлении транзакции', 'danger');
    }
}

async function addNews() {
    const newsData = {
        title: document.getElementById('newsTitle').value,
        content: document.getElementById('newsContent').value,
        postType: document.getElementById('newsType').value,
        category: document.getElementById('newsCategory').value,
        authorId: parseInt(document.getElementById('newsAuthorId').value),
        isPublished: document.getElementById('newsPublished').checked
    };

    try {
        const response = await fetch(`${API_BASE}/news-posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newsData)
        });

        if (response.ok) {
            showToast('Новость успешно добавлена', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addNewsModal')).hide();
            document.getElementById('addNewsForm').reset();
            loadNewsData();
        } else {
            const error = await response.json();
            showToast(`Ошибка: ${error.message}`, 'danger');
        }
    } catch (error) {
        console.error('Error adding news:', error);
        showToast('Ошибка при добавлении новости', 'danger');
    }
}

async function addPrediction() {
    const predictionData = {
        userId: parseInt(document.getElementById('predictionUserId').value),
        currencyId: parseInt(document.getElementById('predictionCurrencyId').value),
        predictedPrice: parseFloat(document.getElementById('predictionPrice').value),
        targetPrice: parseFloat(document.getElementById('predictionTargetPrice').value),
        predictionType: document.getElementById('predictionType').value,
        targetDate: document.getElementById('predictionTargetDate').value,
        notes: document.getElementById('predictionNotes').value
    };

    try {
        const response = await fetch(`${API_BASE}/user-predictions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(predictionData)
        });

        if (response.ok) {
            showToast('Прогноз успешно добавлен', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addPredictionModal')).hide();
            document.getElementById('addPredictionForm').reset();
            loadPredictionsData();
        } else {
            const error = await response.json();
            showToast(`Ошибка: ${error.message}`, 'danger');
        }
    } catch (error) {
        console.error('Error adding prediction:', error);
        showToast('Ошибка при добавлении прогноза', 'danger');
    }
}

// Функции редактирования и удаления
function editCrypto(id) {
    showToast('Функция редактирования в разработке', 'info');
}

function deleteCrypto(id) {
    if (confirm('Вы уверены, что хотите удалить эту криптовалюту?')) {
        showToast('Функция удаления в разработке', 'info');
    }
}

function editTransaction(id) {
    showToast('Функция редактирования в разработке', 'info');
}

function deleteTransaction(id) {
    if (confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
        showToast('Функция удаления в разработке', 'info');
    }
}

// Загрузка дополнительных данных для дашборда
async function loadRecentTransactions() {
    try {
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
        const transactions = await fetch(`${API_BASE}/transactions`, { headers }).then(r => r.json());
        const recent = transactions.slice(0, 5);

        const container = document.getElementById('recentTransactions');
        container.innerHTML = recent.map(t => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <strong>${t.transactionType.toUpperCase()}</strong>
                    <small class="text-muted d-block">${t.currencyCode} - ${new Date(t.createdAt).toLocaleDateString()}</small>
                </div>
                <span class="badge ${getTransactionTypeClass(t.transactionType)}">
                    ${parseFloat(t.amount).toFixed(4)}
                </span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading recent transactions:', error);
    }
}

async function loadPopularCrypto() {
    try {
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
        const crypto = await fetch(`${API_BASE}/crypto-currencies`, { headers }).then(r => r.json());
        const popular = crypto.filter(c => c.isActive).slice(0, 5);

        const container = document.getElementById('popularCrypto');
        container.innerHTML = popular.map(c => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <strong>${c.symbol}</strong>
                    <small class="text-muted d-block">${c.name}</small>
                </div>
                <span class="text-success">
                    $${parseFloat(c.currentPrice).toLocaleString()}
                </span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading popular crypto:', error);
    }
}

// Функции аутентификации
function showAuthModal() {
    if (!authModalInstance) {
        const el = document.getElementById('authModal');
        if (!el) return;
        authModalInstance = bootstrap.Modal.getOrCreateInstance(el, {
            backdrop: 'static',
            keyboard: false
        });
    }
    authModalInstance.show();
}

function updateUIForLoggedInUser() {
    // Обновляем навбар
    const authLink = document.querySelector('a[onclick="showAuthModal()"]');
    if (authLink) {
        authLink.innerHTML = `<i class="bi bi-person-check"></i> ${currentUser.username}`;
        authLink.onclick = logout;
    }

    // Показываем админ-меню только для админов
    const adminUsersMenu = document.getElementById('adminUsersMenu');
    const adminTopupMenu = document.getElementById('adminTopupMenu');
    if (adminUsersMenu) {
        adminUsersMenu.style.display = (!!currentUser.isAdmin) ? 'block' : 'none';
    }
    if (adminTopupMenu) {
        adminTopupMenu.style.display = (!!currentUser.isAdmin) ? 'block' : 'none';
    }

    // Обновляем баланс
    if (currentUser.coinBalance !== undefined) {
        document.getElementById('userBalance').textContent = parseFloat(currentUser.coinBalance).toLocaleString();
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;

    // Обновляем UI
    const authLink = document.querySelector('a[onclick="logout()"]');
    if (authLink) {
        authLink.innerHTML = '<i class="bi bi-person-circle"></i> Войти';
        authLink.onclick = showAuthModal;
    }

    document.getElementById('userBalance').textContent = '0';

    // Скрываем админ-меню
    const adminUsersMenu = document.getElementById('adminUsersMenu');
    const adminTopupMenu = document.getElementById('adminTopupMenu');
    if (adminUsersMenu) adminUsersMenu.style.display = 'none';
    if (adminTopupMenu) adminTopupMenu.style.display = 'none';

    showToast('Вы вышли из системы', 'info');
}

async function handleAuth() {
    if (authRequestInFlight) return;

    const activeTab = document.querySelector('.tab-pane.active').id;

    if (activeTab === 'login') {
        await login();
    } else {
        await register();
    }
}

async function login() {
    if (!validateLoginForm()) return;

    authRequestInFlight = true;
    setAuthButtonLoading(true);

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;

            // Сохраняем в localStorage
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            updateUIForLoggedInUser();
            authModalInstance?.hide();
            document.getElementById('loginForm').reset();

            showToast('Вход выполнен успешно!', 'success');
        } else {
            showToast(data.message || 'Ошибка входа', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Ошибка при входе', 'danger');
    } finally {
        authRequestInFlight = false;
        setAuthButtonLoading(false);
    }
}

async function register() {
    if (!validateRegisterForm()) return;

    authRequestInFlight = true;
    setAuthButtonLoading(true);

    const userData = {
        username: document.getElementById('registerUsername').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        firstName: document.getElementById('registerFirstName').value,
        lastName: document.getElementById('registerLastName').value,
        phone: document.getElementById('registerPhone').value
    };

    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Регистрация успешна! Вы получили 1000 коинов!', 'success');

            // Переключаем на вкладку входа
            document.getElementById('register-tab').classList.remove('active');
            document.getElementById('login-tab').classList.add('active');
            document.getElementById('register').classList.remove('show', 'active');
            document.getElementById('login').classList.add('show', 'active');

            // Заполняем форму входа
            document.getElementById('loginUsername').value = userData.username;

            document.getElementById('registerForm').reset();
        } else {
            showToast(data.message || 'Ошибка регистрации', 'danger');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Ошибка при регистрации', 'danger');
    } finally {
        authRequestInFlight = false;
        setAuthButtonLoading(false);
    }
}

// Функции updateTopupCoins и topupBalance удалены, так как самопополнение заменено на QR-код
