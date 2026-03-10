// ====================== 提示词库 ======================
let greetings = {};

// 全局缓存：让同一时间段内文字保持不变
let currentQuote = '';
let lastPeriod = '';

// 加载提示词库
async function loadGreetings() {
    try {
        const res = await fetch('data/greetings.json');
        greetings = await res.json();
    } catch (e) {
        // 静默失败，不影响页面
    }
}

// ====================== 时间段判断 ======================
function getPeriodKey(hour) {
    const h = parseInt(hour);
    if (h >= 7 && h <= 11) return "07";
    if (h >= 12 && h <= 17) return "12";
    if (h >= 18 && h <= 21) return "18";
    return "22";
}

// ====================== 实时北京时间（趣味化） ======================
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
        
        // 只有时间段变化或首次加载时才随机新文字
        if (periodKey !== lastPeriod || !currentQuote) {
            if (greetings[periodKey] && greetings[periodKey].length > 0) {
                const randomIndex = Math.floor(Math.random() * greetings[periodKey].length);
                currentQuote = greetings[periodKey][randomIndex];
            }
            lastPeriod = periodKey;
        }
        
        if (currentQuote) {
            timeEl.textContent = currentQuote + '：' + datePart + ' ' + timePart;
        } else {
            timeEl.textContent = datePart + ' ' + timePart;
        }
    } catch (e) {
        // 静默处理，防止任何意外
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
};
