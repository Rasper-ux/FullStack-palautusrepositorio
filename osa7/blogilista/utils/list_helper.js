const _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes;
  };

  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  const reducer = (max, item) => {
    return max.likes > item.likes ? max : item;
  };

  return blogs.length === 0 ? null : blogs.reduce(reducer, blogs[0]);
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const authorCounts = _.countBy(blogs, "author");
  const bestAuthor = _.maxBy(
    Object.keys(authorCounts),
    (author) => authorCounts[author],
  );

  return {
    author: bestAuthor,
    blogs: authorCounts[bestAuthor],
  };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const groupedByAuthor = _.groupBy(blogs, "author");
  const authorLikes = _.mapValues(groupedByAuthor, (authorBlogs) =>
    _.sumBy(authorBlogs, "likes"),
  );
  const bestAuthor = _.maxBy(
    Object.keys(authorLikes),
    (author) => authorLikes[author],
  );

  return {
    author: bestAuthor,
    likes: authorLikes[bestAuthor],
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
