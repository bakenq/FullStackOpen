import { createContext, useReducer, useContext } from 'react'
import PropTypes from 'prop-types'

const userReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return action.payload
    case 'LOGOUT':
      return null
    default:
      return state
  }
}

const UserContext = createContext()

export const UserContextProvider = (props) => {
  const [userState, dispatch] = useReducer(userReducer, null)

  return <UserContext.Provider value={{ userState, dispatch }}>{props.children}</UserContext.Provider>
}

UserContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useUserValue = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserValue must be used within a UserContextProvider')
  }
  return context.userState
}

export const useUserDispatch = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserDispatch must be used within a UserContextProvider')
  }
  return context.dispatch
}

export default UserContext
