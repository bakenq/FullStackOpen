import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog.jsx'
import { beforeEach, expect } from 'vitest'

describe('<Blog />', () => {

  const blog = {
    id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.nogoto.com/',
    likes: 5,
    user: {
      id: 'user123',
      username: 'tester',
      name: 'Test User',
    },
  }

  const mockCurrentUser = { id: 'user123', username: 'tester', name: 'Test User' }

  let mockLikeHandler
  let mockDeleteHandler

  beforeEach(() => {
    mockLikeHandler = vi.fn()
    mockDeleteHandler = vi.fn()
  })

  test('renders title and author, but does not render url or likes by default', () => {
    const { container } = render(
      <Blog
        blog={blog}
        handleLike={mockLikeHandler}
        handleDelete={mockDeleteHandler}
        currentUser={mockCurrentUser}
      />
    )

    // --- Assertions ---
    const headerElement = screen.getByText(
      'Go To Statement Considered Harmful Edsger W. Dijkstra'
    )
    expect(headerElement).toBeInTheDocument()

    // Check that title and author are rendered
    const headerDiv = container.querySelector('.blog-header')
    expect(headerDiv).toHaveTextContent('Go To Statement Considered Harmful')
    expect(headerDiv).toHaveTextContent('Edsger W. Dijkstra')

    // Check that url and likes are not rendered
    const detailsDiv = container.querySelector('.blog-details')
    expect(detailsDiv).toBeNull()

    // Explicitly check content absence
    const urlElement = screen.queryByText(blog.url)
    expect(urlElement).toBeNull()
    const likesElement = screen.queryByText(`Likes: ${blog.likes}`)
    expect(likesElement).toBeNull()
  })


  test('shows url and likes when details button is clicked', async () => {
    const { container } = render(
      <Blog
        blog={blog}
        handleLike={mockLikeHandler}
        handleDelete={mockDeleteHandler}
        currentUser={mockCurrentUser}
      />
    )

    const user = userEvent.setup()

    const viewButton = screen.getByText('view')
    expect(viewButton).toBeInTheDocument()

    await user.click(viewButton)

    // --- Assertions ---
    const detailsDiv = container.querySelector('.blog-details')
    expect(detailsDiv).not.toBeNull()
    expect(detailsDiv).toBeInTheDocument()

    // URL
    const urlLink = screen.getByRole('link', { name: blog.url })
    expect(urlLink).toBeInTheDocument()

    const urlDiv = container.querySelector('.blog-url')
    expect(urlDiv).toHaveTextContent(blog.url)

    // Likes
    const likesElement = screen.getByText(`Likes: ${blog.likes}`)
    expect(likesElement).toBeInTheDocument()

    const likesDiv = container.querySelector('.blog-likes')
    expect(likesDiv).toHaveTextContent(`Likes: ${blog.likes}`)
  })


  test('if like button is clicked twice, handler is called twice', async () => {
    const user = userEvent.setup()

    render(
      <Blog
        blog={blog}
        handleLike={mockLikeHandler}
        handleDelete={mockDeleteHandler}
        currentUser={mockCurrentUser}
      />
    )

    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    const likeButton = screen.getByRole('button', { name: 'Like' })

    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockLikeHandler).toHaveBeenCalledTimes(2)
  })

})