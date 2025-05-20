import { render, screen } from '@testing-library/react';
import BlogCreate from './BlogCreate';
import userEvent from '@testing-library/user-event';

test('<BlogCreate /> calls createBlog with correct details', async () => {
  const user = userEvent.setup();
  const createBlog = vi.fn();

  render(<BlogCreate createBlog={createBlog} />);

  const inputTitle = screen.getByPlaceholderText('Title');
  const inputAuthor = screen.getByPlaceholderText('Author');
  const inputUrl = screen.getByPlaceholderText('Url');
  const sendButton = screen.getByText('save');

  await user.type(inputTitle, 'Component testing');
  await user.type(inputAuthor, 'Testing Library');
  await user.type(inputUrl, 'www.testing-library.com');
  await user.click(sendButton);

  expect(createBlog.mock.calls).toHaveLength(1);
  expect(createBlog.mock.calls[0][0].title).toBe('Component testing');
  expect(createBlog.mock.calls[0][0].author).toBe('Testing Library');
  expect(createBlog.mock.calls[0][0].url).toBe('www.testing-library.com');
});
