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
        <!-- after login: show user badge -->
        <div
          v-if="userStore.isLoggedIn"
          class="user-badge"
          @click="toggleMenu"
          @keydown.enter.prevent="toggleMenu"
          tabindex="0"
          aria-haspopup="menu"
          :aria-expanded="menuOpen ? 'true' : 'false'"
        >
          <img v-if="userStore.avatarUrl" :src="userStore.avatarUrl" alt="avatar" class="avatar" />
          <div v-else class="avatar avatar-fallback">{{ initials }}</div>

          <div class="meta">
            <span class="name" :title="userStore.userName">{{ userStore.userName }}</span>
            <span class="email" :title="userStore.userEmail">{{ userStore.userEmail }}</span>
          </div>

          <svg class="caret" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>

          <!-- dropdown menu -->
          <div v-show="menuOpen" class="menu" role="menu">
            <RouterLink to="/favorites" class="menu-item" role="menuitem">Favourite</RouterLink>
            <RouterLink to="/profile" class="menu-item" role="menuitem">Profile</RouterLink>
            <div class="menu-item" role="menuitem" @click="logout">Logout</div>
          </div>
        </div>

        <!-- before login: show login/register buttons -->
        <UserAuth v-else />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import Nav from './Nav.vue'
import UserAuth from './UserAuth.vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  const badge = document.querySelector('.user-badge')
  if (badge && !badge.contains(target)) menuOpen.value = false
}
function logout() {
  userStore.logout()
  menuOpen.value = false
}
const initials = computed(() => {
  const n = (userStore.userName || '').trim()
  if (!n) return 'U'
  const parts = n.split(/\s+/).slice(0, 2)
  return parts.map(p => p[0]?.toUpperCase() || '').join('')
})

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.header {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 50px;
  background: #ffffff;
  border: none;
  box-shadow: none;
  z-index: 1000;
  padding: 0 16px;
}
.inner { height: 100%; display: flex; justify-content: space-between; align-items: center; }
.left { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 18px; }
.logo { height: 48px; width: auto; }
.header, .header span, .header input { color: #000000; }
.brand { color: rgba(13,155,181,1); font-weight: 800; text-decoration: none; display: inline-block; }
.right { display: flex; align-items: center; gap: 12px; }

/* user badge */
.user-badge{
  position: relative;
  display: flex; align-items: center; gap: 10px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f7fbff;
  border: 1px solid #e6f0ff;
  cursor: pointer;
  transition: box-shadow .18s ease, transform .18s ease, background .18s ease;
  user-select: none;
}
.user-badge:hover{ box-shadow: 0 6px 16px rgba(13,155,181,.15); transform: translateY(-1px); background:#f9fdff; }
.user-badge:focus-visible{ outline: 3px solid rgba(13,155,181,.28); }

.avatar{
  width:30px; height:30px; border-radius:50%; object-fit:cover; flex:0 0 30px;
  box-shadow:0 0 0 2px #fff, 0 1px 4px rgba(0,0,0,.08);
}
.avatar-fallback{
  display:flex; align-items:center; justify-content:center;
  width:30px; height:30px; border-radius:50%;
  background: linear-gradient(135deg, #0db, #09b);
  color:#fff; font-weight:800; font-size:12px; letter-spacing:.3px;
  box-shadow:0 0 0 2px #fff, 0 1px 4px rgba(0,0,0,.08);
}
.meta{ display:flex; flex-direction:column; line-height:1.05; }
.name{ font-weight:700; font-size:13px; max-width:150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.email{ font-size:11px; opacity:.7; max-width:150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

.caret{ width:18px; height:18px; opacity:.6; }
.caret path{ stroke:#000; stroke-width:2; fill:none; }

/* dropdown menu */
.menu{
  position:absolute; right:0; top:44px;
  min-width:180px; background:#fff; border:1px solid #eaeaea;
  border-radius:12px; box-shadow:0 16px 40px rgba(0,0,0,.12);
  padding:8px; z-index:2001;
}
.menu-item{
  display:block; width:100%; text-align:left;
  padding:10px 12px; border-radius:8px;
  text-decoration:none; color:#111; font-size:14px;
  transition: background .15s ease, transform .15s ease;
}
.menu-item:hover, .menu-item:focus-visible{ background:#f5faff; }

/* smaller screen */
@media (max-width: 960px){
  .email{ display:none; }
  .name{ max-width: 92px; }
}
</style>