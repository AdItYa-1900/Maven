import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const googleAuth = (data) => api.post('/auth/google', data)

// User
export const getProfile = () => api.get('/users/me')
export const updateProfile = (data) => api.put('/users/profile', data)
export const getUserById = (userId) => api.get(`/users/${userId}`)

// Matches
export const getMyMatches = () => api.get('/matches/my-matches')
export const acceptMatch = (matchId) => api.post(`/matches/${matchId}/accept`)
export const declineMatch = (matchId) => api.post(`/matches/${matchId}/decline`)
export const getMatch = (matchId) => api.get(`/matches/${matchId}`)

// Classroom
export const getClassroomByMatch = (matchId) => api.get(`/classrooms/match/${matchId}`)
export const startSession = (matchId) => api.post(`/classrooms/match/${matchId}/start`)
export const endSession = (matchId) => api.post(`/classrooms/match/${matchId}/end`)
export const getChatHistory = (matchId) => api.get(`/classrooms/match/${matchId}/chat`)
export const saveWhiteboard = (matchId, data) => api.post(`/classrooms/match/${matchId}/whiteboard`, { data })

// Reviews
export const submitReview = (data) => api.post('/reviews', data)
export const getUserReviews = (userId) => api.get(`/reviews/user/${userId}`)
export const checkReviewStatus = (matchId) => api.get(`/reviews/check/${matchId}`)

export default api
