<template>
  <section class="news">
    <header class="news__header">
      <h2 class="news__title">Latest News</h2>
      <p class="news__subtitle">From Victorian Fisheries Authority</p>
      <div class="news__divider" aria-hidden="true"></div>
    </header>

    <div class="news__grid">
      <article v-for="(n, i) in news" :key="i" class="news__item">
        <img class="news__thumb" :src="n.image" :alt="n.title" />
        <div class="news__body">
          <h3 class="news__cardTitle">{{ n.title }}</h3>
          <p class="news__summary">{{ n.summary }}</p>
          <a :href="n.link" target="_blank" rel="noopener" class="btn btn-primary">Read More</a>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import img1 from '@/assets/news1.jpg'
import img2 from '@/assets/news2.jpg'
import img3 from '@/assets/news3.jpg'
import img4 from '@/assets/news4.jpg'

const news = [
  {
    image: img1,
    title: 'Recreational Fishing Grants Program - Applications Open',
    summary: 'Funding now available to improve fishing opportunities across Victoria.',
    link: 'https://vfa.vic.gov.au/about/news/recreational-fishing-grants-program-applications-open'
  },
  {
    image: img2,
    title: 'Snapper Season 2025 Update',
    summary: 'Key details on bag and size limits for the upcoming season.',
    link: 'https://vfa.vic.gov.au/about/news/snapper-season-2025-update'
  },
  {
    image: img3,
    title: 'Fish Stocking Reaches Record High',
    summary: 'Millions of native fish stocked in Victorian waterways this year.',
    link: 'https://vfa.vic.gov.au/about/news/fish-stocking-reaches-record-high'
  },
  {
    image: img4,
    title: 'Compliance & Education Initiatives',
    summary: 'New measures to support sustainable and responsible recreational fishing.',
    link: 'https://vfa.vic.gov.au/about/news'
  }
]
</script>

<style scoped>
.news {
  padding: clamp(48px, 7vw, 92px) clamp(16px, 6vw, 56px);
  background: #fff;
}

.news__header {
  text-align: center;
  margin-bottom: clamp(20px, 4vw, 36px);
}

.news__title {
  font-size: clamp(28px, 3.2vw, 40px);
  font-weight: 800;
  margin: 0 0 6px;
  color: #2b2b2b;
}

.news__subtitle {
  margin: 0 auto;
  color: #8a8a8a;
  font-size: clamp(14px, 1.6vw, 16px);
}

.news__divider {
  width: min(680px, 70%);
  height: 1px;
  margin: clamp(14px, 2vw, 18px) auto 0;
  background: linear-gradient(
    to right,
    rgba(0,0,0,0) 0%,
    rgba(0,0,0,.12) 20%,
    rgba(0,0,0,.12) 80%,
    rgba(0,0,0,0) 100%
  );
}

/* grid layout */
.news__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 32px 24px;
}

.news__item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.news__thumb {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  border-radius: 8px;
  object-fit: cover;
  background: #e8ecef;
}

.news__body {
  flex: 1;
}

.news__cardTitle {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 6px;
}

.news__summary {
  margin: 0 0 10px;
  color: #555;
  line-height: 1.5;
}

.btn {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.btn-primary {
  background: #08a9ef;
  color: #fff;
}
</style>