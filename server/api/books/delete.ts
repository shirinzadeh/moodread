import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const client =  await serverSupabaseClient(event);
  const { bookId } = await readBody(event);

  const { data: user, error: userError } = await client.auth.getUser();

  if (userError || !user) {
    return {
      statusCode: 401,
      body: { error: 'Unauthorized' },
    };
  }

  const { error: deleteError } = await client
    .from('books')
    .delete()
    .eq('id', bookId);

  if (deleteError) {
    throw createError({
      statusCode: 500,
      statusMessage: deleteError.message,
    });
  }

  return { message: 'Book deleted successfully' };
});
