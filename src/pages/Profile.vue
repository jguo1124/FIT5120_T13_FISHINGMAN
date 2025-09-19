<template>
  <section class="profile">
    <h1>Profile</h1>

    <div class="card">
      <div class="row">
        <img
          :src="user.avatarUrl || fallback"
          class="avatar"
          alt="avatar"
        />
        <div class="meta">
          <label class="label">Display Name</label>
          <input v-model="draftName" class="input" type="text" placeholder="Your name" />
          <label class="label">Email</label>
          <input :value="user.userEmail" class="input" type="email" disabled />
          <div class="actions">
            <button class="btn" @click="onSave" :disabled="!canSave">Save</button>
            <button class="btn ghost" @click="onReset" :disabled="draftName === user.userName">Reset</button>
          </div>
        </div>
      </div>
    </div>

    <RouterLink to="/favorites" class="link">→ Go to Favorites</RouterLink>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const draftName = ref(user.userName)
const fallback = computed(() =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userName || 'U')}`
)

const canSave = computed(() =>
  draftName.value.trim().length > 0 && draftName.value.trim() !== user.userName
)

function onSave() {
  user.updateName(draftName.value.trim())
  alert('Profile updated.')
}

function onReset() {
  draftName.value = user.userName
}
</script>

<style scoped>
.profile { padding: 24px; }
h1 { margin: 0 0 16px; }
.card {
  background: #fff; border: 1px solid #eee; border-radius: 14px;
  padding: 16px; box-shadow: 0 6px 20px rgba(0,0,0,.06);
}
.row { display: flex; gap: 16px; align-items: center; }
.avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; flex: 0 0 80px; }
.meta { display: grid; gap: 8px; flex: 1; }
.label { font-size: 12px; color: #666; }
.input {
  width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #e5e7eb;
}
.input:focus { outline: none; border-color: #0da; box-shadow: 0 0 0 3px rgba(0,221,170,.15); }
.actions { display: flex; gap: 8px; margin-top: 8px; }
.btn {
  padding: 8px 14px; border: none; border-radius: 8px; background: #0da; color: #fff; cursor: pointer;
}
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn.ghost { background: #f5f5f5; color: #222; }
.link { display: inline-block; margin-top: 16px; color: #0a7; text-decoration: none; }
.link:hover { text-decoration: underline; }
@media (max-width: 640px) {
  .row { flex-direction: column; align-items: flex-start; }
  .avatar { width: 64px; height: 64px; }
}
</style>