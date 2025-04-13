import { useState } from 'react'
import PropTypes from 'prop-types'


const Blog = ({ blog, handleLike, handleDelete, currentUser }) => {
  const [detailsVisible, setDetailsVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const toggleDetailsVisibility = () => {
    setDetailsVisible(!detailsVisible)
  }

  const buttonLabel = detailsVisible ? 'hide' : 'view'

  const handleLikeClick = () => {
    handleLike(blog.id)
  }

  const handleDeleteClick = () => {
    handleDelete(blog.id)
  }

  const canRemove = currentUser && blog.user && currentUser.id === blog.user.id


  return (
    <div style={blogStyle} className='blog'>
      <div className='blog-header'>
        {blog.title} {blog.author}
        <button onClick={toggleDetailsVisibility}>{buttonLabel}</button>
      </div>

      {detailsVisible && (
        <div className='blog-details'>
          <div className='blog-url'>
            <a href={blog.url} target="_blank" rel="noopener noreferrer">
              {blog.url}
            </a>
          </div>
          <div className='blog-likes'>
            Likes: {blog.likes !== undefined ? blog.likes : 0}
            <button onClick={handleLikeClick}>Like</button>
          </div>
          {blog.user && <div>{blog.user.name}</div>}

          {canRemove && (
            <button
              onClick={handleDeleteClick}
              style={{ backgroundColor: 'lightblue' }}
            >
              Remove
            </button>
          )}
        </div>
      )}

    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
    }),
  }).isRequired,
  handleLike: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
    token: PropTypes.string,
  }),
}

export default Blog