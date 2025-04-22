const loginWith = async (page, username, password)  => {
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, blog) => {
  await page.getByText('create new blog').click()
  await page.getByPlaceholder('title').fill(blog.title)
  await page.getByPlaceholder('author').fill(blog.author)
  await page.getByPlaceholder('url').fill(blog.url)
  await page.getByRole('button', { name: 'save' }).click()
  await page.getByText(`${blog.title} ${blog.author}`).waitFor()
}

export { loginWith, createBlog }