import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: '../../../public/cv-builder-app',
			assets: '../../../public/cv-builder-app',
			fallback: 'index.html',
			precompress: false,
			strict: false,
		}),
		paths: {
			base: '/cv-builder-app',
		},
	},
};

export default config;
