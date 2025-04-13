import { useState } from 'react'
import PropTypes from 'prop-types'

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
    <form onSubmit={handleSubmit}>
      <div>
        username
        <input
          data-testid="username"
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          data-testid="password"
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit" id="login-button">login</button>
    </form>
  )
}

LoginForm.propTypes = {
  handleLoginAttempt: PropTypes.func.isRequired,
}

export default LoginForm