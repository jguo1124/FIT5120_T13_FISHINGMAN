<template>
  <div class="user-auth" @keydown.esc="closeAll">
    <button class="btn" @click="openLogin = true">Login</button>
    <button class="btn" @click="openRegister = true">Register</button>

    <!-- Login Modal -->
    <div
      v-if="openLogin"
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      @click.self="openLogin = false"
    >
      <div class="modal-content">
        <h3 id="login-title">Login</h3>
        <form @submit.prevent="handleLogin" class="form">
          <input v-model="loginEmail" type="email" placeholder="Email" required class="input" />
          <input v-model="loginPassword" type="password" placeholder="Password" required class="input" />
          <div class="form__actions">
            <button type="button" class="btn" @click="openLogin = false">Close</button>
            <button type="submit" class="btn">Submit</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Register Modal -->
    <div
      v-if="openRegister"
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-title"
      @click.self="openRegister = false"
    >
      <div class="modal-content">
        <h3 id="register-title">Register</h3>
        <form @submit.prevent="handleRegister" class="form">
          <input
            v-model="registerName"
            type="text"
            placeholder="Full Name"
            required
            class="input"
          />
          <input v-model="registerEmail" type="email" placeholder="Email" required class="input" />
          <input v-model="registerPassword" type="password" placeholder="Password" required class="input" />
          <div class="form__actions">
            <button type="button" class="btn" @click="openRegister = false">Close</button>
            <button type="submit" class="btn">Submit</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const openLogin = ref(false)
const openRegister = ref(false)

const loginEmail = ref('')
const loginPassword = ref('')
const registerEmail = ref('')
const registerPassword = ref('')

const handleLogin = () => {
  console.log('Login:', loginEmail.value, loginPassword.value)
  openLogin.value = false
}
const handleRegister = () => {
  console.log('Register:', registerEmail.value, registerPassword.value)
  openRegister.value = false
}

function closeAll() {
  openLogin.value = false
  openRegister.value = false
}

/** Prevent background scroll when any modal is open */
watch([openLogin, openRegister], ([loginOpen, regOpen]) => {
  const anyOpen = loginOpen || regOpen
  document.documentElement.style.overflow = anyOpen ? 'hidden' : ''
  document.body.style.overflow = anyOpen ? 'hidden' : ''
})
</script>

  <style scoped>
  .user-auth {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  /* Overlay: full-screen mask that hides page content */
  .modal {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: grid;
    place-items: center;                   /* center the card */
    padding: 20px;
    background: rgba(0,0,0,.6);            /* darker mask to hide content */
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
  }

  /* Centered card */
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

  .btn-close:hover {
    text-decoration: underline;
    box-shadow: 0 3px 6px rgba(0,0,0,.15);
  }

  /* Inputs & form layout */
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

  .form__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
  }

  .btn,
  .btn-close {
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
  .btn-close:hover {
    color: rgba(13,155,181,1);
    text-decoration: underline;
    box-shadow: 0 4px 8px rgba(13,155,181,0.25); 
    transform: translateY(-1px);
  }
  </style>