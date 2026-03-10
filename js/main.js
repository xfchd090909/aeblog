async function loadPosts() {
    const res = await fetch('data/posts.json');
    return await res.json();
}

function renderPosts(posts) {
    const grid = document.getElementById('post-grid');
    grid.innerHTML = posts.map(post => `
        <a href="post.html?slug=${post.slug}" class="card block bg-zinc-900 p-8 group">
            <div class="text-xs text-[#0068B5] mb-4">${post.date}</div>
            <h3 class="text-2xl font-serif tracking-normal mb-4 group-hover:text-[#0068B5] transition">${post.title}</h3>
            <p class="text-zinc-400 text-[15px] leading-relaxed">${post.excerpt}</p>
        </a>
    `).join('');
}

window.onload = async () => {
    const posts = await loadPosts();
    renderPosts(posts);
};
