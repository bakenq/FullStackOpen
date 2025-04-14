import { createSlice } from '@reduxjs/toolkit'
import anecdoteService from '../services/anecdotes'
import { showNotification } from './notificationReducer'


const getId = () => (100000 * Math.random()).toFixed(0)

const initialState = []

const anecdoteSlice = createSlice({
  name: 'anecdotes',
  initialState,
  reducers: {
    updateAnecdote(state, action) {
      const updatedAnecdote = action.payload
      return state.map(anecdote =>
        anecdote.id !== updatedAnecdote.id ? anecdote : updatedAnecdote
      )
    },

    appendAnecdote(state, action) {
      state.push(action.payload)
    },

    setAnecdotes(state, action) {
      return action.payload
    }
  }
})


export const { updateAnecdote, appendAnecdote, setAnecdotes } = anecdoteSlice.actions


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

export const voteAnecdote = (id) => {
  return async (dispatch, getState) => {
    const state = getState()
    const anecdoteToVote = state.anecdotes.find(a => a.id === id)

    if (!anecdoteToVote) {
      console.error(`Anecdote with id ${id} not found`)
      return
    }

    const updatedAnecdote = { ...anecdoteToVote, votes: anecdoteToVote.votes + 1 }

    try {
      const returnedAnecdote = await anecdoteService.update(id, updatedAnecdote)
      dispatch(updateAnecdote(returnedAnecdote))

      const message = `You voted for '${returnedAnecdote.content}'`
      dispatch(showNotification(message, 5))
    } catch (error) {
      console.error('Failed to update anecdote:', error)
      dispatch(showNotification(`Error voting for anecdote: ${error.message || 'Unknown error'}`, 5));
    }
  }
}


export default anecdoteSlice.reducer