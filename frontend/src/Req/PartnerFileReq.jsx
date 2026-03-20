import { useEffect, useState } from "react"
import { AxiosToken } from "../Api/Api";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import LoadingScreen from "../components/LoadingScreen";

const PartnerFileReq = () => {
  const [status,setStatus] = useState("");
  const cookie = new Cookies();
  const token = cookie.get("auth")
  const navigate = useNavigate()
  useEffect(()=>{
    if(!token) navigate("/")
    const verifiedPartner = async () =>{
      try{
        const response = await AxiosToken("/user/verify/partner");
        setStatus(response.status)
      }catch(err){
        setStatus(err.status)
      }
    }
    verifiedPartner();

  },[])
  return (
    !status ? (
       <LoadingScreen />
      ) : (
        (status === 200) ? (
          <Outlet />
        ) : (
          <Navigate to="/partner" replace={true} />
        )
      )
    
  )
}

export default PartnerFileReq