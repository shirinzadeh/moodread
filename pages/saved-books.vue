<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Saved Books</h1>

    <div v-if="pending" class="text-center">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 mx-auto" />
      <p>Loading your saved books...</p>
    </div>

    <div v-else-if="books.length === 0" class="text-center">
      <p>You haven't saved any books yet.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard v-for="book in books" :key="book.id" class="flex flex-col">
        <template #header>
          <h3 class="text-lg font-semibold">{{ book.title }}</h3>
        </template>
        <p>By {{ book.author }}</p>
        <template #footer>
          <div class="flex justify-between">
            <UButton @click="openDetailModal(book)" color="cyan" size="sm">
              View Details
            </UButton>
            <UButton @click="openDeleteDialog(book)" color="red" size="sm">
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </div>

    <!-- Detail Modal -->
    <UModal v-model="isDetailModalOpen">
      <UCard v-if="selectedBook">
        <template #header>
          <h3 class="text-xl font-bold">{{ selectedBook.title }}</h3>
        </template>
        <div>
          <p><strong>Author:</strong> {{ selectedBook.author }}</p>
          <div v-if="selectedBook.other_details">
            <h3 class="font-semibold mt-4 mb-2">Additional Details:</h3>
            <p v-for="category in JSON.parse(selectedBook.other_details).categories"><strong>Category:</strong> {{ category }}</p>
            <p><strong>Publisher:</strong> {{ JSON.parse(selectedBook.other_details).publisher }}</p>
            <p><strong>Published date:</strong> {{ JSON.parse(selectedBook.other_details).publishedDate }}</p>
            <p><strong>Page count:</strong> {{ JSON.parse(selectedBook.other_details).pageCount }}</p>
            <p><strong>Description:</strong> {{ JSON.parse(selectedBook.other_details).description }}</p>

          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Delete Confirmation Dialog -->
    <UModal v-model="isDeleteDialogOpen">
      <UCard>
        <p>Are you sure you want to delete "{{ selectedBook?.title }}"?</p>
        <template #footer>
          <div class="flex justify-end space-x-4">
            <UButton @click="isDeleteDialogOpen = false" color="gray" variant="solid">
              Cancel
            </UButton>
            <UButton @click="deleteBook" color="red">
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>

const supabase = useSupabaseClient()

const isDetailModalOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const selectedBook = ref(null)

const bookDetails = computed(() => {
  if (selectedBook.other_details) return
})

// Initial server-side fetch
const { data: books, pending, refresh } = await useFetch('/api/saved-books')

const openDetailModal = (book) => {
  selectedBook.value = book
  isDetailModalOpen.value = true
}

const openDeleteDialog = (book) => {
  selectedBook.value = book
  isDeleteDialogOpen.value = true
}

const deleteBook = async () => {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', selectedBook.value.id)

  error && showToastError(error?.message || 'Failed to delete book')
  await refresh() // Refresh the book list after deletion
  isDeleteDialogOpen.value = false

}
</script>