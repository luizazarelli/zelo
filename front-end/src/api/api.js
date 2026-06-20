import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000/api/v1', paramsSerializer: { indexes: null } })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authApi = {
  signUp: (data) => api.post('/auth/sign-up', data),
  signIn: (data) => api.post('/auth/sign-in', data),
}

export const SERVER_BASE = 'http://localhost:8000'

export const userApi = {
  update: (userId, data) => api.patch(`/user/${userId}`, data),
  uploadPhoto: (userId, formData) =>
    api.post(`/user/${userId}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

export const serviceTypeApi = {
  list: () => api.get('/service-type'),
}

export const workerApi = {
  search: (serviceTypes) => api.get('/worker', { params: serviceTypes ? { serviceTypes } : {} }),
  getPhotos: (workerId) => api.get(`/worker/${workerId}/photo`),
  uploadPhoto: (workerId, formData) =>
    api.post(`/worker/${workerId}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePhoto: (workerId, photoId) => api.delete(`/worker/${workerId}/photo/${photoId}`),
}

export const hireApi = {
  create: (data) => api.post('/hire', data),
  list: (userId, role, status) => api.get('/hire', { params: { userId, role, ...(status && { status }) } }),
  previous: (userId, role) => api.get('/hire/previous', { params: { userId, role } }),
  updateStatus: (hireId, status) => api.patch(`/hire/${hireId}/status`, { status }),
}

export const messageApi = {
  send: (hireId, data) => api.post(`/hire/${hireId}/message`, data),
  list: (hireId, requesterId) => api.get(`/hire/${hireId}/message`, { params: { requesterId } }),
}

export const paymentApi = {
  process: (hireId, amount) => api.post(`/hire/${hireId}/payment`, { amount }),
  get: (hireId) => api.get(`/hire/${hireId}/payment`),
}
