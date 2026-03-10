// 文章元数据
async function loadPosts() {
    const res = await fetch('data/posts.json');
    return await res.json();
}

function renderPosts(posts) {
    const grid = document.getElementById('post-grid');
    grid.innerHTML = posts.map(post => `
        <a href="post.html?slug=${post.slug}" class="card block bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
            <div class="h-56 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-6xl text-violet-400/30">
                ✍️
            </div>
            <div class="p-6">
                <div class="text-xs text-violet-400 mb-2">${post.date}</div>
                <h3 class="text-xl font-semibold mb-3 line-clamp-2">${post.title}</h3>
                <p class="text-zinc-400 text-sm line-clamp-3">${post.excerpt}</p>
            </div>
        </a>
    `).join('');
}

// 初始化
window.onload = async () => {
    const posts = await loadPosts();
    renderPosts(posts);
};
