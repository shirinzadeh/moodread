import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const client = await serverSupabaseClient(event);
  const { bookId } = await readBody(event);

  console.log( client.from('saved_books').delete().eq('id', bookId))
  const response = await client
  .from('saved_books')
  .delete()
  .eq('id', bookId)
  .select('*'); // Ensure the deletion was successful by selecting the deleted row

  console.log(response)
const { data: deleteData, error: deleteError } = response;

if (deleteError) {
  throw createError({
    statusCode: 500,
    statusMessage: deleteError.message,
  });
}

if (!deleteData || deleteData.length === 0) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Book not found or already deleted',
  });
}

return { message: 'Book deleted successfully', deleted: deleteData };

});