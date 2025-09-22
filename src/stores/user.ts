import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'userSession'

function safeSessionStorage() {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage
  } catch (err) {
    console.warn('[auth] Unable to access sessionStorage:', err)
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const userName = ref('')
  const userEmail = ref('')
  const avatarUrl = ref('')
  const authToken = ref('')
  const userRole = ref('')

  function persist() {
    const storage = safeSessionStorage()
    if (!storage) return
    const payload = {
      token: authToken.value,
      name: userName.value,
      email: userEmail.value,
      role: userRole.value,
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  function loadFromStorage() {
    const storage = safeSessionStorage()
    if (!storage) return null
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch (err) {
      console.warn('[auth] Failed to parse session payload:', err)
      storage.removeItem(STORAGE_KEY)
      return null
    }
  }

  function applyProfile({
    token,
    name,
    email,
    role,
  }: { token: string; name?: string; email?: string; role?: string }) {
    if (typeof token !== 'string' || !token.trim()) {
      throw new Error('Missing authentication token');
    }
    authToken.value = token
    userName.value = name || 'Administrator'
    userEmail.value = email || ''
    userRole.value = role || ''
    avatarUrl.value = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.value || 'A')}`
    isLoggedIn.value = true
    persist()
  }

  function logout() {
    authToken.value = ''
    isLoggedIn.value = false
    userName.value = ''
    userEmail.value = ''
    userRole.value = ''
    avatarUrl.value = ''
    const storage = safeSessionStorage()
    storage?.removeItem(STORAGE_KEY)
  }

  function updateName(newName: string) {
    userName.value = newName
    avatarUrl.value = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName || 'A')}`
    persist()
  }

  function hydrate() {
    const saved = loadFromStorage()
    if (!saved) return
    if (saved.token) {
      authToken.value = saved.token
      userName.value = saved.name || 'Administrator'
      userEmail.value = saved.email || ''
      userRole.value = saved.role || ''
      avatarUrl.value = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.value || 'A')}`
      isLoggedIn.value = true
    }
  }

  hydrate()

  return {
    isLoggedIn,
    userName,
    userEmail,
    avatarUrl,
    authToken,
    userRole,
    applyProfile,
    logout,
    updateName,
    hydrate,
  }
})
