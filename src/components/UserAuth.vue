<template>
  <div class="user-auth">
    <button class="btn" @click="openLogin = true">Login</button>
    <button class="btn" @click="openRegister = true">Register</button>

    <div v-if="openLogin" class="modal" @click.self="openLogin = false">
      <div class="modal-content">
        <h3>Login</h3>
        <form @submit.prevent="handleLogin">
          <input v-model="loginEmail" type="email" placeholder="Email" required />
          <input v-model="loginPassword" type="password" placeholder="Password" required />
          <button type="submit" class="btn">Submit</button>
        </form>
        <button class="btn-close" @click="openLogin = false">Close</button>
      </div>
    </div>

    <div v-if="openRegister" class="modal" @click.self="openRegister = false">
      <div class="modal-content">
        <h3>Register</h3>
        <form @submit.prevent="handleRegister">
          <input v-model="registerEmail" type="email" placeholder="Email" required />
          <input v-model="registerPassword" type="password" placeholder="Password" required />
          <button type="submit" class="btn">Submit</button>
        </form>
        <button class="btn-close" @click="openRegister = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const openLogin = ref(false)
const openRegister = ref(false)
const loginEmail = ref(''); const loginPassword = ref('')
const registerEmail = ref(''); const registerPassword = ref('')
const handleLogin = () => { console.log('Login:', loginEmail.value, loginPassword.value); openLogin.value = false }
const handleRegister = () => { console.log('Register:', registerEmail.value, registerPassword.value); openRegister.value = false }
</script>

<style scoped>
.user-auth { display:flex; gap:8px; }
.btn { padding:4px 10px; border:1px solid #333; background:white; cursor:pointer; }
.btn:hover { background:#eee; }
.btn-close { margin-top:8px; padding:4px 10px; border:1px solid #999; background:#f2f2f2; cursor:pointer; }
.modal { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; }
.modal-content { background:white; padding:20px; border-radius:6px; min-width:300px; display:flex; flex-direction:column; gap:10px; }
</style>