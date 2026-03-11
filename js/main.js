// ====================== Cookie 操作 ======================
function setCookie(name, value, hours) {
    const date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    document.cookie = `\( {name}= \){value}; expires=${date.toUTCString()}; path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function hasValidToken() {
    return getCookie('cf_verified') === 'true';
}

// ====================== Turnstile 配置（动态从 Netlify 变量读取） ======================
let turnstileSiteKey = null;

async function loadTurnstileConfig() {
    console.log('🔧 正在从 Netlify 获取 sitekey...');
    try {
        const res = await fetch('/.netlify/functions/config');
        const data = await res.json();
        turnstileSiteKey = data.siteKey;
        console.log('✅ sitekey 加载成功');
        return true;
    } catch (e) {
        console.error('❌ 获取 sitekey 失败', e);
        return false;
    }
}

// ====================== Turnstile 验证 ======================
window.onTurnstileSuccess = function(token) {
    console.log('✅ Turnstile 验证成功');
    document.getElementById('verify-error').classList.add('hidden');
    verifyWithServer(token);
};

async function verifyWithServer(token) {
    console.log('🔧 正在服务端验证...');
    try {
        const res = await fetch('/.netlify/functions/verify-turnstile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json();
        console.log('服务端返回:', data);
        
        if (data.success) {
            setCookie('cf_verified', 'true', 1);
            document.getElementById('verify-overlay').classList.add('hidden');
            console.log('🎉 验证通过，已设置 1 小时 Cookie');
        } else {
            document.getElementById('verify-error').textContent = '验证失败，请重试';
            document.getElementById('verify-error').classList.remove('hidden');
        }
    } catch (e) {
        console.error('❌ 服务端验证出错', e);
        document.getElementById('verify-error').textContent = '网络错误，请重试';
        document.getElementById('verify-error').classList.remove('hidden');
    }
}

function renderTurnstile() {
    if (!turnstileSiteKey) return;
    const container = document.getElementById('turnstile-container');
    container.innerHTML = `
        <div class="cf-turnstile" 
             data-sitekey="${turnstileSiteKey}"
             data-theme="dark"
             data-callback="onTurnstileSuccess"
             data-retry="auto"></div>`;
    console.log('🎨 Turnstile 已渲染');
}

// ====================== 检查验证（强制弹出调试模式） ======================
async function checkVerification() {
    console.log('🔧 开始检查验证...');
    // 调试模式：强制显示（测试通过后删除下面这行即可恢复正常逻辑）
    console.log('🧪 调试模式：强制弹出验证窗口');
    const overlay = document.getElementById('verify-overlay');
    overlay.classList.remove('hidden');

    const loaded = await loadTurnstileConfig();
    if (loaded) {
        renderTurnstile();
    } else {
        document.getElementById('verify-error').textContent = '函数加载失败，请检查 Netlify Functions 是否部署成功';
        document.getElementById('verify-error').classList.remove('hidden');
    }
}

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
    
    window.addEventListener('resize', () => requestAnimationFrame(checkCompactMode));
    setTimeout(checkCompactMode, 150);
    setTimeout(checkCompactMode, 400);

    // 启动 Cloudflare Turnstile
    checkVerification();
};
