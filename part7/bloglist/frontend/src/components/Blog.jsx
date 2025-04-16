import { Link as RouterLink } from 'react-router-dom'
import PropTypes from 'prop-types'

// MUI Imports
import Paper from '@mui/material/Paper'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

const Blog = ({ blog }) => {
  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Link component={RouterLink} to={`/blogs/${blog.id}`} underline="hover">
        <Typography variant="body1">
          {blog.title} - {blog.author}
        </Typography>
      </Link>
    </Paper>
  )
}

Blog.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
  }).isRequired,
}

export default Blog
