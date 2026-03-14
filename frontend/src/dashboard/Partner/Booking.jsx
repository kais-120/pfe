import { Box, Container, Heading, Table, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AxiosToken } from "../../Api/Api";


export default function Booking() {
    const [bookings,setBookings] = useState([]); 

    useEffect(()=>{
      const fetchData = async () =>{
        const response = await AxiosToken.get("/booking/get/partner/booking/hotel");
        console.log(response.data)
        setBookings(response.data.booking)
      }
      fetchData()
    },[])
console.log(bookings && bookings[0]?.bookingHotelDetails[0]?.check_in_date)
const dataForm = (date) => {
  const dateForme = new Date(date).toLocaleDateString();
  return dateForme;
}
  return (
    <Container maxW="900px" py={10}>
        <Heading size="lg" mb={4}>Listes de réservations</Heading>
      {bookings && bookings.length > 0 ? bookings?.map((booking) => (
      <Box key={booking.id} borderWidth="1px" borderRadius="lg" p={6} boxShadow="md">
        <Heading size="lg" mb={4}>Booking Details</Heading>

        <Text><b>Check-in:</b> {dataForm(booking.bookingHotelDetails[0]?.check_in_date)}</Text>
        <Text><b>Check-out:</b> {dataForm(booking.bookingHotelDetails[0]?.check_out_date)}</Text>
        <Text><b>Méthode de paiement:</b> {booking.method_payment}</Text>
        <Text mb={6}><b>Client:</b> {booking.userBooking.name}</Text>

        <Table.Root size="md">
            <Table.Header>
            <Table.Row>
            <Table.ColumnHeader>#</Table.ColumnHeader>
            <Table.ColumnHeader>Chambre</Table.ColumnHeader>
            <Table.ColumnHeader>Adulte</Table.ColumnHeader>
            <Table.ColumnHeader>Enfant</Table.ColumnHeader>
            </Table.Row>
            </Table.Header>

          <Table.Body>
            {booking?.bookingHotelDetails.map((room,index)=>(
              <Table.Row key={room.id}>
                <Table.Cell>{index+1}</Table.Cell>
                <Table.Cell>{room.RoomHotelBooking.name}</Table.Cell>
                <Table.Cell>{room.number_of_guests_adult}</Table.Cell>
                <Table.Cell>{room.number_of_guests_children}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <Heading className="flex justify-end" size="lg" mt={2}>Prix Total:{booking.total_price} TND</Heading>
      </Box>
      ))
    :
    <Text>Il n'y a pas de réservation</Text>
    }
    </Container>
  );
}