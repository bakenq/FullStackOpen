const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')


blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog
      .find({})
      .populate('user', { username: 1, name: 1, id: 1 })

    response.json(blogs)
  }
  catch (error) {
    next(error)
  }
})

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const user = request.user
  const body = request.body

  try {
    if (!user) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if (!body.title || !body.url) {
      return response.status(400).json({ error: 'title or url missing' })
    }

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes === undefined ? 0 : body.likes,
      user: user._id,
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    const populatedBlog = await Blog.findById(savedBlog.id).populate('user', { username: 1, name: 1, id: 1 })

    response.status(201).json(populatedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const idToDelete = request.params.id
  const user = request.user

  try {
    if (!user) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = await Blog.findById(idToDelete)

    if (!blog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    if (!blog.user || blog.user.toString() !== user._id.toString()) {
      return response.status(403).json({ error: 'User not authorized to delete this blog' })
    }

    await Blog.findByIdAndDelete(idToDelete)

    user.blogs = user.blogs.filter(blogId => blogId.toString() !== idToDelete)
    await user.save()

    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const id = request.params.id
  const body = request.body

  const blogDataToUpdate = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  if (!blogDataToUpdate.title || !blogDataToUpdate.url) {
    return response.status(400).json({ error: 'title or url missing' })
  }

  const options = { new: true, runValidators: true, context: 'query' }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, blogDataToUpdate, options)
      .populate('user', { username: 1, name: 1, id: 1 })

    if (updatedBlog) {
      response.json(updatedBlog)
    } else {
      response.status(404).json({ error: 'blog not found' })
    }
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter