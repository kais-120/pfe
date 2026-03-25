import {
  Badge, Box, Button, Combobox, DatePicker, Flex, Grid,
  HStack, Image, parseDate, Portal, Skeleton, SkeletonText,
  Text, useFilter, useListCollection, VStack,
} from "@chakra-ui/react"
import Header from "./components/home/Header"
import { useColorMode } from "./components/ui/color-mode"
import { useEffect, useState } from "react"
import { Axios, imageURL } from "./Api/Api"
import {
  FaChevronLeft, FaChevronRight, FaMapMarkerAlt,
  FaCar, FaSearch, FaGasPump, FaUsers, FaStar,
  FaSnowflake, FaWifi, FaBluetooth, FaRoute,
} from "react-icons/fa"
import { LuCalendar, LuShieldCheck } from "react-icons/lu"
import { useNavigate } from "react-router-dom"

const LOCATIONS = [
  { label: "Tunis",value: "tunis"},
  { label: "Sfax", value: "sfax"},
  { label: "Sousse",value: "sousse"},
  { label: "Nabeul",value: "nabeul"},
  { label: "Hammamet",value: "hammamet"},
  { label: "Monastir",value: "monastir"},
  { label: "Djerba",value: "djerba"},
  { label: "Tabarka",value: "tabarka" },
  { label: "Bizerte",value: "bizerte"},
  { label: "Tozeur",value: "tozeur"},
]

const CATEGORY_LABELS = {
  economy:  "Économique",
  sedan:    "Berline",
  suv:      "SUV",
  luxury:   "Luxe",
  electric: "Électrique",
  utility:  "Utilitaire",
}

const FUEL_LABELS = {
  petrol:   "Essence",
  diesel:   "Diesel",
  electric: "Électrique",
  hybrid:   "Hybride",
}

const FEATURE_META = {
  AC:{ Icon: FaSnowflake, label: "Clim"},
  GPS:{ Icon: FaRoute,label: "GPS"},
  Bluetooth: { Icon: FaBluetooth, label: "Bluetooth" },
  WiFi:{ Icon: FaWifi,label: "Wi-Fi"},
}

function LocationCombobox({ value, onChange }) {
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({ initialItems: LOCATIONS, filter: contains })

  return (
    <Box flex={1} minW="180px">
      <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>Lieu de prise en charge</Text>
      <Combobox.Root width="full" collection={collection} inputValue={value}
        onInputValueChange={e => { filter(e.inputValue); onChange(e.inputValue) }}
        onValueChange={e => onChange(e.value[0] ?? "")}>
        <Combobox.Control>
          <Combobox.Input placeholder="Où souhaitez-vous louer ?"
            style={{
              height: "42px", border: "1px solid #E2E8F0",
              borderRadius: "8px", padding: "0 12px",
              fontSize: "14px", background: "#F7FAFC",
              width: "100%", outline: "none",
            }} />
          <Combobox.IndicatorGroup style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}>
            <Combobox.ClearTrigger /><Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.Empty>Aucune ville trouvée</Combobox.Empty>
              {collection.items.map(item => (
                <Combobox.Item item={item} key={item.value}>
                  {item.label}<Combobox.ItemIndicator />
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
    </Box>
  )
}

function DateField({ label, value, onChange, min }) {
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>{label}</Text>
      <DatePicker.Root locale="fr-FR"
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
          px={3}
          h="42px"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          bg="gray.50"
          _focusWithin={{
            borderColor: "blue.400",
            boxShadow: "0 0 0 2px rgba(49,130,206,0.12)",
          }}
        >
          <DatePicker.Input
            outline={"none"}
            border="none"
            bg="transparent"
            fontSize="sm"
            color="gray.700"
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

/* ── Image slider ───────────────────────────────────────────────── */
function ImageSlider({ images, vehicleId }) {
  const [idx, setIdx] = useState(0)

  if (!images?.length) {
    return (
      <Flex h="200px" borderRadius="xl" bg="gray.100"
        align="center" justify="center" color="gray.300">
        <FaCar size={40} />
      </Flex>
    )
  }

  const prev = e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }
  const next = e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }

  return (
    <Box position="relative" height="200px" overflow="hidden" borderRadius="xl">
      <Image
        src={`${imageURL}/services/${images[idx].image_url}`}
        alt={`vehicle-${vehicleId}-${idx}`}
        w="100%" h="100%" objectFit="cover"
        transition="opacity 0.3s"
      />
      {images.length > 1 && (
        <>
          <Button size="xs" position="absolute" left={2} top="50%"
            transform="translateY(-50%)" borderRadius="full"
            bg="blackAlpha.600" color="white" minW="26px" h="26px" p={0}
            _hover={{ bg: "blackAlpha.800" }} onClick={prev}>
            <FaChevronLeft size={9} />
          </Button>
          <Button size="xs" position="absolute" right={2} top="50%"
            transform="translateY(-50%)" borderRadius="full"
            bg="blackAlpha.600" color="white" minW="26px" h="26px" p={0}
            _hover={{ bg: "blackAlpha.800" }} onClick={next}>
            <FaChevronRight size={9} />
          </Button>
          <HStack position="absolute" bottom={2} left="50%" transform="translateX(-50%)" spacing={1}>
            {images.map((_, i) => (
              <Box key={i} w={i === idx ? "14px" : "5px"} h="5px" borderRadius="full"
                bg={i === idx ? "white" : "whiteAlpha.600"} transition="all 0.2s"
                cursor="pointer" onClick={e => { e.stopPropagation(); setIdx(i) }} />
            ))}
          </HStack>
        </>
      )}
      {/* Category badge */}
      <Badge position="absolute" top={2} left={2}
        bg="white" color="blue.600" borderRadius="md"
        px={2} py={0.5} fontSize="xs" fontWeight={700} boxShadow="sm">
        {CATEGORY_LABELS[images[0]?.category] ?? "Voiture"}
      </Badge>
    </Box>
  )
}

/* ── Feature tag ────────────────────────────────────────────────── */
function FeatureTag({ feat }) {
  const meta = FEATURE_META[feat]
  if (!meta) return (
    <Flex align="center" gap={1} px={2} py={0.5}
      bg="blue.50" color="blue.600" borderRadius="full" fontSize="xs" fontWeight={500}>
      {feat}
    </Flex>
  )
  const { Icon, label } = meta
  return (
    <Flex align="center" gap={1.5} px={2.5} py={1}
      bg="blue.50" color="blue.600" borderRadius="full" fontSize="xs" fontWeight={500}>
      <Icon size={9} />{label}
    </Flex>
  )
}

/* ── Vehicle card ───────────────────────────────────────────────── */
function VehicleCard({ vehicle, agencyName, agencyAddress, pickupDate, returnDate, navigate }) {
  const nights = (() => {
    if (!pickupDate || !returnDate) return null
    const d = (new Date(returnDate) - new Date(pickupDate)) / 86400000
    return d > 0 ? d : null
  })()

  const totalPrice = nights ? (Number(vehicle.price_per_day) * nights).toFixed(0) : null

  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.06)"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "translateY(-4px)", boxShadow: "0 8px 28px rgba(0,0,0,0.12)" }}
      cursor="pointer">

      <Box p={4} pb={3}>
        <ImageSlider images={vehicle.images} vehicleId={vehicle.id} />
      </Box>

      <VStack align="stretch" px={4} pb={4} spacing={3}>
        {/* Name */}
        <Box>
          <Text fontWeight={700} fontSize="md" color="gray.800" noOfLines={1}>
            {vehicle.brand} {vehicle.model}{" "}
            <Text as="span" fontSize="sm" color="gray.400" fontWeight={400}>
              {vehicle.year}
            </Text>
          </Text>
          <Flex align="center" gap={1.5} mt={1}>
            <Box color="gray.400" flexShrink={0}><FaMapMarkerAlt size={11} /></Box>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {agencyName} · {agencyAddress}
            </Text>
          </Flex>
        </Box>

        {/* Specs row */}
        <Flex gap={3} flexWrap="wrap">
          <Flex align="center" gap={1.5} fontSize="xs" color="gray.500">
            <FaUsers size={11} />{vehicle.seats} places
          </Flex>
          <Flex align="center" gap={1.5} fontSize="xs" color="gray.500">
            <FaGasPump size={11} />
            {FUEL_LABELS[vehicle.fuel] ?? vehicle.fuel}
          </Flex>
          <Flex align="center" gap={1.5} fontSize="xs" color="gray.500">
            <LuShieldCheck size={11} />
            {vehicle.min_age}+ ans
          </Flex>
        </Flex>

        {vehicle.features?.length > 0 && (
          <Flex gap={1.5} flexWrap="wrap">
            {vehicle.features.slice(0, 4).map(f => (
              <FeatureTag key={f} feat={f} />
            ))}
          </Flex>
        )}

        {vehicle.description && (
          <Text fontSize="sm" color="gray.600" lineHeight="1.6" noOfLines={2}>
            {vehicle.description}
          </Text>
        )}

        {/* Price + CTA */}
        <Flex align="center" justify="space-between" mt={1}>
          <Box>
            <Text fontSize="xs" color="gray.400" lineHeight={1}>
              {totalPrice ? `${nights} jour${nights > 1 ? "s" : ""} · total` : "À partir de"}
            </Text>
            <Flex align="baseline" gap={1}>
              <Text fontSize="xl" fontWeight={900} color="blue.600" lineHeight="1.2">
                {totalPrice ?? Number(vehicle.price_per_day).toFixed(0)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                TND{!totalPrice ? " / jour" : ""}
              </Text>
            </Flex>
            {totalPrice && (
              <Text fontSize="9px" color="gray.400">
                ({Number(vehicle.price_per_day).toFixed(0)} TND/jour)
              </Text>
            )}
          </Box>
          <Button colorScheme="blue" borderRadius="xl" size="sm" fontWeight={600} px={5}
            onClick={() => navigate(`/cars/${vehicle.id}`)}>
            Détails
          </Button>
        </Flex>
      </VStack>
    </Box>
  )
}

function CarCardSkeleton() {
  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100" boxShadow="sm">
      <Box p={4} pb={3}><Skeleton height="200px" borderRadius="xl" /></Box>
      <VStack align="stretch" px={4} pb={4} spacing={3}>
        <SkeletonText noOfLines={2} spacing={2} skeletonHeight={3} />
        <Flex gap={2}>
          <Skeleton height="20px" width="60px" borderRadius="full" />
          <Skeleton height="20px" width="60px" borderRadius="full" />
          <Skeleton height="20px" width="60px" borderRadius="full" />
        </Flex>
        <SkeletonText noOfLines={2} spacing={2} skeletonHeight={2} />
        <Skeleton height="36px" borderRadius="xl" />
      </VStack>
    </Box>
  )
}

const HomeLocation = () => {
  useEffect(()=>{
    localStorage.removeItem("searchData")
  },[])
  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]

  const [agencies,setAgencies] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const [destination,setDestination] = useState("")
  const [pickupDate,setPickupDate] = useState(today)
  const [returnDate,setReturnDate] = useState(tomorrow)
  const [category,setCategory] = useState("all")

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await Axios.get("/service/location/public/get")
        setAgencies(res.data.data ?? [])
      } catch {
        setError("Impossible de charger les véhicules. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const allVehicles = agencies.flatMap(agency =>
    (agency.vehicles ?? []).map(v => ({
      ...v,
      agencyName:    agency.name,
      agencyAddress: agency.address,
      agencyId:      agency.id,
    }))
  )

  const filtered = allVehicles.filter(v =>
    category === "all" || v.category === category
  )

  const days = (() => {
    if (!pickupDate || !returnDate) return null
    const d = (new Date(returnDate) - new Date(pickupDate)) / 86400000
    return d > 0 ? d : null
  })()

  const categories = ["all", ...new Set(allVehicles.map(v => v.category))]

  return (
    <>
      <Header />

      <Flex justify="center" alignItems="center" mt={10} px={4}>
        <Box width="full" maxW="1100px" bg="white" p={5}
          borderRadius="2xl" boxShadow="0 4px 24px rgba(0,0,0,0.08)">

          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "1.2fr 1fr 1fr auto" }}
            gap={4} align="flex-end">

            <LocationCombobox value={destination} onChange={setDestination} />

            <DateField label="Date de prise en charge" value={pickupDate}
              min={today} onChange={v => {
                setPickupDate(v)
                if (v >= returnDate) setReturnDate(v)
              }} />

            <DateField label="Date de retour" value={returnDate}
              min={pickupDate || today} onChange={setReturnDate} />

            <Button colorScheme="blue" h="42px" px={7} borderRadius="xl"
              fontWeight={700} fontSize="sm" alignSelf="flex-end"
              leftIcon={<FaSearch size={12} />}>
              Rechercher
            </Button>
          </Grid>

          {/* Duration pill */}
          {days && (
            <Flex align="center" gap={2} mt={3} pt={3}
              borderTop="1px solid" borderColor="gray.100">
              <Badge colorScheme="blue" borderRadius="full" px={2.5} py={0.5} fontSize="xs">
                {days} jour{days > 1 ? "s" : ""}
              </Badge>
              <Text fontSize="xs" color="gray.400">
                du {new Date(pickupDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                {" "}au {new Date(returnDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>

      {/* ── Category filter ── */}
      {!loading && allVehicles.length > 0 && (
        <Flex justify="center" px={4} mt={6}>
          <Flex gap={2} flexWrap="wrap" justify="center">
            {categories.map(cat => (
              <Box key={cat} as="button"
                px={4} py={2} borderRadius="xl" fontSize="sm" fontWeight={600}
                border="1.5px solid"
                borderColor={category === cat ? "blue.400" : "gray.200"}
                bg={category === cat ? "blue.50" : "white"}
                color={category === cat ? "blue.600" : "gray.500"}
                cursor="pointer" transition="all 0.15s"
                _hover={{ borderColor: "blue.300", bg: "blue.50" }}
                onClick={() => setCategory(cat)}>
                {cat === "all" ? "Tous" : (CATEGORY_LABELS[cat] ?? cat)}
              </Box>
            ))}
          </Flex>
        </Flex>
      )}

      {/* ── Vehicle listing ── */}
      <Box maxW="1200px" mx="auto" px={6} py={8}>

        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight={800} color="gray.800">
              Location de voitures
            </Text>
            {!loading && (
              <Text fontSize="sm" color="gray.500" mt={0.5}>
                {filtered.length} véhicule{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
              </Text>
            )}
          </Box>
        </Flex>

        {error && (
          <Flex direction="column" align="center" justify="center" py={20} gap={3}>
            <Text fontSize="2xl">😕</Text>
            <Text color="gray.500">{error}</Text>
            <Button size="sm" colorScheme="blue" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </Flex>
        )}

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CarCardSkeleton key={i} />)
            : filtered.map(v => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  agencyName={v.agencyName}
                  agencyAddress={v.agencyAddress}
                  pickupDate={pickupDate}
                  returnDate={returnDate}
                  navigate={navigate}
                />
              ))
          }
        </Grid>

        {!loading && !error && filtered.length === 0 && (
          <Flex direction="column" align="center" justify="center" py={20} gap={2}>
            <Text fontSize="3xl">🚗</Text>
            <Text fontWeight={600} color="gray.700">Aucun véhicule trouvé</Text>
            <Text fontSize="sm" color="gray.500">
              {category !== "all"
                ? "Essayez une autre catégorie."
                : "Aucun véhicule disponible pour le moment."}
            </Text>
          </Flex>
        )}
      </Box>
    </>
  )
}

export default HomeLocation