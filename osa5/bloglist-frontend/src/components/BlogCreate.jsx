import { useState } from 'react'

const BlogCreate = ({ createBlog }) => {
  const [newTitle, setTitle] = useState('')
  const [newAuthor, setAuthor] = useState('')
  const [newUrl, setUrl] = useState('')


  const addBlog = (event) => {
    event.preventDefault()
    createBlog({
      title: newTitle,
      author: newAuthor,
      url: newUrl,
    })

    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <h2>Create new</h2>

      <form onSubmit={addBlog}>
        <div>
          title
          <input
            type="text"
            value={newTitle}
            name="Title"
            onChange={({ target }) => setTitle(target.value)}
            placeholder='Title'
          />
        </div>
        <div>
          author
          <input
            type="text"
            value={newAuthor}
            name="Author"
            onChange={({ target }) => setAuthor(target.value)}
            placeholder='Author'
          />
        </div>
        <div>
          url
          <input
            type="text"
            value={newUrl}
            name="Url"
            onChange={({ target }) => setUrl(target.value)}
            placeholder='Url'
          />
        </div>
        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default BlogCreate