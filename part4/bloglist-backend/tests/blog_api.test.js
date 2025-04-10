const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const app = require('../app')

const api = supertest(app)


beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})


describe('blog api', () => {

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('should return correct amount of blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('blog posts have id property instead of _id', async () => {
    const response = await api.get('/api/blogs')
    assert(response.body.length > 0, 'Response should contain at least one blog')

    const firstBlog = response.body[0]
    assert.ok(firstBlog.id, 'First blog should have id property')
    assert.strictEqual(firstBlog._id, undefined, 'id should be equal to _id')
  })

})



after(async () => {
  await mongoose.connection.close()
})
