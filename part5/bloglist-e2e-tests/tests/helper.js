const loginWith = async (page, username, password) => {
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, blog) => {
  await page.getByRole('button', { name: 'Create New Blog' }).click()
  await page.getByPlaceholder('Enter title here').fill(blog.title)
  await page.getByPlaceholder('Enter author here').fill(blog.author)
  await page.getByPlaceholder('Enter URL here').fill(blog.url)
  await page.getByRole('button', { name: 'create' }).click()

  await page.locator('.blog').filter({ hasText: blog.title }).waitFor()
}

export { loginWith, createBlog }