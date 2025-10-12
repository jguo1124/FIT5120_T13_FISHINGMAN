<template>
  <article class="kc-row">
    <div class="col title">
      <h3 class="kc-title">
        <a :href="item.url || '#'" target="_blank" rel="noopener noreferrer">
          {{ item.title }}
        </a>
      </h3>
    </div>
    <div class="col date">
      {{ displayDate }}
    </div>
    <div class="col source" :title="item.source || ''">
      {{ item.source || '-' }}
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ item: { type: Object, required: true } })
const displayDate = computed(() => {
  const dt = props.item?.published_at || props.item?.created_at
  if (!dt) return ''
  const d = new Date(dt)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString()
})
</script>

<!-- no styles here; styled centrally from KnowledgeHub.vue via :deep() -->