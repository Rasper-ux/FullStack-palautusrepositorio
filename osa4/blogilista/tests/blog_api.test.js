const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

describe('when there are initially some blogs saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})

        await Blog.insertMany(helper.initialBlogs)
    })

    test('there are three blogs', async () => {
        const response = await api.get('/api/blogs')

        assert.strictEqual(response.body.length, 3)
    })

    test('the identifier property is named id', async () => {
        const response = await api.get('/api/blogs')
        assert(response.body[0].id)
    })

    test('amount of blogs increases by one', async () => {
        const newUser = {
            username: 'testuser',
            name: 'Testi Käyttäjä',
            password: 'salasana'
        }

        await api.post('/api/users').send(newUser)

        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'testuser', password: 'salasana' })

        const token = loginResponse.body.token

        const newBlog = {
            title: 'First class tests',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
            likes: 10
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const titles = response.body.map(r => r.title)

        assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
        assert(titles.includes('First class tests'))
    })

    test('blog without token is not added', async () => {
        const newBlog = {
            title: 'First class tests',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
            likes: 10
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('if likes property is missing, it will default to 0', async () => {
        const newUser = {
        username: 'testuser2',
        name: 'Testaaja',
        password: 'testisalasana'
        }
        await api.post('/api/users').send(newUser)

        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'testuser2', password: 'testisalasana' })

        const token = loginResponse.body.token

        const newBlog = {
            title: 'First class tests',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll'
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const contents = response.body.map(r => r.likes)

        assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
        assert(contents.includes(0))
    })

    test('if title or url properties are missing, return status 400', async () => {
        const newUser = {
            username: 'testuser2',
            name: 'Testaaja',
            password: 'testisalasana'
        }
        await api.post('/api/users').send(newUser)

        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'testuser2', password: 'testisalasana' })

        const token = loginResponse.body.token

        const newBlog = {
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll'
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)

        const newBlog2 = {
            title: 'First class tests',
            author: 'Robert C. Martin'
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog2)
            .expect(400)

        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('deleting an blog', async () => {
        const newUser = {
            username: 'deleter',
            name: 'Poistaja',
            password: 'salasana123'
        }
        await api.post('/api/users').send(newUser)

        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'deleter', password: 'salasana123' })

        const token = loginResponse.body.token

        const newBlog = {
            title: 'Poistettava blogi',
            author: 'Testaaja',
            url: 'http://example.com/delete-me',
            likes: 1
        }

        const createdBlogResponse = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)

        const blogToDelete = createdBlogResponse.body

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

        const contents = blogsAtEnd.map(r => r.title)
        assert(!contents.includes(blogToDelete.title))
    })

    test('updating an blog', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        const updatedBlog = {
            likes: 35
        }

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedBlog)
            .expect(200)

        const blogsAtEnd = await helper.blogsInDb()
        const updatedBlogLikes = blogsAtEnd.find(blog => blog.id === blogToUpdate.id).likes

        assert.strictEqual(updatedBlogLikes, 35)
    })
})

describe('creating a new user', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Jannek',
            name: 'Janne Ahonen',
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
        assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper status code and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
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

    test('creation fails if username or password is missing', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('username or password missing'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails if password is too short', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'ro',
            name: 'Superuser',
            password: 'sa',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('username or password too short'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails if username is too short', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'ro',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('username or password too short'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

after(async () => {
    await mongoose.connection.close()
})