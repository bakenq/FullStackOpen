const { test, expect, describe, beforeEach } = require('@playwright/test')


describe('Bloglist app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible()

    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()

    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })
})
