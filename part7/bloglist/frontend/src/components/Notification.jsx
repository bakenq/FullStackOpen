import { useNotificationValue } from '../../contexts/NotificationContext'

const Notification = () => {
  const notification = useNotificationValue()

  if (notification.message === null || notification.message === '') {
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
    color: notification.type === 'error' ? 'red' : 'green',
    borderColor: notification.type === 'error' ? 'red' : 'green',
  }

  return (
    <div style={notificationStyle} data-testid="notification">
      {notification.message}
    </div>
  )
}

export default Notification
