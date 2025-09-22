<template>
  <div class="user-auth" @keydown.esc="close">
    <button class="btn" @click="openLogin = true">Login</button>

    <div
      v-if="openLogin"
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      @click.self="openLogin = false"
    >
      <div class="modal-content">
        <h3 id="login-title">Administrator Login</h3>
        <form @submit.prevent="handleLogin" class="form">
          <input v-model="loginUsername" type="text" placeholder="Username" required class="input" autocomplete="username" />
          <input v-model="loginPassword" type="password" placeholder="Password" required class="input" autocomplete="current-password" />
          <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
          <div class="form__actions">
            <button type="button" class="btn" @click="openLogin = false" :disabled="isSubmitting">Close</button>
            <button type="submit" class="btn primary" :disabled="isSubmitting">
              <span v-if="isSubmitting">Logging in...</span>
              <span v-else>Submit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()

const API_BASE = import.meta?.env?.VITE_API_BASE || ''

const openLogin = ref(false)
const loginUsername = ref('')
const loginPassword = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  if (isSubmitting.value) return
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUsername.value.trim(), password: loginPassword.value }),
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = payload?.error?.message || 'Login failed. Please check your credentials.'
      throw new Error(message)
    }

    if (!payload?.token || typeof payload.token !== 'string' || !payload.token.trim()) {
      throw new Error('Invalid login response from server.');
    }

    const user = payload?.user || {}
    userStore.applyProfile({
      token: payload?.token,
      name: user.displayName || user.username,
      email: user.email,
      role: user.role,
    })

    loginPassword.value = ''
    openLogin.value = false
    router.push('/')
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = 'Login failed.'
    }
  } finally {
    isSubmitting.value = false
  }
}

function close() {
  openLogin.value = false
}

watch(openLogin, (isOpen) => {
  const root = document.documentElement
  const body = document.body
  if (isOpen) {
    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
  } else {
    root.style.overflow = ''
    body.style.overflow = ''
  }
})
</script>

<style scoped>
.user-auth {
  display: flex;
  gap: 6px;
  align-items: center;
}

.modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0,0,0,.6);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
}

.modal-content {
  width: min(520px, 92vw);
  background: #ffffff;
  border-radius: 16px;
  padding: 22px;
  box-shadow:
    0 30px 60px rgba(0,0,0,.22),
    0 10px 20px rgba(0,0,0,.12);
  animation: pop .18s ease-out;
}

@keyframes pop {
  from { transform: translateY(6px) scale(.98); opacity: 0; }
  to   { transform: translateY(0)   scale(1);    opacity: 1; }
}

.form {
  display: grid;
  gap: 10px;
  margin-top: 8px;
}

.input {
  width: 80%;
  max-width: 320px;
  margin: 0 auto;
  display: block;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #000;
}

.input::placeholder { color: #9ca3af; }
.input:focus {
  outline: none;
  border-color: #333;
  box-shadow: 0 0 0 4px rgba(0,0,0,.12);
}

.error {
  color: #b91c1c;
  font-size: 13px;
  margin: 4px auto 0;
}

.form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.btn,
.btn.primary {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  background: #ffffff;
  color: #000000;
  box-shadow: 0 2px 4px rgba(0,0,0,.1);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.btn:hover,
.btn.primary:hover {
  color: rgba(13,155,181,1);
  text-decoration: underline;
  box-shadow: 0 4px 8px rgba(13,155,181,0.25);
  transform: translateY(-1px);
}

.btn.primary {
  background: rgba(13,155,181,1);
  color: #fff;
}

.btn.primary:disabled,
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  text-decoration: none;
  transform: none;
}
</style>
