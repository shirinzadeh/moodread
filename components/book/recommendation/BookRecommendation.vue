<!-- components/BookRecommendation.vue -->
<template>
	<UCard class="mb-12 bg-white shadow-lg">
		<template #header>
			<h2 class="text-2xl font-semibold text-indigo-700">
				Recommended Book for Your Mood
			</h2>
		</template>
		<div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
			<NuxtImg
				:src="bookImage"
				:alt="book.title"
				class="w-48 h-auto object-cover rounded-lg shadow-md"
			/>
			<div class="flex-1">
				<h3 class="text-xl font-semibold mb-2">
					{{ book.title }}
				</h3>
				<p class="text-gray-600 mb-4">
					By {{ book.author }}
				</p>
				<UButton
					color="green"
					variant="soft"
					@click="$emit('feedback')"
				>
					Share Your Mood After Reading
				</UButton>
			</div>
		</div>
	</UCard>
</template>

<script setup>
const props = defineProps({
	book: {
		type: Object,
		required: true,
	},
});

const bookImage = computed(() => {
	const otherDetails = typeof props.book.other_details === 'string'
		? JSON.parse(props.book.other_details)
		: props.book.other_details;
	return otherDetails?.imageLinks?.smallThumbnail || '/images/book-image.jpg';
});
</script>
