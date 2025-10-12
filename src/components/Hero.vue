<template>
  <section class="hero" role="img" aria-label="Banner">
    <!-- Image only, no text here to match the screenshot -->
  </section>
</template>

<script setup>
// No logic needed
</script>

<style scoped>
/* Full-width banner with a subtle vignette/gradient */
.hero {
  min-height: clamp(280px, 46vw, 500px);
  background-image:
    url('../assets/hero.jpg');
  background-size: cover;
  background-position: center;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-radius: 0;
}
</style>