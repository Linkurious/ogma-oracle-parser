import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "ogma-oracle-parser",
  description: "Seamless Ogma and Oracle Property Graph integration",
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    logo: '/logo-small.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Example', link: '/example' },
      { text: 'API', link: '/api' },

    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Linkurious/ogma-oracle-graph-db' }
    ]
  }
});
