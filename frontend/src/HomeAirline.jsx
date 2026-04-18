import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box, Button, Flex, Grid, Text,
  Badge, Skeleton, SkeletonText,
  DatePicker, parseDate, Portal,
  Combobox,
  useFilter,
  useListCollection,
} from "@chakra-ui/react"
import {
  FaPlane, FaWifi, FaUtensils,
  FaSuitcase, FaStar, FaChevronRight,
  FaMinus, FaPlus,
  FaSearch,
} from "react-icons/fa"
import {
  LuPlane, LuCalendar, LuArrowLeftRight,
} from "react-icons/lu"
import Header from "./components/home/Header"
import { Axios } from "./Api/Api"


const AIRPORTS = [
  { label: "Tunis – Carthage", value: "tunis" },
  { label: "Sfax – Thyna", value: "sfax" },
  { label: "Monastir – Habib", value: "monastir" },
  { label: "Djerba – Zarzis", value: "djerba" },
  { label: "Paris – CDG", value: "paris" },
  { label: "Lyon – Saint-Exupéry", value: "lyon" },
  { label: "Marseille – Provence", value: "marseille" },
  { label: "Londres – Heathrow", value: "londres" },
  { label: "Istanbul", value: "istanbul" },
  { label: "Dubai", value: "dubai" },
]

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

const CLASSES = ["Économique", "Affaires", "Première"]

function AirportCombobox({ placeholder, value, onChange }) {
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({ initialItems: AIRPORTS, filter: contains })
  return (
    <Combobox.Root width="full" collection={collection}
      inputValue={value}
      onInputValueChange={e => { filter(e.inputValue); onChange(e.inputValue) }}
      onValueChange={e => onChange(e.value[0] ?? "")}>
      <Combobox.Control>
        <Combobox.Input placeholder={placeholder}
          style={{
            height: "38px", border: "none", outline: "none",
            fontSize: "14px", fontWeight: "600",
            color: "var(--chakra-colors-gray-800)",
            background: "transparent", width: "100%",
          }} />
        <Combobox.IndicatorGroup style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)" }}>
          <Combobox.ClearTrigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content style={{ zIndex: 9999 }}>
            <Combobox.Empty>Aucun aéroport</Combobox.Empty>
            {collection.items.map(item => (
              <Combobox.Item item={item} key={item.value}>
                {item.label}<Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  )
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

/* ── Counter row ────────────────────────────────────────────────── */
function CounterRow({ label, sub, value, onChange, min = 0 }) {
  return (
    <Flex align="center" justify="space-between" py={3}
      borderBottom="1px solid" borderColor="gray.100">
      <Box>
        <Text fontSize="sm" fontWeight={600} color="gray.800">{label}</Text>
        {sub && <Text fontSize="xs" color="gray.400">{sub}</Text>}
      </Box>
      <Flex align="center" gap={3}>
        <Flex as="button" w="30px" h="30px" borderRadius="full"
          border="1.5px solid" borderColor={value <= min ? "gray.200" : "blue.300"}
          bg={value <= min ? "gray.50" : "blue.50"}
          color={value <= min ? "gray.300" : "blue.600"}
          align="center" justify="center"
          cursor={value <= min ? "not-allowed" : "pointer"}
          onClick={() => value > min && onChange(value - 1)}>
          <FaMinus size={9} />
        </Flex>
        <Text fontSize="sm" fontWeight={700} color="gray.800" minW="16px" textAlign="center">
          {value}
        </Text>
        <Flex as="button" w="30px" h="30px" borderRadius="full"
          border="1.5px solid" borderColor="blue.300"
          bg="blue.50" color="blue.600"
          align="center" justify="center" cursor="pointer"
          onClick={() => onChange(value + 1)}>
          <FaPlus size={9} />
        </Flex>
      </Flex>
    </Flex>
  )
}

/* ── Travelers popover ──────────────────────────────────────────── */
function TravelersPopover({ adults, setAdults, children, setChildren, cabinClass, setCabinClass }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const totalPax = adults + children
  const label = `${totalPax} Voyageur${totalPax > 1 ? "s" : ""}, ${cabinClass}`

  return (
    <Box position="relative" ref={ref}>
      {/* Trigger */}
      <Box
        px={4} py={3}
        borderRight="1px solid" borderColor="gray.150"
        cursor="pointer"
        onClick={() => setOpen(o => !o)}>
        <Text fontSize="xs" fontWeight={700} color="gray.500" mb={0.5}>
          Voyageurs & classe
        </Text>
        <Text fontSize="14px" fontWeight={600} color="gray.800" noOfLines={1}>
          {label}
        </Text>
      </Box>

      {/* Dropdown */}
      {open && (
        <Box
          position="absolute"
          top="calc(100% + 8px)"
          left={0}
          zIndex={9999}
          bg="white"
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 8px 32px rgba(0,0,0,0.14)"
          p={5}
          minW="300px">

          {/* Passenger counters */}
          <Text fontSize="xs" fontWeight={700} color="gray.400"
            textTransform="uppercase" letterSpacing="wider" mb={1}>
            Passagers
          </Text>

          <CounterRow
            label="Adultes" sub="12 ans et plus"
            value={adults} onChange={setAdults} min={1} />
          <CounterRow
            label="Enfants" sub="2 – 11 ans"
            value={children} onChange={setChildren} min={0} />

          {/* Cabin class */}
          <Text fontSize="xs" fontWeight={700} color="gray.400"
            textTransform="uppercase" letterSpacing="wider" mt={4} mb={2}>
            Classe de cabine
          </Text>
          <Flex gap={2} flexWrap="wrap">
            {CLASSES.map(cls => (
              <Box
                key={cls}
                as="button"
                px={3} py={1.5}
                borderRadius="full"
                fontSize="xs" fontWeight={600}
                border="1.5px solid"
                borderColor={cabinClass === cls ? "blue.500" : "gray.200"}
                bg={cabinClass === cls ? "blue.600" : "white"}
                color={cabinClass === cls ? "white" : "gray.600"}
                cursor="pointer"
                transition="all 0.15s"
                onClick={() => setCabinClass(cls)}>
                {cls}
              </Box>
            ))}
          </Flex>

          {/* Done button */}
          <Button
            mt={4} w="full" colorScheme="blue"
            borderRadius="xl" size="sm" h="38px"
            fontWeight={700}
            onClick={() => setOpen(false)}>
            Confirmer
          </Button>
        </Box>
      )}
    </Box>
  )
}

/* ── Flight card ────────────────────────────────────────────────── */
function FlightCard({ flight, airline }) {
  const navigate = useNavigate()
  const s = STATUS_META[flight.status] ?? { color: "gray", label: flight.status }
  const pct = occup(flight.seats_total, flight.seats_available)
  const dur = calcDuration(flight.departure, flight.arrival)
  console.log(flight.flightClasses)

  const cheapestClass = flight.flightClasses?.length
    ? flight.flightClasses.reduce((min, c) => c.price_adult < min.price_adult ? c : min, flight.flightClasses[0])
    : null
    console.log(cheapestClass)

  return (
    <Box bg="white" borderRadius="2xl"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.06)"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "translateY(-3px)", boxShadow: "0 8px 28px rgba(0,0,0,0.1)" }}
      overflow="hidden">

      {/* Airline header strip */}
      <Flex px={4} py={3} bg="blue.600" align="center" justify="space-between">
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

          <Box flex={1} position="relative">
            <Box h="1.5px" bg="gray.200" w="100%" />
            <Flex position="absolute" top="50%" left="50%"
              transform="translate(-50%, -50%)" bg="white" px={2}>
              <Box color="blue.400"><LuPlane size={16} /></Box>
            </Flex>
            {dur && (
              <Text fontSize="9px" color="gray.400" textAlign="center" mt={1}>{dur}</Text>
            )}
          </Box>

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
            <Text fontSize="sm" fontWeight={700} color="gray.700">{flight.baggage_kg} kg</Text>
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

        {/* Price + CTA */}
        <Flex align="center" justify="space-between" gap={3}>
          {cheapestClass && (
            <Box>
              <Text fontSize="9px" color="gray.400" textTransform="uppercase" letterSpacing="wide">
                À partir de
              </Text>
              <Flex align="baseline" gap={1}>
                <Text fontSize="xl" fontWeight={900} color="blue.600" lineHeight={1}>
                  {cheapestClass.price_adult}
                </Text>
                <Text fontSize="xs" fontWeight={600} color="blue.400">TND</Text>
              </Flex>
              <Text fontSize="9px" color="gray.400">{cheapestClass.class_name}</Text>
            </Box>
          )}
          <Button
            flex={1} colorScheme="blue" borderRadius="xl"
            fontWeight={700} size="sm" h="40px"
            isDisabled={flight.status === "annulé" || flight.seats_available === 0}
            onClick={() => navigate(`/airline/flight/${flight.id}`)}>
            <Flex align="center" gap={2}>
              Voir les détails <FaChevronRight size={10} />
            </Flex>
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}

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

/* ── DateField ──────────────────────────────────────────────────── */
function DateField({ value, onChange, min }) {
  return (
    <DatePicker.Root locale="fr-FR"
      min={parseDate(min)}
      value={value ? [parseDate(value)] : []}
      onValueChange={(details) => {
        const date = details.value?.[0]
        if (date) {
          const jsDate = new Date(date.year, date.month - 1, date.day + 1)
          onChange(jsDate.toISOString().split("T")[0])
        }
      }}>
      <DatePicker.Control h="32px" border="none" bg="white">
        <DatePicker.Input p={0} outline="none" border="none" bg="transparent"
          fontSize="14px" fontWeight="600" color="gray.800" />
        <DatePicker.IndicatorGroup>
          <DatePicker.Trigger><LuCalendar size={14} /></DatePicker.Trigger>
        </DatePicker.IndicatorGroup>
      </DatePicker.Control>
      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content>
            <DatePicker.View view="day"><DatePicker.Header /><DatePicker.DayTable /></DatePicker.View>
            <DatePicker.View view="month"><DatePicker.Header /><DatePicker.MonthTable /></DatePicker.View>
            <DatePicker.View view="year"><DatePicker.Header /><DatePicker.YearTable /></DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  )
}

export default function HomeAirline() {
  const [airlines, setAirlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")

  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]

  const [tripType, setTripType] = useState("aller-retour")
  const [fromCity, setFromCity] = useState("")
  const [toCity, setToCity] = useState("")
  const [departDate, setDepartDate] = useState(today)
  const [returnDate, setReturnDate] = useState(tomorrow)
  const [directOnly, setDirectOnly] = useState(false)

  // Travelers state
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [cabinClass, setCabinClass] = useState("Économique")

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

  const filtered = allFlights.filter(({ flight }) => {
    const matchStatus = statusFilter === "all" || flight.status === statusFilter
    const matchFrom = !fromCity || flight.departure_airport?.toLowerCase().includes(fromCity.toLowerCase())
    const matchTo = !toCity || flight.arrival_airport?.toLowerCase().includes(toCity.toLowerCase())
    return matchStatus && matchFrom && matchTo
  })
  const statuses = [...new Set(allFlights.map(({ flight }) => flight.status))]

  const handleSearch = () => {
    navigate(
      `/search/airline?from=${fromCity}` +
      `&to=${toCity ?? ""}` +
      `&type=${tripType ?? ""}` +
      `&depart-date=${departDate ?? ""}` +
      `&return-date=${returnDate}` +
      `&children=${children}` +
      `&adults=${adults}` +
      `&cabin-class=${cabinClass}`
    )
  }
  return (
    <>
      <Header />

      {/* ── Hero ── */}
      <Box bg="linear-gradient(160deg, #0D1B3E 0%, #1A3260 50%, #0D1B3E 100%)"
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
          <Box bg="white" borderRadius="2xl"
            boxShadow="0 8px 40px rgba(0,0,0,0.25)"
          >

            <Grid
              templateColumns={{
                base: "1fr",
                md: tripType === "aller-retour"
                  ? "1.2fr auto 1.2fr 1fr 1fr 1.4fr auto"
                  : "1.4fr auto 1.4fr 1fr 1.4fr auto"
              }}
              align="stretch">

              {/* From */}
              <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150" borderLeftRadius="2xl">
                <Text fontSize="xs" fontWeight={700} color="gray.500" mb={0.5}>De</Text>
                {/* <Box as="input" value={fromCity} onChange={e => setFromCity(e.target.value)}
                  placeholder="Ville ou aéroport"
                  style={{
                    width: "100%", border: "none", outline: "none",
                    fontSize: "15px", fontWeight: "600",
                    color: "var(--chakra-colors-gray-800)", background: "transparent",
                  }} /> */}
                <AirportCombobox placeholder={"Ville ou aéroport"} value={fromCity} onChange={setFromCity} />
              </Box>

              {/* Swap */}
              <Flex align="center" justify="center" px={2}
                borderRight="1px solid" borderColor="gray.150">
                <Flex as="button" w="32px" h="32px" borderRadius="full"
                  border="1.5px solid" borderColor="gray.300"
                  bg="white" align="center" justify="center"
                  cursor="pointer" transition="all 0.15s"
                  _hover={{ bg: "blue.50", borderColor: "blue.300" }}
                  onClick={() => { const t = fromCity; setFromCity(toCity); setToCity(t) }}>
                  <LuArrowLeftRight size={14} color="var(--chakra-colors-gray-500)" />
                </Flex>
              </Flex>

              {/* To */}
              <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150">
                <Text fontSize="xs" fontWeight={700} color="gray.500" mb={0.5}>À</Text>
                {/* <Box as="input" value={toCity} onChange={e => setToCity(e.target.value)}
                  placeholder="Ville ou aéroport"
                  style={{
                    width: "100%", border: "none", outline: "none",
                    fontSize: "15px", fontWeight: "600",
                    color: "var(--chakra-colors-gray-800)", background: "transparent",
                  }} /> */}
                <AirportCombobox placeholder={"Ville ou aéroport"} value={toCity} onChange={setToCity} />

              </Box>

              {/* Depart date */}
              <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150">
                <Text fontSize="xs" fontWeight={700} color="gray.500" mb={0.5}>Départ</Text>
                <DateField min={today} value={departDate} onChange={setDepartDate} />
              </Box>

              {/* Return date */}
              {tripType === "aller-retour" && (
                <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150">
                  <Text fontSize="xs" fontWeight={700} color="gray.500" mb={0.5}>Retour</Text>
                  <DateField min={departDate} value={returnDate} onChange={setReturnDate} />
                </Box>
              )}

              {/* ── Travelers & classe popover ── */}
              <TravelersPopover
                adults={adults} setAdults={setAdults}
                children={children} setChildren={setChildren}
                cabinClass={cabinClass} setCabinClass={setCabinClass}
              />

              {/* Search CTA */}
              <Flex
                as={"button"}
                align="center" justify="center"
                px={6} gap={2} minH="70px"
                bg="blue.600" color="white"
                fontWeight={700} fontSize="sm"
                borderRightRadius="2xl"
                transition="background 0.15s"
                onClick={(!toCity || !fromCity) ? undefined : handleSearch }
                cursor={(!toCity || !fromCity) ? "no-drop" : "pointer"}
                opacity={(!toCity || !fromCity) ? 0.5 : 1}
              >
                <FaSearch size={13} />
                Rechercher
              </Flex>
            </Grid>

            {/* Options row */}
            <Flex px={5} py={3} gap={6}
              borderRadius={"2xl"}
              borderTop="1px solid" borderColor="gray.100" bg="gray.50">
              <Flex as="label" align="center" gap={2} cursor="pointer">
                <Box as="input" type="checkbox"
                  checked={directOnly}
                  onChange={e => setDirectOnly(e.target.checked)}
                  style={{ accentColor: "var(--chakra-colors-blue-600)" }} />
                <Text fontSize="sm" color="gray.600">Vols directs uniquement</Text>
              </Flex>
            </Flex>
          </Box>

          {/* Status filter pills */}
          <Flex gap={2} mt={5} flexWrap="wrap" justify="center">
            {[{ key: "all", label: "Tous les vols" },
            ...statuses.map(s => ({ key: s, ...(STATUS_META[s] ?? { label: s }) }))
            ].map(({ key, label }) => (
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

      <Box bg="#f5f6fa" minH="60vh">
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={8}>

          {/* {!loading && (
            <Text fontSize="sm" color="gray.500" mb={6}>
              {allFlights.length} vol{allFlights.length !== 1 ? "s" : ""}
              {(fromCity || toCity) ? ` · ${fromCity || "??"} → ${toCity || "??"}` : ""}
              {statusFilter !== "all" ? ` · ${STATUS_META[statusFilter]?.label}` : ""}
            </Text>
          )} */}

          {error && (
            <Flex direction="column" align="center" py={20} gap={3}>
              <Text color="gray.500">{error}</Text>
              <Button size="sm" colorScheme="blue" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </Flex>
          )}

          <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }} gap={5}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              : allFlights.map(({ flight, airline }) => (
                <FlightCard key={flight.id} flight={flight} airline={airline} />
              ))
            }
          </Grid>

        </Box>
      </Box>
    </>
  )
}