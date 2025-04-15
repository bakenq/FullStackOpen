import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  message: null,
  type: '',
  timeoutId: null,
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setMessage(state, action) {
      state.message = action.payload.message
      state.type = action.payload.type
      state.timeoutId = action.payload.timeoutId
    },

    clearMessage(state) {
      state.message = null
      state.type = ''
      state.timeoutId = null
    },
  },
})

export const { setMessage, clearMessage } = notificationSlice.actions

export const showNotification = (
  message,
  type = 'success',
  durationInSeconds = 5
) => {
  return async (dispatch, getState) => {
    const { timeoutId: currentTimeoutId } = getState().notification

    if (currentTimeoutId) {
      clearTimeout(currentTimeoutId)
    }

    const newTimeoutId = setTimeout(() => {
      dispatch(clearMessage())
    }, durationInSeconds * 1000)

    dispatch(setMessage({ message, type, timeoutId: newTimeoutId }))
  }
}

export default notificationSlice.reducer
