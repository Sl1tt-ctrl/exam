// script.js — все эмоджи удалены

document.addEventListener('DOMContentLoaded', () => {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let applications = JSON.parse(localStorage.getItem('applications')) || [];
    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
    let isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    if (!users.find(u => u.login === 'testuser')) {
        users.push({
            login: 'testuser',
            password: 'test12345',
            fullname: 'Тестовый Пользователь',
            phone: '+7 (999) 888-77-66',
            email: 'test@example.ru'
        });
        saveUsers();
    }

    function saveUsers() { localStorage.setItem('users', JSON.stringify(users)); }
    function saveApps() { localStorage.setItem('applications', JSON.stringify(applications)); }
    function saveReviews() { localStorage.setItem('reviews', JSON.stringify(reviews)); }

    const header = document.getElementById('mainHeader');
    const burgerBtn = document.getElementById('burgerBtn');
    const mainNav = document.getElementById('mainNav');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    function updateAuthUI() {
        if (currentUser) {
            header.style.display = 'flex';
            document.querySelectorAll('.nav-btn:not(.nav-btn--logout)').forEach(btn => {
                btn.style.display = 'inline-block';
            });
            document.getElementById('page-login').classList.remove('active');
            document.getElementById('page-register').classList.remove('active');
            showPage('home');
            updateGreeting();
            updateProfile();
            updateAdminUI();
        } else {
            header.style.display = 'none';
            document.getElementById('page-login').classList.add('active');
            document.getElementById('page-register').classList.remove('active');
            document.getElementById('page-home').classList.remove('active');
            document.getElementById('page-dashboard').classList.remove('active');
            document.getElementById('page-admin').classList.remove('active');
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        }
    }

    function updateProfile() {
        if (!currentUser) return;
        const initials = currentUser.fullname
            .split(' ')
            .map(word => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
        document.getElementById('avatarInitials').textContent = initials || '?';
        document.getElementById('profileName').textContent = currentUser.fullname || 'Имя не указано';
        document.getElementById('profileEmail').textContent = currentUser.email || 'email@example.com';
        document.getElementById('profilePhone').textContent = currentUser.phone || '+7 (999) 123-45-67';
    }

    function updateAdminUI() {
        const adminStatus = document.getElementById('adminStatus');
        const adminPanel = document.getElementById('adminPanel');
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (isAdmin) {
            adminStatus.textContent = 'Администратор вошёл';
            adminPanel.style.display = 'block';
            adminLoginForm.style.display = 'none';
            adminLogoutBtn.style.display = 'inline-block';
            renderAdminPanel();
        } else {
            adminStatus.textContent = 'Вход не выполнен';
            adminPanel.style.display = 'none';
            adminLoginForm.style.display = 'flex';
            adminLogoutBtn.style.display = 'none';
        }
    }

    adminLogoutBtn.addEventListener('click', () => {
        isAdmin = false;
        sessionStorage.removeItem('isAdmin');
        updateAdminUI();
        alert('Вы вышли из админ-панели');
    });

    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('active');
        mainNav.classList.toggle('open');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            burgerBtn.classList.remove('active');
            mainNav.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header')) {
            burgerBtn.classList.remove('active');
            mainNav.classList.remove('open');
        }
    });

    function updateGreeting() {
        const greetingText = document.getElementById('greetingText');
        if (currentUser) {
            greetingText.textContent = 'Добро пожаловать, ' + currentUser.fullname + '!';
        }
    }

    const navBtns = document.querySelectorAll('.nav-btn:not(.nav-btn--logout)');
    const pages = {
        home: document.getElementById('page-home'),
        dashboard: document.getElementById('page-dashboard'),
        admin: document.getElementById('page-admin')
    };

    function showPage(pageId) {
        if (!currentUser) return;
        Object.keys(pages).forEach(id => {
            pages[id].classList.toggle('active', id === pageId);
        });
        navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageId);
        });
        if (pageId === 'dashboard') {
            updateProfile();
            renderDashboard();
        }
        if (pageId === 'admin') {
            updateAdminUI();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentUser) {
                showPage(btn.dataset.page);
            }
        });
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        isAdmin = false;
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('isAdmin');
        updateAuthUI();
        document.getElementById('page-login').classList.add('active');
        document.getElementById('loginHint').textContent = '';
        document.getElementById('loginUsername').value = 'testuser';
        document.getElementById('loginPassword').value = 'test12345';
    });

    document.getElementById('gotoRegister').addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentUser) {
            document.getElementById('page-login').classList.remove('active');
            document.getElementById('page-register').classList.add('active');
        }
    });
    document.getElementById('gotoLoginFromRegister').addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentUser) {
            document.getElementById('page-register').classList.remove('active');
            document.getElementById('page-login').classList.add('active');
        }
    });

    let mainSlideIndex = 0;
    const mainTrack = document.getElementById('sliderTrack');
    const mainSlides = mainTrack ? mainTrack.querySelectorAll('.slider__slide') : [];
    const mainTotal = mainSlides.length;

    function updateMainSlider() {
        if (!mainTrack) return;
        mainTrack.style.transform = 'translateX(-' + (mainSlideIndex * 100) + '%)';
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
        document.getElementById('page-register').classList.remove('active');
        document.getElementById('page-login').classList.add('active');
        document.getElementById('regLogin').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regFullname').value = '';
        document.getElementById('regPhone').value = '';
        document.getElementById('regEmail').value = '';
    });

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
            updateAuthUI();
            updateProfile();
        } else {
            loginHint.textContent = 'Неверный логин или пароль.';
        }
    });

    function renderDashboard() {
        const container = document.getElementById('dashboardContent');
        if (!currentUser) return;
        const userApps = applications.filter(a => a.userLogin === currentUser.login);
        
        let historyHtml = '<h3>История заявок</h3>';
        if (userApps.length === 0) {
            historyHtml += '<div class="history-list"><p class="history-empty">У вас пока нет заявок.</p></div>';
        } else {
            historyHtml += '<div class="history-list">';
            historyHtml += userApps.map(a =>
                '<div class="history-item"><span>' + a.course + '</span><span>' + a.date + ' | ' + a.status + '</span></div>'
            ).join('');
            historyHtml += '</div>';
        }

        const completedApps = userApps.filter(a => a.status === 'Обучение завершено');
        let reviewHtml = '<h3>Оставить отзыв</h3>';
        reviewHtml += '<form id="reviewForm" class="form">' +
            '<div class="form__group">' +
                '<label for="reviewSelect">Выберите завершённую заявку</label>' +
                '<select id="reviewSelect" class="form__select">';
        if (completedApps.length === 0) {
            reviewHtml += '<option value="">— нет завершённых —</option>';
        } else {
            completedApps.forEach((a, idx) => {
                reviewHtml += '<option value="' + idx + '">' + a.course + ' (' + a.date + ')</option>';
            });
        }
        reviewHtml += '</select>' +
            '</div>' +
            '<div class="form__group">' +
                '<label for="reviewText">Ваш отзыв</label>' +
                '<textarea id="reviewText" rows="2" placeholder="Поделитесь впечатлениями..."></textarea>' +
            '</div>' +
            '<button type="submit" class="btn btn--secondary">Отправить отзыв</button>' +
        '</form>';

        container.innerHTML = historyHtml + reviewHtml;

        document.getElementById('reviewForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentUser) { alert('Войдите в систему'); return; }
            const select = document.getElementById('reviewSelect');
            const text = document.getElementById('reviewText').value.trim();
            if (select.value === '') { alert('Выберите завершённую заявку'); return; }
            if (!text) { alert('Напишите текст отзыва'); return; }

            const userApps2 = applications.filter(a => a.userLogin === currentUser.login);
            const idx = parseInt(select.value);
            const app = userApps2[idx];
            if (!app) return;

            reviews.push({ user: currentUser.login, course: app.course, text, date: new Date().toLocaleDateString() });
            saveReviews();
            alert('Спасибо за отзыв!');
            document.getElementById('reviewText').value = '';
        });
    }

    document.getElementById('homeApplicationForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) {
            document.getElementById('homeAppHint').textContent = 'Пожалуйста, войдите в систему.';
            return;
        }
        const course = document.getElementById('homeAppCourse').value;
        const date = document.getElementById('homeAppDate').value.trim();
        const payment = document.getElementById('homeAppPayment').value;
        const hint = document.getElementById('homeAppHint');

        if (!date) {
            hint.textContent = 'Укажите дату в формате ДД.ММ.ГГГГ';
            return;
        }
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
            hint.textContent = 'Формат даты: ДД.ММ.ГГГГ';
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
        alert('Заявка успешно отправлена на согласование администратору!');
        document.getElementById('homeAppDate').value = '';
    });

    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminStatus = document.getElementById('adminStatus');
    const adminPanel = document.getElementById('adminPanel');

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Сначала войдите в систему');
            return;
        }
        const user = document.getElementById('adminUser').value.trim();
        const pass = document.getElementById('adminPass').value.trim();
        if (user === 'Admin26' && pass === 'Demo20') {
            isAdmin = true;
            sessionStorage.setItem('isAdmin', 'true');
            updateAdminUI();
            alert('Вы вошли в админ-панель');
        } else {
            adminStatus.textContent = 'Неверный логин или пароль админа.';
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
                    return '<div class="admin-item">' +
                        '<span><strong>' + app.course + '</strong> ' + app.date + ' (' + app.userLogin + ')</span>' +
                        '<select data-idx="' + globalIdx + '" class="admin-status-select">' +
                            '<option value="Новая" ' + (app.status === 'Новая' ? 'selected' : '') + '>Новая</option>' +
                            '<option value="Идет обучение" ' + (app.status === 'Идет обучение' ? 'selected' : '') + '>Идет обучение</option>' +
                            '<option value="Обучение завершено" ' + (app.status === 'Обучение завершено' ? 'selected' : '') + '>Обучение завершено</option>' +
                        '</select>' +
                    '</div>';
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
            document.getElementById('adminPageInfo').textContent = adminPage + ' / ' + totalPages;
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

    if (currentUser) {
        updateAuthUI();
        updateProfile();
        if (isAdmin) {
            updateAdminUI();
        }
    } else {
        document.getElementById('page-login').classList.add('active');
        document.getElementById('page-register').classList.remove('active');
        document.getElementById('page-home').classList.remove('active');
        document.getElementById('page-dashboard').classList.remove('active');
        document.getElementById('page-admin').classList.remove('active');
        header.style.display = 'none';
    }

    window.showPage = showPage;
});