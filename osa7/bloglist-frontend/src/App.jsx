import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Blog from './components/Blog';
import Users from './components/Users';
import User from './components/User';
import blogService from './services/blogs';
import loginService from './services/login';
import BlogCreate from './components/BlogCreate';
import Togglable from './components/Togglable';
import PropTypes from 'prop-types';
import Notification from './components/Notification';
import { useNotificationDispatch } from './NotificationContext';
import { useUserValue, useUserDispatch } from './UserContext';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Nav, Navbar, Table, Button } from 'react-bootstrap';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const user = useUserValue();
  const userDispatch = useUserDispatch();
  const createRef = useRef();
  const notificationDispatch = useNotificationDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      userDispatch({ type: 'SET_USER', payload: user });
      blogService.setToken(user.token);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const user = await loginService.login({
        username,
        password,
      });

      window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user));
      blogService.setToken(user.token);
      userDispatch({ type: 'SET_USER', payload: user });
      setUsername('');
      setPassword('');
      notificationDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          message: `Welcome ${user.name}`,
          type: 'success',
        },
      });
      setTimeout(() => {
        notificationDispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 5000);
    } catch (exception) {
      notificationDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          message: 'Wrong username or password',
          type: 'error',
        },
      });
      setTimeout(() => {
        notificationDispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 5000);
    }
  };

  const Menu = () => {
    const padding = {
      padding: 5,
    };
    return (
      <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#" as="span">
              <Link style={padding} to="/">
                blogs
              </Link>
            </Nav.Link>
            <Nav.Link href="#" as="span">
              <Link style={padding} to="/users">
                users
              </Link>
            </Nav.Link>
            <Nav.Link href="#" as="span">
              {user.name} logged in
              <Button
                variant="outline-danger"
                style={padding}
                onClick={() => {
                  window.localStorage.removeItem('loggedNoteappUser');
                  userDispatch({ type: 'CLEAR_USER' });
                }}
              >
                logout
              </Button>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  };

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        <h2>log in to application</h2>
        <Notification />
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
  );

  const blogForm = (blogs) => (
    blogs.sort((a, b) => b.likes - a.likes),
    (
      <Table striped>
        <tbody>
          {blogs.map((blog) => (
            <tr key={blog.id}>
              <td>
                <Link to={`/blog/${blog.id}`}>
                  {blog.title} {blog.author}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    )
  );

  const likeBlogMutation = useMutation({
    mutationFn: (blog) => blogService.update(blog.id, blog.likes),
    onSuccess: (updatedBlog) => {
      const blogs = queryClient.getQueryData(['blogs']);
      queryClient.setQueryData(
        ['blogs'],
        blogs.map((b) => (b.id !== updatedBlog.id ? b : updatedBlog))
      );
      notificationDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          message: `Blog ${updatedBlog.title} liked`,
          type: 'success',
        },
      });
      setTimeout(() => {
        notificationDispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 5000);
    },
  });

  const handleLike = (blog) => {
    likeBlogMutation.mutate({
      ...blog,
      likes: blog.likes + 1,
    });
  };

  const removeBlogMutation = useMutation({
    mutationFn: async (blog) => {
      await blogService.remove(blog.id);
      return blog;
    },
    onSuccess: (blog) => {
      const blogs = queryClient.getQueryData(['blogs']);
      queryClient.setQueryData(
        ['blogs'],
        blogs.filter((b) => b.id !== blog.id)
      );
      notificationDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          message: `Blog ${blog.title} by ${blog.author} removed`,
          type: 'success',
        },
      });
      setTimeout(() => {
        notificationDispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 5000);
    },
  });

  const handleDelete = (blog) => {
    const navigate = useNavigate();
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      removeBlogMutation.mutate(blog);
    }
    navigate('/');
  };

  const result = useQuery({
    queryKey: ['blogs'],
    queryFn: () => blogService.getAll(),
    refetchOnWindowFocus: false,
  });

  if (result.isLoading) {
    return <div>loading data...</div>;
  }

  if (result.isError) {
    return <div>anecdote service not available due to problems in server</div>;
  }

  const blogs = result.data;

  return (
    <div className="container">
      {!user && loginForm()}
      {user && (
        <div>
          <Menu />
          <h2>blog app</h2>
          <Notification />
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <Togglable buttonLabel="create new blog" ref={createRef}>
                    <BlogCreate />
                  </Togglable>
                  <p></p>
                  <h2>blogs</h2>
                  {blogForm(blogs)}
                </div>
              }
            />
            <Route path="/users" element={<Users />} />
            <Route path="/user/:id" element={<User />} />
            <Route
              path="/blog/:id"
              element={
                <Blog
                  blogs={blogs}
                  user={user}
                  likeHandle={handleLike}
                  deleteHandle={handleDelete}
                />
              }
            />
          </Routes>
        </div>
      )}
    </div>
  );
};

export default App;

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  likeHandle: PropTypes.func.isRequired,
  deleteHandle: PropTypes.func.isRequired,
};
