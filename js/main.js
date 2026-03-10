// ====================== 实时北京时间 ======================
function updateBeijingTime() {
    const timeEl = document.getElementById('beijing-time');
    
    const formatter = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(new Date());
    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;
    const second = parts.find(p => p.type === 'second').value;
    
    // 显示格式：2025-03-10 09:10:45
    timeEl.textContent = `\( {year}- \){month}-${day} \( {hour}: \){minute}:${second}`;
}

// 每秒更新一次
setInterval(updateBeijingTime, 1000);

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
    // 初始化时间（立即显示）
    updateBeijingTime();
    
    // 加载文章
    const posts = await loadPosts();
    renderPosts(posts);
};
