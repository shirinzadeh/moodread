import OpenAI from 'openai';

export default defineEventHandler(async (event) => {
    const openai = new OpenAI({
        apiKey: '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',
    });
    const body = await readBody(event);
    const { title, author, description } = body;
    console.log('API body', title, author, description)

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that suggests moods for books."
                },
                {
                    role: "user",
                    content: `Analyze the following book and suggest the most appropriate mood from this list: Happy, Sad, Excited, Calm, Anxious, Nostalgic, Inspired, Confused, Curious, Hopeful, Angry, Romantic, Adventurous, Melancholic, Energetic.

Book Title: ${title}
Author: ${author}
Description: ${description}

Suggested mood:`
                }
            ],
            max_tokens: 60,
            n: 1,
            temperature: 0.5,
        });

        console.log('API response: ', response)
        const suggestedMood = response.choices[0].message.content.trim();
        console.log('API suggestedMood: ', suggestedMood)
        return { mood: suggestedMood };
    } catch (error) {
        console.error('Error analyzing book:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error analyzing book',
        });
    }
});