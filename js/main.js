// ====================== 提示词库 + 不重复机制 ======================
let greetings = {};
let currentQuote = '';
let lastPeriod = '';
let lastUsedQuote = '';   // 新增：记录上一句，避免重复

// 加载提示词库
async function loadGreetings() {
    try {
        const res = await fetch('data/greetings.json');
        greetings = await res.json();
    } catch (e) {}
}

// ====================== 时间段判断 ======================
function getPeriodKey(hour) {
    const h = parseInt(hour);
    if (h >= 7 && h <= 11) return "07";
    if (h >= 12 && h <= 17) return "12";
    if (h >= 18 && h <= 21) return "18";
    return "22";
}

// ====================== 实时北京时间（不重复 + 稳定） ======================
function updateBeijingTime() {
    try {
        const timeEl = document.getElementById('beijing-time');
        
        const now = new Date();
        const options = {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        let timeStr = now.toLocaleString('zh-CN', options).replace(/\//g, '-');
        const [datePart, timePart] = timeStr.split(' ');
        const hour = timePart.split(':')[0];
        
        const periodKey = getPeriodKey(hour);
        
        // 时间段变化或首次加载 → 随机新文字（避免与上一句重复）
        if (periodKey !== lastPeriod || !currentQuote) {
            if (greetings[periodKey] && greetings[periodKey].length > 0) {
                let newQuote;
                let attempts = 0;
                do {
                    const randomIndex = Math.floor(Math.random() * greetings[periodKey].length);
                    newQuote = greetings[periodKey][randomIndex];
                    attempts++;
                } while (newQuote === lastUsedQuote && attempts < 10);   // 最多尝试10次
                
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
        
        // 延迟多重检测布局（彻底解决不触发问题）
        requestAnimationFrame(() => {
            setTimeout(checkCompactMode, 20);
            setTimeout(checkCompactMode, 80);
        });
    } catch (e) {}
}

// ====================== 智能 compact 模式检测（已彻底稳定） ======================
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

// ====================== 文章列表 ======================
async function loadPosts() {
    const res = await fetch('data/posts.json');
    return await res.json();
}

function renderPosts(posts) {
    const grid = document.getElementById('post-grid');
    grid.innerHTML = posts.map(function(post) {
        return '<a href="post.html?slug=' + post.slug + '" class="card block">' +
               '<div class="date">' + post.date + '</div>' +
               '<div class="title">' + post.title + '</div>' +
               '<p class="text-zinc-400 text-[15px] leading-relaxed mt-4">' + post.excerpt + '</p>' +
               '</a>';
    }).join('');
}

// ====================== 初始化 ======================
window.onload = async function() {
    await loadGreetings();
    updateBeijingTime();
    setInterval(updateBeijingTime, 1000);
    
    const posts = await loadPosts();
    renderPosts(posts);
    
    // 监听窗口变化
    window.addEventListener('resize', () => {
        requestAnimationFrame(checkCompactMode);
    });
    
    // 初始多重检查
    setTimeout(checkCompactMode, 150);
    setTimeout(checkCompactMode, 400);
};
