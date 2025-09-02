<template>
  <main class="home">
    <!-- Hero: full-image header -->
    <Hero />
  </main>
</template>

<script setup>
import Hero from '@/components/Hero.vue'
</script>

<style scoped>
/* Home root (the element that wraps Hero and sections) */
.home {
  display: flex;
  flex-direction: column;
  flex: 1;               /* allow to stretch inside .page-container */
  gap: 0;                /* make sections butt up if you want no gaps */
}

/* Hero fills remaining vertical space inside .home */
.hero {
  flex: 1;
  background: url('@/assets/hero-bg.jpg') center/cover no-repeat;
  color: #fff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  /* no top/bottom padding or margin to avoid seams */
  padding: 0;
  margin: 0;
}

/* keep hero content width consistent with other sections */
.hero .content {
  max-width: var(--container-max);
  width: 100%;
  margin: 0 auto;
  padding-inline: var(--container-pad);
}

/* section blocks after hero (What we have / What we aim) */
.section {
  /* control inner spacing with headings, keep blocks butt together */
  padding: 0;
}

.section-title { margin: 16px 0 8px; }
.section-subtitle { margin: 0 0 16px; }

/* divider aligned to container width with no extra margins */
.divider {
  display: block;
  width: 100%;
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 0;
}
</style>