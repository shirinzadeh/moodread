import { ref } from 'vue';

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors: string[];
    // Add other necessary fields here
  };
}

interface GoogleBooksAPIResponse {
  items: Book[];
}

export function useGoogleBooks() {
  const books = ref<Book[]>([]);
  const loading = ref<boolean>(false);

  const fetchBooks = async (query: string) => {
    loading.value = true;
    try {
      const response = await $fetch<GoogleBooksAPIResponse>('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q: query,
          key: process.env.GOOGLE_BOOKS_API_KEY,
        },
      });
      books.value = response.items || [];
    } catch (err: unknown) {
      showToastError('Error occured')
    } finally {
      loading.value = false;
    }
  };

  return {
    books,
    loading,
    fetchBooks,
  };
}
