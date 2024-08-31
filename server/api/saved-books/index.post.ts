import { H3Event } from 'h3';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/database.types';

interface BookData {
	title: string;
	author: string;
	genre: string;
	summary: string;
	mood?: string | null;
}

export default defineEventHandler(async (event: H3Event) => {
	const client = await serverSupabaseClient<Database>(event);

	// Get the authenticated user
	const user = await serverSupabaseUser(event);

	// If the user is not authenticated, return an error
	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	const body = await readBody<BookData>(event);

	try {
		// Insert the book with the user_id set to the authenticated user's ID
		const { data, error } = await client
			.from('books')
			.insert({
				...body,
				user_id: user.id, // Add the authenticated user's ID to the book entry
			});

		if (error) throw error;

		return {
			success: true,
			message: 'Book saved successfully',
			data,
		};
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

		return {
			success: false,
			message: 'Failed to save book',
			error: errorMessage,
		};
	}
});
