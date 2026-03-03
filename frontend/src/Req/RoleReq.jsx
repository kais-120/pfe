import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie"
import { AxiosToken } from "../Api/Api";

const RoleReq = ({allow}) => {
    const [user,setUser] = useState(null);

    const cookie = new Cookies();
    const token = cookie.get("auth");

    const navigate = useNavigate();

    useEffect(()=>{
        async function getUser(){
            try{
                const response = await AxiosToken.get("/auth/profile");
                setUser(response.data.data)
            }catch{
                console.err("error")
                navigate("/",{replace:true});
            }
        }
        getUser();
    },[])    
  return (
    !token ? (
        <Navigate to={"/"} replace={true}/>
    ) :
    (user) ? 
        (user.role.includes(allow)) ? 
            (
                <Outlet />
            ) :
        (
        <Navigate to={"/"} replace={true}/>
        ) : (
            <p>loading ...</p>
        )
  )
}

export default RoleReq