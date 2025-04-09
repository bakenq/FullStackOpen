const totalLikes = (blogs) => {
  const total = blogs.reduce((sum, blog) => {
    return sum + (blog.likes || 0)
  }, 0)
  return total
}

module.exports = {
  totalLikes
}