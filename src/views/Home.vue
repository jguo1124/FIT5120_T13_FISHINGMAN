<!-- src/views/Home.vue -->
<template>
  <main class="page">
    <WeatherCard
      :initial-lat="-37.8136"
      :initial-lon="144.9631"
      fallback-label="Melbourne"
      title="Local Weather"
      lang="en"
      units="metric"
      :useGeolocation="true"
    />
  </main>
</template>

<script setup lang="ts">
import WeatherCard from "@/components/Weather/WeatherCard.vue";
</script>

<style scoped>
.page{
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #fafafa;
}
</style>
