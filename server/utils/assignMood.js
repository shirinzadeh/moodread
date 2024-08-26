const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Define mood categories and keywords
const moodKeywords = {
    'Happy': ['happy', 'joy', 'delight', 'cheerful', 'content'],
    'Sad': ['sad', 'sorrow', 'unhappy', 'gloomy', 'depressed'],
    'Excited': ['excited', 'thrilling', 'energetic', 'enthusiastic'],
    'Calm': ['calm', 'peaceful', 'relaxing', 'tranquil', 'serene'],
    'Anxious': ['anxious', 'nervous', 'uneasy', 'worried', 'tense'],
    'Curious': ['curious', 'inquiring', 'interested', 'intrigued'],
    'Inspired': ['inspired', 'motivated', 'uplifted', 'encouraged'],
    'Romantic': ['romantic', 'love', 'affectionate', 'passionate']
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
};

// Helper function to determine mood based on keywords
const determineMoodFromText = (text) => {
    const sentimentResult = sentiment.analyze(text);
    const tokens = text.toLowerCase().split(/\W+/);

    let moodScores = {};
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
        moodScores[mood] = keywords.filter(keyword => tokens.includes(keyword)).length;
    }

    // Find the mood with the highest score
    let topMood = Object.keys(moodScores).reduce((a, b) => moodScores[a] > moodScores[b] ? a : b);

    // If no keywords matched, use sentiment analysis
    if (moodScores[topMood] === 0) {
        if (sentimentResult.score > 20 && sentimentResult.comparative > 0.2) {
            return 'Energetic';
        } else if (sentimentResult.score > 0) {
            if (sentimentResult.comparative > 0.1) {
                return 'Happy';
            } else if (sentimentResult.comparative > 0.05) {
                return 'Hopeful';
            } else {
                return 'Calm';
            }
        } else if (sentimentResult.score < 0) {
            if (sentimentResult.comparative < -0.1) {
                return 'Sad';
            } else if (sentimentResult.comparative < -0.2) {
                return 'Melancholic';
            } else {
                return 'Anxious';
            }
        } else {
            return 'Confused';
        }
    }

    return topMood;
};

// Helper function to get mood from category
const getMoodFromCategory = (category) => {
    if (category && categoryMoodMap[category]) {
        return categoryMoodMap[category][0]; // Return the first (most likely) mood for the category
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

module.exports = { getMood };