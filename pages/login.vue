<template>
  <div class="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div class="w-full max-w-md p-8 space-y-6 bg-gray-50 dark:bg-gray-800 shadow-lg rounded-lg">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Moodreads</h1>
      <form @submit.prevent="handleLoginOrSignUp" class="space-y-4">
        <input v-model="email" type="email" placeholder="Enter your email" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300" />
        <button type="submit" :disabled="loading" class="w-full px-4 py-2 text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300">
          {{ loading ? 'Sending...' : 'Send Magic Link' }}
        </button>
      </form>
      <div v-if="message" class="text-gray-600 dark:text-gray-400">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
const email = ref('');
const message = ref('');
const loading = ref(false);
const client = useSupabaseClient();
const router = useRouter();

const handleLoginOrSignUp = async () => {
  loading.value = true;
  try {
    const defaultPassword = '123456'; // Default password

    // Attempt to sign up the user
    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email: email.value,
      password: defaultPassword,
    });
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        // If the user already exists, sign them in
        const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
          email: email.value,
          password: defaultPassword,
        });
        if (signInError) throw signInError;
        if (signInData.user) {
          router.push('/'); // Redirect after successful sign-in
        }
      } else {
        throw signUpError;
      }
    } else if (signUpData.user) {
      // Automatically sign in the user after sign-up
      router.push('/'); // Redirect after successful sign-up
    }

  } catch (err) {
    message.value = `Error: ${err.message}`;
  } finally {
    loading.value = false;
  }
};
</script>