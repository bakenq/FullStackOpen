import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAnecdote } from '../requests'

import { useNotificationDispatch } from '../NotificationContext'

const AnecdoteForm = () => {
  const queryClient = useQueryClient()

  const showNotification = useNotificationDispatch()

  const newAnecdoteMutation = useMutation({
    mutationFn: createAnecdote,
    onSuccess: (newAnecdote) => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
      showNotification(`Anecdote '${newAnecdote.content}' created`, 5)
    },
    onError: (error) => {
      showNotification(`Anecdote creation failed: ${error.response.data.error}`, 5)
    }
  })

  const onCreate = (event) => {
    event.preventDefault()
    const content = event.target.anecdote.value
    event.target.anecdote.value = ''

    newAnecdoteMutation.mutate(content)
}

  return (
    <div>
      <h3>create new</h3>
      <form onSubmit={onCreate}>
        <input name='anecdote' />
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default AnecdoteForm
