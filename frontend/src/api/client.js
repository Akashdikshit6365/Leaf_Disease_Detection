import axios from 'axios'
import { Capacitor } from '@capacitor/core'

const webBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
const nativeBaseURL =
  import.meta.env.VITE_MOBILE_API_BASE_URL ||
  import.meta.env.VITE_ANDROID_API_BASE_URL ||
  'http://10.0.2.2:8000/api'

// Use a separate API base URL for native builds so browser dev and phone testing
// do not overwrite each other via the same Vite variable.
export const apiBaseURL = Capacitor.isNativePlatform() ? nativeBaseURL : webBaseURL

export const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 180_000,
})

export function getAuthToken() {
  return localStorage.getItem('leafai_token')
}

export function setAuthSession({ token, user }) {
  localStorage.setItem('leafai_token', token)
  localStorage.setItem('leafai_user', JSON.stringify(user))
}

export function clearAuthSession() {
  localStorage.removeItem('leafai_token')
  localStorage.removeItem('leafai_user')
  window.dispatchEvent(new Event('leafai-auth-cleared'))
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('leafai_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearAuthSession()
    }

    if (err?.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Diagnosis timed out. Please try again with a clearer leaf image.'))
    }

    if (!err?.response) {
      return Promise.reject(
        new Error(`Cannot reach the backend at ${apiBaseURL}. Make sure the API server is reachable from this device.`),
      )
    }

    const detail = err?.response?.data?.detail
    const message =
      (typeof detail === 'string' ? detail : detail?.message) ||
      err?.response?.data?.message ||
      err?.message ||
      'Unknown error'
    return Promise.reject(new Error(message))
  },
)

// ─────────── endpoints ───────────
export async function predictImage(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/predict', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function registerAccount({ name, email, password }) {
  const { data } = await api.post('/auth/register', { name, email, password })
  setAuthSession({ token: data.access_token, user: data.user })
  return data
}

export async function loginAccount({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password })
  setAuthSession({ token: data.access_token, user: data.user })
  return data
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/auth/me')
  localStorage.setItem('leafai_user', JSON.stringify(data))
  return data
}

export async function diagnoseImage(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/scan/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180_000,
  })
  return data
}

export async function askAI({ disease, question }) {
  const { data } = await api.post('/ask-ai', { disease, question })
  return data
}

export async function sendChat({ messages, disease, diagnosisContext }) {
  const { data } = await api.post('/chat', {
    messages,
    disease,
    diagnosis_context: diagnosisContext || null,
  })
  return data
}

export async function fetchHistory({ limit = 50, offset = 0 } = {}) {
  const { data } = await api.get('/history', { params: { limit, offset } })
  return data
}

export async function deleteHistoryItem(id) {
  await api.delete(`/history/${id}`)
}
