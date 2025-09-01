<template>
  <header class="header">
    <div class="inner">
      <div class="left">
        <img class="logo" src="@/assets/logo.png" alt="GoFish logo" />
        <span class="brand">GoFish</span>
      </div>
      <Nav />
      <div class="right">
        <input v-model="search" type="text" placeholder="Search" class="search" />
        <UserAuth />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Nav from './Nav.vue'
import UserAuth from './UserAuth.vue'
const search = ref('')
</script>

<style scoped>
.header { height:56px; margin-bottom:20px; background:#f8f8f8; border-bottom:1px solid #ccc; padding:0 16px; }
.inner { height:56px; display:flex; justify-content:space-between; align-items:center; }
.left { display:flex; align-items:center; gap:8px; font-weight:bold; font-size:18px; }
.logo { height:80px; width:auto; }
.right { display:flex; align-items:center; gap:16px; }
.search { padding:4px 8px; border:1px solid #ccc; border-radius:4px; }
</style>