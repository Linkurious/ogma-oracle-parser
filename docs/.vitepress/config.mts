import { DefaultTheme, defineConfig } from 'vitepress';
import fs from 'fs/promises';

// recursively go into input dir and create a vitepress sidebar config
function createSidebar(dir) {
  return fs.readdir(dir, { withFileTypes: true })
    .then(files => {
      const promises = files.map(file => {
        if (file.isDirectory()) {
          return createSidebar(`${dir}/${file.name}`);
        } else if (file.name.endsWith('.md')) {
          return {
            text: file.name.replace('.md', ''),
            link: `${dir.replace('docs/', '')}/${file.name.replace('.md', '')}`,
          };
        }
      });
      return Promise.all(promises);
    })
    .then(res => {
      return res.filter(r => r);
    });
}
const classes = await createSidebar('docs/api/classes');
// const interfaces = await createSidebar('docs/api/interfaces');
const sidebar: DefaultTheme.Sidebar = {
  'api/': [
    {
      text: 'OgmaOracleParser',
      link: 'api/classes/OgmaOracleParser'
    },
    {
      text: 'Types',
      link: 'api/modules'
    },
  ],
};
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "ogma-oracle-parser",
  description: "Seamless communication between Ogma and Oracle Property Graphs",
  head: [['link', { rel: 'icon', href: '/ogma-oracle-parser/favicon.ico' }]],
  base: '/ogma-oracle-parser/',
  themeConfig: {
    logo: '/logo-small.svg',
    nav: [
      { text: 'Getting started', link: '/getting-started' },
      { text: 'Example', link: '/example' },
      { text: 'API', link: '/api/classes/OgmaOracleParser' },

    ],
    sidebar,
    outline: {
      level: [2, 3]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Linkurious/ogma-oracle-graph-db' }
    ]
  }
});
