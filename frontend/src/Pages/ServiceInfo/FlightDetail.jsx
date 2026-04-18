import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  Box, Button, Flex, Grid, Text, VStack,
  Badge, Skeleton, SkeletonText,
  Link,
} from "@chakra-ui/react"
import {
  FaPlane, FaArrowLeft, FaWifi, FaUtensils,
  FaSuitcase, FaStar, FaCheck, FaChild, FaUser,
} from "react-icons/fa"
import {
  LuPlane, LuCalendar, LuClock, LuUsers,
  LuBaggageClaim, LuShieldCheck, LuBadgeCheck,
  LuMapPin,
} from "react-icons/lu"
import Header from "../../components/home/Header"
import { Axios, AxiosToken } from "../../Api/Api"
import { Helmet } from "react-helmet"
import Cookies from "universal-cookie"
import {Tooltip} from "../../components/ui/tooltip"

/* ── Helpers ────────────────────────────────────────────────────── */
const STATUS_META = {
  "programmé": { color: "blue", label: "Programmé" },
  "en vol": { color: "green", label: "En vol" },
  "atterri": { color: "gray", label: "Atterri" },
  "retardé": { color: "orange", label: "Retardé" },
  "annulé": { color: "red", label: "Annulé" },
}

const SERVICE_META = {
  wifi: { Icon: FaWifi, label: "Wi-Fi à bord" },
  meals: { Icon: FaUtensils, label: "Repas inclus" },
  baggage: { Icon: FaSuitcase, label: "Bagage en soute" },
  lounge: { Icon: FaStar, label: "Accès salon VIP" },
}

const fmtDate = d => d
  ? new Date(d).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })
  : "—"

const fmtTime = d => d
  ? new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  : "—"

const calcDuration = (dep, arr) => {
  if (!dep || !arr) return null
  const m = Math.round((new Date(arr) - new Date(dep)) / 60000)
  const h = Math.floor(m / 60), mn = m % 60
  return `${h}h${mn > 0 ? mn + "min" : ""}`
}

const occup = (total, avail) =>
  total ? Math.round(((total - (avail ?? 0)) / total) * 100) : 0

/* ── Counter row ────────────────────────────────────────────────── */
function Counter({ label, sub, value, min = 0, max, onInc, onDec }) {
  return (
    <Flex justify="space-between" align="center" py={2.5}
      borderBottom="1px solid" borderColor="gray.50"
      _last={{ borderBottom: "none" }}>
      <Box>
        <Text fontSize="sm" fontWeight={600} color="gray.800">{label}</Text>
        {sub && <Text fontSize="xs" color="gray.400">{sub}</Text>}
      </Box>
      <Flex align="center" gap={3}>
        <Box as="button"
          w="28px" h="28px" borderRadius="full"
          border="1px solid" borderColor={value <= min ? "gray.200" : "blue.300"}
          color={value <= min ? "gray.300" : "blue.500"}
          bg="white" display="flex" alignItems="center" justifyContent="center"
          cursor={value <= min ? "not-allowed" : "pointer"}
          fontSize="lg" lineHeight={1} transition="all 0.15s"
          _hover={value > min ? { bg: "blue.50" } : {}}
          onClick={() => value > min && onDec()}>–</Box>
        <Text fontSize="sm" fontWeight={700} minW="16px" textAlign="center" color="gray.800">
          {value}
        </Text>
        <Box as="button"
          w="28px" h="28px" borderRadius="full"
          border="1px solid"
          borderColor={max && value >= max ? "gray.200" : "blue.300"}
          color={max && value >= max ? "gray.300" : "blue.500"}
          bg="white" display="flex" alignItems="center" justifyContent="center"
          cursor={max && value >= max ? "not-allowed" : "pointer"}
          fontSize="lg" lineHeight={1} transition="all 0.15s"
          _hover={!(max && value >= max) ? { bg: "blue.50" } : {}}
          onClick={() => !(max && value >= max) && onInc()}>+</Box>
      </Flex>
    </Flex>
  )
}

/* ── Spec card ──────────────────────────────────────────────────── */
function SpecCard({ icon: Icon, label, value, color = "blue" }) {
  return (
    <Flex align="center" gap={3} p={3}
      bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100">
      <Flex w="36px" h="36px" borderRadius="lg"
        bg={`${color}.50`} color={`${color}.500`}
        align="center" justify="center" flexShrink={0}>
        <Icon size={15} />
      </Flex>
      <Box>
        <Text fontSize="xs" color="gray.400">{label}</Text>
        <Text fontSize="sm" fontWeight={700} color="gray.800">{value}</Text>
      </Box>
    </Flex>
  )
}

function SectionTitle({ children }) {
  return (
    <Text fontSize="xl" fontWeight={800} color="gray.800"
      mb={4} pb={2} borderBottom="2px solid" borderColor="blue.100">
      {children}
    </Text>
  )
}

function PageSkeleton() {
  return (
    <Box maxW="1100px" mx="auto" px={6} py={10}>
      <Skeleton h="180px" borderRadius="2xl" mb={6} />
      <Grid templateColumns={{ base: "1fr", lg: "1fr 360px" }} gap={10}>
        <VStack align="stretch" spacing={5}>
          <Grid templateColumns="1fr 1fr 1fr" gap={3}>
            {[1, 2, 3].map(i => <Skeleton key={i} h="80px" borderRadius="xl" />)}
          </Grid>
          <SkeletonText noOfLines={4} spacing={3} />
        </VStack>
        <Skeleton h="480px" borderRadius="2xl" />
      </Grid>
    </Box>
  )
}

export default function FlightDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [flight, setFlight] = useState(null)
  const [airline, setAirline] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedClass, setSelectedClass] = useState(location?.state?.type || null)
  const [adults, setAdults] = useState(location?.state?.adults || 1)
  const [children, setChildren] = useState(location?.state?.children || 0)
  const cookie = new Cookies()
  const token = cookie.get("auth")

  /* Fetch */
  useEffect(() => {
    ; (async () => {
      try {
        setLoading(true)
        const res = await Axios.get(`/service/airline/flight/public/get/${id}`)
        const f = res.data.flight
        setFlight(f)
        setAirline(f?.compagnieFlight ?? res.data.airline ?? null)
      } catch {
        setError("Impossible de charger ce vol.")
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  useEffect(() => {
    if (flight?.flightClasses?.length > 0 && !selectedClass) {
      const cheapest = flight.flightClasses.reduce((min, c) =>
        c.price_adult < min.price_adult ? c : min,
        flight.flightClasses[0]
      )
      setSelectedClass(cheapest)
    }
  }, [flight])
  const handleBooking = async (selectedClass) => {
    try{
      if (selectedClass) {
            const res = await AxiosToken.post(`/booking/flight/${id}`,{
              seat_class:selectedClass.class_name,
              total_price:totalPrice,
              children_passenger_count:children,
              adult_passenger_count:adults

            })
            window.location = res.data.url
        }
    }catch(err){
      console.error("error")
    }
  }

  if (loading) return <><Header /><PageSkeleton /></>
  if (error || !flight) return (
    <>
      <Header />
      <Flex direction="column" align="center" justify="center" py={32} gap={3}>
        <Text color="gray.500">{error ?? "Vol introuvable."}</Text>
        <Button size="sm" colorScheme="blue" onClick={() => navigate(-1)}>Retour</Button>
      </Flex>
    </>
  )

  const s = STATUS_META[flight.status] ?? { color: "gray", label: flight.status }
  const dur = flight.duration
    ? `${flight.duration}h`
    : calcDuration(flight.departure, flight.arrival)
  const pct = occup(flight.seats_total, flight.seats_available)
  const isDisabled = flight.status === "annulé" || flight.seats_available === 0

  /* Price calculation using new fields */
  const totalPrice = selectedClass
    ? selectedClass.price_adult * adults + selectedClass.price_children * children
    : 0

  return (
    <>
    <Helmet title={"Vol"}></Helmet>

      <Header />

      <Box maxW="1100px" mx="auto" px={{ base: 4, md: 6 }} py={8}>

        {/* Back */}
        <Button variant="ghost" size="sm" color="gray.500" mb={5} pl={0}
          _hover={{ color: "blue.600", bg: "transparent" }} onClick={() => navigate(-1)}>
          <Flex align="center" gap={2}><FaArrowLeft size={12} />Retour aux vols</Flex>
        </Button>

        {/* ── Route hero ── */}
        <Box bg="blue.600" borderRadius="2xl" p={6} mb={8}
          position="relative" overflow="hidden"
          boxShadow="0 4px 24px rgba(24,95,165,0.35)">
          <Box position="absolute" top="-60px" right="-60px"
            w="240px" h="240px" borderRadius="full" bg="whiteAlpha.100" />
          <Box position="absolute" bottom="-40px" left="40%"
            w="160px" h="160px" borderRadius="full" bg="whiteAlpha.100" />

          <Flex justify="space-between" align="flex-start" mb={6} flexWrap="wrap" gap={3}>
            <Flex align="center" gap={2.5}>
              <Flex w="38px" h="38px" borderRadius="lg"
                bg="whiteAlpha.200" align="center" justify="center">
                <FaPlane size={16} color="white" />
              </Flex>
              <Box>
                <Text color="white" fontWeight={800} fontSize="md" lineHeight={1}>
                  {airline?.name ?? "Compagnie"}
                </Text>
                <Text color="blue.100" fontSize="xs">{airline?.hub}</Text>
              </Box>
            </Flex>
            <Flex align="center" gap={2}>
              <Text color="white" fontFamily="mono" fontWeight={800} fontSize="md">
                {flight.flight_number}
              </Text>
              <Badge colorScheme={s.color} borderRadius="full"
                px={2.5} py={0.5} fontSize="xs" fontWeight={700}>
                {s.label}
              </Badge>
              {flight.type_flight && (
                <Badge colorScheme="purple" borderRadius="full"
                  px={2.5} py={0.5} fontSize="xs" fontWeight={600}>
                  {flight.type_flight}
                </Badge>
              )}
            </Flex>
          </Flex>

          <Flex align="center" gap={4} position="relative" zIndex={1}>
            <Box minW="120px">
              <Text fontSize="3xl" fontWeight={900} color="white" lineHeight={1}>
                {flight.departure_airport?.slice(0, 3).toUpperCase()}
              </Text>
              <Text fontSize="xs" color="blue.100" mt={0.5} noOfLines={1}>
                {flight.departure_airport}
              </Text>
              <Text fontSize="xl" fontWeight={700} color="white" mt={2}>
                {fmtTime(flight.departure)}
              </Text>
              <Text fontSize="xs" color="blue.200" textTransform="capitalize">
                {fmtDate(flight.departure)}
              </Text>
            </Box>

            <Box flex={1} textAlign="center">
              <Box h="1.5px" bg="whiteAlpha.400" position="relative" mx={2}>
                <Flex position="absolute" top="50%" left="50%"
                  transform="translate(-50%,-50%)" bg="blue.600" px={2}>
                  <FaPlane size={18} color="white" />
                </Flex>
              </Box>
              {dur && (
                <Flex align="center" justify="center" gap={1} mt={3}>
                  <LuClock size={11} color="rgba(255,255,255,0.7)" />
                  <Text fontSize="xs" color="blue.100">{dur}</Text>
                </Flex>
              )}
            </Box>

            <Box minW="120px" textAlign="right">
              <Text fontSize="3xl" fontWeight={900} color="white" lineHeight={1}>
                {flight.arrival_airport?.slice(0, 3).toUpperCase()}
              </Text>
              <Text fontSize="xs" color="blue.100" mt={0.5} noOfLines={1}>
                {flight.arrival_airport}
              </Text>
              <Text fontSize="xl" fontWeight={700} color="white" mt={2}>
                {fmtTime(flight.arrival)}
              </Text>
              <Text fontSize="xs" color="blue.200" textTransform="capitalize">
                {fmtDate(flight.arrival)}
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* 2-col layout */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 360px" }} gap={10}>

          {/* ── LEFT ── */}
          <VStack align="stretch" spacing={8}>

            {/* Specs */}
            <Box>
              <SectionTitle>Informations du vol</SectionTitle>
              <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3,1fr)" }} gap={3}>
                <SpecCard icon={LuUsers} label="Sièges disponibles"
                  value={`${flight.seats_available} / ${flight.seats_total}`}
                  color={flight.seats_available < 10 ? "red" : "green"} />
                <SpecCard icon={LuBaggageClaim} label="Bagage inclus"
                  value={`${flight.baggage_kg} kg`} color="blue" />
                {dur && (
                  <SpecCard icon={LuClock} label="Durée du vol" value={dur} color="purple" />
                )}
                <SpecCard icon={LuCalendar} label="Départ"
                  value={fmtDate(flight.departure)} color="orange" />
                <SpecCard icon={LuCalendar} label="Arrivée"
                  value={fmtDate(flight.arrival)} color="orange" />
                <SpecCard icon={LuShieldCheck} label="Statut"
                  value={s.label} color={s.color} />
              </Grid>
            </Box>

            {/* Occupancy bar */}
            <Box>
              <SectionTitle>Disponibilité</SectionTitle>
              <Box bg="white" borderRadius="2xl" p={5}
                border="1px solid" borderColor="gray.100"
                boxShadow="0 1px 8px rgba(0,0,0,0.05)">
                <Flex justify="space-between" mb={3}>
                  <Text fontSize="sm" color="gray.600">
                    <Text as="span" fontWeight={700} color="gray.900">
                      {flight.seats_available}
                    </Text>{" "}sièges restants sur{" "}
                    <Text as="span" fontWeight={700}>{flight.seats_total}</Text>
                  </Text>
                  <Text fontSize="sm" fontWeight={700}
                    color={pct > 80 ? "red.500" : pct > 50 ? "orange.500" : "green.500"}>
                    {pct}% occupé
                  </Text>
                </Flex>
                <Box bg="gray.100" borderRadius="full" h="8px" overflow="hidden">
                  <Box bg={pct > 80 ? "red.400" : pct > 50 ? "orange.400" : "green.400"}
                    h="100%" borderRadius="full" w={`${pct}%`} transition="width 0.6s" />
                </Box>
                {flight.seats_available < 10 && (
                  <Text fontSize="xs" color="red.500" fontWeight={600} mt={2}>
                  Plus que {flight.seats_available} place{flight.seats_available > 1 ? "s" : ""} !
                  </Text>
                )}
              </Box>
            </Box>

            {/* ── Classes — NEW with price_adult / price_children ── */}
            {flight.flightClasses?.length > 0 && (
              <Box>
                <SectionTitle>Choisissez votre classe</SectionTitle>
                <Grid templateColumns="repeat(auto-fill, minmax(220px,1fr))" gap={3}>
                  {flight.flightClasses.map(cls => {
                    const isSelected = selectedClass?.id === cls.id
                    const isFull = cls.seats_available === 0
                    return (
                      <Box key={cls.id} as="button" textAlign="left" w="full"
                        onClick={() => { if (!isFull) { setSelectedClass(cls); setAdults(1); setChildren(0) } }}
                        cursor={isFull ? "not-allowed" : "pointer"}
                        opacity={isFull ? 0.55 : 1}
                        bg={isSelected ? "blue.600" : "white"}
                        borderRadius="2xl" overflow="hidden"
                        border="2px solid"
                        borderColor={isSelected ? "blue.600" : "blue.100"}
                        boxShadow={isSelected
                          ? "0 4px 20px rgba(49,130,206,0.35)"
                          : "0 1px 8px rgba(0,0,0,0.05)"}
                        transition="all 0.18s"
                        _hover={!isFull && !isSelected
                          ? { borderColor: "blue.400", boxShadow: "0 4px 16px rgba(49,130,206,0.18)" }
                          : {}}>

                        {/* Header */}
                        <Box px={4} py={2.5}
                          bg={isSelected ? "blue.700" : "blue.50"}
                          borderBottom="1px solid"
                          borderColor={isSelected ? "blue.500" : "blue.100"}>
                          <Flex align="center" justify="space-between">
                            <Flex align="center" gap={2}>
                              <FaStar size={11}
                                color={isSelected ? "white" : "var(--chakra-colors-blue-400)"} />
                              <Text fontSize="sm" fontWeight={700}
                                color={isSelected ? "white" : "blue.700"}>
                                {cls.class_name}
                              </Text>
                            </Flex>
                            {isSelected && (
                              <Flex w="18px" h="18px" borderRadius="full"
                                bg="white" align="center" justify="center">
                                <FaCheck size={9} color="var(--chakra-colors-blue-600)" />
                              </Flex>
                            )}
                            {isFull && (
                              <Badge colorScheme="red" borderRadius="full"
                                px={2} fontSize="9px">Complet</Badge>
                            )}
                          </Flex>
                        </Box>

                        {/* Prices */}
                        <Box px={4} py={3}>
                          {/* Adult price */}
                          <Flex align="center" justify="space-between" mb={1.5}>
                            <Flex align="center" gap={1.5}>
                              <FaUser size={10}
                                color={isSelected ? "rgba(255,255,255,0.7)" : "var(--chakra-colors-gray-400)"} />
                              <Text fontSize="xs"
                                color={isSelected ? "blue.100" : "gray.500"}>
                                Adulte
                              </Text>
                            </Flex>
                            <Flex align="baseline" gap={0.5}>
                              <Text fontSize="lg" fontWeight={900} lineHeight={1}
                                color={isSelected ? "white" : "blue.600"}>
                                {cls.price_adult}
                              </Text>
                              <Text fontSize="10px" fontWeight={700}
                                color={isSelected ? "blue.200" : "blue.400"}>
                                TND
                              </Text>
                            </Flex>
                          </Flex>
                          {/* Children price */}
                          <Flex align="center" justify="space-between" mb={2.5}>
                            <Flex align="center" gap={1.5}>
                              <FaChild size={10}
                                color={isSelected ? "rgba(255,255,255,0.7)" : "var(--chakra-colors-gray-400)"} />
                              <Text fontSize="xs"
                                color={isSelected ? "blue.100" : "gray.500"}>
                                Enfant
                              </Text>
                            </Flex>
                            <Flex align="baseline" gap={0.5}>
                              <Text fontSize="lg" fontWeight={900} lineHeight={1}
                                color={isSelected ? "white" : "blue.600"}>
                                {cls.price_children}
                              </Text>
                              <Text fontSize="10px" fontWeight={700}
                                color={isSelected ? "blue.200" : "blue.400"}>
                                TND
                              </Text>
                            </Flex>
                          </Flex>
                          {/* Seats available */}
                          <Flex align="center" gap={1.5}
                            pt={2} borderTop="1px solid"
                            borderColor={isSelected ? "whiteAlpha.300" : "blue.50"}>
                            <LuUsers size={12}
                              color={isSelected ? "rgba(255,255,255,0.7)" : "var(--chakra-colors-gray-400)"} />
                            <Text fontSize="xs"
                              color={isSelected ? "blue.100" : "gray.500"}>
                              <Text as="span" fontWeight={700}
                                color={
                                  isFull ? "red.400"
                                    : isSelected ? "white"
                                      : cls.seats_available < 5 ? "red.500"
                                        : "gray.700"}>
                                {cls.seats_available}
                              </Text>{" "}siège{cls.seats_available > 1 ? "s" : ""} disponible{cls.seats_available > 1 ? "s" : ""}
                            </Text>
                          </Flex>
                        </Box>
                      </Box>
                    )
                  })}
                </Grid>
              </Box>
            )}

            {/* Services */}
            {airline?.services?.length > 0 && (
              <Box>
                <SectionTitle>Services à bord</SectionTitle>
                <Grid templateColumns="repeat(auto-fill, minmax(200px,1fr))" gap={3}>
                  {airline.services.map(srv => {
                    const m = SERVICE_META[srv]
                    if (!m) return null
                    const Icon = m.Icon
                    return (
                      <Flex key={srv} align="center" gap={3} p={3}
                        bg="purple.50" borderRadius="xl"
                        border="1px solid" borderColor="purple.100">
                        <Flex w="34px" h="34px" borderRadius="lg"
                          bg="purple.100" color="purple.500"
                          align="center" justify="center" flexShrink={0}>
                          <Icon size={14} />
                        </Flex>
                        <Text fontSize="sm" fontWeight={600} color="purple.700">
                          {m.label}
                        </Text>
                      </Flex>
                    )
                  })}
                </Grid>
              </Box>
            )}

          </VStack>

          {/* ── RIGHT — sticky sidebar ── */}
          <Box>
            <VStack align="stretch" spacing={4}
              position={{ base: "static", lg: "sticky" }} top="88px">

              <Box bg="white" borderRadius="2xl" overflow="hidden"
                border="1px solid" borderColor="gray.100"
                boxShadow="0 4px 24px rgba(0,0,0,0.08)">

                {/* Header */}
                <Box bg="blue.600" px={5} py={4}>
                  <Text color="white" fontWeight={700} fontSize="md">
                    Réserver ce vol
                  </Text>
                  <Text color="blue.100" fontSize="xs" mt={0.5}>
                    {flight.seats_available} siège{flight.seats_available > 1 ? "s" : ""} disponible{flight.seats_available > 1 ? "s" : ""}
                  </Text>
                </Box>

                <VStack align="stretch" spacing={3} p={5}>

                  {/* Flight summary */}
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.500">Vol</Text>
                    <Text fontSize="sm" fontWeight={700} color="gray.800" fontFamily="mono">
                      {flight.flight_number}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.500">Trajet</Text>
                    <Text fontSize="sm" fontWeight={700} color="gray.800">
                      {flight.departure_airport?.slice(0, 3).toUpperCase()} →{" "}
                      {flight.arrival_airport?.slice(0, 3).toUpperCase()}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.500">Départ</Text>
                    <Text fontSize="sm" fontWeight={700} color="gray.800">
                      {fmtTime(flight.departure)} · {new Date(flight.departure).toLocaleDateString("fr-FR")}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.500">Bagage</Text>
                    <Text fontSize="sm" fontWeight={700} color="gray.800">
                      {flight.baggage_kg} kg inclus
                    </Text>
                  </Flex>

                  {/* No class warning */}
                  {!selectedClass && !isDisabled && (
                    <Box bg="orange.50" borderRadius="xl" p={3}
                      border="1px solid" borderColor="orange.200">
                      <Text fontSize="xs" color="orange.600" fontWeight={600} textAlign="center">
                        Sélectionnez une classe pour continuer
                      </Text>
                    </Box>
                  )}

                  {/* Passenger selector */}
                  {selectedClass && (
                    <>
                      <Box borderTop="1px solid" borderColor="gray.100" pt={3}>
                        <Flex justify="space-between" align="center" mb={3}>
                          <Text fontSize="xs" fontWeight={700} color="gray.500"
                            textTransform="uppercase" letterSpacing="wider">
                            Passagers
                          </Text>
                          <Badge colorScheme="blue" borderRadius="full" px={2}>
                            {selectedClass.class_name}
                          </Badge>
                        </Flex>

                        <Counter
                          label="Adultes" sub={`${selectedClass.price_adult} TND / pers.`}
                          value={adults} min={1}
                          max={Math.max(1, selectedClass.seats_available - children)}
                          onInc={() => {
                            const newAdults = adults + 1
                            if (newAdults + children <= selectedClass.seats_available) {
                              setAdults(newAdults)
                            }
                          }}
                          onDec={() => setAdults(a => Math.max(1, a - 1))}
                        />
                        <Counter
                          label="Enfants" sub={`${selectedClass.price_children} TND / pers. · 0–12 ans`}
                          value={children} min={0}
                          max={Math.max(0, selectedClass.seats_available - adults)}
                          onInc={() => {
                            const newChildren = children + 1
                            if (adults + newChildren <= selectedClass.seats_available) {
                              setChildren(newChildren)
                            }
                          }}
                          onDec={() => setChildren(c => Math.max(0, c - 1))}
                        />
                      </Box>

                      {/* Price breakdown */}
                      <Box bg="blue.50" borderRadius="xl" p={4}
                        border="1px solid" borderColor="blue.100">
                        <VStack align="stretch" spacing={1.5}>
                          <Flex justify="space-between">
                            <Text fontSize="sm" color="gray.500">
                              {adults} adulte{adults > 1 ? "s" : ""} × {selectedClass.price_adult} TND
                            </Text>
                            <Text fontSize="sm" fontWeight={600} color="gray.700">
                              {adults * selectedClass.price_adult} TND
                            </Text>
                          </Flex>
                          {children > 0 && (
                            <Flex justify="space-between">
                              <Text fontSize="sm" color="gray.500">
                                {children} enfant{children > 1 ? "s" : ""} × {selectedClass.price_children} TND
                              </Text>
                              <Text fontSize="sm" fontWeight={600} color="gray.700">
                                {children * selectedClass.price_children} TND
                              </Text>
                            </Flex>
                          )}
                          <Box borderTop="1px solid" borderColor="blue.200" pt={1.5}>
                            <Flex justify="space-between" align="center">
                              <Text fontSize="sm" fontWeight={700} color="gray.700">Total</Text>
                              <Flex align="baseline" gap={1}>
                                <Text fontSize="2xl" fontWeight={900} color="blue.600" lineHeight={1}>
                                  {totalPrice}
                                </Text>
                                <Text fontSize="xs" fontWeight={700} color="blue.400">TND</Text>
                              </Flex>
                            </Flex>
                          </Box>
                        </VStack>
                      </Box>
                    </>
                  )}
                  <Tooltip content={"Vous devez vous connecter pour réserver"}>
                  <Button w="full" h="46px" colorScheme="blue"
                    borderRadius="xl" fontWeight={700}
                    disabled={isDisabled || !selectedClass ||!token}
                    onClick={() => {handleBooking(selectedClass)}}>
                    <Flex align="center" gap={2}>
                      <LuPlane size={15} />
                      {flight.status === "annulé" ? "Vol annulé"
                        : flight.seats_available === 0 ? "Complet"
                          : !selectedClass ? "Choisissez une classe"
                            : `Réserver · ${totalPrice} TND`}
                    </Flex>
                  </Button>
                  </Tooltip>

                </VStack>
              </Box>

            </VStack>
          </Box>

        </Grid>
      </Box>
    </>
  )
}