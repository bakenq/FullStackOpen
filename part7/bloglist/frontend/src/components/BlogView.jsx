import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import blogService from '../services/blogs'
import { useNotificationDispatch } from '../contexts/NotificationContext'

const BlogView = () => {
  const { id: blogId } = useParams()
  const queryClient = useQueryClient()
  const showNotification = useNotificationDispatch()
  const [comment, setComment] = useState('')

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

  const addCommentMutation = useMutation({
    mutationFn: ({ id, commentText }) => blogService.addComment(id, commentText),
    onSuccess: (returnedUpdatedBlog) => {
      const currentBlogs = queryClient.getQueryData(['blogs']) ?? []
      queryClient.setQueryData(
        ['blogs'],
        currentBlogs.map((blog) => (blog.id === returnedUpdatedBlog.id ? returnedUpdatedBlog : blog))
      )
      setComment('')
      showNotification('Comment added successfully', 'success', 3)
    },
    onError: (exception) => {
      console.error('Failed to add comment:', exception)
      const errorMessage = exception.response?.data?.error || 'Failed to add comment'
      showNotification(errorMessage, 'error', 5)
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

  const handleAddComment = (event) => {
    event.preventDefault()
    if (!comment.trim()) {
      showNotification('Comment cannot be empty', 'error')
      return
    }

    addCommentMutation.mutate({ id: blog.id, commentText: comment })
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

      <div>
        <h3>Comments</h3>

        <form onSubmit={handleAddComment}>
          <input
            type="text"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add a comment"
          />
          <button type="submit">Add Comment</button>
        </form>

        {blog.comments && blog.comments.length > 0 ? (
          <ul>
            {blog.comments.map((comment, index) => (
              <li key={index}>{comment}</li>
            ))}
          </ul>
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
    </div>
  )
}

export default BlogView
