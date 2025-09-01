<template>
  <main class="home">
    <section class="hero">
      <div class="brand">
        <img class="logo" src="@/assets/logo.png" alt="GoFish logo" />
        <h1 class="title">GoFish</h1>
      </div>
      <p class="tagline">Know the rules. Respect the waters.</p>
      <p class="sub">
        Clear, reliable, and up-to-date fishing regulations and compliance guidance for recreational anglers.
      </p>
      <div class="cta">
        <RouterLink to="/dashboard" class="btn primary">Open Dashboard</RouterLink>
        <RouterLink to="/about" class="btn ghost">Learn More</RouterLink>
      </div>
    </section>

    <section class="highlights">
      <article class="card">
        <div class="icon">🎯</div>
        <h3>At a Glance</h3>
        <p>Size, quotas, seasonal and gear restrictions presented intuitively.</p>
      </article>
      <article class="card">
        <div class="icon">🧭</div>
        <h3>Zone Specific</h3>
        <p>Clear distinctions between regions and water zones to avoid confusion.</p>
      </article>
      <article class="card">
        <div class="icon">🌿</div>
        <h3>Sustainable</h3>
        <p>Responsible fishing that protects ecosystems and future stocks.</p>
      </article>
    </section>

    <section class="bottom-cta">
      <h3>Ready to get started?</h3>
      <RouterLink to="/dashboard" class="btn primary lg">Start Now</RouterLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
:root { --brand:#2643e9; --ink:#212121; --sub:#5f6b7b; --line:#e9eef7; --bg-soft:#f6f8ff; }
.home { display:grid; gap:56px; }
.hero { padding:72px 16px 48px; text-align:center; background:#fff; border-bottom:1px solid var(--line); }
.brand { display:inline-flex; align-items:center; gap:8px; }
.logo { height:40px; width:auto; }
.title { margin:0; font-size:42px; letter-spacing:.5px; }
.tagline { margin:10px 0 6px; font-size:18px; color:var(--brand); font-weight:700; }
.sub { margin:0 auto 18px; max-width:720px; color:var(--sub); }
.cta { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
.btn { display:inline-block; padding:10px 16px; border-radius:10px; text-decoration:none; font-weight:600; border:1px solid var(--line); color:var(--ink); }
.btn.primary { background:var(--brand); color:#fff; border-color:var(--brand); }
.btn.ghost { background:#fff; }
.btn.lg { padding:14px 22px; font-size:16px; }
.highlights { display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); padding:0 16px; }
.card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:18px; }
.card .icon { font-size:22px; }
.card h3 { margin:8px 0 6px; }
.bottom-cta { text-align:center; padding:8px 16px 64px; }
@media (max-width:640px){ .title{font-size:32px}.logo{height:32px} }
</style>