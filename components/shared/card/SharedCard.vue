<template>
	<UCard class="bg-white shadow-lg">
		<template #header>
			<h2 class="text-2xl font-semibold text-emerald-300">
				{{ headerTitle }}
			</h2>
		</template>
		<slot />
	</UCard>
</template>

<script setup>
defineProps({
	headerTitle: String,
});
</script>
