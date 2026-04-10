import { createContext, useContext, useEffect, useState } from "react";
import { AxiosToken } from "../Api/Api";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await AxiosToken.get("/auth/profile");
        setUser(res.data.data);
      } catch (err) {
        console.error(err);
      }
      finally{
        setLoading(false)
      }
    };

    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ user,loading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);