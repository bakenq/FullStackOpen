import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { showNotification } from './reducers/notificationSlice'
import { initializeBlogs, createBlog, likeBlog, deleteBlog } from './reducers/blogSlice'
import { initializeUser, loginUser, logoutUser } from './reducers/userSlice'

// Serivces
// not needed anymore?
import blogService from './services/blogs'
import loginService from './services/login'

//Components
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'

const App = () => {
  const user = useSelector((state) => state.user)
  const notification = useSelector((state) => state.notification)
  const blogs = useSelector((state) => state.blogs)

  const dispatch = useDispatch()
  const blogFormRef = useRef()

  useEffect(() => {
    dispatch(initializeUser())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      dispatch(initializeBlogs())
    }
  }, [user, dispatch])

  const sortBlogs = (blogAray) => {
    return [...blogAray].sort((a, b) => (b.likes || 0) - (a.likes || 0))
  }
  const sortedBlogs = sortBlogs(blogs)

  const handleLogin = async (credentials) => {
    dispatch(loginUser(credentials))
  }

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  const addBlog = async (blogObject) => {
    const newBlog = await dispatch(createBlog(blogObject))

    if (newBlog) {
      blogFormRef.current.toggleVisibility()
    }
  }

  const handleLike = async (id) => {
    const blogToLike = blogs.find((b) => b.id === id)
    if (blogToLike) {
      dispatch(likeBlog(blogToLike))
    } else {
      dispatch(showNotification('Blog not found', 'error', 5))
    }
  }

  const handleDelete = async (id) => {
    const blogToDelete = blogs.find((b) => b.id === id)
    if (!blogToDelete) {
      dispatch(showNotification('Blog not found', 'error', 5))
      return
    }

    if (window.confirm(`Remove blog ${blogToDelete.title} by ${blogToDelete.author}?`)) {
      dispatch(deleteBlog(blogToDelete))
    }
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={notification.message} type={notification.type} />
        <LoginForm handleLoginAttempt={handleLogin} />
      </div>
    )
  }

  // Logged-in view
  return (
    <div>
      <h2>Blogs</h2>
      <Notification message={notification.message} type={notification.type} />
      <div>
        <p>
          {user.name} logged in
          <button onClick={handleLogout}>logout</button>
        </p>

        <Togglable buttonLabel="Create New Blog" forwardedRef={blogFormRef}>
          <BlogForm createBlog={addBlog} />
        </Togglable>
      </div>

      <h3>Bloglist</h3>
      {sortedBlogs.map((blog) => (
        <Blog key={blog.id} blog={blog} handleLike={handleLike} handleDelete={handleDelete} currentUser={user} />
      ))}
    </div>
  )
}

export default App
