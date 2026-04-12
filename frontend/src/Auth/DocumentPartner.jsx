import { useEffect, useState } from "react"
import Hotel from "./partnerDocument/Hotel"
import Cookies from "universal-cookie";
import { Navigate, useNavigate } from "react-router-dom";
import PendingSend from "./partnerDocument/PendingSend";
import { AxiosToken } from "../Api/Api";

const DocumentPartner = () => {
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
    status === 200 ?
      <Navigate to={"/partner/dashboard"} replace={true} />
      :
    status === 202 ?
    <PendingSend />
    :
    <Hotel />
  )
}

export default DocumentPartner