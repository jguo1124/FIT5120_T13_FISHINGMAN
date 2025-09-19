<template>
  <main><!-- Top stack in the same order as your screenshot -->
    <Hero />
    <SloganBar />
  </main>
  
  <div class="home">
    <!-- Features Icons -->
    <FeaturesSection :features="features" />

    <!-- <NewsSection /> -->

    <!-- Call To Action -->
    <CallToAction />

    <!-- Footer -->
    <footer class="footer">
      <p class="copyright">
        © GOFish Sustainbly. All rights reserved
      </p>
    </footer>
  </div>
</template>

<script setup>
import Hero from '@/components/Hero.vue';
import SloganBar from '@/components/SloganBar.vue';
import FeaturesSection from '@/components/FeaturesSection.vue'
// import NewsSection from '@/components/NewsSection.vue';
import CallToAction from '@/components/CallToAction.vue'
</script>

<style scoped>
/* General */
.home {
  font-family: Arial, sans-serif;
  color: #444;
  line-height: 1.6;
}

/* Footer */
.footer {
  background: #f9f9f9;
  padding: 16px 20px;
}
.footer .copyright {
  text-align: center;
  font-size: 14px;
  color: #888;
}
</style>