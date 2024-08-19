<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Book Explorer</h1>

    <!-- Mood Selection -->
    <UForm :state="moodData" @submit="handleMoodSelection" class="mb-6">
      <UFormGroup label="Select Your Mood" name="mood">
        <USelect v-model="moodData.selectedMood" :options="moods" option-attribute="mood_name" value-attribute="id" placeholder="Choose your mood" />
      </UFormGroup>
      <UButton type="submit" color="primary" :loading="moodLoading">Get Recommendation</UButton>
    </UForm>

    <!-- Book Recommendation -->
    <div v-if="recommendedBook" class="mt-8">
      <h2 class="text-2xl font-semibold mb-4">Recommended Book</h2>
      <UCard class="flex flex-col">
        <template #header>
          <h3 class="text-lg font-semibold">{{ recommendedBook.title }}</h3>
        </template>
        <NuxtImg :src="getBookImage(recommendedBook)" :alt="recommendedBook.title" class="max-h-[200px] mx-auto" />
        <template #footer>
          <p>By {{ recommendedBook.author }}</p>
          <UButton @click="showMoodFeedbackModal = true" color="green" size="sm" class="mt-2">
            Share Your Mood After Reading
          </UButton>
        </template>
      </UCard>
    </div>


    <!-- Mood Feedback Modal -->
    <UModal v-model="showMoodFeedbackModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Share Your Mood After Reading</h3>
        </template>
        <UForm :state="feedbackData" @submit="submitMoodFeedback">
          <UFormGroup label="Your Mood" name="mood">
            <USelect v-model="feedbackData.mood" :options="moods" option-attribute="mood_name" />
          </UFormGroup>
          <UFormGroup label="Feedback" name="feedback">
            <UTextarea v-model="feedbackData.feedback" placeholder="Share your thoughts..." />
          </UFormGroup>
          <UButton type="submit" color="primary" :loading="feedbackLoading">Submit Feedback</UButton>
        </UForm>
      </UCard>
    </UModal>

    <UForm :state="formData" @submit="handleSearch">
      <UFormGroup label="Search Books" name="search">
        <UInput v-model="formData.searchQuery" placeholder="Enter book title, author, or keyword" />
      </UFormGroup>
      <UButton type="submit" color="primary" :loading="loading">Search</UButton>
    </UForm>

    <div v-if="books.length" class="mt-8">
      <h2 class="text-2xl font-semibold mb-4">Search Results</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard v-for="(book, i) in books" :key="book.id" class="flex flex-col">
          <template #header>
            <h3 class="text-lg font-semibold">{{ book.volumeInfo.title }}</h3>
          </template>
          <NuxtImg :src="book.volumeInfo.imageLinks?.smallThumbnail || '/images/book-image.jpg'" :alt="book.volumeInfo.title" class="max-h-[200px] mx-auto" />

          <template #footer>
            <p>By {{ book.volumeInfo.authors?.join(', ') || 'Unknown Author' }}</p>

            <UButton @click="() => saveBook(book)" color="blue" size="sm" class="mt-2" :disabled="isBookDisabled(book.id)" :loading="isBookSaving(book.id)">
              Save Book
            </UButton>
          </template>
        </UCard>
      </div>
    </div>

    <div v-else-if="!loading && formData.searchQuery" class="mt-8 text-center">
      No books found. Try a different search query.
    </div>
  </div>
</template>

<script setup>

const { books, error, loading, fetchBooks } = useGoogleBooks()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { moods, recommendedBook, loading: moodLoading, fetchMoods, getRecommendation, submitFeedback } = useMoodRecommendation()


const formData = reactive({
  searchQuery: ''
})
const bookStatus = ref({})
const moodData = reactive({
  selectedMood: null
})
const feedbackData = reactive({
  mood: null,
  feedback: ''
})
const feedbackLoading = ref(false)
const showMoodFeedbackModal = ref(false)

// Update handleMoodSelection function
const handleMoodSelection = async () => {
  if (moodData.selectedMood === null) {
    showToastError('Please select a mood')
    return
  }
  
  try {
    const book = await getRecommendation(moodData.selectedMood)
    if (!book) {
      showToastError('No recommendation found for this mood')
    } else {
      showToastSuccess('Here\'s a book recommendation for you!')
    }
  } catch (error) {
    console.error('Error getting recommendation:', error)
    showToastError('Failed to get a recommendation')
  }
}

// Submit mood feedback
const submitMoodFeedback = async () => {
  if (!feedbackData.mood || !recommendedBook.value) return

  feedbackLoading.value = true
  try {
    const success = await submitFeedback(
      user.value.id,
      recommendedBook.value.id,
      feedbackData.mood,
      feedbackData.feedback
    )

    if (success) {
      showToastSuccess('Feedback submitted successfully!')
      showMoodFeedbackModal.value = false
    } else {
      showToastError('Failed to submit feedback')
    }
  } catch (error) {
    console.error('Error submitting feedback:', error)
    showToastError('An error occurred while submitting feedback')
  } finally {
    feedbackLoading.value = false
  }
}

const handleSearch = () => {
  if (formData.searchQuery.trim()) {
    fetchBooks(formData.searchQuery)
  }
}

const saveBook = async (book) => {
  if (!user.value) {
    showToastError('You need to sign in to save books.')
    return
  }
  // Set the status to disabled and saving
  bookStatus.value[book.id] = { isDisabled: true, isSaving: true }

  try {
    /*the use of upsert with onConflict is generally efficient 
    because it ensures that duplicate records aren't inserted*/
    const { data, error } = await supabase
      .from('books')
      .upsert({
        google_books_id: book.id,
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors?.join(', ') || 'Unknown Author',
        related_user_id: user.value?.id,
        other_details: JSON.stringify(book.volumeInfo)
      }, { onConflict: 'google_books_id' })

    if (error) throw error

    showToastSuccess('Book saved successfully!')
  } catch (err) {
    showToastError('Failed to save book. Please try again.')
  } finally {
    // Reset the status after saving is done
    bookStatus.value[book.id].isSaving = false
  }
}

const isBookDisabled = (bookId) => bookStatus.value[bookId]?.isDisabled || false
const isBookSaving = (bookId) => bookStatus.value[bookId]?.isSaving || false

// Helper function to get book image
const getBookImage = (book) => {
  const otherDetails = typeof book.other_details === 'string' 
    ? JSON.parse(book.other_details) 
    : book.other_details
  return otherDetails?.imageLinks?.smallThumbnail || '/images/book-image.jpg'
}

// Fetch moods when the component is mounted
onMounted(async () => {
  await fetchMoods()
})

// Debounce function to delay API calls while typing
let debounceTimeout;
watch(formData, (newData) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (newData) {
      fetchBooks(newData.searchQuery);
    }
  }, 200); // 300ms delay
});
</script>