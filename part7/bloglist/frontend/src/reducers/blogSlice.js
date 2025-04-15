import { createSlice } from '@reduxjs/toolkit'
import blogService from '../services/blogs'
import { showNotification } from './notificationSlice'

const blogSlice = createSlice({
  name: 'blogs',
  initialState: [],
  reducers: {
    setBlogs(state, action) {
      return action.payload
    },

    appendBlog(state, action) {
      state.push(action.payload)
    },
    // Action to update a blog (for later)
    // updateBlog(state, action) {
    //   const updatedBlog = action.payload
    //   return state.map(blog =>
    //     blog.id !== updatedBlog.id ? blog : updatedBlog
    //   )
    // }
    // Action to remove a blog (for later)
    // removeBlog(state, action) {
    //   const idToRemove = action.payload // Expecting id as payload
    //   return state.filter(blog => blog.id !== idToRemove)
    // }
  },
})

export const { setBlogs, appendBlog /*, updateBlog, removeBlog */ } = blogSlice.actions

export const initializeBlogs = () => {
  return async (dispatch) => {
    try {
      const blogs = await blogService.getAll()
      dispatch(setBlogs(blogs))
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
      dispatch(showNotification('Could not fetch blogs from server', 'error'))
    }
  }
}

export const createBlog = (blogObject) => {
  return async (dispatch) => {
    try {
      const newBlog = await blogService.create(blogObject)
      dispatch(appendBlog(newBlog))
      dispatch(showNotification(`A new blog ${newBlog.title} by ${newBlog.author} added`, 'success'))
      return newBlog
    } catch (error) {
      console.error('Failed to create blog:', error)
      const errorMessage = error.response?.data?.error || 'Failed to add blog'
      dispatch(showNotification(errorMessage, 'error'))
      return null
    }
  }
}

export default blogSlice.reducer
