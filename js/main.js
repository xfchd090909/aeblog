// ====================== 全局变量 ======================
let greetings = {};
let currentQuote = '';
let lastPeriod = '';
let lastUsedQuote = '';
let hasDragged = false; // 用于区分拖拽和点击

// ====================== 提示词库 + 北京时间 ======================
async function loadGreetings() {
    try {
        const res = await fetch('data/greetings.json');
        greetings = await res.json();
    } catch (e) { 
        console.error("Failed to load greetings"); 
    }
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
        const options = { 
            timeZone: 'Asia/Shanghai', 
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit', second: '2-digit', 
            hour12: false 
        };
        let timeStr = now.toLocaleString('zh-CN', options).replace(/\//g, '-');
        const [datePart, timePart] = timeStr.split(' ');
        const hour = timePart.split(':')[0];
        const periodKey = getPeriodKey(hour);

        // 如果时间段变化，更新欢迎语
        if (periodKey !== lastPeriod) {
            const periodQuotes = greetings[periodKey] || ["Hello"];
            let newQuote;
            do {
                newQuote = periodQuotes[Math.floor(Math.random() * periodQuotes.length)];
            } while (newQuote === lastUsedQuote && periodQuotes.length > 1);
            
            currentQuote = newQuote;
            lastUsedQuote = newQuote;
            lastPeriod = periodKey;
        }

        timeEl.textContent = `${datePart} ${timePart} · ${currentQuote}`;
    } catch (e) {
        console.error("Time update error", e);
    }
}

// ====================== 侧边菜单逻辑 ======================
function toggleMenu() {
    const menu = document.getElementById('theme-menu');
    menu.classList.toggle('open');
}

function closeMenu() {
    const menu = document.getElementById('theme-menu');
    menu.classList.remove('open');
}

function switchTheme(theme) {
    if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
}

// ====================== NSFW 机制 ======================
async function initNSFWLogic() {
    const nsfwToggle = document.getElementById('nsfw-toggle');
    const nsfwKnob = document.getElementById('nsfw-knob');
    const nsfwSetting = document.getElementById('nsfw-setting');
    
    // 检查地区限制 (通过 Netlify Edge Function)
    try {
        const res = await fetch('/api/ipinfo');
        const data = await res.json();
        if (!data.restrictedRegions.includes(data.country)) {
            nsfwSetting.classList.remove('hidden');
            nsfwSetting.classList.add('flex');
        }
    } catch (e) {
        console.log("Region check skipped");
    }

    let isEnabled = localStorage.getItem('nsfw_enabled') === 'true';
    updateNSFWUI(isEnabled);

    nsfwToggle.addEventListener('click', () => {
        isEnabled = !isEnabled;
        localStorage.setItem('nsfw_enabled', isEnabled);
        updateNSFWUI(isEnabled);
        // 重新渲染文章列表以应用过滤
        loadPosts().then(renderPosts);
    });

    function updateNSFWUI(enabled) {
        if (enabled) {
            nsfwToggle.classList.remove('bg-zinc-200', 'dark:bg-zinc-700');
            nsfwToggle.classList.add('bg-red-500');
            nsfwKnob.style.transform = 'translateX(20px)';
        } else {
            nsfwToggle.classList.add('bg-zinc-200', 'dark:bg-zinc-700');
            nsfwToggle.classList.remove('bg-red-500');
            nsfwKnob.style.transform = 'translateX(0)';
        }
    }
}

// ====================== 悬浮按钮拖拽修复 (核心修复点) ======================
function makeDraggable() {
    const btn = document.getElementById('menu-toggle');
    if (!btn) return;

    let isDragging = false;
    let startX, startY;
    let initialX, initialY;

    // 触摸开始：拦截并阻止默认行为，防止触发下拉刷新
    btn.addEventListener('touchstart', (e) => {
        // 关键：阻止事件冒泡到 body，防止触发浏览器原生的下拉刷新动作
        if (e.cancelable) e.preventDefault(); 
        
        isDragging = true;
        hasDragged = false;
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        
        const rect = btn.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        btn.style.transition = 'none';
        btn.style.zIndex = '1000';
    }, { passive: false });

    // 触摸移动：强制拦截，确保只移动按钮，不滚动页面
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        // 关键：阻止拖动按钮时页面跟随滚动
        if (e.cancelable) e.preventDefault();

        const touch = e.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            hasDragged = true;
        }

        let newX = initialX + dx;
        let newY = initialY + dy;

        // 边界检测
        const padding = 16;
        newX = Math.max(padding, Math.min(window.innerWidth - btn.offsetWidth - padding, newX));
        newY = Math.max(padding, Math.min(window.innerHeight - btn.offsetHeight - padding, newY));

        btn.style.left = `${newX}px`;
        btn.style.top = `${newY}px`;
        btn.style.right = 'auto';
        btn.style.bottom = 'auto';
    }, { passive: false });

    // 触摸结束：恢复吸附逻辑
    document.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        btn.style.transition = 'all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
        
        const rect = btn.getBoundingClientRect();
        // 自动吸附至最近的左右边缘
        if (rect.left + btn.offsetWidth / 2 < window.innerWidth / 2) {
            btn.style.left = '16px';
        } else {
            btn.style.left = `${window.innerWidth - btn.offsetWidth - 16}px`;
        }
    });

    // 处理点击：如果是拖拽产生位移，则不触发菜单切换
    btn.addEventListener('click', (e) => {
        if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        toggleMenu();
    });
}

// ====================== 文章加载与渲染 ======================
async function loadPosts() {
    try {
        const res = await fetch('data/posts.json');
        return await res.json();
    } catch (e) {
        console.error("Failed to load posts");
        return [];
    }
}

function renderPosts(posts) {
    const grid = document.getElementById('post-grid');
    if (!grid) return;

    const isNSFWEnabled = localStorage.getItem('nsfw_enabled') === 'true';
    const filtered = posts.filter(post => !post.nsfw || isNSFWEnabled);

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-20 text-zinc-400">这里暂时空空如也...</p>`;
        return;
    }

    grid.innerHTML = filtered.map(post => `
        <a href="post.html?slug=${post.slug}" class="card block relative">
            ${post.nsfw ? '<span class="absolute top-4 right-4 text-[10px] font-bold text-red-500 border border-red-500 px-1.5 py-0.5 rounded tracking-tighter">18+</span>' : ''}
            <div class="date">${post.date}</div>
            <div class="title">${post.title}</div>
            <p class="text-zinc-400 dark:text-zinc-500 text-[14px] leading-relaxed mt-4 line-clamp-3">${post.excerpt}</p>
        </a>
    `).join('');
}

// ====================== 初始化启动 ======================
window.onload = async function() {
    // 1. 主题初始化
    if (localStorage.theme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }

    // 2. 数据与时间逻辑
    await loadGreetings();
    updateBeijingTime();
    setInterval(updateBeijingTime, 1000);
    
    // 3. 功能组件初始化
    await initNSFWLogic();
    const posts = await loadPosts();
    renderPosts(posts);
    
    // 4. 交互逻辑
    makeDraggable();
    document.getElementById('menu-close').addEventListener('click', closeMenu);

    // 5. 点击外部关闭菜单
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('theme-menu');
        const btn = document.getElementById('menu-toggle');
        if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
            closeMenu();
        }
    });
};
