// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "@nuxt/ui", "@nuxt/image"],
  css: [
  ],
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/',
      include: undefined,
      exclude: [],
      cookieRedirect: false,
    }
  
  },
  runtimeConfig:{
    openaiSecret: process.env.NUXT_OPENAI_API_KEY
  }
})