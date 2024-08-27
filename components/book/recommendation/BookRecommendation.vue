<!-- <template>
	<div
		v-if="recommendedBook"
		class="mt-8"
	>
		<h2 class="text-2xl font-semibold mb-4">
			Recommended Book
		</h2>
		<UCard class="flex flex-col">
			<template #header>
				<h3 class="text-lg font-semibold">
					{{ recommendedBook.title }}
				</h3>
			</template>
			<BookImage
				:book="recommendedBook"
				class="max-h-[200px] mx-auto"
			/>
			<template #footer>
				<p>By {{ recommendedBook.author }}</p>
				<UButton
					color="green"
					size="sm"
					class="mt-2"
					@click="showMoodFeedbackModal = true"
				>
					Share Your Mood After Reading
				</UButton>
			</template>
		</UCard>
	</div>
</template>

<script setup>
const { recommendedBook, showMoodFeedbackModal } = useMoodSelection();
</script> -->
