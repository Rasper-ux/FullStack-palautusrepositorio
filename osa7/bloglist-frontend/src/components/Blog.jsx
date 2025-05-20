import { useParams } from 'react-router-dom';
import { useState } from 'react';
import blogService from '../services/blogs';
import { useQueryClient } from '@tanstack/react-query';

const Blog = ({ blogs, likeHandle }) => {
  const { id } = useParams();
  const [comment, setComment] = useState('');
  const blog = blogs.find((blog) => blog.id === id);
  const queryClient = useQueryClient();

  const handleCommentChange = async (event) => {
    event.preventDefault();
    try {
      await blogService.addComment(blog.id, comment);
      setComment('');
      queryClient.invalidateQueries(['blogs']);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div>
      <div>
        <h2>
          {blog.title} by {blog.author}
        </h2>
        <p>{blog.url}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <p style={{ margin: 0 }}>{blog.likes} likes</p>
          <button onClick={() => likeHandle(blog)}>like</button>
        </div>
        <p>added by {blog.user.name}</p>
        <h4>Comments</h4>
        <form onSubmit={handleCommentChange}>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment"
          />
          <button type="submit">Add Comment</button>
        </form>
        {blog.comments.length > 0 ? (
          <div>
            <ul>
              {blog.comments.map((comment, index) => (
                <li key={index}>{comment}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No comments yet</p>
        )}
      </div>
    </div>
  );
};
export default Blog;
