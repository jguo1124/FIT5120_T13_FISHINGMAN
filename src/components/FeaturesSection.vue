<template>
  <section class="features">
    <RouterLink
      v-for="(f, i) in features"
      :key="i"
      :to="f.link"
      class="feature link-card"
      aria-label="Go to feature"
    >
      <div class="icon-circle" aria-hidden="true">
        <span class="icon-emoji">{{ f.icon }}</span>
      </div>
      <h3 class="feature-title">{{ f.title }}</h3>
      <p class="feature-text">{{ f.text }}</p>
    </RouterLink>
  </section>
</template>

<script setup>
const props = defineProps({
  features: {
    type: Array,
    default: () => ([
      {
        icon: '📊',
        title: 'Dashboard',
        text: 'Quickly access fishing data, regulations, and personal tools in one place.',
        link: '/dashboard'
      },
      {
        icon: '🐟',
        title: 'Endangered Species',
        text: 'Learn about protected and at-risk species to support sustainable fishing.',
        link: '/species' 
      },
      {
        icon: 'ℹ️',
        title: 'About',
        text: 'Find out more about our mission and how we support responsible fishing.',
        link: '/about' 
      }
    ])
  }
});
</script>

<style scoped>
.features{
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: clamp(28px, 4vw, 48px);
  padding: clamp(56px, 8vw, 96px) clamp(16px, 5vw, 48px);
  background: #fff;
  align-items: start;
}
@media (max-width: 900px){
  .features{ grid-template-columns: repeat(2, minmax(220px, 1fr)); }
}
@media (max-width: 640px){
  .features{ grid-template-columns: 1fr; }
}

.feature{
  text-align: center;
  max-width: 520px;
  margin-inline: auto;
  text-decoration: none;
  color: inherit;
  transition: transform .2s ease, box-shadow .2s ease;
}
.feature:hover{
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,.12);
}

.icon-circle{
  width: clamp(96px, 12vw, 128px);
  height: clamp(96px, 12vw, 128px);
  margin: 0 auto clamp(18px, 3vw, 24px);
  border-radius: 50%;
  display: grid;
  place-items: center;

  background: radial-gradient(120% 120% at 30% 25%, #59d3ff 0%, #08a9ef 55%, #0795d6 100%);
  box-shadow:
    0 0 0 8px #fff,            
    0 14px 26px rgba(0,0,0,.12),    
    inset 0 1px 0 rgba(255,255,255,.6); 
}

.icon-emoji{
  font-size: clamp(32px, 4.6vw, 44px);
  line-height: 1;
  filter: drop-shadow(0 1px 0 rgba(0,0,0,.15));
}

.feature-title{
  font-size: clamp(18px, 2.2vw, 22px);
  font-weight: 700;
  color: #2b2b2b;
  margin: 8px 0 10px;
}

.feature-text{
  margin: 0 auto;
  max-width: 36ch;             
  color: #5e5e5e;
  line-height: 1.75;
  font-size: clamp(14px, 1.8vw, 16px);
}
</style>