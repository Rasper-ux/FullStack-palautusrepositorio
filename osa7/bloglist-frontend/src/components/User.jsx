import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import userService from '../services/users';

const User = () => {
  const { id } = useParams();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });
  const user = users.find((user) => user.id === id);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h2>{user.name}</h2>
      <p></p>
      <h3>added blogs</h3>
      <ul>
        {user.blogs.map((blog) => (
          <li key={blog.id}>{blog.title}</li>
        ))}
      </ul>
    </div>
  );
};
export default User;
