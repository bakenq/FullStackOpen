import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import userService from '../services/users'

// MUI Imports
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

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
    return <Alert severity="warning">User not found.</Alert>
  }

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {user.name || user.username}
      </Typography>
      <Typography variant="h6" component="h3" sx={{ mt: 3 }}>
        Added Blogs
      </Typography>
      {user.blogs && user.blogs.length > 0 ? (
        <List dense>
          {user.blogs.map((blog) => (
            <ListItem key={blog.id}>
              <ListItemText primary={blog.title} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" sx={{ mt: 1 }}>
          This user has not added any blogs yet.
        </Typography>
      )}
    </Box>
  )
}

export default UserView
