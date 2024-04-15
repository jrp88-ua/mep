import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { paraglide } from '@inlang/paraglide-js-adapter-sveltekit/vite';

export default defineConfig({
	plugins: [
		paraglide({
			project: './project.inlang',
			outdir: './src/paraglide'
		}),
		sveltekit(),
		purgeCss()
	],
	test: {
		environment: 'jsdom'
	}
});
