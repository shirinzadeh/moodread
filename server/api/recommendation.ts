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
		publishedDate: string;
		averageRating: number;
	};
}

// Define weights for each scoring criterion
const WEIGHTS = {
	KEYWORD_MATCH: 2,
	GENRE_MATCH: 2,
	POPULARITY: 1,
	RATING: 3,
	RECENCY: 0.5,
};

function scoreRecommendation(book: GoogleBook, keywords: Set<string>): number {
	let score = 0;

	// Keyword matching (0-5 points, weighted)
	const bookKeywords = [
		book.volumeInfo.title,
		...(book.volumeInfo.authors || []),
		book.volumeInfo.description,
	].map(k => k?.toLowerCase() || '');

	const keywordMatchCount = bookKeywords.filter(keyword => keywords.has(keyword)).length;
	score += Math.min(keywordMatchCount, 5) * WEIGHTS.KEYWORD_MATCH;

	// Rating (0-5 points, weighted)
	const averageRating = book.volumeInfo?.averageRating || 0;
	score += averageRating * WEIGHTS.RATING;

	// Published date recency (0-2 points, weighted)
	const publishedYear = new Date(book.volumeInfo?.publishedDate).getFullYear();
	const currentYear = new Date().getFullYear();
	if (currentYear - publishedYear <= 2) score += 2 * WEIGHTS.RECENCY;
	else if (currentYear - publishedYear <= 5) score += 1 * WEIGHTS.RECENCY;

	return score;
}

// Normalize scores to a 0-100 scale
function normalizeScores(recommendations: any[]): any[] {
	const maxScore = Math.max(...recommendations.map(r => r.score));
	const minScore = Math.min(...recommendations.map(r => r.score));
	const range = maxScore - minScore;

	return recommendations.map(rec => ({
		...rec,
		normalizedScore: range !== 0 ? Math.round(((rec.score - minScore) / range) * 100) : 100,
	}));
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

		const scoredRecommendations = recommendationsResponses
			.filter((response): response is PromiseFulfilledResult<{ items: GoogleBook[] }> => response.status === 'fulfilled')
			.flatMap(response => response.value.items || [])
			.map(book => ({
				book,
				score: scoreRecommendation(book, keywords),
			}))
			.sort((a, b) => b.score - a.score);

		const normalizedRecommendations = normalizeScores(scoredRecommendations)
			.slice(0, 10)
			.map(({ book, normalizedScore }) => ({
				id: book.id,
				title: book.volumeInfo.title,
				authors: book.volumeInfo.authors,
				description: book.volumeInfo.description,
				thumbnail: book.volumeInfo.imageLinks?.smallThumbnail,
				score: normalizedScore,
			}));

		return { recommendations: normalizedRecommendations };
	}
	catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
});
