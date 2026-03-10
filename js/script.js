// Tailwind 已通过 CDN 加载，无需额外配置

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
            // 可选：刷新页面或直接显示内容
        } else {
            document.getElementById('verify-error').textContent = '验证失败，请重试';
            document.getElementById('verify-error').classList.remove('hidden');
        }
    } catch (e) {
        document.getElementById('verify-error').textContent = '网络错误，请稍后重试';
        document.getElementById('verify-error').classList.remove('hidden');
    }
}

// ====================== 页面加载时检查验证 ======================
function checkVerification() {
    if (!hasValidToken()) {
        const overlay = document.getElementById('verify-overlay');
        overlay.classList.remove('hidden');
        
        // 动态插入 Turnstile（确保每次都新鲜）
        const container = document.getElementById('turnstile-container');
        container.innerHTML = `
            <div class="cf-turnstile" 
                 data-sitekey="0x4AAAAAABuV_6cPPwlj1VPo"
                 data-theme="dark"
                 data-callback="onTurnstileSuccess">
            </div>`;
    }
}

// ====================== 文章数据与渲染 ======================
const posts = [
    {
        id: 1,
        title: "2025 年 AI 前端开发趋势",
        excerpt: "从 React Server Components 到 AI 辅助编程，这一年我们看到了什么？",
        content: "<p>2025 年，AI 已深度融入前端工作流……（此处可放完整文章）</p><p>欢迎留言讨论！</p>",
        date: "2025-03-01"
    },
    {
        id: 2,
        title: "Tailwind CSS 高级技巧分享",
        excerpt: "如何用 Tailwind 打造极致美观且可维护的组件库",
        content: "<p>本文将分享 10 个鲜为人知的 Tailwind 高级用法……</p>",
        date: "2025-02-15"
    },
    {
        id: 3,
        title: "Netlify + Cloudflare Turnstile 实战",
        excerpt: "静态站点如何实现安全人机验证？完整代码已奉上",
        content: "<p>这正是你现在看到的页面实现原理！</p>",
        date: "2025-02-01"
    }
];

function renderPosts() {
    const grid = document.getElementById('post-grid');
    grid.innerHTML = posts.map(post => `
        <div onclick="openPost(${post.id})" class="card bg-zinc-900 rounded-3xl overflow-hidden cursor-pointer border border-zinc-800">
            <div class="h-56 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                <span class="text-6xl">📝</span>
            </div>
            <div class="p-6">
                <div class="text-xs text-violet-400 mb-2">${post.date}</div>
                <h3 class="text-xl font-semibold mb-3 line-clamp-2">${post.title}</h3>
                <p class="text-zinc-400 text-sm line-clamp-3">${post.excerpt}</p>
            </div>
        </div>
    `).join('');
}

function openPost(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    
    document.getElementById('modal-title').textContent = post.title;
    document.getElementById('modal-content').innerHTML = post.content;
    document.getElementById('post-modal').classList.remove('hidden');
    document.getElementById('post-modal').classList.add('flex');
}

function closeModal() {
    const modal = document.getElementById('post-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// ====================== 初始化 ======================
window.onload = function() {
    // 初始化 Tailwind（CDN 已就绪）
    renderPosts();
    checkVerification();
    
    // 防止用户通过控制台直接关闭遮罩（增加一点摩擦）
    console.log('%c欢迎来到 XFCHD 的个人博客 👋', 'color:#a5b4fc; font-size:13px');
};
