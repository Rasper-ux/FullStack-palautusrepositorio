import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import BlogCreate from './components/BlogCreate'
import Togglable from './components/Togglable'
import PropTypes from 'prop-types'



const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const createRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      setSuccessMessage(`welcome ${user.name}`)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    } catch (exception) {
      setErrorMessage('wrong username or password')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        <h2>log in to application</h2>
        <Notification message={errorMessage} type="error" />
        <Notification message={successMessage} type="success" />
        username
        <input
          data-testid="username"
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          data-testid="password"
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const blogForm = () => (
    blogs.sort((a, b) => b.likes - a.likes),
    <div>
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} user={user} likeHandle={handleLike} deleteHandle={handleDelete} />
      )}
    </div>
  )

  Blog.propTypes = {
    blog: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    likeHandle: PropTypes.func.isRequired,
    deleteHandle: PropTypes.func.isRequired
  }

  const handleLike = async (blog) => {
    const updated = await blogService.update(blog.id, blog.likes + 1)

    setBlogs(blogs.map(b =>
      b.id !== blog.id
        ? b
        : { ...blog, likes: updated.likes }
    ))
  }

  const handleDelete = async (blog) => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      await blogService.remove(blog.id)
      setBlogs(blogs.filter(b => b.id !== blog.id))
      setSuccessMessage(`Blog "${blog.title}" by ${blog.author} removed`)
      setTimeout(() => {
        setSuccessMessage(null)
      }
      , 5000)
    }
  }


  const addBlog = (blogObject) => {
    createRef.current.toggleVisibility()

    if (!blogObject.title) {
      setErrorMessage('Title is required')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      return
    }
    if (!blogObject.url) {
      setErrorMessage('Url is required')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
    blogService
      .create(blogObject)
      .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))

        setSuccessMessage(`A new blog "${returnedBlog.title}" by ${returnedBlog.author} added`)
        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)
      })
      .catch(error => {
        setErrorMessage('Blog creation failed')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      }
      )
  }

  const Notification = ({ message, type }) => {
    if (message === null) return null

    return (
      <div className={type === 'success' ? 'success' : 'error'}>
        {message}
      </div>
    )
  }

  return (
    <div>
      {!user && loginForm()}
      {user && <div>
        <h2>blogs</h2>
        <Notification message={errorMessage} type="error" />
        <Notification message={successMessage} type="success" />
        <p>{user.name} logged in <button onClick={() => {
          window.localStorage.removeItem('loggedNoteappUser')
          setUser(null)
        }}>logout</button></p>

        <Togglable buttonLabel="create new blog" ref={createRef}>
          <BlogCreate createBlog={addBlog} />
        </Togglable>

        {blogForm()}
      </div>}
    </div>
  )
}

export default App