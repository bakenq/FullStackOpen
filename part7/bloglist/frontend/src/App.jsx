import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotificationDispatch } from './contexts/NotificationContext'
import { useUserValue, useUserDispatch } from './contexts/UserContext'
import { Routes, Route, Link } from 'react-router-dom'

// Serivces
import blogService from './services/blogs'
import loginService from './services/login'

//Components
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import UsersView from './components/UsersView'
import UserView from './components/UserView'
import BlogView from './components/BlogView'

const Navigation = ({ user, handleLogut }) => {
  const padding = { padding: 5 }

  return (
    <div style={{ background: '#eee', padding: 5, marginBottom: 10 }}>
      <Link style={padding} to="/">
        Blogs
      </Link>
      <Link style={padding} to="/users">
        Users
      </Link>
      {user && (
        <span style={padding}>
          {user.name} logged in
          <button style={padding} onClick={handleLogut}>
            Logout
          </button>
        </span>
      )}
    </div>
  )
}

const App = () => {
  const user = useUserValue()
  const userDispatch = useUserDispatch()

  const showNotification = useNotificationDispatch()
  const blogFormRef = useRef()
  const queryClient = useQueryClient()

  const {
    data: blogsData,
    isLoading: isLoadingBlogs,
    isError: isErrorBlogs,
    error: blogsError,
  } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => blogService.getAll(),
    enabled: !!user,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const blogs = blogsData || []

  const newBlogMutation = useMutation({
    mutationFn: blogService.create,
    onSuccess: (returnedBlog) => {
      const currentBlogs = queryClient.getQueryData(['blogs']) ?? []
      queryClient.setQueryData(['blogs'], [...currentBlogs, returnedBlog])

      showNotification(`A new blog ${returnedBlog.title} by ${returnedBlog.author} added`, 'success', 5)
      blogFormRef.current.toggleVisibility()
    },
    onError: (exception) => {
      console.error('Blog creation failed:', exception)
      const errorMessage = exception.response?.data?.error || 'Failed to add blog'
      showNotification(errorMessage, 'error', 5)
    },
  })

  const updateBlogMutation = useMutation({
    mutationFn: ({ id, updatedBlogData }) => blogService.update(id, updatedBlogData),
    onSuccess: (returnedUpdatedBlog) => {
      const currentBlogs = queryClient.getQueryData(['blogs']) ?? []
      queryClient.setQueryData(
        ['blogs'],
        currentBlogs.map((blog) => (blog.id === returnedUpdatedBlog.id ? returnedUpdatedBlog : blog))
      )
    },
    onError: (exception) => {
      console.error('Blog update (like) failed:', exception)
      const errrorMessage = exception.response?.data?.error || 'Failed to update blog'
      showNotification(errrorMessage, 'error', 5)
    },
  })

  const deleteBlogMutation = useMutation({
    mutationFn: blogService.remove,
    onSuccess: (data, variables) => {
      const deletedBlogId = variables
      const currentBlogs = queryClient.getQueryData(['blogs']) ?? []
      queryClient.setQueryData(
        ['blogs'],
        currentBlogs.filter((blog) => blog.id !== deletedBlogId)
      )
      showNotification('Blog deleted successfully', 'success', 5)
    },
    onError: (exception) => {
      console.error('Blog deletion failed:', exception)
      const errorMessage = exception.response?.data?.error || 'Failed to delete blog'
      showNotification(errorMessage, 'error', 5)
    },
  })

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      try {
        const userFromStorage = JSON.parse(loggedUserJSON)

        if (userFromStorage && typeof userFromStorage === 'object' && userFromStorage.token) {
          userDispatch({ type: 'LOGIN', payload: userFromStorage })
          blogService.setToken(userFromStorage.token)
        } else {
          console.warn('Parsed user from storage was invalid', userFromStorage)
          window.localStorage.removeItem('loggedBlogappUser')
          userDispatch({ type: 'LOGOUT' })
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
        window.localStorage.removeItem('loggedBlogappUser')
        userDispatch({ type: 'LOGOUT' })
      }
    } else {
      console.log('No user found in localStorage')
      userDispatch({ type: 'LOGOUT' })
    }
  }, [])

  const sortBlogs = (blogAray) => {
    return [...blogAray].sort((a, b) => (b.likes || 0) - (a.likes || 0))
  }
  const sortedBlogs = sortBlogs(blogs)

  const handleLogin = async (credentials) => {
    try {
      const user = await loginService.login(credentials)
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      userDispatch({ type: 'LOGIN', payload: user })
    } catch (exception) {
      console.error(exception)
      showNotification('Wrong username or password', 'error', 5)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    userDispatch({ type: 'LOGOUT' })
    queryClient.removeQueries({ queryKey: ['blogs'], exact: true })
  }

  const addBlog = async (blogObject) => {
    newBlogMutation.mutate(blogObject)
  }

  const handleLike = async (id) => {
    const blogToLike = blogs.find((b) => b.id === id)
    if (!blogToLike) {
      showNotification('Blog not found', 'error', 5)
      return
    }

    const updatedBlogData = {
      ...blogToLike,
      likes: (blogToLike.likes || 0) + 1,
      user: blogToLike.user.id,
    }

    updateBlogMutation.mutate({ id, updatedBlogData })
  }

  const handleDelete = async (id) => {
    const blogToDelete = blogs.find((b) => b.id === id)
    if (!blogToDelete) {
      showNotification('Blog not found', 'error', 5)
      return
    }
    if (window.confirm(`Remove blog ${blogToDelete.title} by ${blogToDelete.author}`)) {
      deleteBlogMutation.mutate(id)
    }
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification />
        <LoginForm handleLoginAttempt={handleLogin} />
      </div>
    )
  }

  // Logged-in view
  return (
    <div>
      <Navigation user={user} handleLogut={handleLogout} />

      <h2>Blogs</h2>
      <Notification />

      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Togglable buttonLabel="Create New Blog" forwardedRef={blogFormRef}>
                <BlogForm createBlog={addBlog} />
              </Togglable>

              <h3>Bloglist</h3>
              {isLoadingBlogs && <div>Loading blogs...</div>}
              {isErrorBlogs && <div>Error: {blogsError?.message || 'Unknown Error'}</div>}
              {!isLoadingBlogs && !isErrorBlogs && sortedBlogs.map((blog) => <Blog key={blog.id} blog={blog} />)}
            </div>
          }
        />

        <Route path="/users" element={<UsersView />} />
        <Route path="/users/:id" element={<UserView />} />
        <Route path="/blogs/:id" element={<BlogView />} />
      </Routes>
    </div>
  )
}

export default App
