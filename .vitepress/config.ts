import { defineConfig } from 'vitepress'
import {webMenu} from './menu/web'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "xm-blog",
  description: "AllCode",
  base:'./',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' }
    ],

    sidebar:{
        '/web/':[
            ...webMenu,
        ],
        '/server/':[
            ...webMenu,
        ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
