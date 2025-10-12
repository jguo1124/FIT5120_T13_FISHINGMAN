<template>
  <div class="empty">
    <div class="emoji">🪼</div>
    <div class="title">No species on this page</div>
    <div class="sub">Try another keyword or change filters.</div>
  </div>
</template>

<style scoped>
.empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 24px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}
.emoji { font-size: 36px; }
.title { font-weight: 700; margin-top: 6px; }
.sub { color: #64748b; margin-top: 2px; }
</style>
