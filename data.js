// 年龄分级：适合全年龄、需要监护人指导、不适合工作场景
const blogData = [
{
    id: 1,
    filename: "post2.md",
    title: "深度技术解析：渲染引擎",
    date: "2026-03-03",
    content: "",
    tag: "适合全年龄"
  },
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

