import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export const api = axios.create({
  baseURL,
  timeout: 180_000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Diagnosis timed out. Please try again with a clearer leaf image.'))
    }

    if (!err?.response) {
      return Promise.reject(new Error('Cannot reach the backend. Make sure the API server is running on port 8000.'))
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

export async function sendChat({ messages, disease }) {
  const { data } = await api.post('/chat', { messages, disease })
  return data
}

export async function fetchHistory({ limit = 50, offset = 0 } = {}) {
  const { data } = await api.get('/history', { params: { limit, offset } })
  return data
}

export async function deleteHistoryItem(id) {
  await api.delete(`/history/${id}`)
}
