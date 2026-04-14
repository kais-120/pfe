import { useEffect, useState } from "react"
import {
  Box, Container, Heading, Text, Button, Badge,
  Stack, Flex, VStack, Grid, HStack,
  Skeleton, SkeletonText,
} from "@chakra-ui/react"
import {
  LuPlane, LuPlus, LuPencil, LuTrash2,
  LuMapPin, LuUsers, LuTag, LuClock,
  LuTrendingUp, LuTicket, LuStar, LuWifi,
  LuBaggageClaim, LuUtensils, LuCalendar,
  LuCheck, LuX, LuChevronRight,
  LuPen,
} from "react-icons/lu"
import { FaStar, FaWifi, FaUtensils, FaSuitcase } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { AxiosToken } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"

/* ── Helpers ────────────────────────────────────────────────────── */
const AMENITY_META = {
  wifi: { Icon: FaWifi, label: "Wi-Fi à bord" },
  meals: { Icon: FaUtensils, label: "Repas inclus" },
  baggage: { Icon: FaSuitcase, label: "Bagage en soute" },
  lounge: { Icon: FaStar, label: "Salon VIP" },
}

const FLIGHT_STATUS_STYLE = {
  "programmé": { color: "blue" },
  "en vol": { color: "green" },
  "atterri": { color: "gray" },
  "retardé": { color: "orange" },
  "annulé": { color: "red" },
}

const formatDateTime = (dt) => dt
  ? new Date(dt).toLocaleString("fr-FR", {
    day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  })
  : "—"

/* ── Stat card ──────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color = "blue" }) {
  return (
    <Box bg="white" borderRadius="xl" p={4}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)">
      <Flex align="center" gap={3}>
        <Flex w="40px" h="40px" borderRadius="lg"
          bg={`${color}.50`} color={`${color}.500`}
          align="center" justify="center" flexShrink={0}>
          <Icon size={16} />
        </Flex>
        <Box>
          <Text fontSize="lg" fontWeight={900} color="gray.800" lineHeight={1}>{value}</Text>
          <Text fontSize="xs" color="gray.400" mt={0.5}>{label}</Text>
        </Box>
      </Flex>
    </Box>
  )
}

/* ── Section heading ────────────────────────────────────────────── */
function SectionTitle({ children, action }) {
  return (
    <Flex align="center" justify="space-between" mb={4}
      pb={2} borderBottom="2px solid" borderColor="blue.100">
      <Text fontSize="xl" fontWeight={800} color="gray.800">{children}</Text>
      {action}
    </Flex>
  )
}

/* ── Flight card ────────────────────────────────────────────────── */
function FlightCard({ flight, onDelete,navigate }) {
  const s = FLIGHT_STATUS_STYLE[flight.status] ?? { color: "gray" }
  const occup = flight.seats_total
    ? Math.round(((flight.seats_total - (flight.seats_available ?? 0)) / flight.seats_total) * 100)
    : 0

  return (
    <Box bg="white" borderRadius="xl" p={5}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)"
      transition="box-shadow 0.2s, border-color 0.2s"
      _hover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.09)", borderColor: "blue.100" }}>

      <Flex justify="space-between" align="flex-start" mb={4}>
        <Flex align="center" gap={3}>
          <Flex w="38px" h="38px" borderRadius="xl" bg="blue.50"
            color="blue.500" align="center" justify="center" flexShrink={0}>
            <LuPlane size={16} />
          </Flex>
          <Box>
            <Flex align="center" gap={2}>
              <Text fontWeight={800} fontSize="md" color="gray.900" fontFamily="mono">
                {flight.flight_number}
              </Text>
              <Badge colorScheme={s.color} borderRadius="full"
                px={2} py={0.5} fontSize="xs" fontWeight={600}>
                {flight.status}
              </Badge>
            </Flex>
            {flight.class && (
              <Badge colorScheme="purple" borderRadius="md" px={2} py={0.5} fontSize="xs" mt={0.5}>
                {flight.class}
              </Badge>
            )}
          </Box>
        </Flex>
        <Button size="xs" variant="ghost" color="blue.400"
          borderRadius="lg" _hover={{ bg: "blue.50" }}
          onClick={() => navigate("airline/flight/edit/" + flight.id)}>
          <LuPen size={13} />
        </Button>
        <Button size="xs" variant="ghost" color="red.400"
          borderRadius="lg" _hover={{ bg: "red.50" }}
          onClick={() => onDelete?.(flight.id)}>
          <LuTrash2 size={13} />
        </Button>
      </Flex>

      {/* Route visual */}
      <Flex align="center" gap={3} mb={4}>
        <Box>
          <Text fontSize="xl" fontWeight={900} color="gray.900" lineHeight={1}>
            {flight.from?.split("(")[1]?.replace(")", "") ?? flight.from?.slice(0, 3).toUpperCase()}
          </Text>
          <Text fontSize="xs" color="gray.400">{formatDateTime(flight.departure)}</Text>
        </Box>
        <Flex flex={1} align="center" gap={1} position="relative" mx={2}>
          <Box flex={1} h="1.5px" bg="gray.200" />
          <Box position="absolute" left="50%" transform="translateX(-50%)"
            bg="white" px={2}>
            <LuPlane size={14} color="var(--chakra-colors-blue-400)" />
          </Box>
          {flight.duration && (
            <Box position="absolute" bottom="-16px" left="50%"
              transform="translateX(-50%)" whiteSpace="nowrap">
              <Text fontSize="9px" color="gray.400">{flight.duration}</Text>
            </Box>
          )}
        </Flex>
        <Box textAlign="right">
          <Text fontSize="xl" fontWeight={900} color="gray.900" lineHeight={1}>
            {flight.to?.split("(")[1]?.replace(")", "") ?? flight.to?.slice(0, 3).toUpperCase()}
          </Text>
          <Text fontSize="xs" color="gray.400">{formatDateTime(flight.arrival)}</Text>
        </Box>
      </Flex>

      <Grid templateColumns="1fr 1fr" gap={2} mt={5}>
        <Box bg="gray.50" borderRadius="lg" p={2.5} textAlign="center">
          <Text fontSize="xs" color="gray.400" mb={0.5}>Sièges</Text>
          <Text fontSize="sm" fontWeight={700}
            color={(flight.seats_available ?? 0) < 10 ? "red.500" : "gray.700"}>
            {flight.seats_available ?? "—"} / {flight.seats_total ?? "—"}
          </Text>
        </Box>
        <Box bg="gray.50" borderRadius="lg" p={2.5} textAlign="center">
          <Text fontSize="xs" color="gray.400" mb={0.5}>Bagage</Text>
          <Text fontSize="sm" fontWeight={700} color="gray.700">
            {flight.baggage_kg ?? "—"} kg
          </Text>
        </Box>
      </Grid>

      {/* Occupancy bar */}
      {flight.seats_total > 0 && (
        <Box mt={3}>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="xs" color="gray.400">Occupation</Text>
            <Text fontSize="xs" fontWeight={700}
              color={occup > 80 ? "red.500" : occup > 50 ? "orange.500" : "green.500"}>
              {occup}%
            </Text>
          </Flex>
          <Box bg="gray.100" borderRadius="full" h="4px" overflow="hidden">
            <Box
              bg={occup > 80 ? "red.400" : occup > 50 ? "orange.400" : "green.400"}
              h="100%" borderRadius="full" w={`${occup}%`} transition="width 0.4s" />
          </Box>
        </Box>
      )}
    </Box>
  )
}

/* ── Offer card ─────────────────────────────────────────────────── */
function OfferCard({ offer, onDelete }) {
  const isExpired = offer.valid_until && new Date(offer.valid_until) < new Date()
  return (
    <Box bg="white" borderRadius="xl" p={5}
      border="1px solid" borderColor={isExpired ? "gray.200" : "orange.100"}
      boxShadow="0 1px 8px rgba(0,0,0,0.05)"
      opacity={isExpired ? 0.6 : 1}
      position="relative" overflow="hidden">
      {/* Top accent */}
      {!isExpired && (
        <Box position="absolute" top={0} left={0} right={0} h="3px"
          bg="linear-gradient(90deg, #ED8936, #F6AD55)" />
      )}

      <Flex justify="space-between" align="flex-start" mb={3}>
        <Box flex={1} mr={3}>
          <Text fontWeight={800} color="gray.900" mb={0.5}>{offer.title}</Text>
          {offer.description && (
            <Text fontSize="xs" color="gray.500" noOfLines={2}>{offer.description}</Text>
          )}
        </Box>
        <Flex align="center" gap={2}>
          <Badge colorScheme={isExpired ? "gray" : "orange"}
            fontSize="md" fontWeight={900} borderRadius="lg" px={3} py={1}>
            -{offer.discount}{offer.type === "pourcentage" ? "%" : " TND"}
          </Badge>
          <Button size="xs" variant="ghost" color="red.400"
            borderRadius="lg" _hover={{ bg: "red.50" }}
            onClick={() => onDelete?.(offer.id)}>
            <LuTrash2 size={12} />
          </Button>
        </Flex>
      </Flex>

      <Flex gap={3} flexWrap="wrap" mt={2}>
        {offer.code && (
          <Flex align="center" gap={1.5} bg="gray.50" borderRadius="lg"
            px={3} py={1.5} border="1px dashed" borderColor="gray.300">
            <LuTicket size={12} color="gray" />
            <Text fontSize="xs" fontWeight={700} color="gray.700" fontFamily="mono">
              {offer.code}
            </Text>
          </Flex>
        )}
        {offer.flight_class && offer.flight_class !== "Toutes classes" && (
          <Badge colorScheme="purple" borderRadius="full" px={2} fontSize="xs">
            {offer.flight_class}
          </Badge>
        )}
        {offer.valid_until && (
          <Flex align="center" gap={1.5}>
            <LuCalendar size={11} color="gray" />
            <Text fontSize="xs" color={isExpired ? "red.400" : "gray.500"}>
              {isExpired ? "Expiré" : "Jusqu'au"}{" "}
              {new Date(offer.valid_until).toLocaleDateString("fr-FR")}
            </Text>
          </Flex>
        )}
        {offer.loyalty_points && (
          <Flex align="center" gap={1.5}>
            <FaStar size={11} color="var(--chakra-colors-yellow-500)" />
            <Text fontSize="xs" color="yellow.600" fontWeight={600}>
              {offer.points_required} pts
            </Text>
          </Flex>
        )}
      </Flex>
    </Box>
  )
}

/* ── Page skeleton ──────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <Container maxW="6xl" py={8}>
      <Skeleton h="32px" w="250px" borderRadius="lg" mb={2} />
      <Skeleton h="16px" w="160px" borderRadius="md" mb={8} />
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={3} mb={6}>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="80px" borderRadius="xl" />)}
      </Grid>
      <VStack gap={5} align="stretch">
        <Skeleton h="200px" borderRadius="2xl" />
        <Skeleton h="160px" borderRadius="2xl" />
      </VStack>
    </Container>
  )
}

const ServiceAirline = () => {
  const [airline, setAirline] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMore, setShowMore] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await AxiosToken.get("/service/airline/get")
        setAirline(response.data.airline)
      } catch {
        console.error("Failed to load airline")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  console.log(airline)

  const handleDeleteFlight = async (id) => {
    try {
      await AxiosToken.delete(`/service/flight/${id}`)
      setAirline(prev => ({
        ...prev,
        flights: prev.flights.filter(f => f.id !== id),
      }))
      toaster.create({ description: "Vol supprimé.", type: "info", closable: true })
    } catch {
      toaster.create({ description: "Erreur de suppression.", type: "error", closable: true })
    }
  }

  const handleDeleteOffer = async (id) => {
    try {
      await AxiosToken.delete(`/service/flight/offer/${id}`)
      setAirline(prev => ({
        ...prev,
        offers: prev.offers.filter(o => o.id !== id),
      }))
      toaster.create({ description: "Offre supprimée.", type: "info", closable: true })
    } catch {
      toaster.create({ description: "Erreur de suppression.", type: "error", closable: true })
    }
  }

  if (loading) return <PageSkeleton />

  if (!airline) {
    return (
      <Container maxW="6xl" py={24}>
        <Flex direction="column" align="center" gap={4} textAlign="center">
          <Heading size="lg" color="gray.800">Aucune compagnie aérienne</Heading>
          <Text color="gray.500" maxW="380px" lineHeight="1.7">
            Vous n'avez pas encore ajouté votre compagnie. Commencez par créer votre profil.
          </Text>
          <Button colorScheme="blue" borderRadius="xl" px={8} size="lg"
            onClick={() => navigate("airline/add")}>
            <Flex align="center" gap={2}>
              <LuPlus size={16} />
              Ajouter ma compagnie
            </Flex>
          </Button>
        </Flex>
      </Container>
    )
  }

  /* ── Computed ── */
  const totalFlights = airline.flights?.length ?? 0
  const activeFlights = airline.flights?.filter(f => f.status === "programmé" || f.status === "en vol").length ?? 0
  const totalOffers = airline.offers?.length ?? 0
  const totalPassengers = airline.flights?.reduce((s, f) =>
    s + ((f.seats_total ?? 0) - (f.seats_available ?? 0)), 0) ?? 0

  return (
    <Container maxW="6xl" py={8}>

      {/* ── Header ── */}
      <Flex justify="space-between" align="flex-start" mb={7} gap={4} flexWrap="wrap">
        <Box>
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={1}>
            Mon service
          </Text>
          <Heading size="xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
            {airline.name ?? "Ma Compagnie"}
            {airline.iata_code && (
              <Text as="span" fontSize="lg" color="gray.400" fontWeight={600} ml={2}>
                ({airline.iata_code})
              </Text>
            )}
          </Heading>
          {airline.hub && (
            <Flex align="center" gap={1.5} mt={1}>
              <LuMapPin size={13} color="gray" />
              <Text fontSize="sm" color="gray.500">{airline.hub}</Text>
            </Flex>
          )}
        </Box>
        <Button colorScheme="blue" borderRadius="xl"
          size="sm" px={5} fontWeight={600}
          onClick={() => navigate("airline/edit")}>
          <Flex align="center" gap={2}><LuPencil size={13} />Modifier</Flex>
        </Button>
      </Flex>

      {/* ── Stats ── */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={3} mb={8}>
        <StatCard icon={LuPlane} label="Total vols" value={totalFlights} color="blue" />
        <StatCard icon={LuCheck} label="Vols actifs" value={activeFlights} color="green" />
        <StatCard icon={LuUsers} label="Passagers" value={totalPassengers} color="purple" />
        <StatCard icon={LuTag} label="Offres actives" value={totalOffers} color="orange" />
      </Grid>

      <VStack gap={8} align="stretch">

        {/* ── About ── */}
        <Box bg="white" borderRadius="2xl" p={6}
          border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 8px rgba(0,0,0,0.05)">
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={2}>
            À propos
          </Text>
          {airline.description ? (
            <>
              <Text fontSize="sm" color="gray.600" lineHeight="1.9" whiteSpace="pre-line">
                {showMore || airline.description.length <= 200
                  ? airline.description
                  : airline.description.slice(0, 200) + "…"}
              </Text>
              {airline.description.length > 200 && (
                <Button mt={2} size="sm" variant="ghost" colorScheme="blue" px={0}
                  onClick={() => setShowMore(!showMore)}>
                  {showMore ? "Voir moins ↑" : "Voir plus ↓"}
                </Button>
              )}
            </>
          ) : (
            <Text fontSize="sm" color="gray.400">Aucune description.</Text>
          )}

          {/* Classes + Amenities */}
          {(airline.classes?.length > 0 || airline.services?.length > 0) && (
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mt={5}
              pt={5} borderTop="1px solid" borderColor="gray.100">
              {airline.classes?.length > 0 && (
                <Box>
                  <Text fontSize="xs" fontWeight={700} color="gray.400"
                    textTransform="uppercase" letterSpacing="wider" mb={3}>
                    Classes proposées
                  </Text>
                  <Flex gap={2} flexWrap="wrap">
                    {airline.classes.map(cls => (
                      <Flex key={cls} align="center" gap={1.5}
                        bg="blue.50" color="blue.600" borderRadius="full"
                        px={3} py={1} fontSize="xs" fontWeight={600}>
                        <FaStar size={10} />
                        {cls}
                      </Flex>
                    ))}
                  </Flex>
                </Box>
              )}
              {airline.services?.length > 0 && (
                <Box>
                  <Text fontSize="xs" fontWeight={700} color="gray.400"
                    textTransform="uppercase" letterSpacing="wider" mb={3}>
                    Services à bord
                  </Text>
                  <Flex gap={2} flexWrap="wrap">
                    {airline.services.map(key => {
                      const meta = AMENITY_META[key]
                      if (!meta) return null
                      const Icon = meta.Icon
                      return (
                        <Flex key={key} align="center" gap={1.5}
                          bg="purple.50" color="purple.600" borderRadius="full"
                          px={3} py={1} fontSize="xs" fontWeight={500}>
                          <Icon size={10} />
                          {meta.label}
                        </Flex>
                      )
                    })}
                  </Flex>
                </Box>
              )}
            </Grid>
          )}

          {/* Destinations */}
          {airline.destinations?.length > 0 && (
            <Box mt={5} pt={5} borderTop="1px solid" borderColor="gray.100">
              <Text fontSize="xs" fontWeight={700} color="gray.400"
                textTransform="uppercase" letterSpacing="wider" mb={3}>
                Destinations ({airline.destinations.length})
              </Text>
              <Flex gap={2} flexWrap="wrap">
                {airline.destinations.map(dest => (
                  <Flex key={dest} align="center" gap={1}
                    bg="gray.50" color="gray.600" borderRadius="full"
                    px={3} py={1} fontSize="xs" fontWeight={500}
                    border="1px solid" borderColor="gray.200">
                    <LuMapPin size={10} />
                    {dest}
                  </Flex>
                ))}
              </Flex>
            </Box>
          )}
        </Box>

        {/* ── Flights ── */}
        <Box>
          <SectionTitle
            action={
              <Button colorScheme="blue" size="sm" borderRadius="xl"
                px={4} fontWeight={600}
                onClick={() => navigate("airline/flight/add")}>
                <Flex align="center" gap={2}><LuPlus size={13} />Ajouter un vol</Flex>
              </Button>
            }
          >
            Vols
          </SectionTitle>

          {airline.FlightCompagnie?.length > 0 ? (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
              {airline.FlightCompagnie.map(flight => (
                <FlightCard key={flight.id} flight={flight} navigate={navigate}
                  onDelete={handleDeleteFlight} />
              ))}
            </Grid>
          ) : (
            <Flex direction="column" align="center" py={12} gap={3}
              bg="white" borderRadius="2xl"
              border="1px dashed" borderColor="gray.200">
              <Text fontWeight={600} color="gray.600">Aucun vol ajouté</Text>
              <Text fontSize="sm" color="gray.400">
                Commencez par ajouter vos premiers vols.
              </Text>
              <Button colorScheme="blue" borderRadius="xl" size="sm" mt={1}
                onClick={() => navigate("airline/flight/add")}>
                <Flex align="center" gap={2}><LuPlus size={13} />Ajouter un vol</Flex>
              </Button>
            </Flex>
          )}
        </Box>


      </VStack>
    </Container>
  )
}

export default ServiceAirline