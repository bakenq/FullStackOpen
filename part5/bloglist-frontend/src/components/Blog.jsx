import { useState } from 'react'


const Blog = ({ blog, handleLike }) => {
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

  return (
    <div style={blogStyle}>
      <div>
        {blog.title} {blog.author}
        <button onClick={toggleDetailsVisibility}>{buttonLabel}</button>
      </div>

      {detailsVisible && (
        <div>
          <div>
            <a href={blog.url} target="_blank" rel="noopener noreferrer">
              {blog.url}
            </a>
          </div>
          <div>
            Likes: {blog.likes != undefined ? blog.likes : 0}
            <button onClick={handleLikeClick}>Like</button>
          </div>
          {blog.user && <div>{blog.user.name}</div>}
        </div>
      )}

    </div>
  )
}

export default Blog