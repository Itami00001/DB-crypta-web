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

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Добавляем обработчик для поля пополнения
    document.getElementById('topupAmount').addEventListener('input', updateTopupCoins);

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
}

function showNews() {
    showSection('news');
    loadNewsData();
}

function showPredictions() {
    showSection('predictions');
    loadPredictionsData();
}

// Функции загрузки данных
async function loadDashboardData() {
    try {
        // Загрузка статистики
        const [users, crypto, wallets, transactions] = await Promise.all([
            fetch(`${API_BASE}/users`).then(r => r.json()),
            fetch(`${API_BASE}/crypto-currencies`).then(r => r.json()),
            fetch(`${API_BASE}/crypto-wallets`).then(r => r.json()),
            fetch(`${API_BASE}/transactions`).then(r => r.json())
        ]);
        
        // Обновление счетчиков
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalCrypto').textContent = crypto.filter(c => c.isActive).length;
        document.getElementById('totalWallets').textContent = wallets.length;
        document.getElementById('totalTransactions').textContent = transactions.length;
        
        // Загрузка данных для графиков
        loadCharts(crypto, transactions);
        
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
        const wallets = await fetch(`${API_BASE}/crypto-wallets`).then(r => r.json());
        renderWallets(wallets);
    } catch (error) {
        console.error('Error loading wallets data:', error);
        showToast('Ошибка загрузки кошельков', 'danger');
    }
}

async function loadTransactionsData() {
    try {
        const transactions = await fetch(`${API_BASE}/transactions`).then(r => r.json());
        renderTransactions(transactions);
    } catch (error) {
        console.error('Error loading transactions data:', error);
        showToast('Ошибка загрузки транзакций', 'danger');
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
    
    container.innerHTML = wallets.map(w => `
        <div class="col-md-4 mb-4">
            <div class="wallet-card">
                <h5>${w.currencyCode}</h5>
                <div class="wallet-balance">${parseFloat(w.balance).toFixed(8)}</div>
                <div class="wallet-address">${w.walletAddress}</div>
                <div class="mt-3">
                    <small>Тип: ${w.walletType}</small><br>
                    <small>ID: ${w.id}</small>
                </div>
            </div>
        </div>
    `).join('');
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
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: 'rgba(102, 126, 234, 1)',
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
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
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
    
    charts.transaction = new Chart(transactionCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(transactionTypes),
            datasets: [{
                data: Object.values(transactionTypes),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
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
    const modal = new bootstrap.Modal(document.getElementById('topupModal'));
    modal.show();
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
        const transactions = await fetch(`${API_BASE}/transactions`).then(r => r.json());
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
        const crypto = await fetch(`${API_BASE}/crypto-currencies`).then(r => r.json());
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

function updateTopupCoins() {
    const amount = parseFloat(document.getElementById('topupAmount').value) || 0;
    const coins = amount * 10; // 1 рубль = 10 коинов
    document.getElementById('topupCoins').textContent = coins.toLocaleString();
}

async function topupBalance() {
    if (!authToken) {
        showToast('Сначала войдите в систему', 'warning');
        showAuthModal();
        return;
    }
    
    const amount = parseFloat(document.getElementById('topupAmount').value);
    const paymentMethod = document.getElementById('topupPaymentMethod').value;
    
    if (!amount || amount <= 0) {
        showToast('Введите корректную сумму', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/topup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ amount, paymentMethod })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Обновляем баланс пользователя
            currentUser.coinBalance = data.newBalance;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUIForLoggedInUser();
            bootstrap.Modal.getInstance(document.getElementById('topupModal')).hide();
            document.getElementById('topupForm').reset();
            
            showToast(`Баланс успешно пополнен на ${data.amount} коинов!`, 'success');
        } else {
            showToast(data.message || 'Ошибка пополнения', 'danger');
        }
    } catch (error) {
        console.error('Topup error:', error);
        showToast('Ошибка при пополнении баланса', 'danger');
    }
}
