// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import vue from '@astrojs/vue';
import { fileURLToPath } from 'node:url';

/**
 * Rehype plugin: converts <img src="*.mov|mp4|…"> nodes to <video> elements.
 * Needed because Astro 6 does not invoke the <Content components={{ img }}> override
 * for plain .md content-collection files — the img node is emitted as-is.
 */
function rehypeVideoFromImg() {
  function walk(node) {
    if (node.tagName === 'img') {
      const src = node.properties?.src
      if (typeof src === 'string' && /\.(mov|mp4|webm|ogg)$/i.test(src)) {
        node.tagName = 'video'
        node.properties = { src, controls: true, playsinline: true, loop: true, muted: true, class: 'prose-video' }
        node.children = []
      }
    }
    if (Array.isArray(node.children)) node.children.forEach(walk)
  }
  return (tree) => walk(tree)
}

export default defineConfig({
  adapter: cloudflare(),
  output: 'static',
  integrations: [vue()],
  markdown: {
    rehypePlugins: [rehypeVideoFromImg],
    shikiConfig: {
      theme: 'one-dark-pro',
      langs: ['js', 'ts', 'vue', 'html', 'css', 'scss', 'json', 'bash', 'sh'],
      wrap: false,
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Lets every .scss file do @use 'abstracts' as * without a relative path
          loadPaths: [fileURLToPath(new URL('./src/styles', import.meta.url))],
        },
      },
    },
  },
});
