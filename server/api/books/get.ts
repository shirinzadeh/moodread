import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  
  // Attempt to fetch the user session
  const user = await serverSupabaseUser(event);

  if (!user) {
    console.log('Auth session missing! User could not be retrieved.');
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - User session is missing or expired',
    });
  }

  console.log('Authenticated user:', user);

  const { data: booksData, error: booksError } = await client
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (booksError) {
    console.error('Error fetching books:', booksError);
    throw createError({
      statusCode: 500,
      statusMessage: booksError.message,
    });
  }

  console.log('booksData', booksData)

  return booksData;
});
