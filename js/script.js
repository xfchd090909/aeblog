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

// ====================== 动态加载 Turnstile 配置 ======================
let turnstileSiteKey = null;

async function loadTurnstileConfig() {
    try {
        const res = await fetch('/.netlify/functions/config');
        const data = await res.json();
        turnstileSiteKey = data.siteKey;
        return true;
    } catch (e) {
        console.error('无法获取 Turnstile 配置');
        return false;
    }
}

// ====================== Turnstile 验证 ======================
let currentToken = null;

window.onTurnstileSuccess = function(token) {
    currentToken = token;
    document.getElementById('verify-error').classList.add('hidden');
    verifyWithServer(token);
};

async function verifyWithServer(token) {
    try {
        const res = await fetch('/.netlify/functions/verify-turnstile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json();
        
        if (data.success) {
            setCookie('cf_verified', 'true', 1);  // 1小时有效
            document.getElementById('verify-overlay').classList.add('hidden');
        } else {
            document.getElementById('verify-error').textContent = '验证失败，请重试';
            document.getElementById('verify-error').classList.remove('hidden');
        }
    } catch (e) {
        document.getElementById('verify-error').textContent = '网络错误，请稍后重试';
        document.getElementById('verify-error').classList.remove('hidden');
    }
}

// ====================== 渲染 Turnstile ======================
function renderTurnstile() {
    if (!turnstileSiteKey) return;
    const container = document.getElementById('turnstile-container');
    container.innerHTML = `
        <div class="cf-turnstile" 
             data-sitekey="${turnstileSiteKey}"
             data-theme="dark"
             data-callback="onTurnstileSuccess">
        </div>`;
}

// ====================== 检查验证 ======================
async function checkVerification() {
    if (hasValidToken()) return;

    const overlay = document.getElementById('verify-overlay');
    overlay.classList.remove('hidden');

    const loaded = await loadTurnstileConfig();
    if (loaded) {
        renderTurnstile();
    } else {
        document.getElementById('verify-error').textContent = '加载验证组件失败，请刷新重试';
    }
}

// ====================== 文章数据与渲染（不变） ======================
// （此处保留您之前的 posts 数组、renderPosts、openPost、closeModal 函数）

const posts = [ /* 您的三篇文章数据保持不变 */ ];

function renderPosts() {
    // ...（与之前完全相同）
}

function openPost(id) { /* 与之前相同 */ }
function closeModal() { /* 与之前相同 */ }

// ====================== 初始化 ======================
window.onload = async function() {
    renderPosts();
    await checkVerification();   // 改为 async 调用
    
    console.log('%c欢迎来到 XFCHD 的个人博客 👋', 'color:#a5b4fc; font-size:13px');
};
