<template>
  <main class="about">
    <!-- Who we are -->
    <section class="section container">
      <h2 class="section-title">Who are we?</h2>
      <p class="section-subtitle">
        GoFish is a community-driven initiative created to help recreational fishers
        enjoy the waters while protecting the environment. We provide clear, trusted,
        and up-to-date fishing regulations in one simple platform.
      </p>
      <ul class="list">
        <li>Promote sustainable and responsible fishing practices</li>
        <li>Make rules easy to find and understand</li>
        <li>Encourage respect for aquatic ecosystems</li>
      </ul>
    </section>

    <div class="container"><hr class="divider" /></div>

    <!-- Our strategy -->
    <section class="section container">
      <h2 class="section-title">Our strategy</h2>
      <p class="section-subtitle">
        We believe clear information leads to better compliance and stronger
        conservation. GoFish's strategy focuses on three key directions:
      </p>
      <ul class="list">
        <li>Simplify: present fishing rules in an easy, accessible dashboard</li>
        <li>Educate: highlight why limits and closures protect fish stocks</li>
        <li>Inspire: encourage every angler to become a steward of nature</li>
      </ul>
    </section>

    <div class="container"><hr class="divider" /></div>

    <!-- Our people -->
    <section class="section container">
      <h2 class="section-title">Our people</h2>
      <p class="section-subtitle">
        We are a diverse team of developers, researchers, and outdoor enthusiasts
        who care deeply about healthy rivers, lakes, and oceans.  
        Together with volunteers, educators, and local communities we keep
        GoFish up-to-date and relevant.
      </p>
    </section>

    <div class="container"><hr class="divider" /></div>

    <!-- What we do -->
    <section class="section features container">
      <h2 class="section-title">What we do</h2>
      <p class="section-subtitle">
        GoFish combines conservation knowledge with digital tools to support
        recreational fishers everywhere.
      </p>
      <div class="grid">
        <div class="card"><div class="icon">📏</div><h3>Size limits</h3><p>Show legal size ranges for each species to prevent overharvest.</p></div>
        <div class="card"><div class="icon">📊</div><h3>Catch quotas</h3><p>Daily and seasonal quotas explained clearly for every zone.</p></div>
        <div class="card"><div class="icon">🗓️</div><h3>Seasonal closures</h3><p>Highlight when and where fishing is closed to allow stock recovery.</p></div>
        <div class="card"><div class="icon">🗺️</div><h3>Zones</h3><p>Interactive maps of fishing zones with rules relevant to each area.</p></div>
      </div>
    </section>

    <div class="container"><hr class="divider" /></div>

    <!-- Our organisation -->
    <section class="section features container">
      <h2 class="section-title">Our organisation</h2>
      <p class="section-subtitle">
        GoFish is structured to connect science, technology, and community.
      </p>
      <div class="grid">
        <div class="card">
          <h3>Research & Data</h3>
          <p>Work with marine scientists to ensure our rules reflect current ecology.</p>
        </div>
        <div class="card">
          <h3>Technology</h3>
          <p>Develop and maintain the GoFish dashboard for real-time guidance.</p>
        </div>
        <div class="card">
          <h3>Community & Outreach</h3>
          <p>Engage with anglers, schools, and conservation groups to spread awareness.</p>
        </div>
      </div>
    </section>

    <div class="container"><hr class="divider" /></div>

    <!-- Responsibility -->
    <section class="section container">
      <h2 class="section-title">Our responsibility</h2>
      <p class="section-subtitle">
        GoFish is committed to making recreational fishing safe, enjoyable, and
        sustainable for future generations. We work to ensure our platform
        is accurate, inclusive, and respectful of all communities who share
        our waters.
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
</script>

<style scoped>
.about {
  --space-section: 100px;
  --space-grid-gap: 16px;
  background: #fff;
  color: #0f172a;
}
.section {
  padding-top: var(--space-section);
  padding-bottom: var(--space-section);
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}
.section-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0 0 12px;
}
.section-subtitle {
  color: #475569;
  margin: 0 0 28px;
}
.list {
  margin: 0;
  padding-left: 20px;
  color: #475569;
}
.features .grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-grid-gap);
  margin: 0;
}
@media (max-width: 1024px) {
  .features .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .features .grid { grid-template-columns: 1fr; }
}
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
  transition: box-shadow .2s, transform .2s, border-color .2s;
}
.card:hover {
  border-color: rgba(13,155,181,1);
  box-shadow: 0 10px 24px rgba(13,155,181,0.18);
  transform: translateY(-2px);
}
.card .icon { font-size: 26px; margin-bottom: 8px; }
.card h3 { font-size: 1.125rem; font-weight: 700; margin: 0 0 6px; }
.card p { color: #475569; margin: 0; }
.divider {
  display: block;
  width: 100%;
  border: 0;
  height: 0;
  border-top: 2px solid #cbd5e1;
  margin: calc(var(--space-section) * 0.6) auto;
}
/* Normalize first/last child margins inside sections */
.section > :first-child { margin-top: 0; }
.section > :last-child  { margin-bottom: 0; }
.section:first-of-type {
  padding-top: var(--header-height);  
}
.about .section:last-of-type {
  padding-bottom: 70px;  
}
</style>