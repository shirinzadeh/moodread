import { defineEventHandler, createError } from 'h3';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

interface Book {
	title: string;
	author: string;
	mood_id: number;
}

interface SearchHistory {
	query: string;
}

interface GoogleBook {
	id: string;
	volumeInfo: {
		title: string;
		authors: string[];
		description: string;
		imageLinks?: {
			smallThumbnail: string;
		};
	};
}

async function fetchWithRetry(url: string, params: Record<string, string>, maxRetries = 3) {
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await $fetch<{ items: GoogleBook[] }>(url, { params });
		}
		catch (error) {
			if (i === maxRetries - 1) throw error;
			await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000)); // Exponential backoff
		}
	}
}

export default defineEventHandler(async (event) => {
	const supabase = await serverSupabaseClient(event);
	const user = await serverSupabaseUser(event);

	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	try {
		// Fetch user's saved books
		const { data: savedBooks, error: savedBooksError } = await supabase
			.from('books')
			.select('title, author, mood_id')
			.eq('related_user_id', user.id);

		if (savedBooksError) throw savedBooksError;

		// Fetch user's search history
		const { data: searchHistory, error: searchHistoryError } = await supabase
			.from('search_history')
			.select('query')
			.eq('user_id', user.id);

		if (searchHistoryError) throw searchHistoryError;

		// Create a set of keywords from saved books and search history
		const keywords = new Set<string>();
		savedBooks.forEach((book: Book) => {
			keywords.add(book.title.toLowerCase());
			keywords.add(book.author.toLowerCase());
		});
		searchHistory.forEach((entry: SearchHistory) => keywords.add(entry.query.toLowerCase()));

		// Use keywords to fetch recommendations from Google Books API
		const keywordArray = Array.from(keywords).slice(0, 5); // Limit to 5 keywords to reduce API calls
		const recommendationsPromises = keywordArray.map(keyword =>
			fetchWithRetry('https://www.googleapis.com/books/v1/volumes', {
				q: keyword,
				maxResults: '3',
			}),
		);

		const recommendationsResponses = await Promise.allSettled(recommendationsPromises);

		// Process and deduplicate recommendations
		const recommendationSet = new Set<string>();
		const recommendations = recommendationsResponses
			.filter((response): response is PromiseFulfilledResult<{ items: GoogleBook[] }> => response.status === 'fulfilled')
			.flatMap(response => response.value.items || [])
			.filter((book) => {
				if (recommendationSet.has(book.id)) return false;
				recommendationSet.add(book.id);
				return true;
			})
			.map(book => ({
				id: book.id,
				title: book.volumeInfo.title,
				authors: book.volumeInfo.authors,
				description: book.volumeInfo.description,
				thumbnail: book.volumeInfo.imageLinks?.smallThumbnail,
			}))
			.slice(0, 10); // Limit to 10 recommendations

		return { recommendations };
	}
	catch (error) {
		console.error('Error fetching recommendations:', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
});
