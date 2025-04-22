import { useState } from 'react'

const Blog = ({ blog, user, likeHandle, deleteHandle }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }
  const [visible, setVisible] = useState(false)
  return (
    <div style={blogStyle} className="blog">
      <div>
        {blog.title} {blog.author}
        <button onClick={() => setVisible(!visible)}>
          {visible ? 'hide' : 'view'}
        </button>
      </div>

      {visible && (
        <div>
          <div>{blog.url}</div>
          <div>
            {blog.likes} likes <button
              onClick={() => likeHandle(blog)}
            >like</button>
          </div>
          <div>{blog.user?.name}</div>
          {(blog.user === user.id || blog.user?.id === user.id) && (
            <button onClick={() => deleteHandle(blog)}>remove</button>
          )}
        </div>
      )}
    </div>
  )
}
export default Blog