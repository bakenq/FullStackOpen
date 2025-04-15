import { createContext, useReducer, useContext, useRef } from 'react'

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET':
      return action.payload
    case 'CLEAR':
      return ''
    default:
      return state
  }
}

const NotificationContext = createContext()

export const NotificationContextProvider = (props) => {
  const [notification, notificationDispatch] = useReducer(notificationReducer, '')
  const timeoutIdRef = useRef(null)

  const showNotification = (message, duration = 5) => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
    }

    notificationDispatch({ type: 'SET', payload: message })

    timeoutIdRef.current = setTimeout(() => {
      notificationDispatch({ type: 'CLEAR' })
      timeoutIdRef.current = null
    }, duration * 1000)
  }

  return (
    <NotificationContext.Provider value={[notification, showNotification]}>
      {props.children}
    </NotificationContext.Provider>
  )
}

export const useNotificationValue = () => {
  const valueAndDispatch = useContext(NotificationContext)
  return valueAndDispatch[0]
}

export const useNotificationDispatch = () => {
  const valueAndDispatch = useContext(NotificationContext)
  return valueAndDispatch[1]
}


export default NotificationContext