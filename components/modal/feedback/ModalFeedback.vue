<template>
	<UModal v-model="showMoodFeedbackModal">
		<UCard>
			<template #header>
				<h3 class="text-lg font-semibold">
					Share Your Mood After Reading
				</h3>
			</template>
			<UForm
				:state="feedbackData"
				@submit="submitMoodFeedback"
			>
				<UFormGroup
					label="Your Mood"
					name="mood"
				>
					<USelect
						v-model="feedbackData.mood"
						:options="moods"
						option-attribute="mood_name"
					/>
				</UFormGroup>
				<UFormGroup
					label="Feedback"
					name="feedback"
				>
					<UTextarea
						v-model="feedbackData.feedback"
						placeholder="Share your thoughts..."
					/>
				</UFormGroup>
				<UButton
					type="submit"
					color="primary"
					:loading="feedbackLoading"
				>
					Submit Feedback
				</UButton>
			</UForm>
		</UCard>
	</UModal>
</template>

<script setup>
const { feedbackData, feedbackLoading, showMoodFeedbackModal, submitMoodFeedback } = useFeedback();
const { moods } = useMoodSelection();
</script>
