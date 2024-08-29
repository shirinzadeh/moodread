<template>
	<div class=" text-white min-h-screen flex flex-col">
		<!-- Header -->
		<SharedHeader />

		<!-- Main Content -->
		<main class="flex-grow container mx-auto p-4">
			<NuxtPage />
		</main>

		<!-- Footer (Optional) -->
		<footer class="bg-gray-800 text-gray-400 text-center py-4 mt-auto">
			&copy; 2024 Moodread. All rights reserved.
		</footer>
	</div>
</template>

<script setup>
</script>

  <style scoped>
  /* Additional styles for the layout if needed */
  </style>
