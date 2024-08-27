<template>
	<UForm :state="formData" @submit="handleSearch">
		<UFormGroup label="Search Books" name="search">
			<UInput v-model="formData.searchQuery" placeholder="Enter book title, author, or keyword" />
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
defineProps({
	formData: Object,
	loading: Boolean,
	handleSearch: Function,
});
</script>
