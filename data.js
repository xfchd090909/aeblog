const blogData = [
  {
    id: 1,
    filename: "post1.md",                    // ← 对应 posts/post1.md
    title: "探索极简主义设计",
    date: "2026-03-03",
    content: "",                             // 留空，实际内容从 .md 文件加载
    tag: "适合全年龄"
  }
];

const settingsData = {
  title: "偏好设置",
  categories: [
    {
      id: "appearance",
      title: "外观管理",
      options: [
        { id: "dark_mode", label: "深色模式", type: "theme-toggle" }
      ]
    },
    {
      id: "content",
      title: "内容管理",
      options: [
        { id: "parental_filter", label: "显示需要监护人指导的内容", type: "toggle" },
        { id: "nsfw_filter", label: "显示 NSFW 内容", type: "toggle" }
      ]
    }
  ]
};



