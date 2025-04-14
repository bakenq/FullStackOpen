import { createSlice } from '@reduxjs/toolkit'
import anecdoteService from '../services/anecdotes'
import { showNotification } from './notificationReducer'


const getId = () => (100000 * Math.random()).toFixed(0)

const initialState = []

const anecdoteSlice = createSlice({
  name: 'anecdotes',
  initialState,
  reducers: {
    voteAnecdote(state, action) {
      const id = action.payload
      const anecdoteToChange = state.find(a => a.id === id)

      if (anecdoteToChange) {
        anecdoteToChange.votes += 1
      }

    },

    appendAnecdote(state, action) {
      state.push(action.payload)
    },

    setAnecdotes(state, action) {
      return action.payload
    }
  }
})


export const { voteAnecdote, appendAnecdote, setAnecdotes } = anecdoteSlice.actions


export const initializeAnecdotes = () => {
  return async dispatch => {
    try {
      const anecdotes = await anecdoteService.getAll()
      dispatch(setAnecdotes(anecdotes))
    } catch (error) {
      console.error('Failed to fetch anecdotes:', error)
    }
  }
}

export const createAnecdote = (content) => {
  return async dispatch => {
    try {
      const newAnecdote = await anecdoteService.createNew(content)
      dispatch(appendAnecdote(newAnecdote))

      const message = `You created '${newAnecdote.content}'`
      dispatch(showNotification(message, 5))
    } catch (error) {
      console.error('Failed to create anecdote:', error)
      dispatch(showNotification(`Error creating anecdote: ${error.message || 'Unknown error'}`, 5));
    }
  }
}


export default anecdoteSlice.reducer