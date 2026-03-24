// ====================== 全局变量 ======================
let greetings = {};
let currentQuote = '';
let lastPeriod = '';
let lastUsedQuote = '';
let hasDragged = false;

// ====================== 提示词库 + 北京时间 ======================
async function loadGreetings() {
    try {
        const res = await fetch('data/greetings.json');
        greetings = await res.json();
    } catch (e) { console.error("Failed to load greetings"); }
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
        if (!timeEl) return;
        
        const now = new Date();
        const options = { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        let timeStr = now.toLocaleString('zh-CN', options).replace(/\//g, '-');
        const [datePart, timePart] = timeStr.split(' ');
        const hour = timePart.split(':')[0];
        const periodKey = getPeriodKey(hour);

        if (periodKey !== lastPeriod || !currentQuote) {
            if (greetings[periodKey] && greetings[periodKey].length > 0) {
                let availableQuotes = greetings[periodKey].filter(q => q !== lastUsedQuote);
                if (availableQuotes.length === 0) availableQuotes = greetings[periodKey];
                const randomIndex = Math.floor(Math.random() * availableQuotes.length);
                currentQuote = availableQuotes[randomIndex];
                lastUsedQuote = currentQuote;
                lastPeriod = periodKey;
            }
        }
        timeEl.textContent = `${timeStr} · ${currentQuote || '载入中...'}`;
    } catch (e) {}
}

// ====================== 侧边栏与主题控制 ======================
function toggleMenu() {
    const menu = document.getElementById('theme-menu');
    menu.classList.toggle('open');
}

function closeMenu() {
    const menu = document.getElementById('theme-menu');
    menu.classList.remove('open');
}

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

// ====================== NSFW 逻辑 ======================
async function initNSFWLogic() {
    const nsfwSetting = document.getElementById('nsfw-setting');
    const nsfwToggle = document.getElementById('nsfw-toggle');

    try {
        const res = await fetch('/api/ipinfo');
        const data = await res.json();
        
        if (data.restrictedRegions && data.restrictedRegions.includes(data.country)) {
            localStorage.setItem('nsfw_enabled', 'false');
            nsfwSetting.classList.add('hidden');
        } else {
            nsfwSetting.classList.remove('hidden');
            nsfwSetting.classList.add('flex');
            
            let isEnabled = localStorage.getItem('nsfw_enabled') === 'true';
            updateNSFWUI(isEnabled);

            nsfwToggle.onclick = async () => {
                isEnabled = !isEnabled;
                localStorage.setItem('nsfw_enabled', isEnabled);
                updateNSFWUI(isEnabled);
                const posts = await loadPosts();
                renderPosts(posts);
            };
        }
    } catch (e) {
        localStorage.setItem('nsfw_enabled', 'false');
    }
}

function updateNSFWUI(isEnabled) {
    const btn = document.getElementById('nsfw-toggle');
    const knob = document.getElementById('nsfw-knob');
    if (isEnabled) {
        btn.classList.add('bg-red-500');
        btn.classList.remove('bg-zinc-200', 'dark:bg-zinc-700');
        knob.style.transform = 'translateX(20px)';
    } else {
        btn.classList.remove('bg-red-500');
        btn.classList.add('bg-zinc-200', 'dark:bg-zinc-700');
        knob.style.transform = 'translateX(0)';
    }
}

// ====================== 拖拽与渲染逻辑 ======================
function makeDraggable() {
    const btn = document.getElementById('menu-toggle');
    if (!btn) return;

    let isDragging = false;
    let startX, startY, initialX, initialY;

    let savedX = localStorage.getItem('menuX');
    let savedY = localStorage.getItem('menuY');
    
    if (savedX !== null && savedY !== null) {
        btn.style.transform = `translate(${savedX}px, ${savedY}px)`;
    } else {
        const initialTranslateX = window.innerWidth - 80;
        const initialTranslateY = 24;
        btn.style.transform = `translate(${initialTranslateX}px, ${initialTranslateY}px)`;
    }

    // 修复：passive 必须设为 false 才能在 touchmove 中阻止默认行为
    btn.addEventListener('touchstart', (e) => {
        isDragging = true;
        hasDragged = false;
        const touch = e.touches[0];
        const style = window.getComputedStyle(btn);
        const matrix = new WebKitCSSMatrix(style.transform);
        initialX = matrix.m41;
        initialY = matrix.m42;
        startX = touch.clientX;
        startY = touch.clientY;
        btn.style.transition = 'none';
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        // 核心修复：显式阻止默认事件，防止背景滚动和下拉刷新
        e.preventDefault();

        const touch = e.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasDragged = true;
        const newX = Math.min(Math.max(0, initialX + dx), window.innerWidth - 44);
        const newY = Math.min(Math.max(0, initialY + dy), window.innerHeight - 44);
        btn.style.transform = `translate(${newX}px, ${newY}px)`;
    }, { passive: false });

    document.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        btn.style.transition = 'all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
        
        // 修复：保存位置以便刷新后保持
        const style = window.getComputedStyle(btn);
        const matrix = new WebKitCSSMatrix(style.transform);
        localStorage.setItem('menuX', matrix.m41);
        localStorage.setItem('menuY', matrix.m42);
    });

    btn.addEventListener('click', (e) => {
        if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
        } else {
            toggleMenu();
        }
    });
}

async function loadPosts() {
    const res = await fetch('data/posts.json');
    return await res.json();
}

function renderPosts(posts) {
    const grid = document.getElementById('post-grid');
    if (!grid) return;
    const isNSFWEnabled = localStorage.getItem('nsfw_enabled') === 'true';
    
    const filtered = posts.filter(post => !post.nsfw || isNSFWEnabled);

    grid.innerHTML = filtered.map(post => `
        <a href="post.html?slug=${post.slug}" class="card block relative">
            ${post.nsfw ? '<span class="absolute top-4 right-4 text-[10px] font-bold text-red-500 border border-red-500 px-1.5 py-0.5 rounded">18+</span>' : ''}
            <div class="date">${post.date}</div>
            <div class="title">${post.title}</div>
            <p class="text-zinc-400 dark:text-zinc-400 text-[15px] leading-relaxed mt-4">${post.excerpt}</p>
        </a>
    `).join('');
}

// ====================== 初始化 ======================
window.onload = async function() {
    if (localStorage.theme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }

    await loadGreetings();
    updateBeijingTime();
    setInterval(updateBeijingTime, 1000);
    
    await initNSFWLogic();
    
    const posts = await loadPosts();
    renderPosts(posts);
    
    makeDraggable();

    document.getElementById('menu-close').addEventListener('click', closeMenu);

    document.addEventListener('click', function(e) {
        const menu = document.getElementById('theme-menu');
        const btn = document.getElementById('menu-toggle');
        if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
            closeMenu();
        }
    });
};
