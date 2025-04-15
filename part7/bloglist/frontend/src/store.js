import { configureStore } from '@reduxjs/toolkit'
import notificationReducer from './reducers/notificationSlice'

const store = configureStore({
  reducer: {
    notification: notificationReducer,
  },
})

export default store
