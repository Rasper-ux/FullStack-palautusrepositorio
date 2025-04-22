const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')
const { request } = require('http')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    await request.post('http://localhost:3003/api/users', {
        data: {
          name: 'Kimi Raikkonen',
          username: 'kimmo',
          password: 'salasana'
        }
      })
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = await page.getByText('log in to application')
    await expect(locator).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrong')
      await expect(page.getByText('wrong username or password')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
    })

    test('A blog can be created', async ({ page }) => {
      const blog = {
        title: 'Test Blog',
        author: 'Test Author',
        url: 'http://testblog.com'
      }
      await createBlog(page, blog)
      await expect(page.getByText(`${blog.title} ${blog.author}`)).toBeVisible()
    })

    test('A blog can be liked', async ({ page }) => {
      const blog = {
        title: 'Test Blog',
        author: 'Test Author',
        url: 'http://testblog.com'
      }
      await createBlog(page, blog)
      await page.getByRole('button', { name: 'view' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('1')).toBeVisible()
      await expect(page.getByText('Test Blog Test Author')).toBeVisible()
    })

    test('A blog can be deleted by the user who created it', async ({ page }) => {
      const blog = {
        title: 'Test Blog',
        author: 'Test Author',
        url: 'http://testblog.com'
      }
      await createBlog(page, blog)
      await page.getByRole('button', { name: 'view' }).click()

      page.once('dialog', dialog => {
        expect(dialog.message()).toContain(`Remove blog ${blog.title} by ${blog.author}`)
        dialog.accept()
      })

      await page.getByRole('button', { name: 'remove' }).click()
      await expect(page.getByText('Test Blog Test Author')).not.toBeVisible()
    })

    test('A blog cannot be deleted by another user', async ({ page }) => {
      const blog = {
        title: 'Test Blog',
        author: 'Test Author',
        url: 'http://testblog.com'
      }
      await createBlog(page, blog)
      await page.getByRole('button', { name: 'logout' }).click()
      await loginWith(page, 'kimmo', 'salasana')
      await expect(page.getByText('Kimi Raikkonen logged in')).toBeVisible()
      await page.getByRole('button', { name: 'view' }).click()
      await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })

    test('Blogs are ordered by likes', async ({ page }) => {
      const blog1 = {
        title: 'Test Blog 1',
        author: 'Test Author 1',
        url: 'http://testblog1.com'
      }
      await createBlog(page, blog1)
      const blog2 = {
        title: 'Test Blog 2',
        author: 'Test Author 2',
        url: 'http://testblog2.com'
      }
      await createBlog(page, blog2)
      const blog3 = {
        title: 'Test Blog 3',
        author: 'Test Author 3',
        url: 'http://testblog3.com'
      }
      await createBlog(page, blog3)
      const blogs = await page.locator('.blog')
      const count = await blogs.count()

      for (let i = 0; i < count; i++) {
        const blog = blogs.nth(i)
        await blog.getByRole('button', { name: 'view' }).click()
      }

      const likeCounts = [3, 1, 2]
      const local = await page.locator('.blog')
      for (let i = 0; i < likeCounts.length; i++) {
        const blog = local.nth(i)
        const likeButton = blog.getByRole('button', { name: 'like' })
        for (let j = 0; j < likeCounts[i]; j++) {
          await likeButton.click()
          await page.waitForTimeout(200)
        }
      }

      const updatedBlogs = await page.locator('.blog')
      const likes = []
      for (let i = 0; i < await updatedBlogs.count(); i++) {
        const blog = updatedBlogs.nth(i)
        const likeText = await blog.locator('text=/\\d+ likes/').textContent()
        const likeCount = parseInt(likeText.match(/\d+/)[0], 10)
        likes.push(likeCount)
      }

      const sortedLikes = [...likes].sort((a, b) => b - a)
      expect(likes).toEqual(sortedLikes)
    })
  })
})