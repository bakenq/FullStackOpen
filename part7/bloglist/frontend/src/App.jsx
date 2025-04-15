import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { showNotification } from './reducers/notificationSlice'

// Serivces
import blogService from './services/blogs'
import loginService from './services/login'

//Components
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)

  const notification = useSelector((state) => state.notification)
  const dispatch = useDispatch()

  const blogFormRef = useRef()

  useEffect(() => {
    if (user) {
      blogService.getAll().then((blogs) => setBlogs(sortBlogs(blogs)))
    } else {
      setBlogs([])
    }
  }, [user])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const sortBlogs = (blogAray) => {
    return [...blogAray].sort((a, b) => (b.likes || 0) - (a.likes || 0))
  }

  const handleLogin = async (credentials) => {
    try {
      const user = await loginService.login(credentials)

      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))

      blogService.setToken(user.token)
      setUser(user)
    } catch (exception) {
      console.error(exception)
      dispatch(showNotification('Wrong username or password', 'error', 5))
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    blogService.setToken(null)
  }

  const addBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(sortBlogs(blogs.concat(returnedBlog)))
      dispatch(showNotification(`A new blog ${returnedBlog.title} by ${returnedBlog.author} added`, 'success', 5))

      blogFormRef.current.toggleVisibility()
    } catch (exception) {
      console.error(exception)
      let errorMessage = 'Failed to create blog'

      if (exception.response && exception.response.status === 401) {
        errorMessage = exception.response.data.error || 'Session expired. Please log in again.'
        handleLogout()
      } else if (exception.response && exception.response.data && exception.response.data.error) {
        errorMessage = exception.response.data.error
      }
      dispatch(showNotification(errorMessage, 'error', 5))
    }
  }

  const handleLike = async (id) => {
    const blogToUpdate = blogs.find((b) => b.id === id)
    if (!blogToUpdate) {
      dispatch(showNotification('Blog not found', 'error', 5))
      return
    }

    const updatedBlogData = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: (blogToUpdate.likes || 0) + 1,
    }

    try {
      const returnedUpdatedBlog = await blogService.update(id, updatedBlogData)

      setBlogs(sortBlogs(blogs.map((blog) => (blog.id === id ? returnedUpdatedBlog : blog))))
    } catch (exception) {
      console.error(exception)
      const errorMessage = exception.response?.data?.error || 'Failed to update likes'
      dispatch(showNotification(errorMessage, 'error', 5))
    }
  }

  const handleDelete = async (id) => {
    const blogToDelete = blogs.find((b) => b.id === id)
    if (!blogToDelete) {
      dispatch(showNotification('Blog not found', 'error', 5))
      return
    }

    if (window.confirm(`Remove blog ${blogToDelete.title} by ${blogToDelete.author}?`)) {
      try {
        await blogService.remove(id)
        setBlogs(blogs.filter((blog) => blog.id !== id))

        dispatch(showNotification(`Blog ${blogToDelete.title} deleted`, 'success', 5))
      } catch (exception) {
        console.error(exception)
        const errorMessage = exception.response?.data?.error || 'Failed to delete blog'
        dispatch(showNotification(errorMessage, 'error', 5))
      }
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
      {blogs.map((blog) => (
        <Blog key={blog.id} blog={blog} handleLike={handleLike} handleDelete={handleDelete} currentUser={user} />
      ))}
    </div>
  )
}

export default App
