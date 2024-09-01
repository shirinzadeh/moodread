// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-04-03',
	devtools: { enabled: true },
	modules: ['@nuxtjs/supabase', '@nuxt/ui', '@nuxt/image', '@nuxt/eslint', 'nuxt-swiper'],
	css: [
		'swiper/css',
		'swiper/css/pagination',
	],
	swiper: {
		// Only import the modules you need
		modules: ['pagination', 'autoplay'],
		// Use CSS instead of SCSS for smaller file size
		styleLang: 'css',
	},

	// Nuxt 3 build optimizations
	nitro: {
		prerender: {
			crawlLinks: true,
			routes: ['/'],
		},
	},

	build: {
		transpile: ['swiper'],
	},

	vite: {
		optimizeDeps: {
			include: ['swiper', 'swiper/vue'],
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						swiper: ['swiper', 'swiper/vue'],
					},
				},
			},
		},
	},

	// Nuxt 3 performance optimizations
	// experimental: {
	// 	payloadExtraction: true,
	// 	inlineSSRStyles: false,
	// 	renderJsonPayloads: true,
	// },
	eslint: {
		config: {
			stylistic: {
				indent: 'tab',
				semi: true,
				// ...
			},
		},
	},
	supabase: {
		url: process.env.SUPABASE_URL,
		key: process.env.SUPABASE_KEY,
		redirectOptions: {
			login: '/login',
			callback: '/',
			include: undefined,
			exclude: [],
			cookieRedirect: false,
		},

	},
});
