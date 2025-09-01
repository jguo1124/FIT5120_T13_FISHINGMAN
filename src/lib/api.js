import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false, // set true if your backend uses cookies/session
  timeout: 10000,
})

// optional: response error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API ERROR]', err?.response?.status, err?.message)
    return Promise.reject(err)
  }
)