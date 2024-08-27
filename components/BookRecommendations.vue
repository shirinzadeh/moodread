<template>
	<div>
		<h2>Book Recommendations</h2>
		<ul>
			<li v-for="book in recommendations" :key="book">
				{{ book }}
			</li>
		</ul>
	</div>
</template>

<script setup>
const recommendations = ref([]);
const user = useSupabaseUser();

onMounted(async () => {
	const res = await $fetch('/api/recommendBooks', {
		method: 'POST',
		body: { userId: user.value.id, mood: 'happy' },
	});
	recommendations.value = res.recommendations;
});
</script>
