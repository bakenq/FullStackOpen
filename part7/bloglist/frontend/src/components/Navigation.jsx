import PropTypes from 'prop-types'
import { Link as RouterLink } from 'react-router-dom'

// MUI Imports
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'

const Navigation = ({ user, handleLogut }) => {
  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <Link component={RouterLink} to="/" color="inherit" sx={{ textDecoration: 'none', mr: 2 }}>
          <Button color="inherit">Blogs</Button>
        </Link>
        <Link component={RouterLink} to="/users" color="inherit" sx={{ textDecoration: 'none', mr: 2 }}>
          <Button color="inherit">Users</Button>
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {user.name} logged in
            </Typography>
            <Button color="inherit" variant="outlined" onClick={handleLogut}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}

Navigation.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
  }),
  handleLogut: PropTypes.func.isRequired,
}

export default Navigation
