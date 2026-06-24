// script.js — обновлён с формой заявки на главной

document.addEventListener('DOMContentLoaded', () => {
    // Данные
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let applications = JSON.parse(localStorage.getItem('applications')) || [];
    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
    let isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    function saveUsers() { localStorage.setItem('users', JSON.stringify(users)); }
    function saveApps() { localStorage.setItem('applications', JSON.stringify(applications)); }
    function saveReviews() { localStorage.setItem('reviews', JSON.stringify(reviews)); }

    // Навигация
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = {
        home: document.getElementById('page-home'),
        register: document.getElementById('page-register'),
        login: document.getElementById('page-login'),
        dashboard: document.getElementById('page-dashboard'),
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // === СЛАЙДЕР (главный) ===
    let mainSlideIndex = 0;
    const mainTrack = document.getElementById('sliderTrack');
    const mainSlides = mainTrack ? mainTrack.querySelectorAll('.slider__slide') : [];
    const mainTotal = mainSlides.length;

    function updateMainSlider() {
        if (!mainTrack) return;
        mainTrack.style.transform = `translateX(-${mainSlideIndex * 100}%)`;
        updateDots();
    }

    function nextMainSlide() {
        if (mainTotal === 0) return;
        mainSlideIndex = (mainSlideIndex + 1) % mainTotal;
        updateMainSlider();
    }

    function prevMainSlide() {
        if (mainTotal === 0) return;
        mainSlideIndex = (mainSlideIndex - 1 + mainTotal) % mainTotal;
        updateMainSlider();
    }

    function createDots() {
        const dotsContainer = document.getElementById('sliderDots');
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < mainTotal; i++) {
            const dot = document.createElement('button');
            dot.className = 'slider__dot' + (i === 0 ? ' active' : '');
            dot.dataset.index = i;
            dot.addEventListener('click', () => {
                mainSlideIndex = i;
                updateMainSlider();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        const dotsContainer = document.getElementById('sliderDots');
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.slider__dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === mainSlideIndex);
        });
    }

    if (document.getElementById('sliderNext')) {
        document.getElementById('sliderNext').addEventListener('click', nextMainSlide);
        document.getElementById('sliderPrev').addEventListener('click', prevMainSlide);
        createDots();
        setInterval(nextMainSlide, 4000);
    }

    // === СЛАЙДЕР (личный кабинет) ===
    let dashSlideIndex = 0;
    const dashTrack = document.getElementById('dashboardSliderTrack');
    const dashSlides = dashTrack ? dashTrack.querySelectorAll('.slider__slide') : [];
    const dashTotal = dashSlides.length;

    function updateDashSlider() {
        if (!dashTrack) return;
        dashTrack.style.transform = `translateX(-${dashSlideIndex * 100}%)`;
    }

    function nextDashSlide() {
        if (dashTotal === 0) return;
        dashSlideIndex = (dashSlideIndex + 1) % dashTotal;
        updateDashSlider();
    }

    function prevDashSlide() {
        if (dashTotal === 0) return;
        dashSlideIndex = (dashSlideIndex - 1 + dashTotal) % dashTotal;
        updateDashSlider();
    }

    if (document.getElementById('dashboardSliderNext')) {
        document.getElementById('dashboardSliderNext').addEventListener('click', nextDashSlide);
        document.getElementById('dashboardSliderPrev').addEventListener('click', prevDashSlide);
        setInterval(nextDashSlide, 3000);
    }

    // === РЕГИСТРАЦИЯ ===
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

    // === ВХОД ===
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

    // === ЛИЧНЫЙ КАБИНЕТ ===
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

    // === ОТЗЫВЫ ===
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

    // === ФОРМА ЗАЯВКИ НА ГЛАВНОЙ ===
    document.getElementById('homeApplicationForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) {
            document.getElementById('homeAppHint').textContent = '⚠️ Пожалуйста, войдите в систему.';
            return;
        }
        const course = document.getElementById('homeAppCourse').value;
        const date = document.getElementById('homeAppDate').value.trim();
        const payment = document.getElementById('homeAppPayment').value;
        const hint = document.getElementById('homeAppHint');

        if (!date) {
            hint.textContent = '⚠️ Укажите дату в формате ДД.ММ.ГГГГ';
            return;
        }
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
            hint.textContent = '⚠️ Формат даты: ДД.ММ.ГГГГ';
            return;
        }

        applications.push({
            userLogin: currentUser.login,
            course,
            date,
            payment,
            status: 'Новая'
        });
        saveApps();
        hint.textContent = '';
        alert('✅ Заявка успешно отправлена на согласование администратору!');
        document.getElementById('homeAppDate').value = '';
    });

    // === АДМИНИСТРАТОР ===
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
        sortBtn.onclick = () => {
            filtered.sort((a, b) => {
                const order = sortAsc ? 1 : -1;
                sortAsc = !sortAsc;
                return a.status.localeCompare(b.status) * order;
            });
            renderAdminList(filtered);
        };

        function renderAdminList(list) {
            const container = document.getElementById('adminApplicationsList');
            const start = (adminPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = list.slice(start, end);

            if (pageItems.length === 0) {
                container.innerHTML = '<p>Нет заявок.</p>';
            } else {
                container.innerHTML = pageItems.map((app) => {
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

    // Стартовая страница — ГЛАВНАЯ
    showPage('home');

    window.showPage = showPage;
});