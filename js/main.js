// ====================== 提示词库（从独立文件读取） ======================
let greetings = {};

// 加载提示词库
async function loadGreetings() {
    try {
        const res = await fetch('data/greetings.json');   // 相对路径，更稳定
        greetings = await res.json();
        console.log('✅ 提示词库加载成功，包含时间段：', Object.keys(greetings));
        console.log('📚 完整提示词库内容：', greetings);
    } catch (e) {
        console.error('❌ 提示词库加载失败，请检查 data/greetings.json 是否存在');
    }
}

// ====================== 实时北京时间（带趣味替换） ======================
function updateBeijingTime() {
    const timeEl = document.getElementById('beijing-time');
    const now = new Date();
    
    // 获取北京时间字符串（强制使用北京时区）
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
    const [datePart, timePart] = timeStr.split(' ');   // datePart=日期, timePart=HH:mm:ss
    
    // 关键修复：从北京时间字符串中提取小时（不再用本地 getHours()）
    const beijingHour = timePart.split(':')[0];   // 例如 "07"
    
    console.log(`🕒 当前北京时间：\( {timePart} | 提取小时： \){beijingHour}`);
    
    if (greetings[beijingHour] && greetings[beijingHour].length > 0) {
        const randomIndex = Math.floor(Math.random() * greetings[beijingHour].length);
        const quote = greetings[beijingHour][randomIndex];
        timeEl.textContent = `\( {quote}： \){datePart} ${timePart}`;
        console.log(`🎉 匹配到趣味时间段 \( {beijingHour} → 显示 " \){quote}"`);
    } else {
        timeEl.textContent = `北京时间：${datePart} ${timePart}`;
        console.log('ℹ️ 普通时间段，不显示趣味文字');
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
