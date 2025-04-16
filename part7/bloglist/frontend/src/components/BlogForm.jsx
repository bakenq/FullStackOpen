import { useState } from 'react'
import PropTypes from 'prop-types'

// MUI imports
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const BlogForm = ({ createBlog }) => {
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const handleCreateBlog = (event) => {
    event.preventDefault()
    createBlog({
      title: newTitle,
      author: newAuthor,
      url: newUrl,
    })
    setNewTitle('')
    setNewAuthor('')
    setNewUrl('')
  }

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Create New Blog
      </Typography>
      <Box component="form" onSubmit={handleCreateBlog}>
        <TextField
          label="Title"
          value={newTitle}
          onChange={({ target }) => setNewTitle(target.value)}
          fullWidth
          required
          margin="dense"
          placeholder="Enter title here"
        />
        <TextField
          label="Author"
          value={newAuthor}
          onChange={({ target }) => setNewAuthor(target.value)}
          fullWidth
          margin="dense"
          placeholder="Enter author here"
        />
        <TextField
          label="URL"
          value={newUrl}
          onChange={({ target }) => setNewUrl(target.value)}
          fullWidth
          required
          margin="dense"
          placeholder="Enter URL here"
          type="url" // Use type="url" for better semantics/validation
        />
        <Button type="submit" variant="contained" sx={{ mt: 1 }}>
          Create
        </Button>
      </Box>
    </Box>
  )
}

BlogForm.propTypes = {
  createBlog: PropTypes.func.isRequired,
}

export default BlogForm
