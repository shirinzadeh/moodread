<!-- components/MoodFeedbackModal.vue -->
<template>
	<UModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
		<UCard class="max-w-md mx-auto">
			<template #header>
				<h3 class="text-xl font-semibold text-indigo-700">
					Share Your Mood After Reading
				</h3>
			</template>
			<UForm
				:state="formState"
				class="space-y-4"
				@submit="handleSubmit"
			>
				<UFormGroup label="Your Mood" name="mood">
					<USelect
						v-model="formState.mood"
						:options="moods"
						option-attribute="mood_name"
						placeholder="Select your mood"
						class="w-full"
					/>
				</UFormGroup>
				<UFormGroup label="Feedback" name="feedback">
					<UTextarea
						v-model="formState.feedback"
						placeholder="Share your thoughts about the book..."
						class="w-full"
						:rows="4"
					/>
				</UFormGroup>
				<UButton
					type="submit"
					color="indigo"
					variant="solid"
					:loading="loading"
					class="w-full"
				>
					Submit Feedback
				</UButton>
			</UForm>
		</UCard>
	</UModal>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
	modelValue: {
		type: Boolean,
		required: true,
	},
	moods: {
		type: Array,
		required: true,
	},
	loading: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['update:modelValue', 'submit']);

const formState = reactive({
	mood: null,
	feedback: '',
});

const handleSubmit = () => {
	if (!formState.mood) {
		// You might want to show an error message here
		return;
	}
	emit('submit', { ...formState });
};

// Reset form when modal is closed
watch(() => props.modelValue, (newValue) => {
	if (!newValue) {
		formState.mood = null;
		formState.feedback = '';
	}
});
</script>
