import { Navigate, Outlet } from "react-router-dom";
import Cookies from "universal-cookie"

const AuthReq = () => {
    const cookie = new Cookies()
    const token = cookie.get("auth");
  return (
    !token ? <Outlet /> : <Navigate to={"/"} replace={false} />
  )
}

export default AuthReq