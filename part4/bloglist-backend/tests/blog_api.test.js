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


describe('when there are initially some blogs saved', () => {

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
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

  test('returns status 400 Bad Request if title is missing', async () => {
    const newBlogWithoutTitle = {
      author: 'John Doe',
      url: 'http://example.com/missing-title',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlogWithoutTitle)
      .expect(400)
  })

  test('returns status 400 Bad Request if url is missing', async () => {
    const newBlogWithoutUrl = {
      title: 'Blog Without URL',
      author: 'John Nourl',
      likes: 3
    }

    await api
      .post('/api/blogs')
      .send(newBlogWithoutUrl)
      .expect(400)
  })

})

describe('deletion of a blog', () => {

  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1, 'Blog count should decrease by 1')

    const titles = blogsAtEnd.map(blog => blog.title)
    assert(!titles.includes(blogToDelete.title), 'Deleted blog should not be in the list of blogs')
  })

  test('fails with status code 400 if id is invalid', async () => {
    const invalidId = '12345abc'

    await api
      .delete(`/api/blogs/${invalidId}`)
      .expect(400)
  })

  test('fails with status code 404 if blog does not exist', async () => {
    const nonExistingId = await helper.nonExistingId()

    await api
      .delete(`/api/blogs/${nonExistingId}`)
      .expect(404)
  })

})

describe('updating a blog', () => {

  test('succeeds with status code 200 if id and data is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedData = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 50
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, updatedData.likes, 'Likes should be updated')
    assert.strictEqual(response.body.id, blogToUpdate.id, 'ID should remain the same')

    const updatedBlogInDb = await Blog.findById(blogToUpdate.id)
    assert.strictEqual(updatedBlogInDb.likes, updatedData.likes, 'Likes in DB should match updated likes')
  })

  test('fails with status code 400 if id does not exist', async () => {
    const validNonExistingId = await helper.nonExistingId()
    const updatedData = {
      title: 'Non-existing Update',
      author: 'Non-existing Author',
      url: 'http://example.com/non-existing',
      likes: 10
    }

    await api
      .put(`/api/blogs/${validNonExistingId}`)
      .send(updatedData)
      .expect(404)
  })

  test('fails with status code 400 if id is invalid', async () => {
    const invalidId = '12345abcde'
    const updatedData = { likes: 10 }

    await api
      .put(`/api/blogs/${invalidId}`)
      .send(updatedData)
      .expect(400)
  })

  test('fails with status code 400 if required data (e.g. url) is missing', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const invalidUpdateData = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      likes: blogToUpdate.likes + 1
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(invalidUpdateData)
      .expect(400)
  })

})



after(async () => {
  await mongoose.connection.close()
})
