import { useSelector, useDispatch } from 'react-redux'
import { voteAnecdote } from '../reducers/anecdoteReducer'
import { showNotification } from '../reducers/notificationReducer'

const AnecdoteList = () => {
  const anecdotes = useSelector(state => state.anecdotes)
  const filter = useSelector(state => state.filter)
  const dispatch = useDispatch()

  const vote = (id) => {
    console.log('vote', id)

    const anecdoteToVote = anecdotes.find(a => a.id === id)
    dispatch(voteAnecdote(id))

    const message = `You voted for '${anecdoteToVote.content}'`
    dispatch(showNotification(message, 5))
  }

  const anecdotesToShow = anecdotes.filter(anecdote =>
    anecdote.content.toLowerCase().includes(filter.toLowerCase())
  )

  const sortedAnecdotes = [...anecdotesToShow].sort((a, b) => b.votes - a.votes)

  return (
    <>
      {sortedAnecdotes.map(anecdote =>
        <div key={anecdote.id}>
          <div>
            {anecdote.content}
          </div>
          <div>
            has {anecdote.votes}
            <button onClick={() => vote(anecdote.id)}>vote</button>
          </div>
        </div>
      )}
    </>
  )
}

export default AnecdoteList