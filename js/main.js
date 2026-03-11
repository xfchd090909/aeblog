// ====================== 提示词库 + 北京时间 ======================
let greetings = {};
let currentQuote = '';
let lastPeriod = '';
let lastUsedQuote = '';

async function loadGreetings() {
    try {
        const res = await fetch('data/greetings.json');
        greetings = await res.json();
    } catch (e) {}
}

function getPeriodKey(hour) {
    const h = parseInt(hour);
    if (h >= 7 && h <= 11) return "07";
    if (h >= 12 && h <= 17) return "12";
    if (h >= 18 && h <= 21) return "18";
    return "22";
}

function updateBeijingTime() {
    try {
        const timeEl = document.getElementById('beijing-time');
        const now = new Date();
        const options = { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        let timeStr = now.toLocaleString('zh-CN', options).replace(/\//g, '-');
        const [datePart, timePart] = timeStr.split(' ');
        const hour = timePart.split(':')[0];
        const periodKey = getPeriodKey(hour);

        if (periodKey !== lastPeriod || !currentQuote) {
            if (greetings[periodKey] && greetings[periodKey].length > 0) {
                let newQuote;
                let attempts = 0;
                do {
                    const randomIndex = Math.floor(Math.random() * greetings[periodKey].length);
                    newQuote = greetings[periodKey][randomIndex];
                    attempts++;
                } while (newQuote === lastUsedQuote && attempts < 10);
                currentQuote = newQuote;
                lastUsedQuote = newQuote;
            }
            lastPeriod = periodKey;
        }

        if (currentQuote) {
            timeEl.textContent = currentQuote + '：' + datePart + ' ' + timePart;
        } else {
            timeEl.textContent = datePart + ' ' + timePart;
        }
    } catch (e) {}
}

// ====================== 智能 compact 模式 ======================
function checkCompactMode() {
    const container = document.getElementById('nav-container');
    const leftNav = document.querySelector('.nav-left');
    const timeEl = document.getElementById('beijing-time');
    if (!leftNav || !timeEl) return;
    const gap = timeEl.getBoundingClientRect().left - leftNav.getBoundingClientRect().right;
    if (gap < 35 || timeEl.scrollWidth > timeEl.clientWidth + 8) {
        container.classList.add('compact');
    } else {
        container.classList.remove('compact');
    }
}

// ====================== 可随意拖动按钮（最终修复版） ======================
function makeDraggable() {
    const btn = document.getElementById('menu-toggle');
    
    // 恢复位置（只存数字，避免 "100pxpx" bug）
    let posX = parseFloat(localStorage.getItem('menuX')) || (window.innerWidth - 80);
    let posY = parseFloat(localStorage.getItem('menuY')) || 24;
    btn.style.left = posX + 'px';
    btn.style.top = posY + 'px';
    btn.style.right = 'auto';

    let isDragging = false;
    let hasDragged = false;     // 防误触关键标志
    let startX, startY;
    let threshold = 8;          // 移动超过8px才算拖拽

    // ==================== 鼠标事件 ====================
    btn.addEventListener('mousedown', e => {
        isDragging = true;
        hasDragged = false;
        startX = e.clientX - btn.offsetLeft;
        startY = e.clientY - btn.offsetTop;
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        let newX = e.clientX - startX;
        let newY = e.clientY - startY;

        // 边界限制（防止拖出屏幕）
        newX = Math.max(10, Math.min(window.innerWidth - btn.offsetWidth - 10, newX));
        newY = Math.max(10, Math.min(window.innerHeight - btn.offsetHeight - 10, newY));

        btn.style.left = newX + 'px';
        btn.style.top = newY + 'px';
        if (Math.abs(e.clientX - (startX + btn.offsetLeft)) > threshold) hasDragged = true;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            if (hasDragged) {
                localStorage.setItem('menuX', btn.offsetLeft);
                localStorage.setItem('menuY', btn.offsetTop);
            }
        }
    });

    // ==================== 移动端触摸事件 ====================
    btn.addEventListener('touchstart', e => {
        isDragging = true;
        hasDragged = false;
        startX = e.touches[0].clientX - btn.offsetLeft;
        startY = e.touches[0].clientY - btn.offsetTop;
    });

    document.addEventListener('touchmove', e => {
        if (!isDragging) return;
        let newX = e.touches[0].clientX - startX;
        let newY = e.touches[0].clientY - startY;

        // 边界限制
        newX = Math.max(10, Math.min(window.innerWidth - btn.offsetWidth - 10, newX));
        newY = Math.max(10, Math.min(window.innerHeight - btn.offsetHeight - 10, newY));

        btn.style.left = newX + 'px';
        btn.style.top = newY + 'px';
        if (Math.abs(e.touches[0].clientX - (startX + btn.offsetLeft)) > threshold) hasDragged = true;
    });

    document.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            if (hasDragged) {
                localStorage.setItem('menuX', btn.offsetLeft);
                localStorage.setItem('menuY', btn.offsetTop);
            }
        }
    });
}

// ====================== 菜单控制 ======================
function toggleMenu() {
    const menu = document.getElementById('theme-menu');
    menu.classList.toggle('open');
}

function closeMenu() {
    const menu = document.getElementById('theme-menu');
    menu.classList.remove('open');
}

// ====================== 全局主题切换 ======================
function switchTheme(mode) {
    if (mode === 'light') {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
    closeMenu();
}

// ====================== 文章列表 ======================
async function loadPosts() {
    const res = await fetch('data/posts.json');
    return await res.json();
}

function renderPosts(posts) {
    const grid = document.getElementById('post-grid');
    grid.innerHTML = posts.map(post => `
        <a href="post.html?slug=${post.slug}" class="card block">
            <div class="date">${post.date}</div>
            <div class="title">${post.title}</div>
            <p class="text-zinc-400 dark:text-zinc-400 text-[15px] leading-relaxed mt-4">${post.excerpt}</p>
        </a>
    `).join('');
}

// ====================== 初始化 ======================
window.onload = async function() {
    await loadGreetings();
    updateBeijingTime();
    setInterval(updateBeijingTime, 1000);
    
    const posts = await loadPosts();
    renderPosts(posts);
    
    window.addEventListener('resize', () => requestAnimationFrame(checkCompactMode));
    setTimeout(checkCompactMode, 150);
    setTimeout(checkCompactMode, 400);

    // 菜单点击（防拖拽误触）
    const toggleBtn = document.getElementById('menu-toggle');
    toggleBtn.addEventListener('click', function(e) {
        if (!this.dataset.dragged) toggleMenu();
    });

    document.getElementById('menu-close').addEventListener('click', closeMenu);

    document.addEventListener('click', function(e) {
        const menu = document.getElementById('theme-menu');
        if (!e.target.closest('#theme-menu') && !e.target.closest('#menu-toggle')) {
            menu.classList.remove('open');
        }
    });

    // 恢复主题
    if (localStorage.theme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }

    // 启用拖拽
    makeDraggable();
};
