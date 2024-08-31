<template>
	<div>
		<div class="container mx-auto sm:px-4 py-8 sm:py-12">
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
			<BookMoodResult
				:selected-mood="selectedMood"
				:loading-saved-books="loadingSavedBooks"
				:saved-books="savedBooks"
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

			<!-- Book Recommendation -->
			<BookRecommendation
				v-if="user"
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

const feedbackData = reactive({
	mood: null,
	feedback: '',
});
const feedbackLoading = ref(false);
const showMoodFeedbackModal = ref(false);

const formData = ref({
	searchQuery: '',
});

const handleSearch = async () => {
	if (formData.value.searchQuery.trim()) {
		await fetchBooks(formData.value.searchQuery);
	}
};

const handleSearchInput = (value) => {
	if (value.trim()) {
		fetchBooks(value);
	}
};

const logSearchHistory = async (query) => {
	const { error } = await supabase
		.from('search_history')
		.insert([{ user_id: user.value.id, query }]);

	if (error) {
		console.error('Error logging search history:', error);
		throw error;
	}
};

// Debounce the search input
let debounceTimeout;
watch(() => formData.value.searchQuery, (newQuery) => {
	clearTimeout(debounceTimeout);
	debounceTimeout = setTimeout(() => {
		if (newQuery.trim()) {
			fetchBooks(newQuery);
			logSearchHistory(newQuery);
		}
		else {
			books.value.length = 0;
		}
	}, 300); // 300ms delay
});

const selectedMood = ref(null);
const savedBooks = ref([]);
const loadingSavedBooks = ref(false);

// Update handleMoodSelection function
const handleMoodSelection = async (mood) => {
	if (!user.value) {
		showToastError('You need to sign in first.');
		return;
	}
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
	console.log(book);
	if (!user.value) {
		showToastError('You need to sign in to save books.');
		return;
	}

	// Normalize the book structure
	const normalizedBook = normalizeBook(book);

	// Set the status to disabled and saving
	bookStatus.value[book.id] = { isDisabled: true, isSaving: true };

	try {
		/* the use of upsert with onConflict is generally efficient
	because it ensures that duplicate records aren't inserted */
		const { error } = await supabase
			.from('books')
			.upsert({
				google_books_id: normalizedBook.id,
				title: normalizedBook.title,
				author: normalizedBook.authors?.join(', ') || 'Unknown Author',
				description: normalizedBook.description, // Include description
				related_user_id: user.value?.id,
				other_details: JSON.stringify(normalizedBook),
			}, { onConflict: 'google_books_id' });

		if (error) throw error;

		// Automatically assign mood to the saved book
		await assignMoodToSavedBook(normalizedBook.id, normalizedBook);

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
		showToastError('Error assigning mood');
	}
};

const normalizeBook = (book) => {
	return {
		id: book.id,
		title: book.title || book.volumeInfo?.title,
		authors: book.authors || book.volumeInfo?.authors,
		description: book.description || book.volumeInfo?.description,
		imageLinks: book.thumbnail || book.volumeInfo?.imageLinks?.smallThumbnail,
	};
};

const isBookDisabled = bookId => bookStatus.value[bookId]?.isDisabled || false;
const isBookSaving = bookId => bookStatus.value[bookId]?.isSaving || false;

// Fetch moods when the component is mounted
onMounted(async () => {
	await fetchMoods();
});
</script>
