import { useEffect, useState } from "react"
import {
  Box, Button, Flex, Grid, Text, Badge,
  Skeleton, SkeletonText, VStack, HStack,
  Combobox, Portal, useFilter, useListCollection,
  DatePicker, parseDate,
} from "@chakra-ui/react"
import {
  FaPlane, FaSearch, FaWifi, FaUtensils,
  FaSuitcase, FaStar, FaChevronRight,
  FaMinus, FaPlus,
} from "react-icons/fa"
import {
  LuSlidersHorizontal, LuX, LuUsers, LuCheck,
  LuPlane, LuCalendar, LuArrowLeftRight,
} from "react-icons/lu"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Axios } from "../../Api/Api"
import Header from "../../components/home/Header"

/* ── Constants ──────────────────────────────────────────────────── */
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

const PRICE_RANGES = [
  { label: "Moins de 200 TND", min: 0, max: 200 },
  { label: "200 – 500 TND", min: 200, max: 500 },
  { label: "500 – 1000 TND", min: 500, max: 1000 },
  { label: "Plus de 1000 TND", min: 1000, max: 99999 },
]

const CLASSES_LIST = ["Économique", "Affaires", "Première"]

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
  : "—"
const fmtTime = (d) => d
  ? new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  : "—"
const calcDuration = (dep, arr) => {
  if (!dep || !arr) return null
  const m = Math.round((new Date(arr) - new Date(dep)) / 60000)
  return `${Math.floor(m / 60)}h${m % 60 > 0 ? (m % 60) + "min" : ""}`
}
const occup = (total, avail) => {
  if (!total) return 0
  return Math.round(((total - (avail ?? 0)) / total) * 100)
}

/* ── Airport combobox ───────────────────────────────────────────── */
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

/* ── Borderless DateField (search bar) ──────────────────────────── */
function DateFieldBar({ label, value, onChange, min }) {
  const today = new Date().toISOString().split("T")[0]
  return (
    <Box>
      <Text fontSize="10px" fontWeight={700} color="gray.400"
        textTransform="uppercase" letterSpacing="wider" mb={0.5}>
        {label}
      </Text>
      <DatePicker.Root locale="fr-FR"
        min={parseDate(min ?? today)}
        value={value ? [parseDate(value)] : []}
        onValueChange={(details) => {
          const date = details.value?.[0]
          if (date) {
            const jsDate = new Date(date.year, date.month - 1, date.day + 1)
            onChange(jsDate.toISOString().split("T")[0])
          }
        }}>
        <DatePicker.Control h="38px" border="none" bg="transparent">
          <DatePicker.Input p={0} outline="none" border="none" bg="transparent"
            fontSize="14px" fontWeight="600" color="gray.800" />
          <DatePicker.IndicatorGroup>
            <DatePicker.Trigger><LuCalendar size={13} /></DatePicker.Trigger>
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
    </Box>
  )
}

function CounterRow({ label, sub, value, onChange, min = 0 }) {
  return (
    <Flex align="center" justify="space-between" py={2.5}
      borderBottom="1px solid" borderColor="gray.100">
      <Box>
        <Text fontSize="sm" fontWeight={600} color="gray.800">{label}</Text>
        {sub && <Text fontSize="xs" color="gray.400">{sub}</Text>}
      </Box>
      <Flex align="center" gap={3}>
        <Flex as="button" w="28px" h="28px" borderRadius="full"
          border="1.5px solid"
          borderColor={value <= min ? "gray.200" : "blue.300"}
          bg={value <= min ? "gray.50" : "blue.50"}
          color={value <= min ? "gray.300" : "blue.600"}
          align="center" justify="center"
          cursor={value <= min ? "not-allowed" : "pointer"}
          onClick={() => value > min && onChange(value - 1)}>
          <FaMinus size={9} />
        </Flex>
        <Text fontSize="sm" fontWeight={700} color="gray.800" minW="14px" textAlign="center">
          {value}
        </Text>
        <Flex as="button" w="28px" h="28px" borderRadius="full"
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

function TravelersBar({ adults, setAdults, children, setChildren, cabinClass, setCabinClass }) {
  const [open, setOpen] = useState(false)
  const ref = useState(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref[0] && !ref[0].contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const total = adults + children
  const label = `${total} voyageur${total > 1 ? "s" : ""}, ${cabinClass}`

  return (
    <Box position="relative" ref={el => ref[0] = el}>
      <Box cursor="pointer" onClick={() => setOpen(o => !o)}>
        <Text fontSize="10px" fontWeight={700} color="gray.400"
          textTransform="uppercase" letterSpacing="wider" mb={0.5}>
          Voyageurs & classe
        </Text>
        <Text fontSize="14px" fontWeight="600" color="gray.800" noOfLines={1}>
          {label}
        </Text>
      </Box>

      {open && (
        <Box position="absolute" top="calc(100% + 10px)" left={0}
          zIndex={9999} bg="white" borderRadius="2xl"
          border="1px solid" borderColor="gray.100"
          boxShadow="0 8px 32px rgba(0,0,0,0.14)"
          p={5} minW="290px">

          <Text fontSize="xs" fontWeight={700} color="gray.400"
            textTransform="uppercase" letterSpacing="wider" mb={1}>
            Passagers
          </Text>
          <CounterRow label="Adultes" sub="12 ans et plus" value={adults} onChange={setAdults} min={1} />
          <CounterRow label="Enfants" sub="2 – 11 ans" value={children} onChange={setChildren} />

          <Text fontSize="xs" fontWeight={700} color="gray.400"
            textTransform="uppercase" letterSpacing="wider" mt={4} mb={2}>
            Classe de cabine
          </Text>
          <Flex gap={2} flexWrap="wrap">
            {CLASSES_LIST.map(cls => (
              <Box key={cls} as="button"
                px={3} py={1.5} borderRadius="full"
                fontSize="xs" fontWeight={600} border="1.5px solid"
                borderColor={cabinClass === cls ? "blue.500" : "gray.200"}
                bg={cabinClass === cls ? "blue.600" : "white"}
                color={cabinClass === cls ? "white" : "gray.600"}
                cursor="pointer" transition="all 0.15s"
                onClick={() => setCabinClass(cls)}>
                {cls}
              </Box>
            ))}
          </Flex>

          <Button mt={4} w="full" colorScheme="blue" borderRadius="xl"
            size="sm" h="38px" fontWeight={700}
            onClick={() => setOpen(false)}>
            Confirmer
          </Button>
        </Box>
      )}
    </Box>
  )
}

function FilterBox({ label, checked, onChange }) {
  return (
    <Flex as="button" type="button" align="center" gap={2.5}
      cursor="pointer" w="full" py={1.5} onClick={() => onChange(!checked)}>
      <Flex w="18px" h="18px" borderRadius="md" flexShrink={0}
        border="1.5px solid"
        borderColor={checked ? "blue.400" : "gray.300"}
        bg={checked ? "blue.500" : "white"}
        align="center" justify="center" transition="all 0.15s">
        {checked && <LuCheck size={11} color="white" />}
      </Flex>
      <Text fontSize="sm" color="gray.700">{label}</Text>
    </Flex>
  )
}

/* ── Flight card ─────────────────────────────────────────────────── */
function FlightCard({ flight, airline,type,adults,children }) {
  const navigate = useNavigate()
  const s = STATUS_META[flight.status] ?? { color: "gray", label: flight.status }
  const pct = occup(flight.seats_total, flight.seats_available)
  const dur = calcDuration(flight.departure, flight.arrival)
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

      {/* Airline strip */}
      <Flex px={4} py={3} bg="blue.600" align="center" justify="space-between">
        <Flex align="center" gap={2.5}>
          <Flex w="32px" h="32px" borderRadius="lg"
            bg="whiteAlpha.300" align="center" justify="center">
            <FaPlane size={13} color="white" />
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight={700} color="white" lineHeight={1}>
              {airline?.name}
            </Text>
            <Text fontSize="10px" color="blue.100">{airline?.hub}</Text>
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
        {/* Route */}
        <Flex align="center" gap={3} mb={4}>
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
              transform="translate(-50%,-50%)" bg="white" px={2}>
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

        {/* Info grid */}
        <Grid templateColumns="1fr 1fr 1fr" gap={2} mb={3}>
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
            <Text fontSize="xs" fontWeight={700} color="gray.700">
              {flight.flightClasses?.length ?? 0}
            </Text>
          </Box>
        </Grid>

        {/* Occupancy */}
        <Box mb={3}>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="xs" color="gray.400">Occupation</Text>
            <Text fontSize="xs" fontWeight={700}
              color={pct > 80 ? "red.500" : pct > 50 ? "orange.500" : "green.500"}>
              {pct}%
            </Text>
          </Flex>
          <Box bg="gray.100" borderRadius="full" h="4px" overflow="hidden">
            <Box bg={pct > 80 ? "red.400" : pct > 50 ? "orange.400" : "green.400"}
              h="100%" borderRadius="full" w={`${pct}%`} transition="width 0.4s" />
          </Box>
        </Box>

        {/* Services */}
        {airline?.services?.length > 0 && (
          <Flex gap={1.5} flexWrap="wrap" mb={3}>
            {airline.services.map(srv => {
              const m = SERVICE_META[srv]
              if (!m) return null
              return (
                <Flex key={srv} align="center" gap={1} px={2} py={0.5}
                  bg="blue.50" color="blue.600" borderRadius="full"
                  fontSize="xs" fontWeight={500}>
                  <m.Icon size={9} />{m.label}
                </Flex>
              )
            })}
          </Flex>
        )}

        {/* Price + CTA */}
        <Flex align="center" justify="space-between" gap={3}
          pt={3} borderTop="1px solid" borderColor="gray.50">
          {cheapestClass ? (
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
          ) : <Box />}
          <Button flex={1} colorScheme="blue" borderRadius="xl"
            fontWeight={700} size="sm" h="40px"
            isDisabled={flight.status === "annulé" || flight.seats_available === 0}
            onClick={() => navigate(`/airline/flight/${flight.id}`, { state: {type,adults,children} })}>
            <Flex align="center" gap={2}>
              Voir les détails <FaChevronRight size={10} />
            </Flex>
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}

/* ── Card skeleton ───────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100">
      <Skeleton h="58px" />
      <Box p={5}>
        <SkeletonText noOfLines={3} spacing={3} mb={4} />
        <Grid templateColumns="1fr 1fr 1fr" gap={2} mb={3}>
          {[1, 2, 3].map(i => <Skeleton key={i} h="48px" borderRadius="lg" />)}
        </Grid>
        <Skeleton h="36px" borderRadius="xl" />
      </Box>
    </Box>
  )
}

export default function SearchFlights() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const initFrom = searchParams.get("from") ?? ""
  const initTo = searchParams.get("to") ?? ""
  const initDepart = searchParams.get("depart-date") ?? ""
  const initReturn = searchParams.get("return-date") ?? ""
  const initAdults = Number(searchParams.get("adults") ?? 1)
  const initChildren = Number(searchParams.get("children") ?? 0)
  const initCabin = searchParams.get("cabin-class") ?? "Économique"
  const initTripType = searchParams.get("type") ?? "aller retour"

  const [from, setFrom] = useState(initFrom)
  const [to, setTo] = useState(initTo)
  const [depart, setDepart] = useState(initDepart)
  const [ret, setRet] = useState(initReturn)
  const [adults, setAdults] = useState(initAdults)
  const [children, setChildren] = useState(initChildren)
  const [cabinClass, setCabinClass] = useState(initCabin)
  const [tripType, setTripType] = useState(initTripType)
  const [directOnly, setDirectOnly] = useState(false)

  const [airlines, setAirlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selStatus, setSelStatus] = useState([])
  const [selPrice, setSelPrice] = useState(null)
  const [selServices, setSelServices] = useState([])
  const [mobileFilter, setMobileFilter] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  /* Fetch */
  useEffect(() => {
    ; (async () => {
      try {
        setLoading(true)
        const res = await Axios.post("/service/airline/search/get",{
          type:initTripType,
          from:initFrom,
          to:initTo,
          dateFlight:initDepart,
          dateReturnFlight:initReturn,
          number: initAdults + initChildren,
          class:initCabin.toLowerCase()
        })
        setAirlines(res.data.flights ?? [])
      } catch {
        setError("Impossible de charger les vols.")
      } finally {
        setLoading(false)
      }
    })()
  }, [searchParams.toString()])

  const allFlights = airlines.flatMap(airline =>
    (airline.FlightCompagnie ?? []).map(flight => ({ flight, airline }))
  )

  const filtered = allFlights.filter(({ flight, airline }) => {
    const matchFrom = !initFrom || flight.departure_airport?.toLowerCase().includes(initFrom.toLowerCase())
    const matchTo = !initTo || flight.arrival_airport?.toLowerCase().includes(initTo.toLowerCase())
    const matchStatus = selStatus.length === 0 || selStatus.includes(flight.status)
    const cheapest = flight.flightClasses?.length
      ? Math.min(...flight.flightClasses.map(c => c.price_adult)) : null
    const matchPrice = !selPrice || (cheapest !== null && cheapest >= selPrice.min && cheapest <= selPrice.max)
    const matchSvc = selServices.length === 0 || selServices.every(s => airline.services?.includes(s))
    return matchFrom && matchTo && matchStatus && matchPrice && matchSvc
  })

  const activeCount = selStatus.length + (selPrice ? 1 : 0) + selServices.length

  const resetFilters = () => { setSelStatus([]); setSelPrice(null); setSelServices([]) }

  const toggleStatus = s => setSelStatus(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])
  const toggleService = s => setSelServices(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])

  const handleSearch = () => {
    navigate(
      `/search-flights?from=${from}&to=${to}&depart-date=${depart}` +
      `&return-date=${ret}&adults=${adults}&children=${children}` +
      `&cabin-class=${cabinClass}&type=${tripType}`
    )
  }

  const Filters = () => (
    <VStack align="stretch" spacing={6}>

      {/* Status */}
      <Box>
        <Text fontSize="xs" fontWeight={700} color="gray.400"
          textTransform="uppercase" letterSpacing="wider" mb={3}>
          Statut du vol
        </Text>
        <VStack align="stretch" spacing={0}>
          {Object.entries(STATUS_META).map(([key, { label }]) => (
            <FilterBox key={key} label={label}
              checked={selStatus.includes(key)}
              onChange={() => toggleStatus(key)} />
          ))}
        </VStack>
      </Box>

      {/* Price */}
      <Box>
        <Text fontSize="xs" fontWeight={700} color="gray.400"
          textTransform="uppercase" letterSpacing="wider" mb={3}>
          Prix / personne
        </Text>
        <VStack align="stretch" spacing={0}>
          {PRICE_RANGES.map(range => {
            const active = selPrice?.label === range.label
            return (
              <Flex key={range.label} as="button" type="button"
                align="center" gap={2.5} cursor="pointer" py={1.5}
                onClick={() => setSelPrice(active ? null : range)}>
                <Flex w="18px" h="18px" borderRadius="full" flexShrink={0}
                  border="1.5px solid"
                  borderColor={active ? "blue.400" : "gray.300"}
                  bg={active ? "blue.500" : "white"}
                  align="center" justify="center" transition="all 0.15s">
                  {active && <Box w="6px" h="6px" borderRadius="full" bg="white" />}
                </Flex>
                <Text fontSize="sm" color="gray.700">{range.label}</Text>
              </Flex>
            )
          })}
        </VStack>
      </Box>

      {/* Services */}
      <Box>
        <Text fontSize="xs" fontWeight={700} color="gray.400"
          textTransform="uppercase" letterSpacing="wider" mb={3}>
          Services à bord
        </Text>
        <VStack align="stretch" spacing={0}>
          {Object.entries(SERVICE_META).map(([key, { label }]) => (
            <FilterBox key={key} label={label}
              checked={selServices.includes(key)}
              onChange={() => toggleService(key)} />
          ))}
        </VStack>
      </Box>

      {/* Direct only */}
      <Box>
        <Text fontSize="xs" fontWeight={700} color="gray.400"
          textTransform="uppercase" letterSpacing="wider" mb={3}>
          Options
        </Text>
        <FilterBox label="Vols directs uniquement"
          checked={directOnly} onChange={setDirectOnly} />
      </Box>

      {activeCount > 0 && (
        <Button size="sm" variant="outline" borderRadius="xl"
          color="red.500" borderColor="red.200" _hover={{ bg: "red.50" }}
          onClick={resetFilters}>
          <Flex align="center" gap={2}><LuX size={13} />Réinitialiser</Flex>
        </Button>
      )}
    </VStack>
  )

  return (
    <>
      <Header />

      {/* ── Sticky search bar ── */}
      <Box bg="linear-gradient(135deg, #0D1B3E, #1A3260)"
        px={4} py={4} position="sticky" top={0} zIndex={20}
        boxShadow="0 2px 16px rgba(0,0,0,0.2)">
        <Box maxW="1200px" mx="auto">
          <Box bg="white" borderRadius="2xl"
            border="1px solid" borderColor="gray.100"
            boxShadow="0 4px 24px rgba(0,0,0,0.12)">

            <Grid
              templateColumns={{
                base: "1fr",
                md: tripType === "aller retour"
                  ? "1fr auto 1fr 1fr 1fr 1.3fr auto"
                  : "1fr auto 1fr 1fr 1.3fr auto"
              }}
              align="stretch">

              {/* From */}
              <Box px={4} py={2.5} borderRight="1px solid" borderColor="gray.150"
                borderLeftRadius="2xl">
                <Text fontSize="10px" fontWeight={700} color="gray.400"
                  textTransform="uppercase" letterSpacing="wider" mb={0.5}>
                  De
                </Text>
                <AirportCombobox placeholder="Ville ou aéroport" value={from} onChange={setFrom} />
              </Box>

              {/* Swap */}
              <Flex align="center" justify="center" px={2}
                borderRight="1px solid" borderColor="gray.150">
                <Flex as="button" w="30px" h="30px" borderRadius="full"
                  border="1.5px solid" borderColor="gray.300"
                  bg="white" align="center" justify="center"
                  cursor="pointer" transition="all 0.15s"
                  _hover={{ bg: "blue.50", borderColor: "blue.300" }}
                  onClick={() => { const t = from; setFrom(to); setTo(t) }}>
                  <LuArrowLeftRight size={13} color="var(--chakra-colors-gray-500)" />
                </Flex>
              </Flex>

              {/* To */}
              <Box px={4} py={2.5} borderRight="1px solid" borderColor="gray.150">
                <Text fontSize="10px" fontWeight={700} color="gray.400"
                  textTransform="uppercase" letterSpacing="wider" mb={0.5}>
                  À
                </Text>
                <AirportCombobox placeholder="Ville ou aéroport" value={to} onChange={setTo} />
              </Box>

              {/* Depart */}
              <Box px={4} py={2.5} borderRight="1px solid" borderColor="gray.150">
                <DateFieldBar label="Départ" min={today} value={depart} onChange={setDepart} />
              </Box>

              {/* Return */}
              {tripType === "aller retour" && (
                <Box px={4} py={2.5} borderRight="1px solid" borderColor="gray.150">
                  <DateFieldBar label="Retour" min={depart || today} value={ret} onChange={setRet} />
                </Box>
              )}

              {/* Travelers */}
              <Box px={4} py={2.5} borderRight="1px solid" borderColor="gray.150">
                <TravelersBar
                  adults={adults} setAdults={setAdults}
                  children={children} setChildren={setChildren}
                  cabinClass={cabinClass} setCabinClass={setCabinClass}
                />
              </Box>

              {/* Search CTA */}
              <Flex as="button" align="center" justify="center"
                px={5} gap={2} minH="68px"
                bg="blue.600" color="white" fontWeight={700} fontSize="sm"
                borderRightRadius="2xl"
                cursor={!from && !to ? "not-allowed" : "pointer"}
                opacity={!from && !to ? 0.6 : 1}
                transition="background 0.15s"
                _hover={from || to ? { bg: "blue.700" } : {}}
                onClick={handleSearch}>
                <FaSearch size={13} />Rechercher
              </Flex>
            </Grid>

            {/* Trip type + summary strip */}
            <Flex align="center" justify="space-between" px={5} py={2.5}
              borderTop="1px solid" borderColor="gray.100"
              bg="blue.50" borderBottomRadius="2xl" flexWrap="wrap" gap={3}>

              {/* Trip type pills */}
              <Flex gap={2}>
                {["aller retour", "aller simple"].map(t => (
                  <Box key={t} as="button"
                    px={3} py={1} borderRadius="full"
                    fontSize="xs" fontWeight={600}
                    bg={tripType === t ? "blue.600" : "white"}
                    color={tripType === t ? "white" : "gray.500"}
                    border="1.5px solid"
                    borderColor={tripType === t ? "blue.600" : "gray.200"}
                    cursor="pointer" transition="all 0.15s"
                    textTransform="capitalize"
                    onClick={() => setTripType(t)}>
                    {t}
                  </Box>
                ))}
              </Flex>

              {/* Summary info */}
              <Flex align="center" gap={3} flexWrap="wrap">
                {(initFrom || initTo) && (
                  <Flex align="center" gap={1.5}>
                    <FaPlane size={10} color="var(--chakra-colors-blue-500)" />
                    <Text fontSize="xs" color="blue.700" fontWeight={700}>
                      {initFrom || "??"} → {initTo || "??"}
                    </Text>
                  </Flex>
                )}
                {initDepart && (
                  <Badge colorScheme="blue" borderRadius="full" px={2} py={0.5} fontSize="xs">
                    {new Date(initDepart).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </Badge>
                )}
                <Flex align="center" gap={1.5} fontSize="xs" color="gray.500">
                  <LuUsers size={11} />
                  {initAdults} adulte{initAdults > 1 ? "s" : ""}
                  {initChildren > 0 && `, ${initChildren} enfant${initChildren > 1 ? "s" : ""}`}
                  {" · "}{initCabin}
                </Flex>
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box bg="#f5f6fa" minH="calc(100vh - 150px)">
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={7}>

          {/* Mobile filter toggle */}
          <Flex display={{ base: "flex", lg: "none" }}
            justify="space-between" align="center" mb={5}>
            <Text fontSize="sm" color="gray.600" fontWeight={500}>
              {loading ? "Recherche en cours…"
                : `${filtered.length} vol${filtered.length !== 1 ? "s" : ""} trouvé${filtered.length !== 1 ? "s" : ""}`}
            </Text>
            <Button size="sm" variant="outline" borderRadius="xl"
              borderColor="gray.200" color="gray.600"
              onClick={() => setMobileFilter(o => !o)}>
              <Flex align="center" gap={2}>
                <LuSlidersHorizontal size={14} />Filtres
                {activeCount > 0 && (
                  <Badge colorScheme="blue" borderRadius="full">{activeCount}</Badge>
                )}
              </Flex>
            </Button>
          </Flex>

          {/* Mobile filter panel */}
          {mobileFilter && (
            <Box display={{ base: "block", lg: "none" }}
              bg="white" borderRadius="2xl" p={5} mb={5}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 4px 20px rgba(0,0,0,0.08)">
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight={700} color="gray.800">Filtres</Text>
                <Button size="xs" variant="ghost" color="gray.400"
                  onClick={() => setMobileFilter(false)}><LuX size={15} /></Button>
              </Flex>
              <Filters />
            </Box>
          )}

          <Grid templateColumns={{ base: "1fr", lg: "260px 1fr" }} gap={7}>

            {/* ── Sidebar ── */}
            <Box display={{ base: "none", lg: "block" }}>
              <Box bg="white" borderRadius="2xl" p={5}
                border="1px solid" borderColor="gray.100"
                boxShadow="0 1px 8px rgba(0,0,0,0.05)"
                position="sticky" top="145px">
                <Flex justify="space-between" align="center" mb={5}>
                  <Text fontWeight={800} fontSize="md" color="gray.800">Filtres</Text>
                  {activeCount > 0 && (
                    <Badge colorScheme="blue" borderRadius="full" px={2}>{activeCount}</Badge>
                  )}
                </Flex>
                <Filters />
              </Box>
            </Box>

            {/* ── Results ── */}
            <Box>
              <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
                <Box>
                  {loading ? (
                    <Skeleton h="20px" w="200px" borderRadius="md" />
                  ) : (
                    <>
                      <Text fontSize="lg" fontWeight={800} color="gray.900">
                        {filtered.length} vol{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
                      </Text>
                      {(initFrom || initTo) && (
                        <Text fontSize="sm" color="gray.400" mt={0.5}>
                          <Text as="span" fontWeight={600} color="gray.600">{initFrom || "??"}</Text>
                          {" → "}
                          <Text as="span" fontWeight={600} color="gray.600">{initTo || "??"}</Text>
                          {initDepart && ` · ${new Date(initDepart).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`}
                        </Text>
                      )}
                    </>
                  )}
                </Box>
              </Flex>

              {/* Active filter pills */}
              {activeCount > 0 && (
                <Flex gap={2} flexWrap="wrap" mb={4}>
                  {selStatus.map(s => (
                    <Flex key={s} align="center" gap={1.5}
                      bg="blue.50" color="blue.600" borderRadius="full"
                      px={3} py={1} fontSize="xs" fontWeight={600}
                      border="1px solid" borderColor="blue.200">
                      {STATUS_META[s]?.label}
                      <Box as="button" onClick={() => toggleStatus(s)} ml={1}><LuX size={10} /></Box>
                    </Flex>
                  ))}
                  {selServices.map(s => (
                    <Flex key={s} align="center" gap={1.5}
                      bg="purple.50" color="purple.600" borderRadius="full"
                      px={3} py={1} fontSize="xs" fontWeight={600}
                      border="1px solid" borderColor="purple.200">
                      {SERVICE_META[s]?.label}
                      <Box as="button" onClick={() => toggleService(s)} ml={1}><LuX size={10} /></Box>
                    </Flex>
                  ))}
                  {selPrice && (
                    <Flex align="center" gap={1.5}
                      bg="green.50" color="green.600" borderRadius="full"
                      px={3} py={1} fontSize="xs" fontWeight={600}
                      border="1px solid" borderColor="green.200">
                      {selPrice.label}
                      <Box as="button" onClick={() => setSelPrice(null)} ml={1}><LuX size={10} /></Box>
                    </Flex>
                  )}
                </Flex>
              )}

              {/* Grid */}
              {loading ? (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={5}>
                  {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
                </Grid>
              ) : error && allFlights.length === 0 ? (
                <Flex direction="column" align="center" py={20} gap={3}
                  bg="white" borderRadius="2xl"
                  border="1px dashed" borderColor="gray.200">
                  <Text fontWeight={700} color="gray.600">Aucun vol trouvé</Text>
                  <Text fontSize="sm" color="gray.400">{error}</Text>
                </Flex>
              ) : filtered.length === 0 ? (
                <Flex direction="column" align="center" py={20} gap={3}
                  bg="white" borderRadius="2xl"
                  border="1px dashed" borderColor="gray.200">
                  <Text fontWeight={700} color="gray.600">Aucun résultat avec ces filtres</Text>
                  <Text fontSize="sm" color="gray.400">Essayez de retirer certains filtres.</Text>
                  <Button size="sm" colorScheme="blue" variant="outline"
                    borderRadius="xl" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                </Flex>
              ) : (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={5}>
                  {filtered.map(({ flight, airline }) => (
                    <FlightCard key={flight.id} flight={flight} airline={airline} type={initCabin} adults={initAdults} children={initChildren} />
                  ))}
                </Grid>
              )}
            </Box>
          </Grid>
        </Box>
      </Box>
    </>
  )
}