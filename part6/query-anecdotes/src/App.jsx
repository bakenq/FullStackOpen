import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAnecdotes, updateAnecdote } from './requests'

import { useNotificationDispatch } from './NotificationContext'

import AnecdoteForm from './components/AnecdoteForm'
import Notification from './components/Notification'

const App = () => {
  const queryClient = useQueryClient()

  const showNotification = useNotificationDispatch()

  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: getAnecdotes,
    retry: 1,
  })

  const updateAnecdoteMutation = useMutation({
    mutationFn: updateAnecdote,
    onSuccess: (updatedAnecdote) => {
      const anecdotes = queryClient.getQueryData(['anecdotes'])
      queryClient.setQueryData(['anecdotes'],
        anecdotes.map(anecdote =>
          anecdote.id === updatedAnecdote.id ? updatedAnecdote : anecdote
        )
      )
      showNotification(`Anecdote '${updatedAnecdote.content}' voted`, 5)
    },
    onError: (error) => {
      showNotification(`Error voting: ${error.response.data.error}`, 5)
    }
  })


  const handleVote = (anecdote) => {
    const updatedAnecdote = { ...anecdote, votes: anecdote.votes + 1 }
    updateAnecdoteMutation.mutate(updatedAnecdote)
  }


  if (result.isLoading) {
    return <div>loading data...</div>
  }

  if (result.isError) {
    return <div>anecdote service not available due to problems in server</div>
  }

  const anecdotes = result.data


  return (
    <div>
      <h3>Anecdote app</h3>

      <Notification />
      <AnecdoteForm />

      {anecdotes.map(anecdote =>
        <div key={anecdote.id}>
          <div>
            {anecdote.content}
          </div>
          <div>
            has {anecdote.votes}
            <button onClick={() => handleVote(anecdote)}>vote</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
