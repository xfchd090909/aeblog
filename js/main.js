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
        requestAnimationFrame(() => setTimeout(checkCompactMode, 20));
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

// ====================== 文章列表 + 弹性蓝条动画 ======================
async function loadPosts() {
    const res = await fetch('data/posts.json');
    return await res.json();
}

function renderPosts(posts) {
    const grid = document.getElementById('post-grid');
    grid.innerHTML = posts.map(post => `
        <div class="card block" data-slug="${post.slug}">
            <div class="date">${post.date}</div>
            <div class="title">${post.title}</div>
            <p class="text-zinc-400 text-[15px] leading-relaxed mt-4">${post.excerpt}</p>
        </div>
    `).join('');

    // 为每个卡片绑定点击动画
    document.querySelectorAll('#post-grid .card').forEach(card => {
        card.addEventListener('click', function() {
            const slug = this.getAttribute('data-slug');
            
            // 添加动画类
            this.classList.add('animating');
            
            // 动画结束后跳转
            this.addEventListener('transitionend', function handler(e) {
                if (e.propertyName === 'transform' || e.propertyName === 'left') {
                    window.location.href = `post.html?slug=${slug}`;
                    this.removeEventListener('transitionend', handler);
                }
            });
        });
    });
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
};
