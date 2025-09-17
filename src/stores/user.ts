import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const userName = ref('')
  const userEmail = ref('')
  const avatarUrl = ref('')

  function login(name: string, email: string) {
    isLoggedIn.value = true
    userName.value = name
    userEmail.value = email
    avatarUrl.value = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
    // persist
    localStorage.setItem('userName', name)
    localStorage.setItem('userEmail', email)
  }

  function logout() {
    isLoggedIn.value = false
    userName.value = ''
    userEmail.value = ''
    avatarUrl.value = ''
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userPassword')
  }

  function updateName(newName: string) {
    userName.value = newName
    avatarUrl.value = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}`
    localStorage.setItem('userName', newName)
  }

  // hydrate from localStorage (for simulated auth)
  function hydrate() {
    const n = localStorage.getItem('userName')
    const e = localStorage.getItem('userEmail')
    if (n && e) {
      isLoggedIn.value = true
      userName.value = n
      userEmail.value = e
      avatarUrl.value = `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}`
    }
  }
  hydrate()

  return { isLoggedIn, userName, userEmail, avatarUrl, login, logout, updateName, hydrate }
})