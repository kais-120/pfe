import { Badge, Box, Button, Flex, Grid, Text, VStack, Spinner } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { FaHotel, FaMapMarkerAlt, FaMoon, FaBed, FaCalendarAlt, FaEye } from "react-icons/fa"
import { AxiosToken } from "../../Api/Api"

const STATUS_CONFIG = {
  "en attente": { label: "En attente", color: "orange" },
  "confirmée": { label: "Confirmée", color: "green" },
  "annulée":   { label: "Annulée", color: "red" },
  "terminée":  { label: "Terminée", color: "gray" },
}

const BookingClientInfo = () => {
  const [filter, setFilter] = useState("all")
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await AxiosToken.get("/booking/get/client/booking")
        const formatted = data.booking.map(b => ({
          id: b.id,
          hotelName: b.bookingHotelDetails[0]?.RoomHotelBooking?.hotelRoom?.name ?? "Hôtel inconnu",
          address: b.bookingHotelDetails[0]?.RoomHotelBooking?.hotelRoom?.address,
          nights: Math.ceil(
            (new Date(b.bookingHotelDetails[0]?.check_out_date) - new Date(b.bookingHotelDetails[0]?.check_in_date)) / (1000*60*60*24)
          ),
          totalPrice: b.total_price,
          status: b.status.toLowerCase(), // en attente, confirmée, annulée, terminée
          checkIn: b.bookingHotelDetails[0]?.check_in_date,
          checkOut: b.bookingHotelDetails[0]?.check_out_date,
          selectedRooms: b.bookingHotelDetails.map(d => ({
            roomId: d.room_id,
            name: d.RoomHotelBooking.name,
            capacity: d.RoomHotelBooking.capacity,
            priceByDay: d.RoomHotelBooking.price_by_day,
            priceByAdult: d.RoomHotelBooking.price_by_adult,
            priceByChildren: d.RoomHotelBooking.price_by_children,
            requestedAdults: d.number_of_guests_adult,
            requestedChildren: d.number_of_guests_children,
            pricePerNight: d.RoomHotelBooking.price_by_day,
          }))
        }))
        setBookings(formatted)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter)

  if (loading) return <Flex justify="center" py={20}><Spinner size="xl" /></Flex>

  return (
    <Box maxW="900px" mx="auto" px={4} py={8}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight={800} color="gray.800">Mes Réservations</Text>
          <Text fontSize="sm" color="gray.500" mt={0.5}>
            {bookings.length} réservation{bookings.length > 1 ? "s" : ""}
          </Text>
        </Box>
        <Badge
          colorScheme="blue"
          borderRadius="full"
          px={3} py={1}
          fontSize="sm"
          fontWeight={700}
        >
          {bookings.filter(b => b.status === "confirmée").length} confirmée{bookings.filter(b => b.status === "confirmée").length > 1 ? "s" : ""}
        </Badge>
      </Flex>

      {/* Filter Tabs */}
      <Flex gap={2} mb={6} flexWrap="wrap">
        {["all", "en attente", "confirmée", "annulée", "terminée"].map(key => (
          <Button
            key={key}
            size="sm"
            borderRadius="full"
            fontWeight={600}
            px={4}
            variant={filter === key ? "solid" : "outline"}
            colorScheme={filter === key ? "blue" : "gray"}
            onClick={() => setFilter(key)}
          >
            {key === "all" ? "Toutes" : STATUS_CONFIG[key].label}
            <Badge ml={2} borderRadius="full" colorScheme={filter === key ? "whiteAlpha" : "gray"} fontSize="xs">
              {key === "all" ? bookings.length : bookings.filter(b => b.status === key).length}
            </Badge>
          </Button>
        ))}
      </Flex>

      {filtered.length === 0 ? (
        <Box textAlign="center" py={16} border="2px dashed" borderColor="gray.200" borderRadius="2xl" color="gray.400">
          <FaCalendarAlt size={32} style={{ margin: "0 auto 12px" }} />
          <Text fontWeight={600} fontSize="md">Aucune réservation trouvée</Text>
          <Text fontSize="sm" mt={1}>Essayez un autre filtre</Text>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          {filtered.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </VStack>
      )}
    </Box>
  )
}

function BookingCard({ booking }) {
  const { id, hotelName, address, nights, totalPrice, checkIn, checkOut, status, selectedRooms } = booking
  const { label, color } = STATUS_CONFIG[status] ?? STATUS_CONFIG["en attente"]
  const fmt = d => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })

  return (
    <Box border="1px solid" borderColor="gray.100" borderRadius="2xl" bg="white" boxShadow="0 2px 12px rgba(0,0,0,0.06)" overflow="hidden" transition="box-shadow 0.2s, border-color 0.2s" _hover={{ boxShadow: "0 6px 24px rgba(0,0,0,0.1)", borderColor: "blue.100" }}>
      <Flex justify="space-between" align="center" px={5} py={3} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
        <Text fontSize="xs" color="gray.400" fontWeight={600}>Réservation #{id}</Text>
        <Badge colorScheme={color} borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight={700}>{label}</Badge>
      </Flex>

      <Box p={5}>
        <Flex justify="space-between" align="flex-start" gap={4} flexWrap="wrap">
          <Box flex={1} minW="220px">
            <Flex align="center" gap={2} mb={1}><Box color="blue.500"><FaHotel size={14} /></Box><Text fontWeight={800} fontSize="lg" color="gray.800">{hotelName}</Text></Flex>
            <Flex align="center" gap={1} mb={4}><Box color="gray.400"><FaMapMarkerAlt size={11} /></Box><Text fontSize="xs" color="gray.500">{address}</Text></Flex>

            <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
              <Box bg="blue.50" borderRadius="xl" p={3}><Text fontSize="xs" color="blue.400" fontWeight={600} mb={0.5}>Arrivée</Text><Text fontSize="sm" fontWeight={700} color="gray.700">{fmt(checkIn)}</Text></Box>
              <Box bg="blue.50" borderRadius="xl" p={3}><Text fontSize="xs" color="blue.400" fontWeight={600} mb={0.5}>Départ</Text><Text fontSize="sm" fontWeight={700} color="gray.700">{fmt(checkOut)}</Text></Box>
            </Grid>

            <Flex align="center" gap={2} mb={3}><Box color="blue.400"><FaMoon size={12} /></Box><Text fontSize="sm" color="gray.600"><Text as="span" fontWeight={700} color="gray.800">{nights}</Text> nuit{nights>1?"s":""}</Text></Flex>

            <VStack align="stretch" spacing={2}>
              {selectedRooms.map((room,i)=>(
                <Flex key={i} align="center" gap={3} bg="gray.50" borderRadius="lg" px={3} py={2}>
                  <Box color="blue.400"><FaBed size={12} /></Box>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight={600} color="gray.700">{room.name}</Text>
                    <Text fontSize="xs" color="gray.400">{room.requestedAdults} adulte{room.requestedAdults>1?"s":""}{room.requestedChildren>0 && ` · ${room.requestedChildren} enfant${room.requestedChildren>1?"s":""}`} · {room.capacity} pers. max</Text>
                  </Box>
                  <Text fontSize="xs" fontWeight={700} color="blue.500">{room.pricePerNight} TND/nuit</Text>
                </Flex>
              ))}
            </VStack>
          </Box>

          <Box textAlign="right" flexShrink={0} minW="140px">
            <Text fontSize="xs" color="gray.400" fontWeight={600} mb={1}>Total séjour</Text>
            <Text fontSize="3xl" fontWeight={900} color="blue.600" lineHeight="1.1">{totalPrice}</Text>
            <Text fontSize="xs" color="gray.400">TND</Text>
            <VStack mt={4} spacing={2} align="stretch">
              <Button size="sm" colorScheme="blue" borderRadius="lg" fontWeight={600} leftIcon={<FaEye size={11}/>}>Détails</Button>
            </VStack>
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

export default BookingClientInfo