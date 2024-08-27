<template>
	<div class="container mx-auto mt-10 px-4">
		<UCard class="max-w-md mx-auto">
			<template #header>
				<h1 class="text-2xl font-bold">
					{{ isLogin ? 'Sign In' : 'Sign Up' }}
				</h1>
			</template>

			<UForm :state="formData" @submit="handleSubmit">
				<UFormGroup label="Email" name="email">
					<UInput
						v-model="formData.email"
						type="email"
						placeholder="Enter your email"
					/>
				</UFormGroup>

				<UFormGroup label="Password" name="password">
					<UInput
						v-model="formData.password"
						type="password"
						placeholder="Enter your password"
					/>
				</UFormGroup>

				<template v-if="!isLogin">
					<UFormGroup label="Username" name="username">
						<UInput v-model="formData.username" placeholder="Choose a username" />
					</UFormGroup>
				</template>

				<UButton
					type="submit"
					color="primary"
					class="justify-center w-full mt-4"
					:loading="loading"
				>
					{{ isLogin ? 'Sign In' : 'Sign Up' }}
				</UButton>
			</UForm>

			<div class="mt-4 text-center">
				<UButton variant="link" @click="toggleAuthMode">
					{{ isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In' }}
				</UButton>
			</div>
		</UCard>
	</div>
</template>

<script setup>
definePageMeta({
	middleware: 'auth',
});

const supabase = useSupabaseClient();
const router = useRouter();

const isLogin = ref(true);
const loading = ref(false);
const formData = reactive({
	email: '',
	password: '',
	username: '',
});

const toggleAuthMode = () => {
	isLogin.value = !isLogin.value;
	formData.email = '';
	formData.password = '';
	formData.username = '';
};

const handleSubmit = async () => {
	loading.value = true;
	try {
		if (isLogin.value) {
			const { error } = await supabase.auth.signInWithPassword({
				email: formData.email,
				password: formData.password,
			});

			if (error) throw error;

			showToastSuccess('Signed in successfully!');
			router.push('/'); // Redirect to home page
		}
		else {
			// Sign Up
			const { data: authData, error: authError } = await supabase.auth.signUp({
				email: formData.email,
				password: formData.password,
				options: {
					data: {
						username: formData.username,
					},
				},
			});

			if (authError) throw authError;

			if (authData.user) {
				// Insert the user into the users table
				const { error: dbError } = await supabase
					.from('users')
					.insert({
						id: authData.user.id,
						email: authData.user.email,
						username: formData.username,
					});

				if (dbError) throw dbError;

				showToastSuccess('Signed up successfully!');
				router.push('/');
			}
		}
	}
	catch (error) {
		showToastError(error.message || 'An error occurred during authentication.');
	}
	finally {
		loading.value = false;
	}
};
</script>
