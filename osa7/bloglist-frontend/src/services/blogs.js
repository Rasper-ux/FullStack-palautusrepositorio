import axios from 'axios';
const baseUrl = '/api/blogs';

let token = null;

const setToken = (newToken) => {
  token = `Bearer ${newToken}`;
};

const getAll = () => {
  const request = axios.get(baseUrl);
  return request.then((response) => response.data);
};

const create = async (newObject) => {
  const config = {
    headers: { Authorization: token },
  };

  const response = await axios.post(baseUrl, newObject, config);
  return response.data;
};

const update = async (id, newLikes) => {
  const request = await axios.put(`${baseUrl}/${id}`, { likes: newLikes });
  return request.data;
};

const remove = async (id) => {
  const config = {
    headers: { Authorization: token },
  };

  const request = await axios.delete(`${baseUrl}/${id}`, config);
  return request.data;
};

const addComment = async (id, comment) => {
  const request = await axios.post(`${baseUrl}/${id}/comments`, { comment });
  return request.data;
};

export default { getAll, setToken, create, update, remove, addComment };
