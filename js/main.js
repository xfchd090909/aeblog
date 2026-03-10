// ====================== 实时北京时间（已彻底修复） ======================
function updateBeijingTime() {
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
    
    let timeStr = now.toLocaleString('zh-CN', options);
    // 统一格式：把斜杠替换为横线（兼容不同浏览器）
    timeStr = timeStr.replace(/\//g, '-');
    
    timeEl.textContent = `北京时间：${timeStr}`;
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
            <p class="text-zinc-400 text-[15px] leading-relaxed mt-4">${post.excerpt}</p>
        </a>
    `).join('');
}

// ====================== 初始化 ======================
window.onload = async () => {
    // 立即显示一次时间
    updateBeijingTime();
    
    // 每秒自动更新
    setInterval(updateBeijingTime, 1000);
    
    // 加载文章列表
    const posts = await loadPosts();
    renderPosts(posts);
};
