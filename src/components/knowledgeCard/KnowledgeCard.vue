<template>
  <article class="kh-card">
    <header class="kh-head">
      <h3 class="kh-title">{{ item.title }}</h3>
    </header>

    <p v-if="item.summary" class="kh-summary">
      {{ item.summary }}
    </p>

    <div class="kh-meta">
      <span v-if="displayDate">🗓 {{ displayDate }}</span>
      <span v-if="item.source">· 来源：{{ item.source }}</span>
      <span class="kh-link">
        <a :href="item.url" target="_blank" rel="noopener noreferrer">Read More →</a>
      </span>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ item: Object });

const displayDate = computed(() => {
  const dt = props.item.published_at || props.item.created_at;
  if (!dt) return '';
  try { return new Date(dt).toLocaleDateString(); } catch { return ''; }
});
</script>

<style scoped>
:root{
  --kh-text:#1f2937;
  --kh-muted:#6b7280;
  --kh-border:#e5e7eb;
  --kh-bg:#ffffff;
  --kh-accent:#0d6efd;
  --kh-hover:#0b5ed7;
  --kh-shadow:0 2px 8px rgba(0,0,0,.06);
}

.kh-card{
  background:var(--kh-bg);
  border:1px solid var(--kh-border);
  border-radius:16px;
  padding:1rem 1.2rem;
  box-shadow:var(--kh-shadow);
  transition:box-shadow .15s, transform .05s;
  color:var(--kh-text);
}
.kh-card:hover{ box-shadow:0 6px 18px rgba(0,0,0,.08); transform:translateY(-1px); }

.kh-title{ margin:0 0 .4rem; font-weight:700; font-size:1.1rem; line-height:1.35; }
.kh-summary{ color:var(--kh-muted); font-size:.95rem; line-height:1.6; margin:.25rem 0 1rem; }

.kh-meta{ display:flex; align-items:center; gap:.6rem; font-size:.8rem; color:var(--kh-muted); }
.kh-link{ margin-left:auto; }
.kh-link a{ color:var(--kh-accent); text-decoration:underline; text-underline-offset:3px; }
.kh-link a:hover{ color:var(--kh-hover); text-decoration:none; }
</style>
