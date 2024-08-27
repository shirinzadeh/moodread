<template>
	<form @submit.prevent="logMood">
		<input
			v-model="beforeMood"
			placeholder="Your mood before reading"
			required
		>
		<input
			v-model="afterMood"
			placeholder="Your mood after reading"
			required
		>
		<button type="submit">
			Log Mood
		</button>
	</form>
</template>

<script setup>
import { ref } from 'vue';
import { useSupabaseUser } from '@nuxtjs/supabase';

const beforeMood = ref('');
const afterMood = ref('');
const user = useSupabaseUser();

const logMood = async () => {
	const res = await $fetch('/api/logMood', {
		method: 'POST',
		body: {
			userId: user.value.id,
			bookId: 'your-book-id',
			beforeMood: beforeMood.value,
			afterMood: afterMood.value,
		},
	});
	console.log(res);
};
</script>
