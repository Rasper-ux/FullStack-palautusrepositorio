import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAnecdote } from '../requests'
import { useNotificationDispatch } from '../NotificationContext'

const AnecdoteForm = () => {
  const queryClient = useQueryClient()
  const notificationDispatch = useNotificationDispatch()

  const newAnecdoteMutation = useMutation({
  mutationFn: createAnecdote,
  onSuccess: (newAnecdote) => {
    const anecdotes = queryClient.getQueryData(['anecdotes'])
    queryClient.setQueryData(['anecdotes'], anecdotes.concat(newAnecdote))
    notificationDispatch({
      type: 'SET_NOTIFICATION',
      payload: `you created '${newAnecdote.content}'`
    })
    setTimeout(() => {
      notificationDispatch({
        type: 'CLEAR_NOTIFICATION'
      })
    }, 5000)
  },
  onError: (error) => {
    notificationDispatch({
      type: 'SET_NOTIFICATION',
      payload: `too short anecdote, must have length 5 or more`
    })
    setTimeout(() => {
      notificationDispatch({
        type: 'CLEAR_NOTIFICATION'
      })
    }, 5000)
  }
})

  const onCreate = (event) => {
    event.preventDefault()
    const content = event.target.anecdote.value
    event.target.anecdote.value = ''
    newAnecdoteMutation.mutate({ content, votes: 0 })
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
