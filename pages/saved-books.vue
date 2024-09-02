<template>
	<div>
		<h1 class="text-4xl font-bold mb-8 text-center text-emerald-600 dark:text-emerald-400">
			Saved Books
		</h1>

		<div v-if="pending" class="text-center py-12">
			<UIcon
				name="i-heroicons-arrow-path"
				class="animate-spin h-12 w-12 mx-auto text-emerald-600 dark:text-emerald-400 mb-4"
			/>
			<p class="text-lg text-gray-700 dark:text-emerald-200">
				Loading your saved books...
			</p>
		</div>

		<div v-else-if="books.length === 0" class="text-center py-12 rounded-lg shadow-md bg-gray-50 dark:bg-gray-800">
			<UIcon
				name="i-heroicons-book-open"
				class="h-16 w-16 mx-auto text-emerald-600 dark:text-emerald-400 mb-4"
			/>
			<p class="text-xl text-gray-700 dark:text-emerald-200">
				You haven't saved any books yet.
			</p>
			<NuxtLink to="/" class="mt-4 inline-block">
				<UButton color="emerald" variant="soft">
					Explore Books
				</UButton>
			</NuxtLink>
		</div>

		<div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8">
			<UCard
				v-for="book in books"
				:key="book.id"
				class="bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-300"
				:ui="{
					footer: {
						base: 'mt-auto',
					},
				}"
			>
				<template #header>
					<h3 class="text-md sm:text-xl font-semibold text-emerald-500 dark:text-emerald-200 truncate">
						{{ book.title }}
					</h3>
				</template>
				<p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">
					By {{ book.author }}
				</p>
				<template #footer>
					<div class="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-between">
						<UButton
							color="cyan"
							variant="soft"
							size="sm"
							@click="openDetailModal(book)"
						>
							View Details
						</UButton>
						<UButton
							color="red"
							variant="soft"
							size="sm"
							@click="openDeleteDialog(book)"
						>
							Delete
						</UButton>
					</div>
				</template>
			</UCard>
		</div>

		<!-- Detail Modal -->
		<UModal v-model="isDetailModalOpen">
			<UCard v-if="selectedBook" class="max-w-2xl mx-auto bg-white dark:bg-gray-900">
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
							{{ selectedBook.title }}
						</h3>
						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark-20-solid"
							class="-my-1"
							@click="isDetailModalOpen = false"
						/>
					</div>
				</template>
				<div class="space-y-4">
					<p><strong class="text-emerald-600 dark:text-emerald-400">Author:</strong> {{ selectedBook.author }}</p>
					<div v-if="selectedBook.other_details">
						<h3 class="font-semibold text-lg text-gray-800 dark:text-emerald-400 mt-6 mb-2">
							Additional Details:
						</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<p v-if="bookDetails.categories?.length">
								<strong class="text-emerald-600 dark:text-emerald-400">Categories:</strong> {{ bookDetails.categories.join(', ') }}
							</p>
							<p v-if="bookDetails.publisher">
								<strong class="text-emerald-600 dark:text-emerald-400">Publisher:</strong> {{ bookDetails.publisher }}
							</p>
							<p v-if="bookDetails.publishedDate">
								<strong class="text-emerald-600 dark:text-emerald-400">Published date:</strong> {{ bookDetails.publishedDate }}
							</p>
							<p v-if="bookDetails.pageCount">
								<strong class="text-emerald-600 dark:text-emerald-400">Page count:</strong> {{ bookDetails.pageCount }}
							</p>
						</div>
						<p v-if="bookDetails.description" class="mt-4 text-gray-700 dark:text-gray-300">
							<strong class="text-emerald-600 dark:text-emerald-400">Description:</strong> {{ bookDetails.description }}
						</p>
					</div>
				</div>
			</UCard>
		</UModal>

		<!-- Delete Confirmation Dialog -->
		<UModal v-model="isDeleteDialogOpen">
			<UCard class="max-w-md mx-auto bg-white dark:bg-gray-900">
				<p class="text-lg text-center mb-6 text-gray-800 dark:text-gray-300">
					Are you sure you want to delete "<span class="font-semibold">{{ selectedBook?.title }}</span>"?
				</p>
				<template #footer>
					<div class="flex justify-end space-x-4">
						<UButton color="gray" @click="isDeleteDialogOpen = false">
							Cancel
						</UButton>
						<UButton
							color="red"
							variant="solid"
							@click="deleteBook"
						>
							Delete
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>
	</div>
</template>

<script setup>
const supabase = useSupabaseClient();

const isDetailModalOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const selectedBook = ref(null);

// Initial server-side fetch
const { data: books, pending, refresh } = await useFetch('/api/saved-books');

const bookDetails = computed(() => {
	if (selectedBook.value && selectedBook.value.other_details) {
		return JSON.parse(selectedBook.value.other_details);
	}
	return {};
});

// const getBookImage = (book) => {
// 	const otherDetails = typeof book.other_details === 'string'
// 		? JSON.parse(book.other_details)
// 		: book.other_details;
// 	return otherDetails?.imageLinks?.thumbnail || '/images/book-placeholder.jpg';
// };

const openDetailModal = (book) => {
	selectedBook.value = book;
	isDetailModalOpen.value = true;
};

const openDeleteDialog = (book) => {
	selectedBook.value = book;
	isDeleteDialogOpen.value = true;
};

const deleteBook = async () => {
	try {
		const { error } = await supabase
			.from('books')
			.delete()
			.eq('id', selectedBook.value.id);

		if (error) throw error;

		isDeleteDialogOpen.value = false;
		await refresh(); // Refresh the book list after deletion
		showToastSuccess('Book deleted successfully');
	}
	catch (error) {
		showToastError(error?.message || 'Failed to delete book');
	}
};
</script>
