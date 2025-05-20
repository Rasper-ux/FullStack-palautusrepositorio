import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import blogService from '../services/blogs';
import { useNotificationDispatch } from '../NotificationContext';
import { Form, Button } from 'react-bootstrap';

const BlogCreate = () => {
  const [newTitle, setTitle] = useState('');
  const [newAuthor, setAuthor] = useState('');
  const [newUrl, setUrl] = useState('');
  const queryClient = useQueryClient();
  const notificationDispatch = useNotificationDispatch();

  const newBlogMutation = useMutation({
    mutationFn: (newBlog) => blogService.create(newBlog),
    onSuccess: (newBlog) => {
      const blogs = queryClient.getQueryData(['blogs']);
      queryClient.setQueryData(['blogs'], blogs.concat(newBlog));
      queryClient.invalidateQueries(['users']);
      notificationDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          message: `a new blog ${newBlog.title} by ${newBlog.author} added`,
          type: 'success',
        },
      });
      setTimeout(() => {
        notificationDispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 5000);
    },
    onError: (error) => {
      notificationDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          message: error.response.data.error,
          type: 'error',
        },
      });
      setTimeout(() => {
        notificationDispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 5000);
    },
  });

  const addBlog = (event) => {
    event.preventDefault();
    newBlogMutation.mutate({
      title: newTitle,
      author: newAuthor,
      url: newUrl,
    });

    setTitle('');
    setAuthor('');
    setUrl('');
  };

  return (
    <div>
      <h2>Create new</h2>

      <Form onSubmit={addBlog}>
        <Form.Group>
          <Form.Label>title</Form.Label>
          <Form.Control
            type="text"
            value={newTitle}
            name="Title"
            onChange={({ target }) => setTitle(target.value)}
            placeholder="Title"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>author</Form.Label>
          <Form.Control
            type="text"
            value={newAuthor}
            name="Author"
            onChange={({ target }) => setAuthor(target.value)}
            placeholder="Author"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>url</Form.Label>
          <Form.Control
            type="text"
            value={newUrl}
            name="Url"
            onChange={({ target }) => setUrl(target.value)}
            placeholder="Url"
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          save
        </Button>
      </Form>
    </div>
  );
};

export default BlogCreate;
