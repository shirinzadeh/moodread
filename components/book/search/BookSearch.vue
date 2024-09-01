<template>
	<UForm
		:state="formState"
		class="space-y-4"
		@submit.prevent="onSubmit"
	>
		<UFormGroup label="Search Books" name="search">
			<UInput
				v-model="localSearchQuery"
				placeholder="Enter book title, author, or keyword"
			/>
		</UFormGroup>
		<UButton
			type="submit"
			color="primary"
			:loading="loading"
		>
			Search
		</UButton>
	</UForm>
</template>

<script setup>
const props = defineProps({
	modelValue: String,
	loading: Boolean,
	handleSearch: Function,
});

const emit = defineEmits(['update:modelValue', 'search']);

const formState = ref({
	search: props.modelValue,
});

const localSearchQuery = ref(props.modelValue);

watch(localSearchQuery, (newValue) => {
	emit('update:modelValue', newValue);
	emit('search', newValue);
	formState.value.search = newValue;
});

watch(() => props.modelValue, (newValue) => {
	localSearchQuery.value = newValue;
	formState.value.search = newValue;
});

const onSubmit = () => {
	if (props.handleSearch) {
		props.handleSearch();
	}
};
</script>
