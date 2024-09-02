<!-- components/BookRecommendations.vue -->
<template>
	<div v-if="status === 'pending'" class="text-center py-12">
		<UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 mx-auto text-emerald-600 mb-4" />
	</div>
	<div v-else-if="recommendations.length" class="mt-12">
		<h2 class="text-3xl font-semibold mb-6 text-center text-emerald-400">
			Recommended for You
		</h2>
		<Swiper
			:modules="[SwiperAutoplay, SwiperPagination]"
			:slides-per-view="2"
			:space-between="10"
			:navigation="true"
			:loop="true"
			:autoplay="{
				delay: 3000,
				disableOnInteraction: true,
			}"
			:breakpoints="{
				640: {
					slidesPerView: 2,
					spaceBetween: 20,
				},
				768: {
					slidesPerView: 3,
					spaceBetween: 20,
				},
				1024: {
					slidesPerView: 4,
					spaceBetween: 20,
				},
			}"
		>
			<SwiperSlide v-for="book in recommendations" :key="book.id">
				<UCard
					class="flex flex-col dark:shadow-xl shadow-xl transition-shadow duration-300"
					:ui="{
						footer: {
							base: 'mt-auto',
						},
					}"
				>
					<template #header>
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-semibold text-blue-400 dark:text-blue-200 truncate">
								{{ book.title }}
							</h3>
							<UIcon
								v-if="book.score > 80"
								name="i-heroicons-star"
								class="text-yellow-800 dark:text-yellow-400 w-6 h-6 ml-2"
							/>
						</div>
					</template>
					<div class="flex flex-col items-center">
						<NuxtImg
							:src="getBookImage(book)"
							:alt="book.title"
							class="w-36 h-auto object-cover rounded-md shadow-sm mb-4"
						/>
						<p class="text-sm mb-4">
							{{ book.authors ? `By ${book.authors?.[0]}` : 'Unknown Author' }}
						</p>
					</div>
					<template #footer>
						<UButton
							color="blue"
							variant="soft"
							:disabled="isBookDisabled(book.id)"
							:loading="isBookSaving(book.id)"
							class="w-full justify-center "
							@click="$emit('saveBook', getBookData(book))"
						>
							Save Book
						</UButton>
					</template>
				</UCard>
			</SwiperSlide>
		</Swiper>
	</div>
</template>

<script setup>
defineProps({
	isBookDisabled: {
		type: Function,
		required: true,
	},
	isBookSaving: {
		type: Function,
		required: true,
	},
});
defineEmits(['saveBook']);

const recommendations = ref([]);

const { data, error, status } = await useLazyAsyncData(
	'recommendation',
	() => $fetch('/api/recommendation'));

const getBookData = book => ({
	title: book.title,
	authors: book.authors,
	description: book.description,
	thumbnail: book.thumbnail,
});

watch(data, (newData) => {
	if (newData.recommendations.length) {
		recommendations.value = newData.recommendations;
	}
});

error.value && showToastError(error.value?.message);

const getBookImage = (book) => {
	return book.thumbnail || '/images/book-placeholder.jpg';
};
</script>
