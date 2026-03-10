// ====================== 提示词库（从独立文件读取） ======================
let greetings = {};

// 加载提示词库
async function loadGreetings() {
    try {
        const res = await fetch('data/greetings.json');
        greetings = await res.json();
    } catch (e) {
        console.error('提示词库加载失败，使用默认北京时间');
    }
}

// ====================== 实时北京时间（带趣味替换） ======================
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
    timeStr = timeStr.replace(/\//g, '-');           // 统一横线格式
    const [datePart, timePart] = timeStr.split(' '); // 分离日期和时间
    
    // 精确匹配整点秒（07:00:00、12:00:00、18:00:00、22:00:00）
    if (greetings[timePart] && greetings[timePart].length > 0) {
        // 随机挑选一条（每次刷新/每秒都会重新随机 → 不同文字）
        const randomIndex = Math.floor(Math.random() * greetings[timePart].length);
        const quote = greetings[timePart][randomIndex];
        timeEl.textContent = `\( {quote}： \){datePart} ${timePart}`;
    } else {
        // 普通时间显示
        timeEl.textContent = `北京时间：${datePart} ${timePart}`;
    }
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
    // 加载提示词库
    await loadGreetings();
    
    // 立即显示时间
    updateBeijingTime();
    
    // 每秒更新（精确到秒触发趣味替换）
    setInterval(updateBeijingTime, 1000);
    
    // 加载文章
    const posts = await loadPosts();
    renderPosts(posts);
};
