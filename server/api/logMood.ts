import { serverSupabaseClient } from '#supabase/server';

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const { userId, bookId, beforeMood, afterMood } = await readBody(event);

  const moodLog = {
    user_id: userId,
    book_id: bookId,
    before_mood: beforeMood,
    after_mood: afterMood,
  };

  const { data, error } = await client.from('mood_logs').insert([moodLog] as any);
  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return { message: 'Mood logged successfully', data };
});
