import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  try {
    const { data, error } = await client
      .from('books')
      .select('*')
      .eq('related_user_id', user.id)

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching saved books:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch saved books'
    })
  }
})