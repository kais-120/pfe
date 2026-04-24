import { createContext, useContext, useEffect, useState } from "react";
import { AxiosToken } from "../Api/Api";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const cookie = new Cookies();
  const token = cookie.get("auth")

  useEffect(() => {
    if(!token) return
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await AxiosToken.get("/auth/profile");
        setUser(res.data.data);
      } catch (err) {
        cookie.remove("auth");
        navigate("/");
        console.error(err);
      }
      finally{
        setLoading(false)
      }
    };

    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ user,loading,setUser }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);