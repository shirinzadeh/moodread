<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Welcome to Moodread</h1>
    
    <div v-if="loading" class="text-lg text-gray-600">Checking your authentication status...</div>
    <div v-if="!loading && !user" class="text-lg text-red-600">Please log in or sign up.</div>
    
    <div v-if="user">
      <p class="text-xl mb-6">Hello, {{ user.email }}!</p>

      <div class="mb-4">
        <form @submit.prevent="searchBooks" class="flex items-center">
          <input 
            v-model="query" 
            type="text" 
            placeholder="Search for books..." 
            class="border border-gray-300 p-2 flex-grow rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button 
            type="submit" 
            class="ml-2 bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700"
            :disabled="loadingBooks"
          >
            {{ loadingBooks ? 'Searching...' : 'Search' }}
          </button>
        </form>
      </div>

      <div v-if="error" class="text-red-600">{{ error }}</div>
      <div v-if="loadingBooks" class="text-gray-600">Loading...</div>

      <ul v-if="books.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <li 
          v-for="book in books" 
          :key="book.id" 
          class="bg-white p-4 rounded-md shadow hover:shadow-lg transition"
        >
          <h3 class="text-xl font-semibold mb-2">{{ book.volumeInfo.title }}</h3>
          <p class="text-gray-700 mb-2">
            {{ book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown author' }}
          </p>
          <button 
            @click="saveBook(book)" 
            class="bg-green-600 text-white py-2 px-4 rounded-md shadow hover:bg-green-700"
          >
            Save to Library
          </button>
        </li>
      </ul>

    </div>
  </div>
</template>

<script setup>

const user = useSupabaseUser();
const router = useRouter();
const client = useSupabaseClient();

const loading = ref(true);
const query = ref('');
const { books, error, loading: loadingBooks, fetchBooks } = useGoogleBooks();
const savedBooks = ref([]);
const loadingSavedBooks = ref(false);

onMounted(() => {
  if (user.value) {
    loading.value = false;  // User is logged in, so allow them to see the page
    fetchSavedBooks(); // Fetch saved books when the component is mounted
  } else {
    router.push('/login');  // Redirect to login if not logged in
  }
});

const searchBooks = async () => {
  if (query.value) {
    await fetchBooks(query.value);
  }
};

const saveBook = async (book) => {
  try {
    const { data, error: insertError } = await client
      .from('books')
      .insert([
        {
          title: book.volumeInfo.title,
          author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown',
          genre: book.volumeInfo.categories ? book.volumeInfo.categories.join(', ') : 'Unknown',
          summary: book.volumeInfo.description || 'No description available',
        },
      ]);

    if (insertError) throw insertError;

    showSuccess('Book saved to library!');

    fetchSavedBooks(); // Refresh the saved books list after a successful save
  } catch (err) {
    showError('Error saving book: ' + err.message);
  }
};

const fetchSavedBooks = async () => {
  loadingSavedBooks.value = true;
  try {
    const { data, error: fetchError } = await client
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    savedBooks.value = data || [];
  } catch (err) {
    showError('Error fetching saved books: ' + err.message);
  } finally {
    loadingSavedBooks.value = false;
  }
};
</script>

<style>
/* You can add any custom styles here if needed */
</style>
