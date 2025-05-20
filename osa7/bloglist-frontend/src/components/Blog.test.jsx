import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Blog from './Blog';

test('renders content', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Testing Library',
    url: 'www.testing-library.com',
  };

  render(<Blog blog={blog} />);

  const element = screen.getByText(
    'Component testing is done with react-testing-library Testing Library'
  );
  expect(element).toBeDefined();
});

test('should show url, likes and user when button is clicked', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Testing Library',
    url: 'www.testing-library.com',
    likes: 0,
    user: {
      name: 'Testikäyttäjä',
      id: 'user123',
    },
  };

  const user1 = {
    id: 'user123',
    name: 'Testikäyttäjä',
  };

  render(<Blog blog={blog} user={user1} />);

  const user = userEvent.setup();

  expect(screen.queryByText('www.testing-library.com')).toBeNull();
  expect(screen.queryByText('0 likes')).toBeNull();
  expect(screen.queryByText('Testikäyttäjä')).toBeNull();

  const button = screen.getByText('view');
  await user.click(button);

  expect(screen.getByText('www.testing-library.com')).toBeDefined();
  expect(screen.getByText('0 likes')).toBeDefined();
  expect(screen.getByText('Testikäyttäjä')).toBeDefined();
});

test('should call likeHandle twice when liked twice', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Testing Library',
    url: 'www.testing-library.com',
    likes: 0,
    user: {
      name: 'Testikäyttäjä',
      id: 'user123',
    },
  };
  const user1 = {
    id: 'user123',
    name: 'Testikäyttäjä',
  };

  const mockLikeHandler = vi.fn();

  render(<Blog blog={blog} user={user1} likeHandle={mockLikeHandler} />);

  const user = userEvent.setup();

  const button = screen.getByText('view');
  await user.click(button);

  const likeButton = screen.getByText('like');
  await user.click(likeButton);
  await user.click(likeButton);

  expect(mockLikeHandler.mock.calls).toHaveLength(2);
});
