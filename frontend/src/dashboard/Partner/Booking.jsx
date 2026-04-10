import { useEffect, useState } from 'react'
import { AxiosToken } from '../../Api/Api';
import LoadingScreen from '../../components/LoadingScreen';
import BookingOffer from './Service/booking/BookingOffer';
import BookingHotel from './Service/booking/BookingHotel';
import { Box, Spinner } from '@chakra-ui/react';
import { useProfile } from '../../Context/useProfile';
import BookingCircuits from './Service/booking/BookingCircuits';
import BookingLocation from './Service/booking/BookingLocation';

const Booking = () => {
  const { loading, user } = useProfile();
  const currentUser = user.partnerInfo[0].sector;
  if (loading) return <Box><Spinner /></Box>
  return (
    currentUser && (currentUser === "agence de voyage")
      ? <BookingOffer />
      : (currentUser === "hôtel") ?
      <BookingHotel />
      : (currentUser === "location de voitures") ?
      <BookingLocation />
      :(<BookingCircuits />)
  )
}

export default Booking