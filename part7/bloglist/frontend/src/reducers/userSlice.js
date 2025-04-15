import { createSlice } from '@reduxjs/toolkit'
import loginService from '../services/login'
import blogService from '../services/blogs'
import { showNotification } from './notificationSlice'

const userSlice = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    setUser(state, action) {
      return action.payload
    },

    clearUser(state, action) {
      return null
    },
  },
})

export const { setUser, clearUser } = userSlice.actions

// Thunk for initializing user from localStorage
export const initializeUser = () => {
  return (dispatch) => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      dispatch(setUser(user))
      blogService.setToken(user.token) // Set token for API calls
      console.log('Initialized user from storage:', user.username)
    } else {
      console.log('No user found in storage.')
    }
  }
}

// Thunk for handling user login
export const loginUser = (credentials) => {
  return async (dispatch) => {
    try {
      const user = await loginService.login(credentials)
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      dispatch(setUser(user))
    } catch (exception) {
      console.error('Login failed:', exception)
      dispatch(showNotification('Wrong username or password', 'error'))
    }
  }
}

// Thunk for handling user logout
export const logoutUser = () => {
  return (dispatch) => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    dispatch(clearUser())
  }
}

export default userSlice.reducer
