import { useQuery } from '@tanstack/react-query'
import userService from '../services/users'
import { Link as RouterLink } from 'react-router-dom'

// MUI Imports
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Error loading users: {error?.message || 'Unknown error'}
      </Alert>
    )
  }

  if (!Array.isArray(users)) {
    return <Alert severity="info">No user data available.</Alert>
  }

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Users
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 300 }} aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell align="right">Blogs Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  <Link component={RouterLink} to={`/users/${user.id}`}>
                    {user.name || user.username}
                  </Link>
                </TableCell>
                <TableCell align="right">{user.blogs ? user.blogs.length : 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default UsersView
