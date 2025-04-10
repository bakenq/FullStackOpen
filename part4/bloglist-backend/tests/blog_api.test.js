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


describe('blog api fetching', () => {

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

describe('blog api creation (POST)', () => {

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'New Blog',
      author: 'John Doe',
      url: 'http://example.com',
      likes: 8
    }

    const initialBlogsInDb = await helper.blogsInDb()

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.title, newBlog.title)
    assert.strictEqual(response.body.author, newBlog.author)
    assert.strictEqual(response.body.url, newBlog.url)
    assert.strictEqual(response.body.likes, newBlog.likes)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, initialBlogsInDb.length + 1, 'Blog count should increase by 1')

    const titles = blogsAtEnd.map(blog => blog.title)
    assert(titles.includes(newBlog.title), 'New blog should be in the list of blogs')
  })

  test('if likes property is missing, it should default to 0', async () => {
    const newBlogWithoutLikes = {
      title: 'New Blog Without Likes',
      author: 'John Bro',
      url: 'http://example.com/default-likes'
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlogWithoutLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, 0, 'Likes should default to 0')

    assert.strictEqual(response.body.title, newBlogWithoutLikes.title)
    assert.ok(response.body.id)
  })

})



after(async () => {
  await mongoose.connection.close()
})
