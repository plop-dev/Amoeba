import MillionLint from '@million/lint';
// @ts-check
import path from 'path';
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
			APPNAME: envField.string({ context: 'client', access: 'public', default: 'Amoeba' }),
			TIPTAP_APPID: envField.string({ context: 'client', access: 'public', default: '7j9y6m10' }),
			PUBLIC_API_URL: envField.string({
				context: 'client',
				access: 'public',
				default: 'http://localhost:8000',
			}),
		},
	},
	adapter: vercel({
		// webAnalytics: {
		// 	enabled: true
		// }
	}),
	output: 'server',
	vite: {
		resolve: {
			alias: {
				'@': path.resolve(process.cwd(), 'src'),
			},
		},
		optimizeDeps: {
			force: true,
			exclude: ['lucide-react/dynamicIconImports', 'lucide-react/dynamic'],
			// include: ['lucide-react/dynamic'],
		},
		...(import.meta.env.PROD
			? {
					ssr: {
						noExternal: true,
					},
			  }
			: {}),

		// plugins: [MillionLint.vite({ enabled: true }), million.vite({ mode: 'react', server: false, auto: { threshold: 0 } })],
	},
});
