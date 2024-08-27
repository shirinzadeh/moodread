<template>
	<UForm
		:state="moodData"
		class="mb-6"
		@submit="handleMoodSelection"
	>
		<UFormGroup
			label="Select Your Mood"
			name="mood"
		>
			<USelect
				v-model="moodData.selectedMood"
				:options="moods"
				option-attribute="mood_name"
				value-attribute="id"
				placeholder="Choose your mood"
			/>
		</UFormGroup>
		<UButton
			type="submit"
			color="primary"
			:loading="moodLoading"
		>
			Get Recommendation
		</UButton>
	</UForm>
</template>

<script setup>
const { moodData, moods, moodLoading, handleMoodSelection } = useMoodSelection();
</script>
