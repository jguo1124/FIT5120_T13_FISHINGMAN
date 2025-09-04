<template>
  <!-- Single species card -->
  <article class="card media" tabindex="0">
    <!-- Thumbnail image -->
    <div
      class="thumb"
      :style="{ backgroundImage: `url('${sp.image_url}')` }"
      role="img"
      :aria-label="sp.common_name || sp.species_code"
    ></div>

    <!-- Overlay with details (visible on hover/focus) -->
    <div class="overlay">
      <!-- Header with avatar and titles -->
      <div class="ov-header">
        <div class="avatar">{{ (sp.common_name || sp.species_code).slice(0,1) }}</div>
        <div class="title-wrap">
          <div class="title">{{ sp.common_name || sp.species_code }}</div>
          <div class="subtitle">{{ sp.scientific_name || '-' }}</div>
        </div>
      </div>

      <!-- Status chips -->
      <div class="chips">
        <span class="chip chip-amber">Endangered</span>
        <span class="chip chip-red-outline">Prohibited</span>
      </div>

      <!-- Metadata -->
      <div class="meta">
        <div class="synced">Synced: {{ formatDate(sp.last_synced_at) }}</div>
        <div class="sightings">
          <span class="dot"></span>{{ sp.recent_sightings }} sightings nearby
        </div>
      </div>

      <!-- Action buttons -->
      <div class="actions">
        <button class="btn" @click.stop="openSource(sp.source_url)">Source</button>
        <button
          class="btn danger"
          v-if="sp.lawful_take==='Prohibited'"
          @click.stop="alertRelease(sp)"
        >
          Release
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
// Props: single species object
const props = defineProps({ sp: { type: Object, required: true } });

// Format ISO date string to locale string
function formatDate(iso) {
  if (!iso) return "-";
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

// Open external link in new tab
function openSource(url) {
  if (url) window.open(url, "_blank");
}

// Alert when species is prohibited
function alertRelease(sp) {
  alert(`"${sp.common_name || sp.species_code}" is ${sp.status}. Please release immediately.`);
}
</script>

<style scoped>
/* Card container */
.card.media {
  position: relative;
  overflow: hidden;
  background: #000;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(2, 8, 23, .06);
}

/* Thumbnail image */
.thumb {
  width: 100%;
  aspect-ratio: 4/3;
  background-size: cover;
  background-position: center;
  transition: transform .35s ease;
}
.card.media:hover .thumb,
.card.media:focus-within .thumb {
  transform: scale(1.03);
}

/* Overlay layer */
.overlay {
  position: absolute; inset: 0;
  display: grid; grid-template-rows: auto auto 1fr auto;
  gap: 10px; padding: 14px; color: #111827;
  background: linear-gradient(to top, rgba(255,255,255,.95) 35%, rgba(255,255,255,.7) 70%, rgba(255,255,255,0));
  opacity: 0; pointer-events: none;
  transition: opacity .2s ease;
}
.card.media:hover .overlay,
.card.media:focus-within .overlay {
  opacity: 1; pointer-events: auto;
}

/* Header */
.ov-header { display: flex; align-items: center; gap: 10px; }
.avatar {
  width: 40px; height: 40px; border-radius: 999px;
  background: #eef2ff; display: grid; place-items: center;
  font-weight: 700; color: #3730a3;
}
.title-wrap .title { font-weight: 700; }
.title-wrap .subtitle { font-size: 12px; color: #64748b; }

/* Chips */
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chip { padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; border: 1px solid transparent; }
.chip-amber { background: #fef3c7; color: #b45309; }
.chip-red-outline { background: #fff; color: #b91c1c; border-color: #fecaca; }

/* Metadata */
.meta { display: grid; gap: 6px; }
.synced { color: #64748b; font-size: 12px; }
.sightings { display: flex; gap: 8px; align-items: center; font-size: 14px; }
.sightings .dot { width: 8px; height: 8px; border-radius: 999px; background: #38bdf8; display: inline-block; }

/* Actions */
.actions { margin-top: auto; display: flex; gap: 8px; }
.btn { border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; padding: 8px 12px; cursor: pointer; }
.btn.danger { background: #e11d48; color: #fff; border-color: #e11d48; }
</style>
