<template>
	<header class="bg-gray-800 text-white py-4 shadow-md">
		<div class="container mx-auto flex justify-between items-center">
			<NuxtLink
				to="/"
				class="text-2xl font-bold"
			>
				Moodread
			</NuxtLink>
			<nav>
				<ul
					v-if="user"
					class="flex items-center space-x-4"
				>
					<li>
						<NuxtLink
							to="/"
							class="hover:text-gray-300"
						>
							Home
						</NuxtLink>
					</li>
					<li>
						<NuxtLink
							to="/saved-books"
							class="hover:text-gray-300"
						>
							Saved Books
						</NuxtLink>
					</li>
					<li
						class="hover:text-red-400 cursor-pointer"
						@click="logout"
					>
						Logout
					</li>
				</ul>
				<ul
					v-else
					class="flex items-center space-x-4"
				>
					<li>
						<NuxtLink
							to="/login"
							class="hover:text-green-300"
						>
							Login
						</NuxtLink>
					</li>
				</ul>
			</nav>
		</div>
	</header>
</template>

<script setup>
const user = useSupabaseUser();
const router = useRouter();
const client = useSupabaseClient();

const logout = async () => {
	await client.auth.signOut();
	router.push('/login');
};
</script>

<style scoped>
/* Add any additional styling for the header here */
</style>
