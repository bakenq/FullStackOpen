import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import userService from '../services/users'

const UserView = () => {
  const { id: userId } = useParams()

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
    refetchOnWindowFocus: false,
  })

  const user = users?.find((u) => u.id === userId)

  if (isLoading) {
    return <div>Loading user data...</div>
  }

  if (isError) {
    return <div>Error loading user data: {error.message}</div>
  }

  if (!user) {
    return <div>User not found.</div>
  }

  return (
    <div>
      <h2>{user.name || user.username}</h2>
      <h3>Added Blogs</h3>
      {user.blogs && user.blogs.length > 0 ? (
        <ul>
          {user.blogs.map((blog) => (
            <li key={blog.id}>{blog.title}</li>
          ))}
        </ul>
      ) : (
        <p>This user has not added any blogs yet.</p>
      )}
    </div>
  )
}

export default UserView
