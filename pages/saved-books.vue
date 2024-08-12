<template>
  <div class="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
    <h1 class="text-3xl font-bold mb-4">My Library</h1>

    <div v-if="loading" class="text-gray-400">Loading your saved books...</div>
    <div v-if="error" class="text-red-400">{{ error }}</div>

    <ul v-if="savedBooks.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <li
        v-for="book in savedBooks"
        :key="book.id"
        class="bg-gray-800 p-4 rounded-md shadow hover:shadow-lg transition"
      >
        <h3 class="text-xl font-semibold mb-2">{{ book.title }}</h3>
        <p class="text-gray-400 mb-2">{{ book.author }}</p>
        <p class="text-gray-500 mb-4">{{ book.genre }}</p>
        <button
          @click="viewBookDetails(book)"
          class="bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700"
        >
          View Details
        </button>
        <button
          @click="removeBook(book.id)"
          class="bg-red-600 text-white py-2 px-4 mt-2 rounded-md shadow hover:bg-red-700"
        >
          Remove from Library
        </button>
      </li>
    </ul>
    <p v-if="!loading && !savedBooks.length" class="text-gray-400">No books in your library yet.</p>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const router = useRouter();

const { data: savedBooks, error, refresh } = await useAsyncData('savedBooks', async () => {
    const response = await $fetch('/api/books/get');
    console.log(response, 'response')
    
    showError('Error fetching books: ' + error.message);
});

const loading = ref(!savedBooks.value && !error.value);

const viewBookDetails = (book) => {
  showInfo(`Title: ${book.title}\nAuthor: ${book.author}`);
};

const removeBook = async (bookId) => {
  try {
    await $fetch('/api/books/delete', {
      method: 'POST',
      body: { bookId },
    });

    showSuccess('Book removed from your library!');
    refresh(); // Refresh the data after removal
  } catch (err) {
    showError('Error removing book: ' + err.message);
  }
};
</script>

<style>
/* Add any custom styles here if needed */
</style>
