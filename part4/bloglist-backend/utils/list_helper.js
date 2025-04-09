const totalLikes = (blogs) => {
  const total = blogs.reduce((sum, blog) => {
    return sum + (blog.likes || 0)
  }, 0)
  return total
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const favorite = blogs.reduce((fav, currentBlog) => {
    const currentLikes = currentBlog.likes || 0
    const favoriteLikes = fav.likes || 0

    return (currentLikes > favoriteLikes) ? currentBlog : fav
  }, blogs[0])

  return favorite
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const authorCounts = blogs.reduce((counts, blog) => {
    const author = blog.author || 'Unknown'
    counts[author] = (counts[author] || 0) + 1
    return counts
  }, {})

  let topAuthor = ''
  let maxBlogs = 0

  for (const [author, count] of Object.entries(authorCounts)) {
    if (count > maxBlogs) {
      maxBlogs = count
      topAuthor = author
    }
  }

  if (topAuthor === '') {
    return null
  }

  return {
    author: topAuthor,
    blogs: maxBlogs
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const authorLikes = blogs.reduce((likes, blog) => {
    const author = blog.author || 'Unknown'
    likes[author] = (likes[author] || 0) + (blog.likes || 0)
    return likes
  }, {})

  let topAuthor = ''
  let maxLikes = 0

  for (const [author, count] of Object.entries(authorLikes)) {
    if (count > maxLikes) {
      maxLikes = count
      topAuthor = author
    }
  }

  if (topAuthor === '') {
    return null
  }

  return {
    author: topAuthor,
    likes: maxLikes
  }
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}