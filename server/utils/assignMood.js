import Sentiment from 'sentiment';

const sentiment = new Sentiment();

// Define mood categories and keywords
const moodKeywords = {
	Happy: ['happy', 'joy', 'delight', 'cheerful', 'content'],
	Sad: ['sad', 'sorrow', 'unhappy', 'gloomy', 'depressed'],
	Excited: ['excited', 'thrilling', 'energetic', 'enthusiastic'],
	Calm: ['calm', 'peaceful', 'relaxing', 'tranquil', 'serene'],
	Anxious: ['anxious', 'nervous', 'uneasy', 'worried', 'tense'],
	Curious: ['curious', 'inquiring', 'interested', 'intrigued'],
	Inspired: ['inspired', 'motivated', 'uplifted', 'encouraged'],
	Romantic: ['romantic', 'love', 'affectionate', 'passionate'],
};

// Define category to mood mappings
const categoryMoodMap = {
	'Fiction': ['Excited', 'Curious', 'Happy'],
	'Non-fiction': ['Curious', 'Inspired', 'Calm'],
	'Mystery': ['Curious', 'Anxious', 'Excited'],
	'Romance': ['Romantic', 'Happy', 'Excited'],
	'Science Fiction': ['Curious', 'Excited', 'Inspired'],
	'Biography': ['Inspired', 'Curious', 'Calm'],
	'History': ['Curious', 'Inspired', 'Calm'],
	'Self-help': ['Inspired', 'Happy', 'Calm'],
	'Law': ['Curious', 'Calm', 'Inspired'],
	'Textbook': ['Curious', 'Inspired', 'Calm'],
	'Comics': ['Excited', 'Happy', 'Curious'], // Added category for Comics
};

// Helper function to determine mood based on keywords
const determineMoodFromText = (text) => {
	const sentimentResult = sentiment.analyze(text);
	const tokens = text.toLowerCase().split(/\W+/);

	let moodScores = {};
	for (const [mood, keywords] of Object.entries(moodKeywords)) {
		moodScores[mood] = keywords.filter(keyword => tokens.includes(keyword)).length;
	}

	// If no keywords matched, use sentiment analysis
	const { score, comparative } = sentimentResult;

	if (score > 20 && comparative > 0.2) {
		return 'Excited'; // Highly positive and energetic mood
	}

	if (score > 10) {
		if (comparative > 0.15) {
			return 'Happy'; // Positive mood with strong positivity
		}
		if (comparative > 0.05) {
			return 'Inspired'; // Positive but slightly less intense
		}
		return 'Calm'; // Positive with a calm disposition
	}

	if (score > 0) {
		if (comparative > 0.1) {
			return 'Happy'; // Slightly positive mood
		}
		if (comparative > 0.05) {
			return 'Inspired'; // Low-level positive mood
		}
		return 'Calm'; // Generally positive but more reserved
	}

	if (score < 0) {
		if (comparative < -0.2) {
			return 'Melancholic'; // Strongly negative mood
		}
		if (comparative < -0.1) {
			return 'Sad'; // Moderately negative mood
		}
		return 'Anxious'; // Negative but not deeply so
	}

	if (score < -10) {
		if (comparative < -0.15) {
			return 'Sad'; // Intensely negative
		}
		if (comparative < -0.1) {
			return 'Melancholic'; // Moderately negative
		}
		return 'Anxious'; // Mildly negative
	}

	return 'Curious';
};

// Helper function to get mood from category
const getMoodFromCategory = (category) => {
	if (category) {
		// Check if the category or any substring matches our predefined categories
		for (const [key, moods] of Object.entries(categoryMoodMap)) {
			if (category.toLowerCase().includes(key.toLowerCase())) {
				return moods[0]; // Return the first (most likely) mood for the category
			}
		}
	}
	return null;
};

// Main function to get mood
const getMood = (description, title, authors, categories) => {
	// First, check if we have a category and if it's in our mapping
	if (categories && Array.isArray(categories) && categories.length > 0) {
		for (let category of categories) {
			const categoryMood = getMoodFromCategory(category);
			if (categoryMood) {
				return categoryMood;
			}
		}
	}

	// If no category match, use the description
	if (description) {
		return determineMoodFromText(description);
	}

	// Fallback to title and authors if description is not available
	if (title && authors) {
		const combinedTextFallback = title + ' ' + authors.join(' ');
		return determineMoodFromText(combinedTextFallback);
	}

	// Default mood if no data is available
	return 'Calm';
};

export { getMood };
