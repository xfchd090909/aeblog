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

    document.getElementById('page-title').textContent = `${postMeta.title} - XFCHD`;
    document.getElementById('post-title').textContent = postMeta.title;
    document.getElementById('post-date').textContent = postMeta.date;

    const mdRes = await fetch(`../posts/${slug}.md`);
    const markdown = await mdRes.text();

    const html = marked.parse(markdown);
    document.getElementById('post-content').innerHTML = html;

    hljs.highlightAll();
}

window.onload = loadPostData;
