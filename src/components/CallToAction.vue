<template>
  <section class="cta">
    <h2>{{ title }}</h2>
    <button class="btn btn-white" @click="goToAbout">{{ buttonText }}</button>

    <div class="cards">
      <div v-for="(c, i) in cards" :key="i" class="card">
        <div class="icon">{{ c.icon }}</div>
        <h3>{{ c.title }}</h3>
        <p>{{ c.text }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router"

const props = defineProps({
  title: {
    type: String,
    default: "Why This Platform Matters"
  },
  buttonText: {
    type: String,
    default: "More information"
  }
})

const router = useRouter()

const goToAbout = () => {
  router.push("/about")
}

const cards = [
  {
    icon: "📊",
    title: "Smarter Dashboard",
    text: "Real-time data on zones and species helps you fish responsibly and avoid accidental harm."
  },
  {
    icon: "🐟",
    title: "Protect Endangered Species",
    text: "Highlighting species at risk ensures sustainable fishing and preserves biodiversity."
  },
  {
    icon: "🌍",
    title: "Sustainability for Our Planet",
    text: "Every informed choice protects ecosystems and keeps our waters healthy for the future."
  }
]
</script>

<style scoped>
.cta {
  text-align: center;
  background: linear-gradient(to right, #00aaff, #33ccff);
  color: white;
  padding: 40px 20px;
  border-radius: 8px;
}
.cta h2 {
  margin-bottom: 16px;
  font-weight: 700;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn-white {
  background: white;
  color: #333;
}
.btn-white:hover {
  background: #f1f1f1;
}

.cards {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}
.card {
  background: white;
  color: #333;
  border-radius: 10px;
  padding: 20px;
  text-align: left;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transition: transform 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
}
.icon {
  font-size: 32px;
  margin-bottom: 10px;
}
.card h3 {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
}
.card p {
  font-size: 15px;
  line-height: 1.6;
}
</style>