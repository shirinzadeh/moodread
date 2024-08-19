export function useMoodRecommendation() {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const moods = ref([])
    const recommendedBook = ref(null)
    const loading = ref(false)

    const fetchMoods = async () => {
        const { data, error } = await supabase.from('moods').select('*')
        if (error) {
            console.error('Error fetching moods:', error)
            return []
        }
        moods.value = data
        return data
    }

    const getRecommendation = async (moodId) => {
        console.log('mood id', moodId)
        loading.value = true
        try {
            // First, try to get a recommendation from the database
            let { data, error } = await supabase
                .from('recommendations')
                .select(`
                    id,
                    book_id,
                    books (
                        id,
                        title,
                        author,
                        google_books_id,
                        other_details
                    )
                `)
                .eq('mood_id', moodId)
                // .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (error || !data) {
                // If no recommendation found, get a random book and analyze it
                const { data: randomBook, error: randomError } = await supabase
                    .from('books')
                    .select('*')
                    // .order('created_at', { ascending: false })
                    .limit(1)
                    .single()

                if (randomError) throw randomError

                // Analyze the random book
                const { data: moodData } = await $fetch('/api/analyze-book', {
                    method: 'POST',
                    body: {
                        title: randomBook.title,
                        author: randomBook.author,
                        description: JSON.parse(randomBook.other_details).description || ''
                    }
                })

                console.log('moodData', moodData)

                if (moodData && moodData.mood) {
                    const { data: moodIdData } = await supabase
                        .from('moods')
                        .select('id')
                        .eq('mood_name', moodData.mood)
                        .single()

                    if (moodIdData && moodIdData.id === moodId) {
                        // If the analyzed mood matches the requested mood, use this book
                        data = { books: randomBook }
                        // Save this recommendation for future use
                        await supabase.from('recommendations').insert({
                            user_id: user.value.id,
                            book_id: randomBook.id,
                            mood_id: moodId
                        })
                    }
                }
            }

            recommendedBook.value = data ? data.books : null
            return recommendedBook.value
        } catch (err) {
            console.error('Error getting recommendation:', err)
            return null
        } finally {
            loading.value = false
        }
    }

    const submitFeedback = async (userId, bookId, moodId, feedback) => {
        try {
            const { error } = await supabase
                .from('mood_feedback')
                .insert({
                    user_id: userId,
                    book_id: bookId,
                    mood_id: moodId,
                    feedback: feedback
                })

            if (error) throw error

            return true
        } catch (err) {
            console.error('Error submitting feedback:', err)
            return false
        }
    }

    return {
        moods,
        recommendedBook,
        loading,
        fetchMoods,
        getRecommendation,
        submitFeedback
    }
}