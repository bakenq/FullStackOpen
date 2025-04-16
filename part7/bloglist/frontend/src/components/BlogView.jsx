import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import blogService from '../services/blogs'
import { useNotificationDispatch } from '../contexts/NotificationContext'

const BlogView = () => {
  const { id: blogId } = useParams()
  const queryClient = useQueryClient()
  const showNotification = useNotificationDispatch()

  const {
    data: blogs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['blogs'],
    queryFn: blogService.getAll,
    refetchOnWindowFocus: false,
    retry: 1,
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
      const errorMessage = exception.response?.data?.error || 'Failed to update blog'
      showNotification(errorMessage, 'error')
    },
  })

  const blog = blogs?.find((b) => b.id === blogId)

  if (isLoading) {
    return <div>Loading blog data...</div>
  }

  if (isError) {
    return <div>Error loading blog data: {error.message}</div>
  }

  if (!blog) {
    return <div>Blog not found.</div>
  }

  const handleLikeClick = () => {
    const updatedBlogData = {
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: (blog.likes || 0) + 1,
      user: blog.user.id,
    }
    updateBlogMutation.mutate({ id: blog.id, updatedBlogData })
  }

  return (
    <div>
      <h2>
        {blog.title} by {blog.author}
      </h2>
      <div>
        <a href={blog.url} target="_blank" rel="noopener noreferrer">
          {blog.url}
        </a>
      </div>
      <div>
        {blog.likes || 0} likes
        <button onClick={handleLikeClick} style={{ marginLeft: 5 }}>
          Like
        </button>
      </div>
      <div>Added by {blog.user ? blog.user.name || blog.user.username : 'Unknown User'}</div>
    </div>
  )
}

export default BlogView
