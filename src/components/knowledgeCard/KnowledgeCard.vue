<template>
  <article class="rounded-2xl border p-4 shadow-sm hover:shadow transition">
    <header class="mb-2">
      <h3 class="text-lg font-semibold leading-snug">
        {{ item.title }}
      </h3>
    </header>

    <p v-if="item.summary" class="text-sm text-gray-600 mb-3">
      {{ item.summary }}
    </p>

    <div class="flex items-center gap-3 text-xs text-gray-500">
      <span v-if="displayDate">🗓 {{ displayDate }}</span>
      <span v-if="item.source">· 来源：{{ item.source }}</span>
      <span class="ml-auto">
        <a
          class="underline underline-offset-4 hover:no-underline"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read More →
        </a>
      </span>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({ item: Object });

const displayDate = computed(() => {
  const dt = props.item.published_at || props.item.created_at;
  if (!dt) return "";
  try {
    const d = new Date(dt);
    return d.toLocaleDateString();
  } catch {
    return "";
  }
});
</script>
