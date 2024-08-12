// import { serverSupabaseClient } from '#supabase/server';
// import { Configuration, OpenAIApi } from 'openai';

// export default eventHandler(async (event) => {
//   const client = await serverSupabaseClient(event);
//   const { userId, mood } = await readBody(event);

//   const { data: userPrefs, error } = await client
//     .from('users')
//     .select('preferences')
//     .eq('id', userId)
//     .single();

//   if (error) throw createError({ statusCode: 500, message: error.message });

//   const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
//   const response = await openai.createCompletion({
//     model: 'text-davinci-003',
//     prompt: `Recommend books based on the user's mood (${mood}) and preferences: ${JSON.stringify(userPrefs)}`,
//     max_tokens: 100,
//   });

//   return { recommendations: response.data.choices[0].text.trim().split('\n') };
// });
