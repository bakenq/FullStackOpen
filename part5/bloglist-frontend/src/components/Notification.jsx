import React from 'react'
import PropTypes from 'prop-types'

const Notification = ({ message, type }) => {
  if (message === null || message === '') {
    return null
  }

  const baseStyle = {
    background: 'lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '15px',
  }

  const notificationStyle = {
    ...baseStyle,
    color: type === 'error' ? 'red' : 'green',
    borderColor: type === 'error' ? 'red' : 'green',
  }

  return (
    <div style={notificationStyle} data-testid='notification'>
      {message}
    </div>
  )
}

Notification.propTypes = {
  message: PropTypes.string,
  type: PropTypes.string
}

export default Notification