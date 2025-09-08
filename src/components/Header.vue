<template>
  <header class="header">
    <div class="inner">
      <div class="left">
        <img class="logo" src="@/assets/logo.png" alt="GoFish logo" />
        <RouterLink to="/" class="brand" active-class="" exact-active-class="">
          GoFish
        </RouterLink>
      </div>

      <Nav />

      <div class="right">
        <button v-if="!showSearch" class="search-icon" @click="openSearch" aria-label="Open search">
          🔍
        </button>
        <input
          v-else
          ref="searchInput"
          v-model="search"
          type="text"
          placeholder="Search"
          class="search"
          @blur="showSearch = false"
        />
        <UserAuth />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue' 
import Nav from './Nav.vue'
import UserAuth from './UserAuth.vue'

const search = ref('')
const showSearch = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

function openSearch() {
  showSearch.value = true
  nextTick(() => {
    searchInput.value?.focus()
  })
}
</script>

<style scoped>
.header {
  position: fixed;      /* stick to top */
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #ffffff;  /* white, opaque */
  border: none;         /* no border */
  box-shadow: none;     /* no shadow */
  z-index: 1000;
  padding: 0 16px;
}

.inner {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 18px;
}

.logo {
  height: 48px;
  width: auto;
}

/* keep header text color */
.header, .header span, .header input {
  color: #000000; 
}

.brand {
  color: rgba(13,155,181,1); 
  font-weight: 800;
  text-decoration: none;       
  display: inline-block; 
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;           
}

/* magnifier button */
.search-icon {
  font-size: 18px;
  background: transparent;
  border: none;
  color: #000;
  cursor: pointer;
  padding: 6px;
  line-height: 1;
  transition: color 0.3s ease, transform 0.3s ease;
}
.search-icon:hover {
  color: rgba(13,155,181,1);   /* hover color keep consistent */
  transform: scale(1.08);      /* hover grow animation */
}

/* collapsed to expanded input */
.search {
  width: 140px;                 /* default */
  max-width: 220px;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  outline: none;
  transition: width 0.3s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.search:focus {
  width: 220px;                 /* expand on focus */
  border-color: rgba(13,155,181,1);
  box-shadow: 0 0 0 3px rgba(13,155,181,0.25);
}
</style>