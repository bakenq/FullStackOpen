import React from 'react'

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
    <div style={notificationStyle}>
      {message}
    </div>
  )
}

export default Notification