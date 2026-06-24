// script.js — полная логика приложения (без изменений)

document.addEventListener('DOMContentLoaded', () => {

    // ---------- ДАННЫЕ ----------
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let applications = JSON.parse(localStorage.getItem('applications')) || [];
    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
    let isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    // ---------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ----------
    function saveUsers() { localStorage.setItem('users', JSON.stringify(users)); }
    function saveApps() { localStorage.setItem('applications', JSON.stringify(applications)); }
    function saveReviews() { localStorage.setItem('reviews', JSON.stringify(reviews)); }

    // ---------- НАВИГАЦИЯ ----------
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = {
        register: document.getElementById('page-register'),
        login: document.getElementById('page-login'),
        dashboard: document.getElementById('page-dashboard'),
        application: document.getElementById('page-application'),
        admin: document.getElementById('page-admin')
    };

    function showPage(pageId) {
        Object.keys(pages).forEach(id => {
            pages[id].classList.toggle('active', id === pageId);
        });
        navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageId);
        });
        if (pageId === 'dashboard') renderDashboard();
        if (pageId === 'admin') renderAdminPanel();
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showPage(btn.dataset.page);
        });
    });

    document.getElementById('gotoLoginFromRegister').addEventListener('click', (e) => {
        e.preventDefault(); showPage('login');
    });
    document.getElementById('gotoRegisterFromLogin').addEventListener('click', (e) => {
        e.preventDefault(); showPage('register');
    });

    // ---------- РЕГИСТРАЦИЯ ----------
    const registerForm = document.getElementById('registerForm');
    const regLoginHint = document.getElementById('regLoginHint');
    const regPasswordHint = document.getElementById('regPasswordHint');

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const login = document.getElementById('regLogin').value.trim();
        const password = document.getElementById('regPassword').value;
        const fullname = document.getElementById('regFullname').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const email = document.getElementById('regEmail').value.trim();

        let valid = true;
        const loginRegex = /^[a-zA-Z0-9]{6,}$/;
        if (!loginRegex.test(login)) {
            regLoginHint.textContent = 'Логин: латиница, цифры, мин. 6 симв.';
            valid = false;
        } else if (users.find(u => u.login === login)) {
            regLoginHint.textContent = 'Этот логин уже занят.';
            valid = false;
        } else {
            regLoginHint.textContent = '';
        }

        if (password.length < 8) {
            regPasswordHint.textContent = 'Пароль должен быть не менее 8 символов.';
            valid = false;
        } else {
            regPasswordHint.textContent = '';
        }

        if (!valid) return;

        users.push({ login, password, fullname, phone, email });
        saveUsers();
        alert('Регистрация успешна! Теперь войдите.');
        showPage('login');
        document.getElementById('regLogin').value = '';
        document.getElementById('regPassword').value = '';
    });

    // ---------- ВХОД ----------
    const loginForm = document.getElementById('loginForm');
    const loginHint = document.getElementById('loginHint');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        const user = users.find(u => u.login === username && u.password === password);
        if (user) {
            currentUser = user;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            loginHint.textContent = '';
            alert('Добро пожаловать, ' + user.fullname);
            showPage('dashboard');
            renderDashboard();
        } else {
            loginHint.textContent = 'Неверный логин или пароль.';
        }
    });

    // ---------- ЛИЧНЫЙ КАБИНЕТ + СЛАЙДЕР ----------
    function renderDashboard() {
        if (!currentUser) {
            document.querySelector('#page-dashboard .card').innerHTML = `
                <h2 class="card__title">Личный кабинет</h2>
                <p>Пожалуйста, <a href="#" onclick="showPage('login')">войдите</a>.</p>
            `;
            return;
        }
        const userApps = applications.filter(a => a.userLogin === currentUser.login);
        const historyDiv = document.getElementById('applicationsHistory');
        if (userApps.length === 0) {
            historyDiv.innerHTML = '<p class="history-empty">У вас пока нет заявок.</p>';
        } else {
            historyDiv.innerHTML = userApps.map(a =>
                `<div class="history-item"><span>${a.course}</span><span>${a.date} | ${a.status}</span></div>`
            ).join('');
        }

        const reviewSelect = document.getElementById('reviewSelect');
        const completedApps = userApps.filter(a => a.status === 'Обучение завершено');
        reviewSelect.innerHTML = '<option value="">— выберите заявку —</option>';
        completedApps.forEach((a, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = `${a.course} (${a.date})`;
            reviewSelect.appendChild(opt);
        });
    }

    // Слайдер
    let slideIndex = 0;
    const track = document.getElementById('sliderTrack');
    const slides = track ? track.querySelectorAll('.slider__slide') : [];
    const totalSlides = slides.length;

    function updateSlider() {
        if (!track) return;
        track.style.transform = `translateX(-${slideIndex * 100}%)`;
    }

    function nextSlide() {
        if (totalSlides === 0) return;
        slideIndex = (slideIndex + 1) % totalSlides;
        updateSlider();
    }

    function prevSlide() {
        if (totalSlides === 0) return;
        slideIndex = (slideIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    }

    if (document.getElementById('sliderNext')) {
        document.getElementById('sliderNext').addEventListener('click', nextSlide);
        document.getElementById('sliderPrev').addEventListener('click', prevSlide);
        setInterval(nextSlide, 3000);
    }

    // Отзывы
    document.getElementById('reviewForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) { alert('Войдите в систему'); return; }
        const select = document.getElementById('reviewSelect');
        const text = document.getElementById('reviewText').value.trim();
        if (select.value === '') { alert('Выберите завершённую заявку'); return; }
        if (!text) { alert('Напишите текст отзыва'); return; }

        const userApps = applications.filter(a => a.userLogin === currentUser.login);
        const idx = parseInt(select.value);
        const app = userApps[idx];
        if (!app) return;

        reviews.push({ user: currentUser.login, course: app.course, text, date: new Date().toLocaleDateString() });
        saveReviews();
        alert('Спасибо за отзыв!');
        document.getElementById('reviewText').value = '';
    });

    // ---------- ЗАЯВКА ----------
    document.getElementById('applicationForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) { alert('Пожалуйста, войдите в систему.'); return; }
        const course = document.getElementById('appCourse').value;
        const date = document.getElementById('appDate').value.trim();
        const payment = document.getElementById('appPayment').value;

        if (!date) { alert('Укажите дату в формате ДД.ММ.ГГГГ'); return; }
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) { alert('Формат даты: ДД.ММ.ГГГГ'); return; }

        applications.push({
            userLogin: currentUser.login,
            course,
            date,
            payment,
            status: 'Новая'
        });
        saveApps();
        alert('Заявка отправлена на согласование администратору.');
        document.getElementById('appDate').value = '';
        showPage('dashboard');
        renderDashboard();
    });

    // ---------- АДМИНИСТРАТОР ----------
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminStatus = document.getElementById('adminStatus');
    const adminPanel = document.getElementById('adminPanel');

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('adminUser').value.trim();
        const pass = document.getElementById('adminPass').value.trim();
        if (user === 'Admin26' && pass === 'Demo20') {
            isAdmin = true;
            sessionStorage.setItem('isAdmin', 'true');
            adminStatus.textContent = '✅ Администратор вошёл';
            adminPanel.style.display = 'block';
            renderAdminPanel();
        } else {
            adminStatus.textContent = '❌ Неверный логин или пароль админа.';
        }
    });

    let adminPage = 1;
    const itemsPerPage = 3;

    function renderAdminPanel() {
        if (!isAdmin) { adminPanel.style.display = 'none'; return; }
        adminPanel.style.display = 'block';
        const filter = document.getElementById('adminFilter').value.toLowerCase();
        let filtered = applications.filter(a => a.course.toLowerCase().includes(filter));

        const sortBtn = document.getElementById('adminSortBtn');
        let sortAsc = true;
        sortBtn.addEventListener('click', () => {
            filtered.sort((a, b) => {
                const order = sortAsc ? 1 : -1;
                sortAsc = !sortAsc;
                return a.status.localeCompare(b.status) * order;
            });
            renderAdminList(filtered);
        });

        function renderAdminList(list) {
            const container = document.getElementById('adminApplicationsList');
            const start = (adminPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = list.slice(start, end);

            if (pageItems.length === 0) {
                container.innerHTML = '<p>Нет заявок.</p>';
            } else {
                container.innerHTML = pageItems.map((app, idx) => {
                    const globalIdx = applications.indexOf(app);
                    return `<div class="admin-item">
                        <span><strong>${app.course}</strong> ${app.date} (${app.userLogin})</span>
                        <select data-idx="${globalIdx}" class="admin-status-select">
                            <option value="Новая" ${app.status === 'Новая' ? 'selected' : ''}>Новая</option>
                            <option value="Идет обучение" ${app.status === 'Идет обучение' ? 'selected' : ''}>Идет обучение</option>
                            <option value="Обучение завершено" ${app.status === 'Обучение завершено' ? 'selected' : ''}>Обучение завершено</option>
                        </select>
                    </div>`;
                }).join('');

                document.querySelectorAll('.admin-status-select').forEach(sel => {
                    sel.addEventListener('change', function() {
                        const idx = parseInt(this.dataset.idx);
                        applications[idx].status = this.value;
                        saveApps();
                        renderAdminPanel();
                        alert('Статус обновлён');
                    });
                });
            }

            const totalPages = Math.ceil(list.length / itemsPerPage) || 1;
            document.getElementById('adminPageInfo').textContent = `${adminPage} / ${totalPages}`;
            document.getElementById('adminPagePrev').disabled = adminPage === 1;
            document.getElementById('adminPageNext').disabled = adminPage === totalPages;
        }

        document.getElementById('adminPagePrev').onclick = () => {
            if (adminPage > 1) { adminPage--; renderAdminPanel(); }
        };
        document.getElementById('adminPageNext').onclick = () => {
            const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
            if (adminPage < totalPages) { adminPage++; renderAdminPanel(); }
        };

        document.getElementById('adminFilter').addEventListener('input', () => {
            adminPage = 1;
            renderAdminPanel();
        });

        renderAdminList(filtered);
    }

    if (isAdmin) {
        adminStatus.textContent = '✅ Администратор вошёл';
        adminPanel.style.display = 'block';
        renderAdminPanel();
    }

    showPage('register');
    if (currentUser) {
        showPage('dashboard');
        renderDashboard();
    }

    window.showPage = showPage;
});