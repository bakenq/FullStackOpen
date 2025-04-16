import { useState } from 'react'
import PropTypes from 'prop-types'

// MUI imports
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

const LoginForm = ({ handleLoginAttempt }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    handleLoginAttempt({ username, password })
    // setUsername('')
    // setPassword('')
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={({ target }) => setUsername(target.value)}
        data-testid="username"
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="Password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={({ target }) => setPassword(target.value)}
        data-testid="password"
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} id="login-button">
        Login
      </Button>
    </Box>
  )
}

LoginForm.propTypes = {
  handleLoginAttempt: PropTypes.func.isRequired,
}

export default LoginForm
