import { useState, useImperativeHandle } from 'react'
import PropTypes from 'prop-types'

// MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

const Togglable = ({ children, buttonLabel, forwardedRef }) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  useImperativeHandle(forwardedRef, () => {
    return {
      toggleVisibility,
    }
  })

  return (
    <Box sx={{ my: 2 }}>
      <Box style={hideWhenVisible}>
        <Button variant="outlined" onClick={toggleVisibility}>
          {buttonLabel}
        </Button>
      </Box>
      <Box style={showWhenVisible}>
        {children}
        <Button variant="text" onClick={toggleVisibility} sx={{ mt: 1 }}>
          Cancel
        </Button>
      </Box>
    </Box>
  )
}

Togglable.displayName = 'Togglable'

Togglable.propTypes = {
  buttonLabel: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
}

export default Togglable
