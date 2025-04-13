import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm.jsx'

describe('<BlogForm />', () => {

  test('calls event handler with correct details when a new blog is created', async () => {
    const createBlogMock = vi.fn()
    const user = userEvent.setup()

    render(<BlogForm createBlog={createBlogMock} />)

    const titleInput = screen.getByPlaceholderText('Enter title here')
    const authorInput = screen.getByPlaceholderText('Enter author here')
    const urlInput = screen.getByPlaceholderText('Enter URL here')
    const createButton = screen.getByRole('button', { name: 'create' })

    await user.type(titleInput, 'Testing form title')
    await user.type(authorInput, 'Testing form author')
    await user.type(urlInput, 'http://testingform.com')
    await user.click(createButton)

    // --- Assertions ---
    expect(createBlogMock).toHaveBeenCalledTimes(1)

    expect(createBlogMock.mock.calls[0][0]).toEqual({
      title: 'Testing form title',
      author: 'Testing form author',
      url: 'http://testingform.com',
    })
  })
})