import { defineEventHandler, readBody } from 'h3';
import { getMood } from '../utils/assignMood';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
	const supabase = await serverSupabaseClient(event);
	const body = await readBody(event);
	const { description, title, authors, categories } = body;

	if ((!title || !authors)) {
		throw createError({ statusCode: 400, statusMessage: 'Insufficient data for mood assignment' });
	}

	try {
		const moodName = getMood(description, title, authors, categories);
		// Fetch the mood from the database
		const { data: mood, error } = await supabase
			.from('moods')
			.select('id, mood_name')
			.eq('mood_name', moodName)
			.single();

		if (error || !mood) {
			console.error('Error fetching mood from database:', error);
			throw createError({ statusCode: 404, statusMessage: 'Mood not found' });
		}

		return { mood: { id: mood.id, name: mood.mood_name } };
	}
	catch (error) {
		console.error('Error assigning mood:', error);
		throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
	}
});
