import { useNotificationValue } from '../contexts/NotificationContext'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

const Notification = () => {
  const notification = useNotificationValue()

  const open = notification.message !== null && notification.message !== ''

  if (!open) return null

  return (
    <Snackbar open={open} autoHideDuration={null} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert severity={notification.type === 'error' ? 'error' : 'success'} variant="filled" sx={{ wdith: '100%' }}>
        {notification.message}
      </Alert>
    </Snackbar>
  )
}

export default Notification
