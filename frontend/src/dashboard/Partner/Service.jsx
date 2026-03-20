import { useEffect, useState } from "react";
import ServiceHotel from "./Service/Fetsh/ServiceHotel";
import ServiceLocation from "./Service/Fetsh/ServiceLocation";
import ServiceAgency from "./Service/Fetsh/ServiceAgency";
import { AxiosToken } from "../../Api/Api";
import LoadingScreen from "../../components/LoadingScreen";

const Service = () => {
   const [user, setUser] = useState(null);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await AxiosToken.get(`/auth/profile`);
          setUser(response.data.data)
        } catch(err) {
          console.error("error")
        }
      }
      fetchData()
    }, [])
  return (
    user ? user?.partnerInfo?.[0]?.sector === "hôtel" ? <ServiceHotel /> 
    : user?.partnerInfo?.[0]?.sector === "agence de voyage" ? <ServiceAgency />
    : <ServiceLocation />
    : <LoadingScreen />
  )
}

export default Service