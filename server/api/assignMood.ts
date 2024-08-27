import { defineEventHandler, readBody } from 'h3';
import { getMood } from '../utils/assignMood';

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const { description, title, authors, categories } = body;

	if ((!title || !authors)) {
		return { statusCode: 400, message: 'Insufficient data for mood assignment' };
	}

	try {
		const mood = getMood(description, title, authors, categories);
		return { success: true, mood };
	}
	catch (error) {
		console.error('Error assigning mood:', error);
		return { statusCode: 500, message: 'Internal Server Error' };
	}
});
