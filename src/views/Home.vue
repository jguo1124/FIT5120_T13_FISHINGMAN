<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <!-- left column: Title + Search -->
      <div class="hero-left">
        <h1>
          Explore Fishing:
          <span class="highlight">Rules, Limits, and More</span>
          <br />
          on Our Fascinating GoFish Platform
        </h1>

        <!-- today's tip banner -->
        <div class="tip-banner">
          <span class="tip-label">Today's Tip:</span>
          <span class="tip-text">{{ todayTip }}</span>
        </div>
      </div>

      <!-- right column: Image -->
      <div class="hero-right">
        <img src="@/assets/fishing-rod.jpg" alt="Fishing rod" />
      </div>
    </section>

    <!-- Cards -->
    <section class="cards">
      <!-- Card 1: Dashboard -->
      <RouterLink to="/dashboard" class="card link-card dashboard-card" aria-label="Open Dashboard">
        <div class="card-top"><span class="arrow">↗</span></div>
        <h3>GoFish Dashboard</h3>
        <p>Check rules by zone & species - size limits, quotas, and seasons.</p>
        <div class="accent"></div>
      </RouterLink>

      <!-- Card 2: Endangered -->
      <RouterLink to="/endangered" class="card link-card endangered-card" aria-label="View Endangered Species">
        <div class="card-top"><span class="arrow">↗</span></div>
        <h3>Endangered Species</h3>
        <p>Know protected / no-take lists before you cast.</p>
        <div class="accent"></div>
      </RouterLink>

      <!-- Card 3: TBD -->
      <div class="card">
        <h3>Coming Soon</h3>
        <p>More tools to make smart, legal fishing easier.</p>
      </div>

      <!-- Card 4: TBD Large -->
      <div class="card large">
        <h3>Coming Soon</h3>
        <p>Guides, tips, and resources tailored for your target species.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const todayTip = ref("");

// Sample data (can be replaced with the return of the backend API)
const tips = [
  "Snapper season is now OPEN in VIC-BAY.",
  "Flathead minimum size limit: 30cm.",
  "Remember: Bag limit for Bream is 10 per person.",
  "Endangered species: Murray Cod is catch-and-release only."
];

onMounted(() => {
  // Randomly select a tip for today
  const randomIndex = Math.floor(Math.random() * tips.length);
  todayTip.value = tips[randomIndex];
});
</script>

<style scoped>
.home {
  padding: 2rem;
  font-family: Arial, sans-serif;
  color: #222;
}

/* HERO */
.hero {
  display: grid;
  /* left 1.2fr, right 1fr */
  grid-template-columns: 1.2fr 1fr;
  align-items: start;
  gap: 2rem;
  margin-bottom: 3rem;
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 1.25rem; 
  max-width: 48rem; 
}

.hero h1 {
  font-size: 2.5rem;
  line-height: 1.3;
}

.highlight {
  font-style: italic;
  color: #666;
}

.search-bar {
  display: flex;
  margin-top: 0.5rem;
}

.search-bar input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-right: none;
  border-radius: 8px 0 0 8px;
}

.search-btn {
  padding: 0.8rem 1rem;
  border: 1px solid #ccc;
  border-left: none;
  background: black;
  color: white;
  cursor: pointer;
  border-radius: 0 8px 8px 0;
}

.hero-right {
  display: flex;
  align-items: center;  
  justify-content: center;
}

.hero-right img {
  max-height: 350px;    
  width: auto;          
  border-radius: 12px;
  object-fit: contain;   
}

/* CARDS */
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.card {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.card.large {
  grid-column: span 3;
}

/* responsive adjustments */
@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero-right {
    order: 2; 
  }
}
/* Card link styles */
.link-card {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.link-card:hover,
.link-card:focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  outline: none;
}

/* Specific card styles */
.dashboard-card {
  background: #f3f8ff;           
  border: 1px solid #e1eeff;
}

.endangered-card {
  background: #fff6f6;            
  border: 1px solid #ffe1e1;
}

/* arrow and accent styles */
.card-top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.25rem;
}
.arrow { font-size: 1.1rem; opacity: 0.7; }
.accent {
  height: 4px;
  width: 40%;
  margin-top: 0.75rem;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.12;
}
</style>