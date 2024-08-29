<template>
	<div>
		<div class="container mx-auto px-4 py-12">
			<h1 class="text-4xl font-bold mb-8 text-center text-emerald-400">
				Book Explorer
			</h1>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
				<SharedCard :header-title="'Find a Book for Your Mood'">
					<MoodSelector
						:moods="moods"
						:loading="moodLoading"
						@select-mood="handleMoodSelection"
					/>
				</SharedCard>

				<!-- Book Search -->
				<SharedCard :header-title="'Search a book'">
					<BookSearch
						v-model="formData.searchQuery"
						:loading="searchLoading"
						:handle-search="handleSearch"
						@search="handleSearchInput"
					/>
				</SharedCard>
			</div>

			<!-- Mood-based Saved Books Section -->
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
				<div v-else-if="savedBooks.length === 0" class="text-center py-4 bg-white rounded-lg shadow">
					<p class="text-emerald-600">
						No books found for this mood.
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
							<img
								:src="getBookImage(book)"
								:alt="book.title"
								class="w-32 h-48 object-cover rounded-md shadow-sm mb-4"
							>
							<p class="text-gray-600 text-sm">
								By {{ book.author }}
							</p>
						</div>
						<template #footer>
							<UButton
								color="cyan"
								variant="soft"
								class="w-full"
								@click="viewBookDetails(book)"
							>
								View Details
							</UButton>
						</template>
					</UCard>
				</div>
			</div>

			<!-- Book Recommendation -->
			<BookRecommendation
				v-if="recommendedBook"
				:book="recommendedBook"
				@feedback="showMoodFeedbackModal = true"
			/>

			<!-- Search Results -->
			<BookSearchResult
				:books="books"
				:loading="searchLoading"
				:search-query="formData.searchQuery"
				:is-book-disabled="isBookDisabled"
				:is-book-saving="isBookSaving"
				@save-book="saveBook"
			/>
		</div>

		<!-- Mood Feedback Modal -->
		<ModalFeedback
			v-model="showMoodFeedbackModal"
			:moods="moods"
			:loading="feedbackLoading"
			@submit="submitMoodFeedback"
		/>
	</div>
</template>

<script setup>
const { books, loading: searchLoading, fetchBooks } = useGoogleBooks();
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const { moods, recommendedBook, loading: moodLoading, fetchMoods, submitFeedback } = useMoodRecommendation();

const bookStatus = ref({});
// const moodData = reactive({
// 	selectedMood: null,
// });
const feedbackData = reactive({
	mood: null,
	feedback: '',
});
const feedbackLoading = ref(false);
const showMoodFeedbackModal = ref(false);

const formData = ref({
	searchQuery: '',
});

const handleSearch = () => {
	if (formData.value.searchQuery.trim()) {
		fetchBooks(formData.value.searchQuery);
	}
};

const handleSearchInput = (value) => {
	if (value.trim()) {
		fetchBooks(value);
	}
};

// Debounce the search input
let debounceTimeout;
watch(() => formData.value.searchQuery, (newQuery) => {
	clearTimeout(debounceTimeout);
	debounceTimeout = setTimeout(() => {
		if (newQuery.trim()) {
			fetchBooks(newQuery);
		}
	}, 300); // 300ms delay
});

const selectedMood = ref(null);
const savedBooks = ref([]);
const loadingSavedBooks = ref(false);

// Update handleMoodSelection function
const handleMoodSelection = async (mood) => {
	if (!mood) {
		showToastError('Please select a mood');
		return;
	}

	selectedMood.value = mood;
	loadingSavedBooks.value = true;

	try {
		const { data, error } = await supabase
			.from('books')
			.select('*')
			.eq('mood_id', mood.id)
			.eq('related_user_id', user.value.id);

		if (error) throw error;
		savedBooks.value = data;
	}
	catch (error) {
		showToastError(error?.message || 'Failed to fetch books for the selected mood');
	}
	finally {
		loadingSavedBooks.value = false;
	}
};

// Submit mood feedback
const submitMoodFeedback = async () => {
	if (!feedbackData.mood || !recommendedBook.value) return;

	feedbackLoading.value = true;
	try {
		const success = await submitFeedback(
			user.value.id,
			recommendedBook.value.id,
			feedbackData.mood,
			feedbackData.feedback,
		);

		if (success) {
			showToastSuccess('Feedback submitted successfully!');
			showMoodFeedbackModal.value = false;
		}
		else {
			showToastError('Failed to submit feedback');
		}
	}
	catch (error) {
		console.error('Error submitting feedback:', error);
		showToastError('An error occurred while submitting feedback');
	}
	finally {
		feedbackLoading.value = false;
	}
};

const saveBook = async (book) => {
	if (!user.value) {
		showToastError('You need to sign in to save books.');
		return;
	}

	// Set the status to disabled and saving
	bookStatus.value[book.id] = { isDisabled: true, isSaving: true };

	try {
		/* the use of upsert with onConflict is generally efficient
	because it ensures that duplicate records aren't inserted */
		const { error } = await supabase
			.from('books')
			.upsert({
				google_books_id: book.id,
				title: book.volumeInfo.title,
				author: book.volumeInfo.authors?.join(', ') || 'Unknown Author',
				description: book.volumeInfo.description, // Include description
				related_user_id: user.value?.id,
				other_details: JSON.stringify(book.volumeInfo),
			}, { onConflict: 'google_books_id' });

		if (error) throw error;

		// Automatically assign mood to the saved book
		await assignMoodToSavedBook(book.id, book.volumeInfo);

		showToastSuccess('Book saved successfully!');
	}
	catch (err) {
		showToastError('Failed to save book. Please try again.');
	}
	finally {
		// Reset the status after saving is done
		bookStatus.value[book.id].isSaving = false;
	}
};

// Assign mood to the saved book
const assignMoodToSavedBook = async (bookId, bookDetails) => {
	try {
		const response = await $fetch('/api/assignMood', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				description: bookDetails.description,
				title: bookDetails.title,
				authors: bookDetails.authors,
				categories: bookDetails.categories || [], // Include categories
			}),
		});

		console.log('response', response);

		const mood = response?.mood;
		if (mood) {
			// Save the assigned mood to the book
			await supabase
				.from('books')
				.update({ mood_id: mood.id })
				.eq('google_books_id', bookId);
		}
	}
	catch (error) {
		console.error('Error assigning mood:', error);
		showToastError(error?.message);
	}
};

const isBookDisabled = bookId => bookStatus.value[bookId]?.isDisabled || false;
const isBookSaving = bookId => bookStatus.value[bookId]?.isSaving || false;

const getBookImage = (book) => {
	const otherDetails = typeof book.other_details === 'string'
		? JSON.parse(book.other_details)
		: book.other_details;
	return otherDetails?.imageLinks?.thumbnail || '/images/book-placeholder.jpg';
};

// Fetch moods when the component is mounted
onMounted(async () => {
	await fetchMoods();
});
</script>
