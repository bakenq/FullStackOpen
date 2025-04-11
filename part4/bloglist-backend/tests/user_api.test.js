const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const app = require('../app')

const api = supertest(app)


beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', name: 'root', passwordHash })

  await user.save()
})


describe('user creation', () => {

  describe('when there is initially one user in db', () => {

    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      assert.ok(usernames.includes(newUser.username))
    })

    test('creation fails with proper status code (400) and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'sailainen',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('expected `username` to be unique'))

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

  })


  describe('with invalid data', () => {

    test('fails with status code 400 if username is missing', async () => {
      const newUser = {
        name: 'Nameless',
        password: 'password123',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('username and password are required'))
    })

    test('fails with status code 400 if password is missing', async () => {
      const newUser = {
        username: 'nopassword',
        name: 'Pass Less',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('username and password are required'))
    })

    test('fails with status code 400 if username is too short', async () => {
      const newUser = {
        username: 'hi',
        name: 'Shorty',
        password: 'password123',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('username must be at least 3 characters long'))
    })

    test('fails with status code 400 if password is too short', async () => {
      const newUser = {
        username: 'shortpass',
        name: 'Short Password',
        password: 'hi',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('password must be at least 3 characters long'))
    })

  })

})


after(async () => {
  await mongoose.connection.close()
})