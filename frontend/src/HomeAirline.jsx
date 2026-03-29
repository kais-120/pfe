import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box, Button, Flex, Grid, Text, VStack,
  Badge, Skeleton, SkeletonText, HStack,
  DatePicker,
  parseDate,
  Portal,
} from "@chakra-ui/react"
import {
  FaPlane, FaSearch, FaWifi, FaUtensils,
  FaSuitcase, FaStar, FaChevronRight,
} from "react-icons/fa"
import {
  LuPlane, LuCalendar, LuUsers, LuClock,
  LuMapPin, LuCheck, LuBadgeCheck, LuArrowLeftRight,
} from "react-icons/lu"
import Header from "./components/home/Header"
import { Axios } from "./Api/Api"

/* ── Helpers ────────────────────────────────────────────────────── */
const STATUS_META = {
  "programmé": { color: "blue", label: "Programmé" },
  "en vol": { color: "green", label: "En vol" },
  "atterri": { color: "gray", label: "Atterri" },
  "retardé": { color: "orange", label: "Retardé" },
  "annulé": { color: "red", label: "Annulé" },
}

const SERVICE_META = {
  wifi: { Icon: FaWifi, label: "Wi-Fi" },
  meals: { Icon: FaUtensils, label: "Repas inclus" },
  baggage: { Icon: FaSuitcase, label: "Bagage inclus" },
  lounge: { Icon: FaStar, label: "Salon VIP" },
}

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
  : "—"

const fmtTime = (d) => d
  ? new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  : "—"

const calcDuration = (dep, arr) => {
  if (!dep || !arr) return null
  const m = Math.round((new Date(arr) - new Date(dep)) / 60000)
  const h = Math.floor(m / 60), mn = m % 60
  return `${h}h${mn > 0 ? mn + "min" : ""}`
}

const occup = (total, avail) => {
  if (!total) return 0
  return Math.round(((total - (avail ?? 0)) / total) * 100)
}

/* ── Flight card ────────────────────────────────────────────────── */
/* ── Flight card ────────────────────────────────────────────────── */
function FlightCard({ flight, airline }) {
  const navigate = useNavigate()
  const s = STATUS_META[flight.status] ?? { color: "gray", label: flight.status }
  const pct = occup(flight.seats_total, flight.seats_available)
  const dur = calcDuration(flight.departure, flight.arrival)

  // Get the cheapest class price
  const cheapestClass = flight.flightClasses?.length
    ? flight.flightClasses.reduce((min, c) => c.price < min.price ? c : min, flight.flightClasses[0])
    : null

  return (
    <Box bg="white" borderRadius="2xl"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.06)"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "translateY(-3px)", boxShadow: "0 8px 28px rgba(0,0,0,0.1)" }}
      overflow="hidden">

      {/* Airline header strip */}
      <Flex px={4} py={3}
        bg="blue.600"
        align="center" justify="space-between">
        <Flex align="center" gap={2.5}>
          <Flex w="32px" h="32px" borderRadius="lg"
            bg="whiteAlpha.300" align="center" justify="center">
            <FaPlane size={13} color="white" />
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight={700} color="white" lineHeight={1}>
              {airline.name}
            </Text>
            <Text fontSize="10px" color="blue.100">{airline.hub}</Text>
          </Box>
        </Flex>
        <Flex align="center" gap={2}>
          <Text fontSize="xs" fontWeight={800} color="white"
            fontFamily="mono" letterSpacing="wider">
            {flight.flight_number}
          </Text>
          <Badge colorScheme={s.color} borderRadius="full"
            px={2} py={0.5} fontSize="xs" fontWeight={600}>
            {s.label}
          </Badge>
        </Flex>
      </Flex>

      <Box p={5}>
        {/* Route visual */}
        <Flex align="center" gap={3} mb={5}>
          {/* Departure */}
          <Box textAlign="center" minW="70px">
            <Text fontSize="2xl" fontWeight={900} color="gray.900" lineHeight={1}>
              {flight.departure_airport?.slice(0, 3).toUpperCase()}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={0.5} noOfLines={1}>
              {flight.departure_airport}
            </Text>
            <Text fontSize="sm" fontWeight={700} color="blue.600" mt={1}>
              {fmtTime(flight.departure)}
            </Text>
            <Text fontSize="9px" color="gray.400">{fmtDate(flight.departure)}</Text>
          </Box>

          {/* Middle arrow */}
          <Box flex={1} position="relative">
            <Box h="1.5px" bg="gray.200" w="100%" />
            <Flex
              position="absolute" top="50%" left="50%"
              transform="translate(-50%, -50%)"
              bg="white" px={2}>
              <Box color="blue.400"><LuPlane size={16} /></Box>
            </Flex>
            {dur && (
              <Text fontSize="9px" color="gray.400" textAlign="center" mt={1}>
                {dur}
              </Text>
            )}
          </Box>

          {/* Arrival */}
          <Box textAlign="center" minW="70px">
            <Text fontSize="2xl" fontWeight={900} color="gray.900" lineHeight={1}>
              {flight.arrival_airport?.slice(0, 3).toUpperCase()}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={0.5} noOfLines={1}>
              {flight.arrival_airport}
            </Text>
            <Text fontSize="sm" fontWeight={700} color="blue.600" mt={1}>
              {fmtTime(flight.arrival)}
            </Text>
            <Text fontSize="9px" color="gray.400">{fmtDate(flight.arrival)}</Text>
          </Box>
        </Flex>

        {/* Info row */}
        <Grid templateColumns="1fr 1fr 1fr" gap={2} mb={4}>
          <Box bg="gray.50" borderRadius="lg" p={2} textAlign="center">
            <Text fontSize="xs" color="gray.400" mb={0.5}>Sièges</Text>
            <Text fontSize="sm" fontWeight={800}
              color={flight.seats_available < 10 ? "red.500" : "gray.700"}>
              {flight.seats_available}
              <Text as="span" fontWeight={400} color="gray.400">/{flight.seats_total}</Text>
            </Text>
          </Box>
          <Box bg="gray.50" borderRadius="lg" p={2} textAlign="center">
            <Text fontSize="xs" color="gray.400" mb={0.5}>Bagage</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">
              {flight.baggage_kg} kg
            </Text>
          </Box>
          <Box bg="gray.50" borderRadius="lg" p={2} textAlign="center">
            <Text fontSize="xs" color="gray.400" mb={0.5}>Classes</Text>
            <Text fontSize="xs" fontWeight={700} color="gray.700" noOfLines={1}>
              {airline.classes?.length ?? 0}
            </Text>
          </Box>
        </Grid>

        {/* Occupancy bar */}
        <Box mb={4}>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="xs" color="gray.400">Occupation</Text>
            <Text fontSize="xs" fontWeight={700}
              color={pct > 80 ? "red.500" : pct > 50 ? "orange.500" : "green.500"}>
              {pct}%
            </Text>
          </Flex>
          <Box bg="gray.100" borderRadius="full" h="5px" overflow="hidden">
            <Box
              bg={pct > 80 ? "red.400" : pct > 50 ? "orange.400" : "green.400"}
              h="100%" borderRadius="full" w={`${pct}%`}
              transition="width 0.4s" />
          </Box>
        </Box>

        {/* Services */}
        {airline.services?.length > 0 && (
          <Flex gap={1.5} flexWrap="wrap" mb={4}>
            {airline.services.map(s => {
              const m = SERVICE_META[s]
              if (!m) return null
              const Icon = m.Icon
              return (
                <Flex key={s} align="center" gap={1} px={2} py={0.5}
                  bg="blue.50" color="blue.600" borderRadius="full"
                  fontSize="xs" fontWeight={500}>
                  <Icon size={9} />{m.label}
                </Flex>
              )
            })}
          </Flex>
        )}

        {/* ── Price + CTA ── */}
        <Flex align="center" justify="space-between" gap={3}>
          {/* Cheapest class price */}
          {cheapestClass && (
            <Box>
              <Text fontSize="9px" color="gray.400" textTransform="uppercase" letterSpacing="wide">
                À partir de
              </Text>
              <Flex align="baseline" gap={1}>
                <Text fontSize="xl" fontWeight={900} color="blue.600" lineHeight={1}>
                  {cheapestClass.price}
                </Text>
                <Text fontSize="xs" fontWeight={600} color="blue.400">TND</Text>
              </Flex>
              <Text fontSize="9px" color="gray.400">{cheapestClass.class_name}</Text>
            </Box>
          )}

          {/* CTA */}
          <Button
            flex={1}
            colorScheme="blue" borderRadius="xl"
            fontWeight={700} size="sm" h="40px"
            isDisabled={flight.status === "annulé" || flight.seats_available === 0}
            onClick={() => navigate(`/flight/${flight.id}`)}>
            <Flex align="center" gap={2}>
              Voir les détails
              <FaChevronRight size={10} />
            </Flex>
          </Button>
        </Flex>

      </Box>
    </Box>
  )
}

/* ── Card skeleton ──────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100">
      <Skeleton h="60px" />
      <Box p={5}>
        <SkeletonText noOfLines={3} spacing={3} mb={4} />
        <Grid templateColumns="1fr 1fr 1fr" gap={2} mb={4}>
          {[1, 2, 3].map(i => <Skeleton key={i} h="52px" borderRadius="lg" />)}
        </Grid>
        <Skeleton h="36px" borderRadius="xl" />
      </Box>
    </Box>
  )
}

function DateField({ label, value, onChange, min }) {
  return (
    <Box>
      <DatePicker.Root locale="fr-FR"
        cursor={"pointer"}
        min={parseDate(min)}
        value={value ? [parseDate(value)] : []}
        onValueChange={(details) => {
          const date = details.value?.[0]
          if (date) {
            const jsDate = new Date(date.year, date.month - 1, date.day + 1)
            onChange(jsDate.toISOString().split("T")[0])
          }
        }}
      >
        <DatePicker.Control
          h="42px"
          border="none"
          bg="white"

        >
          <DatePicker.Input
          p={0}
            outline="none"
            border="none"
            bg="transparent"
            fontSize="14px"
            fontWeight="600"
            color="gray.800"
          />

          <DatePicker.IndicatorGroup>
            <DatePicker.Trigger>
              <LuCalendar size={14} />
            </DatePicker.Trigger>
          </DatePicker.IndicatorGroup>
        </DatePicker.Control>

        <Portal>
          <DatePicker.Positioner>
            <DatePicker.Content>
              <DatePicker.View view="day">
                <DatePicker.Header />
                <DatePicker.DayTable />
              </DatePicker.View>

              <DatePicker.View view="month">
                <DatePicker.Header />
                <DatePicker.MonthTable />
              </DatePicker.View>

              <DatePicker.View view="year">
                <DatePicker.Header />
                <DatePicker.YearTable />
              </DatePicker.View>
            </DatePicker.Content>
          </DatePicker.Positioner>
        </Portal>
      </DatePicker.Root>
    </Box>
  )
}

/* ── Main page ──────────────────────────────────────────────────── */
export default function HomeAirline() {
  const [airlines, setAirlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")

  /* Search bar state */
  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]
  const [tripType, setTripType] = useState("aller-retour")
  const [fromCity, setFromCity] = useState("")
  const [toCity, setToCity] = useState("")
  const [departDate, setDepartDate] = useState(today)
  const [returnDate, setReturnDate] = useState(tomorrow)
  const [travelers, setTravelers] = useState("1 Adulte, Économique")
  const [directOnly, setDirectOnly] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    ; (async () => {
      try {
        setLoading(true)
        const res = await Axios.get("/service/airline/public/get")
        setAirlines(res.data.airline ?? [])
      } catch {
        setError("Impossible de charger les vols.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const allFlights = airlines.flatMap(airline =>
    (airline.FlightCompagnie ?? []).map(flight => ({ flight, airline }))
  )

  /* Filter */
  const filtered = allFlights.filter(({ flight, airline }) => {
    const matchStatus = statusFilter === "all" || flight.status === statusFilter
    const qFrom = fromCity.toLowerCase()
    const qTo = toCity.toLowerCase()
    const matchFrom = !qFrom || flight.departure_airport?.toLowerCase().includes(qFrom)
    const matchTo = !qTo || flight.arrival_airport?.toLowerCase().includes(qTo)
    return matchStatus && matchFrom && matchTo
  })

  const statuses = [...new Set(allFlights.map(({ flight }) => flight.status))]

  return (
    <>
      <Header />

      {/* ── Hero with BA-style search ── */}
      <Box
        bg="linear-gradient(160deg, #0D1B3E 0%, #1A3260 50%, #0D1B3E 100%)"
        pt={12} pb={8} px={4}>

        <Box maxW="1100px" mx="auto">

          {/* Title */}
          <Box textAlign="center" mb={7}>
            <Flex align="center" justify="center" gap={2} mb={3}>
              <Box color="blue.200"><FaPlane size={14} /></Box>
              <Text fontSize="xs" fontWeight={700} color="blue.200"
                textTransform="uppercase" letterSpacing="widest">
                Compagnies aériennes
              </Text>
            </Flex>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight={900}
              color="white" letterSpacing="-0.5px">
              Recherchez votre vol
            </Text>
            <Text fontSize="sm" color="blue.200" mt={1}>
              {allFlights.length} vol{allFlights.length !== 1 ? "s" : ""} ·{" "}
              {airlines.length} compagnie{airlines.length !== 1 ? "s" : ""}
            </Text>
          </Box>

          {/* Trip type toggle */}
          <Flex gap={2} mb={4} justify="center">
            {["aller-retour", "aller simple"].map(t => (
              <Box key={t} as="button"
                px={4} py={1.5} borderRadius="full"
                fontSize="sm" fontWeight={600}
                bg={tripType === t ? "white" : "whiteAlpha.100"}
                color={tripType === t ? "blue.700" : "white"}
                border="1.5px solid"
                borderColor={tripType === t ? "white" : "whiteAlpha.300"}
                cursor="pointer" transition="all 0.15s"
                textTransform="capitalize"
                onClick={() => setTripType(t)}>
                {t}
              </Box>
            ))}
          </Flex>

          {/* Search bar */}
          <Box
            bg="white" borderRadius="2xl"
            boxShadow="0 8px 40px rgba(0,0,0,0.25)"
            overflow="hidden">

            <Grid
              templateColumns={{
                base: "1fr",
                md: tripType === "aller-retour"
                  ? "1.4fr auto 1.4fr 1fr 1fr 1fr auto"
                  : "1.4fr auto 1.4fr 1fr 1fr auto"
              }}
              align="stretch">

              {/* From */}
              <Box
                px={4} py={3} position="relative"
                borderRight="1px solid" borderColor="gray.150">
                <Text fontSize="xs" fontWeight={700} color="gray.500" mb={0.5}>
                  De
                </Text>
                <Box as="input"
                  value={fromCity}
                  onChange={e => setFromCity(e.target.value)}
                  placeholder="Ville ou aéroport"
                  style={{
                    width: "100%", border: "none", outline: "none",
                    fontSize: "15px", fontWeight: "600",
                    color: "var(--chakra-colors-gray-800)",
                    background: "transparent",
                  }} />
              </Box>

              {/* Swap button */}
              <Flex
                align="center" justify="center"
                px={2}
                borderRight="1px solid" borderColor="gray.150">
                <Flex
                  as="button"
                  w="32px" h="32px" borderRadius="full"
                  border="1.5px solid" borderColor="gray.300"
                  bg="white" align="center" justify="center"
                  cursor="pointer" transition="all 0.15s"
                  _hover={{ bg: "blue.50", borderColor: "blue.300" }}
                  onClick={() => {
                    const tmp = fromCity
                    setFromCity(toCity)
                    setToCity(tmp)
                  }}>
                  <LuArrowLeftRight size={14} color="var(--chakra-colors-gray-500)" />
                </Flex>
              </Flex>

              {/* To */}
              <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150">
                <Text fontSize="xs" fontWeight={700} color="gray.500" mb={0.5}>
                  À
                </Text>
                <Box as="input"
                  value={toCity}
                  onChange={e => setToCity(e.target.value)}
                  placeholder="Ville ou aéroport"
                  style={{
                    width: "100%", border: "none", outline: "none",
                    fontSize: "15px", fontWeight: "600",
                    color: "var(--chakra-colors-gray-800)",
                    background: "transparent",
                  }} />
              </Box>

              {/* Depart date */}
              <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150">
                <Text fontSize="xs" fontWeight={700} color="gray.500" mb={0.5}>
                  Départ
                </Text>
                <DateField min={today} value={departDate} onChange={setDepartDate} />
              </Box>

              {/* Return date — only for aller-retour */}
              {tripType === "aller-retour" && (
                <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150">
                  <Text fontSize="xs" fontWeight={700} color="gray.500" mb={0.5}>
                    Retour
                  </Text>
                  <DateField min={departDate} value={returnDate} onChange={setReturnDate} />
                </Box>

              )}

              {/* Travelers & class */}
              <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150"
                cursor="pointer">
                <Text fontSize="xs" fontWeight={700} color="gray.500" mb={0.5}>
                  Voyageurs & classe
                </Text>
                <Text fontSize="14px" fontWeight={600} color="gray.800">
                  {travelers}
                </Text>
              </Box>

              {/* Search button */}
              <Flex
                as="button"
                align="center" justify="center"
                px={6}
                bg="blue.600" color="white"
                fontWeight={700} fontSize="sm"
                cursor="pointer"
                transition="background 0.15s"
                _hover={{ bg: "blue.700" }}
                onClick={() => { }}>
                Rechercher
              </Flex>

            </Grid>

            {/* Options row */}
            <Flex px={5} py={3} gap={6}
              borderTop="1px solid" borderColor="gray.100"
              bg="gray.50">
              <Flex as="label" align="center" gap={2} cursor="pointer">
                <Box
                  as="input" type="checkbox"
                  checked={directOnly}
                  onChange={e => setDirectOnly(e.target.checked)}
                  style={{ accentColor: "var(--chakra-colors-blue-600)" }}
                />
                <Text fontSize="sm" color="gray.600">Vols directs uniquement</Text>
              </Flex>
            </Flex>
          </Box>

          {/* Status filter pills below bar */}
          <Flex gap={2} mt={5} flexWrap="wrap" justify="center">
            {[{ key: "all", label: "Tous les vols", color: "blue" },
            ...statuses.map(s => ({ key: s, ...(STATUS_META[s] ?? { color: "gray", label: s }) }))
            ].map(({ key, label, color }) => (
              <Box key={key} as="button"
                px={3} py={1} borderRadius="full"
                fontSize="xs" fontWeight={600}
                bg={statusFilter === key ? "white" : "whiteAlpha.100"}
                color={statusFilter === key ? "blue.700" : "white"}
                border="1.5px solid"
                borderColor={statusFilter === key ? "white" : "whiteAlpha.300"}
                cursor="pointer" transition="all 0.15s"
                onClick={() => setStatusFilter(key)}>
                {label}
              </Box>
            ))}
          </Flex>

        </Box>
      </Box>

      {/* ── Grid ── */}
      <Box bg="#f5f6fa" minH="60vh">
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={8}>

          {!loading && (
            <Text fontSize="sm" color="gray.500" mb={6}>
              {filtered.length} vol{filtered.length !== 1 ? "s" : ""}
              {(fromCity || toCity) ? ` · ${fromCity || "??"} → ${toCity || "??"}` : ""}
              {statusFilter !== "all" ? ` · ${STATUS_META[statusFilter]?.label}` : ""}
            </Text>
          )}

          {error && (
            <Flex direction="column" align="center" py={20} gap={3}>
              <Text color="gray.500">{error}</Text>
              <Button size="sm" colorScheme="blue"
                onClick={() => window.location.reload()}>Réessayer</Button>
            </Flex>
          )}

          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }}
            gap={5}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              : filtered.map(({ flight, airline }) => (
                <FlightCard key={flight.id} flight={flight} airline={airline} />
              ))
            }
          </Grid>

          {!loading && !error && filtered.length === 0 && (
            <Flex direction="column" align="center" py={20} gap={3}>
              <Text fontWeight={600} color="gray.700">Aucun vol trouvé</Text>
              <Text fontSize="sm" color="gray.400">
                {(fromCity || toCity || statusFilter !== "all")
                  ? "Essayez d'autres filtres."
                  : "Aucun vol disponible pour le moment."}
              </Text>
              {(search || statusFilter !== "all") && (
                <Button size="sm" colorScheme="blue" variant="outline"
                  borderRadius="xl"
                  onClick={() => { setFromCity(""); setToCity(""); setStatusFilter("all") }}>
                  Réinitialiser
                </Button>
              )}
            </Flex>
          )}

        </Box>
      </Box>
    </>
  )
}