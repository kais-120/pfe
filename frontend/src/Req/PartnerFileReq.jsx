import { useEffect, useState } from "react"
import { AxiosToken } from "../Api/Api";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

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
        console.log(response)
        setStatus(response.status)
      }catch(err){
        console.log(err.status)
        setStatus(err.status)
      }
    }
    verifiedPartner();

  },[])
  console.log(status)
  return (
    !status ? (
       <p>loading ...</p>
      ) : (
        status === 200 ? (
          <Outlet />
        ) : (
          <Navigate to="/partner" replace={true} />
        )
      )
    
  )
}

export default PartnerFileReq