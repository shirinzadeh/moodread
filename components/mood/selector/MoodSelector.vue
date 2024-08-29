<template>
	<UForm
		:state="formState"
		class="space-y-4"
		@submit="handleSubmit"
	>
		<UFormGroup label="How are you feeling today?" name="mood">
			<USelect
				:value="selectedMoodId"
				:options="moods"
				option-attribute="mood_name"
				value-attribute="id"
				placeholder="Choose your mood"
				class="w-full"
				@change="handleChange"
			/>
		</UFormGroup>
	</UForm>
</template>

<script setup>
import { ref, reactive, defineEmits, defineProps } from 'vue';

const props = defineProps({
	moods: {
		type: Array,
		required: true,
	},
	loading: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['select-mood']);

const formState = reactive({
	selectedMood: null,
});

const selectedMoodId = ref(null);

const handleChange = (id) => {
	const selectedMood = props.moods.find(mood => mood.id === +id);
	formState.selectedMood = selectedMood;
	emit('select-mood', formState.selectedMood);
};

const handleSubmit = () => {
	// Optionally handle form submission if needed
};
</script>
