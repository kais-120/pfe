import { Box, Container, Heading, Table, Text, Badge, Flex, Grid, Skeleton, SkeletonText, VStack, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AxiosToken } from "../../../../Api/Api";
import {
  LuCalendarDays, LuUser, LuCreditCard, LuPlane,
  LuUsers, LuBaby, LuHash, LuTrendingUp,
  LuMapPin, LuClock, LuStar, LuTag
} from "react-icons/lu";
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";

/* ── Helpers ────────────────────────────────────────────────────── */
const formatDate = (date) =>
  new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })

const formatTime = (time) => {
  if (!time) return "—"
  return time.slice(0, 5)
}

/* ── Payment method badge ───────────────────────────────────────── */
const PAYMENT_COLORS = {
  cash: "orange",
  card: "blue",
  virement: "purple",
  en_ligne: "blue",
}

function PaymentBadge({ method }) {
  const color = PAYMENT_COLORS[method?.toLowerCase()] ?? "gray"
  return (
    <Badge
      colorScheme={color} borderRadius="full"
      px={2.5} py={0.5} fontSize="xs" fontWeight={600}
      textTransform="capitalize"
    >
      {method ?? "—"}
    </Badge>
  )
}

/* ── Status badge ───────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    confirmed: { color: "green", Icon: FaCheckCircle, label: "Confirmée" },
    confirmée: { color: "green", Icon: FaCheckCircle, label: "Confirmée" },
    pending: { color: "yellow", Icon: FaHourglassHalf, label: "En attente" },
    cancelled: { color: "red", Icon: FaTimesCircle, label: "Annulée" },
  }
  const s = map[status?.toLowerCase()] ?? map.pending
  const Icon = s.Icon
  return (
    <Flex align="center" gap={1.5}>
      <Icon size={11} color={`var(--chakra-colors-${s.color}-500)`} />
      <Badge colorScheme={s.color} borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight={600}>
        {s.label}
      </Badge>
    </Flex>
  )
}

/* ── Stat card ──────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color = "blue" }) {
  return (
    <Box
      bg="white" borderRadius="xl" p={4}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)"
    >
      <Flex align="center" gap={3}>
        <Flex
          w="40px" h="40px" borderRadius="lg"
          bg={`${color}.50`} color={`${color}.500`}
          align="center" justify="center" flexShrink={0}
        >
          <Icon size={16} />
        </Flex>
        <Box>
          <Text fontSize="xs" color="gray.400" fontWeight={500}>{label}</Text>
          <Text fontSize="lg" fontWeight={800} color="gray.800" lineHeight={1.2}>{value}</Text>
        </Box>
      </Flex>
    </Box>
  )
}

/* ── Skeleton booking card ──────────────────────────────────────── */
function BookingOfferCardSkeleton() {
  return (
    <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.05)" overflow="hidden">
      <Box px={6} py={4} borderBottom="1px solid" borderColor="gray.100">
        <SkeletonText noOfLines={1} skeletonHeight={4} w="40%" mb={2} />
        <SkeletonText noOfLines={1} skeletonHeight={3} w="25%" />
      </Box>
      <Box p={6}>
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={4} mb={5}>
          {[1, 2].map(i => <Skeleton key={i} h="60px" borderRadius="xl" />)}
        </Grid>
        <Skeleton h="200px" borderRadius="xl" />
      </Box>
    </Box>
  )
}

function BookingOfferCard({ booking, index }) {
  const offer = booking.offerBooking?.[0]
  const packageData = offer?.bookingPackageOffer
  const details = offer?.bookingDetailsOffer
  const destination = packageData?.destination?.[0]

  const departureDate = packageData?.departureDate
  const returnDate = packageData?.returnDate
  const departureTime = packageData?.departureTime
  const returnTime = packageData?.returnTime

  return (
    <Box
      bg="white" borderRadius="2xl"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.05)"
      overflow="hidden"
      transition="box-shadow 0.2s, border-color 0.2s"
      _hover={{ boxShadow: "0 6px 28px rgba(0,0,0,0.09)", borderColor: "blue.100" }}
    >
      {/* Card header */}
      <Flex
        px={6} py={4}
        bg="gray.50"
        borderBottom="1px solid" borderColor="gray.100"
        align="center" justify="space-between"
        flexWrap="wrap" gap={3}
      >
        <Flex align="center" gap={3}>
          <Flex
            w="36px" h="36px" borderRadius="lg"
            bg="blue.100" color="blue.700"
            align="center" justify="center"
            fontSize="xs" fontWeight={800} flexShrink={0}
          >
            #{index + 1}
          </Flex>
          <Box>
            <Flex align="center" gap={2}>
              <LuUser size={12} color="gray" />
              <Text fontSize="sm" fontWeight={700} color="gray.800">
                {booking.userBooking?.name ?? "Client inconnu"}
              </Text>
            </Flex>
            <Text fontSize="xs" color="gray.400" mt={0.5}>
              Réservation #{booking.id?.slice?.(0, 8) ?? booking.id}
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap={2}>
          {booking.status && <StatusBadge status={booking.status} />}
        </Flex>
      </Flex>

      <Box px={6} py={5}>
        {/* Offer title and type */}
        <Box mb={5}>
          <Flex align="start" gap={3} mb={2}>
            <Box
              bg="indigo.50" borderRadius="lg" p={2}
              color="indigo.600" flexShrink={0}
            >
              <LuPlane size={16} />
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight={800} color="gray.900">
                {details?.title ?? packageData?.title ?? "—"}
              </Text>
              <Flex align="center" gap={2} mt={1}>
                <Badge colorScheme="blue" variant="subtle" borderRadius="full">
                  {details?.type ?? packageData?.type ?? ""}
                </Badge>
                {packageData?.installment && (
                  <Badge colorScheme="cyan" variant="subtle" borderRadius="full">
                    {packageData.installment}
                  </Badge>
                )}
              </Flex>
            </Box>
          </Flex>
        </Box>

        {/* Destination and flight info */}
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={3} mb={5}>

          {/* Destination */}
          <Box bg="indigo.50" borderRadius="xl" p={3}>
            <Flex align="center" gap={1.5} mb={1}>
              <LuMapPin size={11} color="#4C51BF" />
              <Text fontSize="9px" fontWeight={700} color="indigo.600" textTransform="uppercase" letterSpacing="wider">
                Destination
              </Text>
            </Flex>
            <Text fontSize="sm" fontWeight={700} color="gray.800">
              {destination?.name ?? details?.destination ?? "—"}
            </Text>
            {destination?.nights && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                {destination.nights} nuit{destination.nights > 1 ? "s" : ""}
              </Text>
            )}
          </Box>

          {/* Departure */}
          <Box bg="blue.50" borderRadius="xl" p={3}>
            <Flex align="center" gap={1.5} mb={1}>
              <LuCalendarDays size={11} color="#3182CE" />
              <Text fontSize="9px" fontWeight={700} color="blue.500" textTransform="uppercase" letterSpacing="wider">
                Départ
              </Text>
            </Flex>
            <Text fontSize="sm" fontWeight={700} color="gray.800">
              {departureDate ? formatDate(departureDate) : "—"}
            </Text>
            {departureTime && (
              <Flex align="center" gap={1} mt={1}>
                <LuClock size={10} color="gray" />
                <Text fontSize="xs" color="gray.500">{formatTime(departureTime)}</Text>
              </Flex>
            )}
          </Box>

          {/* Return */}
          <Box bg="blue.50" borderRadius="xl" p={3}>
            <Flex align="center" gap={1.5} mb={1}>
              <LuCalendarDays size={11} color="#3182CE" />
              <Text fontSize="9px" fontWeight={700} color="blue.500" textTransform="uppercase" letterSpacing="wider">
                Retour
              </Text>
            </Flex>
            <Text fontSize="sm" fontWeight={700} color="gray.800">
              {returnDate ? formatDate(returnDate) : "—"}
            </Text>
            {returnTime && (
              <Flex align="center" gap={1} mt={1}>
                <LuClock size={10} color="gray" />
                <Text fontSize="xs" color="gray.500">{formatTime(returnTime)}</Text>
              </Flex>
            )}
          </Box>

          {/* Duration */}
          <Box bg="gray.50" borderRadius="xl" p={3}>
            <Flex align="center" gap={1.5} mb={1}>
              <LuClock size={11} color="gray" />
              <Text fontSize="9px" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wider">
                Durée
              </Text>
            </Flex>
            <Text fontSize="sm" fontWeight={700} color="gray.800">
              {details?.duration ?? destination?.nights ?? packageData?.duration ?? "—"}
              {(details?.duration || destination?.nights || packageData?.duration) && " jour(s)"}
            </Text>
          </Box>

        </Grid>

        {/* Flight airports */}
        {(packageData?.departureAirport || packageData?.returnAirport) && (
          <Box
            border="1px solid" borderColor="gray.100"
            borderRadius="xl" p={4} mb={4}
            bg="gray.50"
          >
            <Text fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={3}>
              Aéroports
            </Text>
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
              {packageData?.departureAirport && (
                <Flex direction="column" gap={1}>
                  <Text fontSize="xs" color="gray.400" fontWeight={600}>Départ</Text>
                  <Text fontSize="sm" fontWeight={700} color="gray.800">{packageData.departureAirport}</Text>
                </Flex>
              )}
              {packageData?.returnAirport && (
                <Flex direction="column" gap={1}>
                  <Text fontSize="xs" color="gray.400" fontWeight={600}>Retour</Text>
                  <Text fontSize="sm" fontWeight={700} color="gray.800">{packageData.returnAirport}</Text>
                </Flex>
              )}
            </Grid>
          </Box>
        )}


        {/* Availability and pricing */}
        <Flex
          justify="space-between" align="center"
          pt={4} borderTop="1px solid" borderColor="gray.100"
          gap={4} flexWrap="wrap"
        >
          {packageData?.number_place && (
            <Flex direction="column" gap={0.5}>
              <Text fontSize="xs" color="gray.400" fontWeight={500}>Places disponibles</Text>
              <Text fontSize="sm" fontWeight={700} color="gray.800">
                {packageData.number_place} place{packageData.number_place > 1 ? "s" : ""}
              </Text>
            </Flex>
          )}

          <Flex align="baseline" gap={1} ml="auto">
            <Text fontSize="2xl" fontWeight={900} color="blue.600" lineHeight={1}>
              {booking.total_price}
            </Text>
            <Text fontSize="sm" color="gray.500" fontWeight={500}>TND</Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}

export default function BookingOffer() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await AxiosToken.get("/booking/get/partner/agency")
        setBookings(response.data.booking ?? [])
      } catch {
        setError("Impossible de charger les offres de réservation.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Aggregate stats
  const totalRevenue = bookings.reduce((s, b) => s + (Number(b.total_price) || 0), 0)
  const totalPackages = bookings.reduce((s, b) => s + (b.offerBooking?.length ?? 0), 0)

  return (
    <Container py={8}>

      {/* Page title */}
      <Box mb={7}>
        <Text fontSize="xs" fontWeight={700} color="blue.500" textTransform="uppercase"
          letterSpacing="widest" mb={1}>
          Tableau de bord
        </Text>
        <Heading size="xl" color="gray.900" fontWeight={900}>
          Offres de voyage
        </Heading>
      </Box>

      {/* Stats */}
      {!loading && bookings.length > 0 && (
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }} gap={3} mb={7}>
          <StatCard icon={LuHash} label="Total réservations" value={bookings.length} color="blue" />
          <StatCard icon={LuTrendingUp} label="Revenus totaux" value={`${totalRevenue} TND`} color="green" />
          <StatCard icon={LuPlane} label="Total offres" value={totalPackages} color="indigo" />
        </Grid>
      )}

      {/* Loading */}
      {loading && (
        <VStack spacing={4} align="stretch">
          {[1, 2, 3].map(i => <BookingOfferCardSkeleton key={i} />)}
        </VStack>
      )}

      {/* Error */}
      {!loading && error && (
        <Flex direction="column" align="center" justify="center" py={20} gap={3}>
          <Text color="gray.500">{error}</Text>
        </Flex>
      )}

      {/* Empty */}
      {!loading && !error && bookings.length === 0 && (
        <Flex
          direction="column" align="center" justify="center"
          py={20} gap={3}
          bg="white" borderRadius="2xl"
          border="1px dashed" borderColor="gray.200"
        >
          <Text fontWeight={700} color="gray.700" fontSize="lg">Aucune offre réservée</Text>
          <Text fontSize="sm" color="gray.400">
            Les réservations d'offres de voyage de vos clients apparaîtront ici.
          </Text>
        </Flex>
      )}

      {/* Booking offer cards */}
      {!loading && !error && bookings.length > 0 && (
        <VStack spacing={5} align="stretch">
          {bookings.map((booking, i) => (
            <BookingOfferCard key={booking.id} booking={booking} index={i} />
          ))}
        </VStack>
      )}

    </Container>
  )
}