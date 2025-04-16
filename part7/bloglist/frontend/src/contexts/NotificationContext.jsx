import { createContext, useReducer, useContext } from 'react'
import PropTypes from 'prop-types'

const initialState = {
  message: null,
  type: '',
  timeoutId: null,
}

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATION':
      if (state.timeoutId) {
        clearTimeout(state.timeoutId)
      }

      return {
        message: action.payload.message,
        type: action.payload.type,
        timeoutId: action.payload.timeoutId,
      }
    case 'CLEAR_NOTIFICATION':
      return { ...initialState }
    default:
      return state
  }
}

const NotificationContext = createContext()

export const NotificationContextProvider = (props) => {
  const [notificationState, dispatch] = useReducer(notificationReducer, initialState)

  const showNotificationWithTimeout = (message, type = 'success', durationInSeconds = 5) => {
    const newTimeoutId = setTimeout(() => {
      dispatch({ type: 'CLEAR_NOTIFICATION' })
    }, durationInSeconds * 1000)

    dispatch({
      type: 'SET_NOTIFICATION',
      payload: { message, type, timeoutId: newTimeoutId },
    })
  }

  const contextValue = {
    notificationState,
    showNotificationWithTimeout,
  }

  return <NotificationContext.Provider value={contextValue}>{props.children}</NotificationContext.Provider>
}

NotificationContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useNotificationValue = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationValue must be used within a NotificationContextProvider')
  }

  return context.notificationState
}

export const useNotificationDispatch = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationDispatch must be used within a NotificationContextProvider')
  }

  return context.showNotificationWithTimeout
}

export default NotificationContext
