<!-- <template>
  <UCard class="flex flex-col">
    <template #header>
      <h3 class="text-lg font-semibold">
        {{ book.volumeInfo.title }}
      </h3>
    </template>
    <BookImage :book="book" class="max-h-[200px] mx-auto" />
    <template #footer>
      <p>By {{ book.volumeInfo.authors?.join(', ') || 'Unknown Author' }}</p>
      <UButton color="blue" size="sm" class="mt-2" :disabled="isBookDisabled(book.id)" :loading="isBookSaving(book.id)" @click="saveBook(book)">
        Save Book
      </UButton>
    </template>
  </UCard>
</template>

<script setup>
const props = defineProps({
  book: Object,
});

const { saveBook, isBookDisabled, isBookSaving } = useSaveBook();

const { book } = toRefs(props);
</script> -->
