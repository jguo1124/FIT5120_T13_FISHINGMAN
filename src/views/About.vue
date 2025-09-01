<template>
  <main class="about">
    <!-- Hero -->
    <section class="hero">
      <h1>About GoFish</h1>
      <p class="tag">Conserving Nature under Climate Change</p>
      <p class="lead">
        GoFish is an integrated compliance and conservation tool for recreational fishers.
        It consolidates size limits, quotas, seasonal closures, and zone restrictions into
        a single dashboard so you can fish responsibly and protect biodiversity.
      </p>
      <RouterLink to="/dashboard" class="btn primary">Open Dashboard</RouterLink>
    </section>

    <!-- Why it matters -->
    <section class="grid">
      <article class="card">
        <h3>Why it matters</h3>
        <ul class="bullets">
          <li>Warming waters shift breeding seasons and species ranges.</li>
          <li>Extreme weather increases local habitat stress.</li>
          <li>Overfishing plus climate pressure magnifies risks.</li>
        </ul>
      </article>
      <article class="card">
        <h3>Our mission</h3>
        <ul class="bullets">
          <li>Make rules clear and trusted—what, where, and when you can fish.</li>
          <li>Unify regional differences into one simple view.</li>
          <li>Detect protected species and alert in real time.</li>
        </ul>
      </article>
    </section>

    <!-- Features aligned to stories -->
    <section class="features">
      <h2>What GoFish provides</h2>
      <div class="cards">
        <article class="feature"><h4>Size Limits</h4><p>Minimum/maximum legal sizes per species. “No size limits” when missing.</p></article>
        <article class="feature"><h4>Catch Quotas</h4><p>Daily and seasonal quotas; auto-update by zone. “No quota limits” when none.</p></article>
        <article class="feature"><h4>Seasonal Closures</h4><p>Clear “Closed Season” badge when applicable; otherwise “Open Season”.</p></article>
        <article class="feature"><h4>Zone Rules</h4><p>Select a zone to see only relevant restrictions; default guidance if none.</p></article>
        <article class="feature"><h4>Integrated Dashboard</h4><p>All four rule types together with placeholders for missing data.</p></article>
        <article class="feature"><h4>Protected Species</h4><p>Cross-checks catches with threatened lists in under 5s; alerts within 3s.</p></article>
        <article class="feature"><h4>Compliance Records</h4><p>Logs species, time, and location for proof of compliance.</p></article>
      </div>
    </section>

    <!-- CTA -->
    <section class="bottom-cta">
      <h3>Make every trip a step toward protecting nature</h3>
      <RouterLink to="/dashboard" class="btn primary lg">Start with GoFish</RouterLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
:root { --ink:#1d2939; --sub:#667085; --line:#e6eaf2; --brand:#2643e9; }
.about { display:grid; gap:32px; padding:16px; color:var(--ink); }

/* hero */
.hero { text-align:center; padding:24px 8px 10px; border-bottom:1px solid var(--line); }
.hero h1 { margin:0 0 8px; font-size:28px; }
.tag { color:var(--brand); font-weight:700; margin:0 0 8px; }
.lead { margin:0 auto 12px; max-width:840px; color:var(--sub); }
.btn { display:inline-block; padding:10px 16px; border-radius:10px; border:1px solid var(--line);
       background:#fff; color:var(--ink); text-decoration:none; font-weight:600; }
.btn.primary { background:var(--brand); color:#fff; border-color:var(--brand); }
.btn.lg { padding:12px 18px; }

/* grid cards */
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:12px; }
.card { background:#fff; border:1px solid var(--line); border-radius:12px; padding:14px; }
.bullets { list-style:disc inside; display:grid; gap:6px; margin:0; padding:0; }

/* features */
.features { display:grid; gap:12px; }
.features .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; }
.feature { border:1px solid var(--line); border-radius:10px; padding:12px; background:#fff; }

/* bottom cta */
.bottom-cta { text-align:center; padding:20px; border-top:1px solid var(--line); }
</style>