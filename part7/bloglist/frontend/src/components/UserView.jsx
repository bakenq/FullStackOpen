import { useQuery } from '@tanstack/react-query'
import userService from '../services/users'
import { Link } from 'react-router-dom'

const UsersView = () => {
  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  if (isLoading) {
    return <div>Loading users...</div>
  }

  if (isError) {
    return <div>Error loading users: {error?.message || 'Unknown error'}</div>
  }

  if (!Array.isArray(users)) {
    return <div>No user data available.</div>
  }

  return (
    <div>
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Blogs Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name || user.username}</td>
              <td>{user.blogs ? user.blogs.length : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UsersView
