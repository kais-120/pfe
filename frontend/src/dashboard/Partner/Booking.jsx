import { useEffect, useState } from 'react'
import { AxiosToken } from '../../Api/Api';
import LoadingScreen from '../../components/LoadingScreen';
import BookingOffer from './Service/booking/BookingOffer';
import BookingHotel from './Service/booking/BookingHotel';
import { Box, Spinner } from '@chakra-ui/react';

const Booking = () => {
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(false);
  useEffect(()=>{
    setLoading(true)
    const fetchData = async () => {
      try{

        const res = await AxiosToken.get("/auth/profile");
        setUser(res.data.data.partnerInfo[0].sector)
      }catch{
        console.error("error")
      }
      finally{
        setLoading(false)
      }
    }
    fetchData()
  },[])
  if(loading) return <Box><Spinner /></Box>
  return (
    user && user === "agence de voyage" ? <BookingOffer /> : <BookingHotel />
  )
}

export default Booking