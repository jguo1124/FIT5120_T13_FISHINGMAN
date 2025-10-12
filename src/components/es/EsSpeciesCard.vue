<template>
  <article class="card media" tabindex="0">
   
    <img
      class="thumb"
      :src="imgSrc"
      :alt="sp.common_name || sp.species_code"
      @error="onImgError"
      loading="lazy"
      referrerpolicy="no-referrer"
    />

    <div class="overlay">
      <div class="ov-header">
        <div class="avatar">{{ (sp.common_name || sp.species_code).slice(0,1) }}</div>
        <div class="title-wrap">
          <div class="title">{{ sp.common_name || sp.species_code }}</div>
          <div class="subtitle">{{ sp.scientific_name || '-' }}</div>
        </div>
      </div>

      <div class="chips">
        <span class="chip chip-amber">{{ sp.conservation_status || '-' }}</span>
      </div>

      <div class="meta">
        <div class="distribution">
          <strong>Distribution:</strong>
          <span>{{ sp.distribution || '-' }}</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn" @click.stop="openSource(sp.source)">Source</button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({ sp: { type: Object, required: true } });


const FALLBACK_IMG = 'https://www.eftta.com/fileadmin/user_upload/FISHPROTECT_white__2.jpg';

const imgSrc = ref(props.sp.image_url || FALLBACK_IMG);


watch(
  () => props.sp.image_url,
  (val) => {
    imgSrc.value = (val && String(val).trim()) ? val : FALLBACK_IMG;
  },
  { immediate: true }
);

function onImgError() {
  if (imgSrc.value !== FALLBACK_IMG) {
    imgSrc.value = FALLBACK_IMG;
  }
}

function openSource(url) {
  if (!url) return;
  try { window.open(url, "_blank"); } catch {}
}
</script>

<style scoped>
.card.media {
  position: relative;
  overflow: hidden;
  background: #000;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(2, 8, 23, .06);
}
.thumb {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;     
  display: block;
  transition: transform .35s ease;
}
.card.media:hover .thumb,
.card.media:focus-within .thumb { transform: scale(1.03); }

.overlay {
  position: absolute; inset: 0;
  display: grid; grid-template-rows: auto auto 1fr auto;
  gap: 10px; padding: 14px; color: #111827;
  background: linear-gradient(to top, rgba(255,255,255,.95) 35%, rgba(255,255,255,.7) 70%, rgba(255,255,255,0));
  opacity: 0; pointer-events: none; transition: opacity .2s ease;
}
.card.media:hover .overlay,
.card.media:focus-within .overlay { opacity: 1; pointer-events: auto; }

.ov-header { display: flex; align-items: center; gap: 10px; }
.avatar {
  width: 40px; height: 40px; border-radius: 999px;
  background: #eef2ff; display: grid; place-items: center;
  font-weight: 700; color: #3730a3;
}
.title-wrap .title { font-weight: 700; }
.title-wrap .subtitle { font-size: 12px; color: #64748b; }

.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chip { padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; border: 1px solid transparent; }
.chip-amber { background: #fef3c7; color: #b45309; }

.meta { display: grid; gap: 6px; font-size: 14px; }
.meta strong { color: #111; }

.actions { margin-top: auto; display: flex; gap: 8px; }
.btn {
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
}
</style>
