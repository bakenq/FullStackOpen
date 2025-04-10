const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({})
    response.json(blogs)
  }
  catch (error) {
    next(error)
  }
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'title or url missing' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes === undefined ? 0 : body.likes,
  })

  try {
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const idToDelete = request.params.id

  try {
    const result = await Blog.findByIdAndDelete(idToDelete)

    if (result) {
      response.status(204).end()
    } else {
      response.status(404).json({ error: 'blog not found' })
    }
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