import { fileURLToPath } from 'node:url';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Unocss from 'unocss/vite';

const postcssConfig = fileURLToPath(new URL('./postcss.config.js', import.meta.url));

export default defineConfig({
	plugins: [sveltekit(), Unocss()],
	css: {
		postcss: postcssConfig,
	},
	server: {
		port: 5174,
		strictPort: true,
	},
});