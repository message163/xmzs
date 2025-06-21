import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Awesome Project",
  description: "A VitePress Site",
  base: '/',
  outDir: 'docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/markdown-examples' },
      { text: 'pages', link: '/page' }
    ],

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'long',
        timeStyle: 'short'
      }
    },
    search: {
      provider: 'local',
    },
    // 侧边栏
    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      },
      {
        text: 'hooks',
        items: [
          { text: 'useState', link: '/hooks/useState' },
        ]
      }
    ],
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'twitter', link: 'https://twitter.com/vuejs' }
    ]
  }
})
