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
  })
})
