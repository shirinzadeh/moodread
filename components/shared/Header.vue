<template>
	<header class="bg-gray-100 dark:bg-gray-800 shadow-md">
		<UContainer>
			<div class="flex justify-between items-center py-4">
				<NuxtLink to="/" class="text-2xl font-bold text-gray-800 dark:text-gray-100">
					Moodread
				</NuxtLink>
				<!-- Desktop Navigation -->
				<nav class="hidden md:block">
					<UButtonGroup v-if="user" size="sm">
						<UButton
							to="/"
							variant="ghost"
							color="gray"
						>
							Home
						</UButton>
						<UButton
							to="/saved-books"
							variant="ghost"
							color="gray"
						>
							Saved Books
						</UButton>
						<UButton
							variant="ghost"
							color="red"
							@click="logout"
						>
							Logout
						</UButton>
					</UButtonGroup>
					<UButton
						v-else
						to="/login"
						variant="ghost"
						color="gray"
						size="sm"
					>
						Login
					</UButton>
				</nav>
				<!-- Mobile Menu Button -->
				<UButton
					icon="i-heroicons-bars-3"
					color="gray"
					variant="ghost"
					aria-label="Menu"
					class="md:hidden"
					@click="toggleMenu"
				/>
			</div>
		</UContainer>

		<!-- Mobile Menu -->
		<Transition name="slide">
			<div v-if="isMenuOpen" class="fixed inset-0 bg-gray-100 dark:bg-gray-800 z-50 md:hidden overflow-y-auto">
				<UContainer class="h-full flex flex-col">
					<div class="flex justify-between items-center py-4">
						<NuxtLink
							to="/"
							class="text-2xl font-bold text-gray-800 dark:text-gray-100"
							@click="closeMenu"
						>
							Moodread
						</NuxtLink>
						<UButton
							icon="i-heroicons-x-mark"
							color="gray"
							variant="ghost"
							aria-label="Close menu"
							@click="closeMenu"
						/>
					</div>
					<nav class="flex-grow flex flex-col justify-center space-y-4">
						<template v-if="user">
							<UButton
								to="/"
								variant="ghost"
								color="gray"
								block
								@click="closeMenu"
							>
								Home
							</UButton>
							<UButton
								to="/saved-books"
								variant="ghost"
								color="gray"
								block
								@click="closeMenu"
							>
								Saved Books
							</UButton>
							<UButton
								variant="ghost"
								color="red"
								block
								@click="handleLogout"
							>
								Logout
							</UButton>
						</template>
						<UButton
							v-else
							to="/login"
							variant="ghost"
							color="gray"
							block
							@click="closeMenu"
						>
							Login
						</UButton>
					</nav>
				</UContainer>
			</div>
		</Transition>
	</header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const user = useSupabaseUser();
const router = useRouter();
const client = useSupabaseClient();

const isMenuOpen = ref(false);
const scrollbarWidth = ref(0);

const logout = async () => {
	await client.auth.signOut();
	router.push('/login');
};

const handleLogout = () => {
	logout();
	closeMenu();
};

const toggleMenu = () => {
	isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
	isMenuOpen.value = false;
};

const lockScroll = () => {
	scrollbarWidth.value = window.innerWidth - document.documentElement.clientWidth;
	document.body.style.overflow = 'hidden';
	document.body.style.paddingRight = `${scrollbarWidth.value}px`;
};

const unlockScroll = () => {
	document.body.style.overflow = '';
	document.body.style.paddingRight = '';
};

onMounted(() => {
	watch(isMenuOpen, (newValue) => {
		if (newValue) {
			lockScroll();
		}
		else {
			unlockScroll();
		}
	});
});

onBeforeUnmount(() => {
	unlockScroll();
});
</script>

  <style scoped>
  .slide-enter-active,
  .slide-leave-active {
	transition: transform 0.3s ease;
  }

  .slide-enter-from,
  .slide-leave-to {
	transform: translateX(100%);
  }

  .slide-enter-to,
  .slide-leave-from {
	transform: translateX(0);
  }
  </style>
