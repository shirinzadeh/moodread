export default defineNuxtRouteMiddleware((to) => {
	const user = useSupabaseUser();

	if (!user && to.path !== '/login') {
		return navigateTo('/login');
	}

	// If the user is logged in and trying to access the login page, redirect to homepage
	if (user.value && to.path === '/login') {
		return navigateTo('/', { replace: true });
	}
});
