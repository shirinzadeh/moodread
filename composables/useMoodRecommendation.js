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
        try {
          console.log('mood id', moodId);
      
          const { data: moodData, error } = await supabase
            .from('moods')
            .select('mood_name')
            .eq('id', moodId)
            .single();
      
          if (error) throw error;
      
          if (moodData) {
            const analyzeData = await $fetch('/api/analyze/mood', {
              method: 'POST',
              body: { mood: moodData.mood_name }, // Ensure the body is an object
            });
      
            console.log('analyzeData', analyzeData);
            return analyzeData;
          }
        } catch (error) {
          console.error('Error fetching recommendation:', error);
          showToastError('Failed to get a recommendation');
        }
      };
      

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