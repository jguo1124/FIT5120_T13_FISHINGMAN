<template>
  <section class="slogan">
    <div class="container">
      <p class="text">
        <strong>GoFish Sustainably: </strong> Your Smart Guide to Legal & Sustainable Fishing
      </p>
      <button class="cta" @click="goAbout">Learn More</button>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router"
const router = useRouter()
function goAbout() {
  router.push("/about")
}
</script>

<style scoped>
.slogan {
  background: rgba(0,0,0,.86);
  color: #fff;
  padding: 18px 0;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
.container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}
.text { margin: 0; opacity: .98; }
.text strong { font-weight: 800; }
.cta {
  background: linear-gradient(180deg, #37aee3, #3bc1ff);
  color: #fff; border: 0; border-radius: 10px;
  padding: .75rem 1.1rem; font-weight: 800; cursor: pointer;
  box-shadow: 0 6px 16px rgba(0,0,0,.22);
}
.cta:active { transform: translateY(1px); }
</style>