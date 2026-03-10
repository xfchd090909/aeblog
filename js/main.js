// ====================== 提示词库 ======================
let greetings = {};

// 加载提示词库
async function loadGreetings() {
    try {
        const res = await fetch('data/greetings.json');
        greetings = await res.json();
        console.log('✅ 提示词库加载成功');
    } catch (e) {
        console.error('❌ 提示词库加载失败，请确认 data/greetings.json 存在于根目录');
    }
}

// ====================== 时间段判断（全天覆盖） ======================
function getPeriodKey(hour) {
    const h = parseInt(hour);
    if (h >= 7 && h <= 11) return "07";   // 早上 7:00-11:59
    if (h >= 12 && h <= 17) return "12";  // 中午 12:00-17:59
    if (h >= 18 && h <= 21) return "18";  // 傍晚 18:00-21:59
    return "22";                          // 深夜 22:00-次日 06:59
}

// ====================== 实时北京时间（趣味化） ======================
let currentQuote = '';   // 缓存当前文字，让同一时间段内保持稳定

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
    
    let timeStr = now.toLocaleString('zh-CN', options).replace(/\//g, '-');
    const [datePart, timePart] = timeStr.split(' ');
    const hour = timePart.split(':')[0];   // 如 "08"

    const periodKey = getPeriodKey(hour);
    
    console.log(`🕒 北京时间 ${timePart} | 区间: ${periodKey}`);

    // 如果时间段变化或首次加载，则随机新文字
    if (!currentQuote || periodKey !== getPeriodKey(new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour: '2-digit'}).split(':')[0])) {
        if (greetings[periodKey] && greetings[periodKey].length > 0) {
            const randomIndex = Math.floor(Math.random() * greetings[periodKey].length);
            currentQuote = greetings[periodKey][randomIndex];
        }
    }

    if (currentQuote) {
        timeEl.textContent = `( {currentQuote}： ){datePart} ${timePart}`;
        console.log(`🎉 显示趣味文字: ${currentQuote}`);
    } else {
        timeEl.textContent = `${datePart} ${timePart}`;
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
