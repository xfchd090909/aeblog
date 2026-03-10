// ====================== 提示词库（从独立文件读取） ======================
let greetings = {};

// 加载提示词库
async function loadGreetings() {
    try {
        const res = await fetch('/data/greetings.json');   // 使用根路径，确保加载
        greetings = await res.json();
        console.log('提示词库加载成功');
    } catch (e) {
        console.error('提示词库加载失败');
    }
}

// ====================== 实时北京时间（按小时段趣味替换） ======================
function updateBeijingTime() {
    const timeEl = document.getElementById('beijing-time');
    const now = new Date();
    
    // 获取北京时间
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
    
    // 按小时匹配（07、12、18、22 任意分钟秒都生效）
    const currentHour = String(now.getHours()).padStart(2, '0');   // 强制两位数
    
    console.log(`当前北京小时: ${currentHour} | 完整时间: ${timePart}`);
    
    if (greetings[currentHour] && greetings[currentHour].length > 0) {
        const randomIndex = Math.floor(Math.random() * greetings[currentHour].length);
        const quote = greetings[currentHour][randomIndex];
        timeEl.textContent = `\( {quote}： \){datePart} ${timePart}`;
        console.log(`🎉 匹配到趣味时间段: \( {currentHour} → 显示 " \){quote}"`);
    } else {
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
    await loadGreetings();
    updateBeijingTime();
    setInterval(updateBeijingTime, 1000);
    
    const posts = await loadPosts();
    renderPosts(posts);
};
