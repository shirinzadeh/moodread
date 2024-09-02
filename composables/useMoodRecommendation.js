export function useMoodRecommendation() {
	const supabase = useSupabaseClient();
	const moods = ref([]);
	const recommendedBook = ref(null);
	const loading = ref(false);

	const fetchMoods = async () => {
		const { data, error } = await supabase.from('moods').select('*');
		if (error) {
			showToastError('Error fetching moods');
			return [];
		}
		moods.value = data;
		return data;
	};

	const submitFeedback = async (userId, bookId, moodId, feedback) => {
		try {
			const { error } = await supabase
				.from('mood_feedback')
				.insert({
					user_id: userId,
					book_id: bookId,
					mood_id: moodId,
					feedback: feedback,
				});

			if (error) throw error;

			return true;
		}
		catch (err) {
			console.error('Error submitting feedback:', err);
			return false;
		}
	};

	return {
		moods,
		recommendedBook,
		loading,
		fetchMoods,
		submitFeedback,
	};
}
