import MillionLint from '@million/lint';
// @ts-check
import { defineConfig, envField } from 'astro/config';
import million from 'million/compiler';
import vercel from '@astrojs/vercel';

import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

export default defineConfig({
	server: {
		port: 3000,
	},
	integrations: [react(), tailwind({ applyBaseStyles: false })],
	env: {
		schema: {
			PORT: envField.number({ context: 'server', access: 'public', default: 3000 }),
			APPNAME: envField.string({ context: 'server', access: 'public', default: 'Amoeba' }),
		},
	},
	adapter: vercel({
		// webAnalytics: {
		// 	enabled: true
		// }
	}),
	output: 'server',
	// plugins: [
	// 	MillionLint.vite({
	// 		enabled: true,
	// 	}),
	// ],
	// vite: {
	// 	plugins: [MillionLint.vite({ enabled: true }), million.vite({ mode: 'react', server: false, auto: { threshold: 0 } })],
	// },
});
