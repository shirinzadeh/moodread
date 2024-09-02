<template>
	<div v-if="selectedMood" class="mb-12">
		<h2 class="text-2xl font-semibold mb-4 text-blue-500">
			Books for {{ selectedMood.mood_name }} Mood
		</h2>
		<div v-if="loadingSavedBooks" class="text-center py-4">
			<UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 mx-auto text-emerald-600" />
			<p class="mt-2 text-emerald-600">
				Loading books...
			</p>
		</div>
		<div v-else-if="savedBooks.length === 0">
			<p class="text-yellow-100 text-center">
				No books found for this mood from your saved books.
			</p>
		</div>
		<div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
			<UCard
				v-for="book in savedBooks"
				:key="book.id"
				class="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
			>
				<template #header>
					<h3 class="text-lg font-semibold text-blue-200 truncate">
						{{ book.title }}
					</h3>
				</template>
				<div class="flex flex-col items-center py-4">
					<NuxtImg
						:src="getBookImage(book)"
						:alt="book.title"
						class="w-32 h-48 object-cover rounded-md shadow-sm mb-4"
					/>
					<p class=" text-sm">
						By {{ book.author }}
					</p>
				</div>
				<template #footer>
					<UButton
						color="cyan"
						variant="soft"
						class="w-full justify-center"
						@click="openDetailModal(book)"
					>
						View Details
					</UButton>
				</template>
			</UCard>
		</div>
	</div>
	<!-- Detail Modal -->
	<UModal v-model="isDetailModalOpen">
		<UCard v-if="selectedBook" class="max-w-2xl mx-auto">
			<template #header>
				<h3 class="text-2xl font-bold text-emerald-200">
					{{ selectedBook.title }}
				</h3>
			</template>
			<div class="space-y-4">
				<p><strong class="text-emerald-600">Author:</strong> {{ selectedBook.author }}</p>
				<div v-if="selectedBook.other_details">
					<h3 class="font-semibold text-lg text-emerald-600 mt-6 mb-2">
						Additional Details:
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<p v-if="bookDetails.categories?.length">
							<strong class="text-emerald-600">Categories:</strong> {{ bookDetails.categories.join(', ') }}
						</p>
						<p v-if="bookDetails.publisher">
							<strong class="text-emerald-600">Publisher:</strong> {{ bookDetails.publisher }}
						</p>
						<p v-if="bookDetails.publishedDate">
							<strong class="text-emerald-600">Published date:</strong> {{ bookDetails.publishedDate }}
						</p>
						<p v-if="bookDetails.pageCount">
							<strong class="text-emerald-600">Page count:</strong> {{ bookDetails.pageCount }}
						</p>
					</div>
					<p v-if="bookDetails.description" class="mt-4">
						<strong class="text-emerald-600">Description:</strong> {{ bookDetails.description }}
					</p>
				</div>
			</div>
		</UCard>
	</UModal>
</template>

<script setup>
defineProps({
	selectedMood: {
		type: [Object, null],
		default: null,
		required: true,
	},
	loadingSavedBooks: {
		type: Boolean,
		required: true,
	},
	savedBooks: {
		type: Array,
		required: true,
	},

});
const getBookImage = (book) => {
	const otherDetails = typeof book.other_details === 'string'
		? JSON.parse(book.other_details)
		: book.other_details;

	return otherDetails?.imageLinks || otherDetails?.imageLink || '/images/book-placeholder.jpg';
};

const selectedBook = ref(null);
const isDetailModalOpen = ref(false);

const openDetailModal = (book) => {
	selectedBook.value = book;
	isDetailModalOpen.value = true;
};
const bookDetails = computed(() => {
	if (selectedBook.value && selectedBook.value.other_details) {
		return JSON.parse(selectedBook.value.other_details);
	}
	return {};
});
</script>
