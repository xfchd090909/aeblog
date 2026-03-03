const blogData = [
  {
    id: 1,
    title: "探索极简主义设计",
    date: "2026-03-03",
    content: "极简主义不仅是一种审美选择，更是一种功能性的进步。通过减少视觉噪音，我们可以让用户更专注于核心内容。",
    tag: "适合全年龄"
  },
  {
    id: 2,
    title: "深度技术解析：渲染引擎",
    date: "2026-03-01",
    content: "本文将深入探讨现代浏览器如何处理复杂的CSS动画与层叠上下文。",
    tag: "适合全年龄"
  },
  {
    id: 3,
    title: "职场心理学：压力管理",
    date: "2026-02-25",
    content: "在快节奏加的办公环境中，保持心理健康是长期职业发展的关键。",
    tag: "不适合工作场景"
  },
  {
    id: 4,
    title: "特殊内容回顾",
    date: "2026-02-20",
    content: "此处为需要特定指导查看的内容。",
    tag: "需要监护人指导"
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
        { id: "nsfw_filter", label: "显示 NSFW 内容", type: "toggle" }
      ]
    }
  ]
};
