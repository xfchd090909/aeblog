async function loadPostData() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) {
        window.location.href = 'index.html';
        return;
    }

    const postsRes = await fetch('../data/posts.json');
    const posts = await postsRes.json();
    const postMeta = posts.find(p => p.slug === slug);
    
    if (!postMeta) {
        document.getElementById('post-title').textContent = '文章不见了';
        return;
    }

    // 拦截逻辑：如果文章是 NSFW 但开关没开
    if (postMeta.nsfw && localStorage.getItem('nsfw_enabled') !== 'true') {
        document.getElementById('page-title').textContent = '访问受限';
        document.getElementById('post-title').textContent = '⚠️ 内容受限';
        document.getElementById('post-content').innerHTML = `
            <div class="p-8 bg-red-500/5 border border-red-500/20 rounded-2xl text-center">
                <p class="text-red-500 font-medium">此内容包含 NSFW 信息，已根据系统安全策略拦截。</p>
                <p class="text-zinc-500 text-sm mt-2">请确认您的地理位置是否受限，或在首页设置中开启访问权限。</p>
            </div>`;
        return;
    }

    document.getElementById('page-title').textContent = `${postMeta.title} - aeBlog`;
    document.getElementById('post-title').textContent = postMeta.title;
    document.getElementById('post-date').textContent = postMeta.date;

    try {
        const mdRes = await fetch(`../posts/${slug}.md`);
        const markdown = await mdRes.text();
        const html = marked.parse(markdown);
        document.getElementById('post-content').innerHTML = html;
        hljs.highlightAll();
    } catch(e) {
        document.getElementById('post-content').textContent = '内容加载失败';
    }
}

window.onload = loadPostData;
