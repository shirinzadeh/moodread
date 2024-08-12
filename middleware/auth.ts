export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSupabaseUser();
    console.log(user)

    if (!user && to.path !== '/login') {
        return navigateTo('/login');
    }

    // If the user is logged in and trying to access the login page, redirect to homepage
    if (user.value && to.path === '/login') {
        return navigateTo('/');
    }
});
