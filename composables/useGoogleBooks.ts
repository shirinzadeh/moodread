import { ref } from 'vue';

interface Book {
	id: string;
	volumeInfo: {
		title: string;
		authors: string[];
		categories?: string[];
		description?: string;
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

			// Filter out books that do not have authors or both categories and description
			books.value = (response.items || []).filter(book =>
				book.volumeInfo.authors?.length > 0
				&& (book.volumeInfo.categories || book.volumeInfo.description),
			);
		}
		catch (err: any) {
			// Check if the error has a response object with an error message from Google API
			const errorMessage = err?.data?.error?.message || 'An error occurred while fetching books';
			showToastError(errorMessage);
		}
		finally {
			loading.value = false;
		}
	};

	return {
		books,
		loading,
		fetchBooks,
	};
}
