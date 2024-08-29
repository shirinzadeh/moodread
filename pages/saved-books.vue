<template>
	<div class="container mx-auto px-4">
		<h1 class="text-4xl font-bold mb-8 text-center text-emerald-400">
			Saved Books
		</h1>

		<div
			v-if="pending"
			class="text-center py-12"
		>
			<UIcon
				name="i-heroicons-arrow-path"
				class="animate-spin h-12 w-12 mx-auto text-emerald-600 mb-4"
			/>
			<p class="text-lg text-emerald-200">
				Loading your saved books...
			</p>
		</div>

		<div
			v-else-if="books.length === 0"
			class="text-center py-12 bg-white rounded-lg shadow-md"
		>
			<UIcon
				name="i-heroicons-book-open"
				class="h-16 w-16 mx-auto text-emerald-400 mb-4"
			/>
			<p class="text-xl text-emerald-200">
				You haven't saved any books yet.
			</p>
			<NuxtLink to="/" class="mt-4 inline-block">
				<UButton color="emerald" variant="soft">
					Explore Books
				</UButton>
			</NuxtLink>
		</div>

		<div
			v-else
			class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
		>
			<UCard
				v-for="book in books"
				:key="book.id"
				class="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
			>
				<template #header>
					<h3 class="text-xl font-semibold text-emerald-200 truncate">
						{{ book.title }}
					</h3>
				</template>
				<p class="mb-4">
					By {{ book.author }}
				</p>
				<template #footer>
					<div class="flex justify-between">
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

		<!-- Delete Confirmation Dialog -->
		<UModal v-model="isDeleteDialogOpen">
			<UCard class="max-w-md mx-auto">
				<p class="text-lg text-center mb-6">
					Are you sure you want to delete "<span class="font-semibold">{{ selectedBook?.title }}</span>"?
				</p>
				<template #footer>
					<div class="flex justify-end space-x-4">
						<UButton
							color="gray"
							@click="isDeleteDialogOpen = false"
						>
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
