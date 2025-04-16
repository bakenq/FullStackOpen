import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import blogService from '../services/blogs'
import { useNotificationDispatch } from '../contexts/NotificationContext'

// MUI Imports
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'

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
    return <Alert severity="warning">Blog not found.</Alert>
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
    <Box sx={{ my: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {blog.title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        by {blog.author}
      </Typography>
      <Box sx={{ my: 2 }}>
        <Link href={blog.url} target="_blank" rel="noopener noreferrer">
          {blog.url}
        </Link>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
        <Typography variant="body1" sx={{ mr: 1 }}>
          {blog.likes || 0} likes
        </Typography>
        <Button variant="outlined" size="small" onClick={handleLikeClick}>
          Like
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary">
        Added by {blog.user ? blog.user.name || blog.user.username : 'Unknown User'}
      </Typography>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" component="h3" gutterBottom>
        Comments
      </Typography>
      <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Add comment"
          size="small"
          variant="outlined"
          value={comment}
          onChange={({ target }) => setComment(target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained">
          Add
        </Button>
      </Box>
      {blog.comments && blog.comments.length > 0 ? (
        <List dense>
          {blog.comments.map((commentText, index) => (
            <ListItem key={index} disableGutters>
              <Typography variant="body2">{commentText}</Typography>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" sx={{ mt: 1 }}>
          No comments yet.
        </Typography>
      )}
    </Box>
  )
}

export default BlogView
