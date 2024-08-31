<!-- components/SearchResults.vue -->
<template>
	<div v-if="books.length" class="mt-12">
		<h2 class="text-3xl font-semibold mb-6 text-emerald-400">
			Search Results
		</h2>
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
			<UCard
				v-for="book in books"
				:key="book.id"
				class="flex flex-col dark:shadow-xl shadow-xl transition-shadow duration-300 "
				:ui="{
					footer: {
						base: 'mt-auto',
					},
				}"
			>
				<template #header>
					<h3 class="text-lg font-semibold text-blue-200 truncate">
						{{ book.volumeInfo.title }}
					</h3>
				</template>
				<div class="flex flex-col items-center">
					<NuxtImg
						:src="book.volumeInfo.imageLinks?.smallThumbnail || '/images/book-placeholder.jpg'"
						:alt="book.volumeInfo.title"
						class="w-36 h-auto object-cover rounded-md shadow-sm mb-4"
					/>
					<p class=" text-sm mb-4">
						By {{ book.volumeInfo.authors?.join(', ') || 'Unknown Author' }}
					</p>
				</div>
				<template #footer>
					<UButton
						color="blue"
						variant="soft"
						:disabled="isBookDisabled(book.id)"
						:loading="isBookSaving(book.id)"
						class="w-full justify-center "
						@click="$emit('saveBook', book)"
					>
						Save Book
					</UButton>
				</template>
			</UCard>
		</div>
	</div>
	<div v-else-if="!loading && searchQuery" class="mt-12 text-center text-gray-600">
		No books found. Try a different search query.
	</div>
</template>

<script setup>
defineProps({
	books: {
		type: Array,
		required: true,
	},
	loading: {
		type: Boolean,
		default: false,
	},
	searchQuery: {
		type: String,
		default: '',
	},
	isBookDisabled: {
		type: Function,
		required: true,
	},
	isBookSaving: {
		type: Function,
		required: true,
	},
});

defineEmits(['saveBook']);
</script>
