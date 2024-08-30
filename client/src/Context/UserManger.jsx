import UserContext from "./UserContext";
import { useState, useEffect } from "react";

const UserManager = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const hasToken = document.cookie.split('; ').some((cookie) => cookie.startsWith('token='));
    const userId = localStorage.getItem('user_id');

    if (hasToken && userId) {
      setUser({ id: userId });
    } else {
      setUser(null);
      if (!hasToken) {
        localStorage.removeItem('user_id');
      }
    }
  }, []); 

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserManager;
