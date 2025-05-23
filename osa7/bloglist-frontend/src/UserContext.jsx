import { createContext, useReducer, useContext } from 'react';

const UserReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return action.payload;
    case 'CLEAR_USER':
      return null;
    default:
      return state;
  }
};
const UserContext = createContext();
export const UserContextProvider = (props) => {
  const [user, dispatch] = useReducer(UserReducer, null);

  return <UserContext.Provider value={[user, dispatch]}>{props.children}</UserContext.Provider>;
};

export const useUserValue = () => {
  const userAndDispatch = useContext(UserContext);
  return userAndDispatch[0];
};

export const useUserDispatch = () => {
  const userAndDispatch = useContext(UserContext);
  return userAndDispatch[1];
};

export default UserContext;
