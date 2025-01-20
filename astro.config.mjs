import MillionLint from '@million/lint';
// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

export default defineConfig({
	server: {
		port: 3000,
	},
	integrations: [react(), tailwind({ applyBaseStyles: false }), MillionLint.astro({})],
	env: {
		schema: {
			PORT: envField.number({ context: 'server', access: 'public', default: 3000 }),
			APPNAME: envField.string({ context: 'server', access: 'public', default: 'Amoeba' }),
		},
	},
	output: 'server',
	plugins: [
		MillionLint.vite({
			enabled: true,
		}),
	],
});
