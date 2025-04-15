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

    updateBlog(state, action) {
      const updatedBlog = action.payload
      return state.map((blog) => (blog.id !== updatedBlog.id ? blog : updatedBlog))
    },

    removeBlog(state, action) {
      const idToRemove = action.payload
      return state.filter((blog) => blog.id !== idToRemove)
    },
  },
})

export const { setBlogs, appendBlog, updateBlog, removeBlog } = blogSlice.actions

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

export const likeBlog = (blogToLike) => {
  return async (dispatch) => {
    const blogId = blogToLike.id
    const updatedBlogData = {
      title: blogToLike.title,
      author: blogToLike.author,
      url: blogToLike.url,
      likes: (blogToLike.likes || 0) + 1,
      user: blogToLike.user.id,
    }

    try {
      const returnedUpdatedBlog = await blogService.update(blogId, updatedBlogData)
      dispatch(updateBlog(returnedUpdatedBlog))
    } catch (error) {
      console.error('Failed to like blog:', error)
      const errorMessage = error.response?.data?.error || 'Failed to update likes'
      dispatch(showNotification(errorMessage, 'error'))
    }
  }
}

export const deleteBlog = (blogToDelete) => {
  return async (dispatch) => {
    const blogId = blogToDelete.id

    try {
      await blogService.remove(blogId)
      dispatch(removeBlog(blogId))
      dispatch(showNotification(`Blog ${blogToDelete.title} deleted`, 'success'))
    } catch (error) {
      console.error('Failed to delete blog:', error)
      let errorMessage = 'Failed to delete blog'
      if (error.response && error.response.status === 401) {
        errorMessage = error.response.data.error || 'Session expired or unauthorized. Please log in again.'
      } else if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error
      }
      dispatch(showNotification(errorMessage, 'error'))
    }
  }
}

export default blogSlice.reducer
