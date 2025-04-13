import { test, expect, beforeEach, describe } from '@playwright/test'
import { loginWith, createBlog } from './helper.js'
import { create } from '../../../part4/bloglist-backend/models/blog.js'


const testUser = {
  name: 'Matti Luukkainen',
  username: 'mluukkai',
  password: 'salainen'
}

const testUser2 = {
  name: 'User Two',
  username: 'usertwo',
  password: 'passwordtwo'
}

const testBlog = {
  title: 'E2E testing with Playwright',
  author: 'Playwright',
  url: 'https://playwright.dev',
}

const blogA = { title: 'Blog A - Low Likes', author: 'Author A', url: 'http://a.com' }
const blogB = { title: 'Blog B - Zero Likes', author: 'Author B', url: 'http://b.com' }
const blogC = { title: 'Blog C - High Likes', author: 'Author C', url: 'http://c.com' }


describe('Bloglist app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: testUser,
    })
    await request.post('/api/users', {
      data: testUser2,
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible()

    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()

    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {

    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, testUser.username, testUser.password)

      await expect(page.getByText(`${testUser.name} logged in`)).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('username').fill(testUser.username)
      await page.getByTestId('password').fill('wrong')

      await page.getByRole('button', { name: 'login' }).click()

      const notification = page.getByTestId('notification')

      await expect(notification).toBeVisible()
      await expect(notification).toHaveText('Wrong username or password')

      await expect(page.getByText(`${testUser.name} logged in`)).not.toBeVisible()
      await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, testUser.username, testUser.password)

      await expect(page.getByText(`${testUser.name} logged in`)).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, testBlog)

      const successNotification = page.getByTestId('notification')
      await expect(successNotification).toContainText(
        `A new blog ${testBlog.title} by ${testBlog.author} added`
      )
      await expect(successNotification).toBeVisible()

      const newBlogDiv = page.locator('.blog').filter({ hasText: testBlog.title })
      await expect(newBlogDiv).toBeVisible()
      await expect(newBlogDiv).toContainText(testBlog.author)
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, testBlog)

        await page.locator('.blog').filter({ hasText: testBlog.title }).waitFor()
      })

      test('it can be liked', async ({ page }) => {
        const blogContainer = page.locator('.blog').filter({ hasText: testBlog.title })
        await blogContainer.getByRole('button', { name: 'view' }).click()

        const likesLocator = blogContainer.locator('.blog-likes')
        await expect(likesLocator).toContainText('Likes: 0')
        await blogContainer.getByRole('button', { name: 'Like' }).click()
        await expect(likesLocator).toContainText('Likes: 1')
      })

      test('user who created the blog can remove it', async ({ page }) => {
        const blogContainer = page.locator('.blog').filter({ hasText: testBlog.title })
        await blogContainer.getByRole('button', { name: 'view' }).click()

        page.on('dialog', async (dialog) => {
          expect(dialog.type()).toContain('confirm')
          expect(dialog.message()).toContain(`Remove blog ${testBlog.title} by ${testBlog.author}?`)
          await dialog.accept()
        })

        const removeButton = blogContainer.getByRole('button', { name: 'Remove' })
        await expect(removeButton).toBeVisible()
        await removeButton.click()

        await expect(blogContainer).not.toBeVisible()
      })

      test('delete button is only visible to the blog creator', async ({ page }) => {
        // --- Part1: First user is logged in
        const blogContainerUser1 = page.locator('.blog').filter({ hasText: testBlog.title })
        await expect(blogContainerUser1).toBeVisible()

        await blogContainerUser1.getByRole('button', { name: 'view' }).click()

        const removeButtonUser1 = blogContainerUser1.getByRole('button', { name: 'Remove' })
        await expect(removeButtonUser1).toBeVisible()

        // --- Part2: Logout => Second user is logged in
        await page.getByRole('button', { name: 'logout' }).click()
        await expect(page.getByText('Log in to application')).toBeVisible()

        await loginWith(page, testUser2.username, testUser2.password)
        await expect(page.getByText(`${testUser2.name} logged in`)).toBeVisible()

        const blogContainerUser2 = page.locator('.blog').filter({ hasText: testBlog.title })
        await expect(blogContainerUser2).toBeVisible()

        await blogContainerUser2.getByRole('button', { name: 'view' }).click()

        const removeButtonUser2 = blogContainerUser2.getByRole('button', { name: 'Remove' })
        await expect(removeButtonUser2).not.toBeVisible()
      })
    })

    describe('and multiple blogs exist', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, blogA)
        await createBlog(page, blogB)
        await createBlog(page, blogC)

        await expect(page.locator('.blog', { hasText: blogA.title })).toBeVisible()
        await expect(page.locator('.blog', { hasText: blogB.title })).toBeVisible()
        await expect(page.locator('.blog', { hasText: blogC.title })).toBeVisible()
      })

      test('blogs are ordered by likes (descending)', async ({ page }) => {
        const blogContainerA = page.locator('.blog', { hasText: blogA.title })
        const blogContainerB = page.locator('.blog', { hasText: blogB.title })
        const blogContainerC = page.locator('.blog', { hasText: blogC.title })

        // View details and like blogs to establish order (C=2, A=1, B=0)
        // Like Blog C twice
        await blogContainerC.getByRole('button', { name: 'view' }).click()
        const likeButtonC = blogContainerC.getByRole('button', { name: 'Like' })
        await likeButtonC.click()
        await expect(blogContainerC.locator('.blog-likes')).toContainText('Likes: 1')
        await likeButtonC.click()
        await expect(blogContainerC.locator('.blog-likes')).toContainText('Likes: 2')

        // Like Blog A once
        await blogContainerA.getByRole('button', { name: 'view' }).click()
        const likeButtonA = blogContainerA.getByRole('button', { name: 'Like' })
        await likeButtonA.click()
        await expect(blogContainerA.locator('.blog-likes')).toContainText('Likes: 1')
        // Blog B remains at 0 likes


        const blogElements = await page.locator('.blog').all()
        expect(blogElements.length).toBe(3)

        // Check order of blogs
        await expect(blogElements[0]).toContainText(blogC.title)
        await expect(blogElements[1]).toContainText(blogA.title)
        await expect(blogElements[2]).toContainText(blogB.title)

        // ALternatively use element position
        const boundingBoxC = await blogContainerC.boundingBox()
        const boundingBoxA = await blogContainerA.boundingBox()
        const boundingBoxB = await blogContainerB.boundingBox()

        expect(boundingBoxC.y).toBeLessThan(boundingBoxA.y)
        expect(boundingBoxA.y).toBeLessThan(boundingBoxB.y)
      })
    })
  })
})
