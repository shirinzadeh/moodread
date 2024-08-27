import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css'; // You can choose a different theme if you prefer

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.use(VueToast);
});
