import {
  Badge, Box, Button, CloseButton, Combobox, DatePicker, Dialog, Flex, Grid,
  HStack, Image, parseDate, Portal, Skeleton, SkeletonText,
  Text, useFilter, useListCollection, VStack,
} from "@chakra-ui/react"
import Header from "./components/home/Header"
import { useEffect, useState } from "react"
import { Axios, imageURL } from "./Api/Api"
import {
  FaChevronLeft, FaChevronRight, FaMapMarkerAlt,
  FaCar, FaSearch, FaGasPump, FaUsers, FaStar,
  FaSnowflake, FaWifi, FaBluetooth, FaRoute, FaChevronRight as FaArrow,
} from "react-icons/fa"
import { LuCalendar, LuShieldCheck, LuArrowLeftRight, LuMapPin } from "react-icons/lu"
import { useNavigate } from "react-router-dom"
import FooterPage from "./components/home/Footer"

const LOCATIONS = [
  { label: "Tunis", value: "tunis" },
  { label: "Sfax", value: "sfax" },
  { label: "Sousse", value: "sousse" },
  { label: "Nabeul", value: "nabeul" },
  { label: "Hammamet", value: "hammamet" },
  { label: "Monastir", value: "monastir" },
  { label: "Djerba", value: "djerba" },
  { label: "Tabarka", value: "tabarka" },
  { label: "Bizerte", value: "bizerte" },
  { label: "Tozeur", value: "tozeur" },
]

const CATEGORY_LABELS = {
  economy: "Économique",
  sedan: "Berline",
  suv: "SUV",
  luxury: "Luxe",
  electric: "Électrique",
  utility: "Utilitaire",
}

const FUEL_LABELS = {
  petrol: "Essence",
  diesel: "Diesel",
  electric: "Électrique",
  hybrid: "Hybride",
}

const FEATURE_META = {
  AC: { Icon: FaSnowflake, label: "Clim" },
  GPS: { Icon: FaRoute, label: "GPS" },
  Bluetooth: { Icon: FaBluetooth, label: "Bluetooth" },
  WiFi: { Icon: FaWifi, label: "Wi-Fi" },
}

/* ── Location combobox ──────────────────────────────────────────── */
function LocationCombobox({ value, onChange }) {
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({ initialItems: LOCATIONS, filter: contains })

  return (
    <Box>
      <Text fontSize="xs" fontWeight={700} color="gray.500" mb={0.5}>
        Lieu de prise en charge
      </Text>
      <Combobox.Root
        width="full" collection={collection} inputValue={value}
        onInputValueChange={e => { filter(e.inputValue); onChange(e.inputValue) }}
        onValueChange={e => onChange(e.value[0] ?? "")}>
        <Combobox.Control>
          <Combobox.Input
            placeholder="Ville ou lieu..."
            style={{
              width: "100%", border: "none", outline: "none",
              fontSize: "15px", fontWeight: "600",
              color: "var(--chakra-colors-gray-800)",
              background: "transparent", height: "32px",
            }}
          />
          <Combobox.IndicatorGroup style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
            <Combobox.ClearTrigger />
            <Combobox.Trigger />
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
      {label && (
        <Text fontSize="xs" fontWeight={700} color="gray.500" mb={0.5}>
          {label}
        </Text>
      )}
      <DatePicker.Root
        locale="fr-FR"
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
        <DatePicker.Control h="32px" border="none" bg="white">
          <DatePicker.Input
            p={0}
            outline="none" border="none" bg="transparent"
            fontSize="14px" fontWeight="600" color="gray.800"
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
                <DatePicker.Header /><DatePicker.DayTable />
              </DatePicker.View>
              <DatePicker.View view="month">
                <DatePicker.Header /><DatePicker.MonthTable />
              </DatePicker.View>
              <DatePicker.View view="year">
                <DatePicker.Header /><DatePicker.YearTable />
              </DatePicker.View>
            </DatePicker.Content>
          </DatePicker.Positioner>
        </Portal>
      </DatePicker.Root>
    </Box>
  )
}

/* ── DateField (dialog — bordered) ─────────────────────────────── */
function DateFieldBordered({ label, value, onChange, min }) {
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>{label}</Text>
      <DatePicker.Root
        locale="fr-FR"
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
          px={3} h="42px"
          border="1px solid" borderColor="gray.200"
          borderRadius="lg" bg="gray.50"
          _focusWithin={{ borderColor: "blue.400", boxShadow: "0 0 0 2px rgba(49,130,206,0.12)" }}
        >
          <DatePicker.Input outline="none" border="none" bg="transparent" fontSize="sm" color="gray.700" />
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
          <HStack position="absolute" bottom={2} left="50%"
            transform="translateX(-50%)" spacing={1}>
            {images.map((_, i) => (
              <Box key={i} w={i === idx ? "14px" : "5px"} h="5px" borderRadius="full"
                bg={i === idx ? "white" : "whiteAlpha.600"} transition="all 0.2s"
                cursor="pointer" onClick={e => { e.stopPropagation(); setIdx(i) }} />
            ))}
          </HStack>
        </>
      )}
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
  const Icon = meta?.Icon
  return (
    <Flex align="center" gap={1.5} px={2.5} py={1}
      bg="blue.50" color="blue.600" borderRadius="full"
      fontSize="xs" fontWeight={500}>
      {Icon && <Icon size={9} />}
      {meta?.label ?? feat}
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

  const [localPickup, setLocalPickup] = useState(pickupDate)
  const [localReturn, setLocalReturn] = useState(returnDate)
  const [checking, setChecking] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const today = new Date().toISOString().split("T")[0]

  const checkAvailability = async () => {
    if (!localPickup || !localReturn) { setErrorMsg("Choisissez les dates"); return }
    try {
      setChecking(true); setErrorMsg("")
      const res = await Axios.post("/service/check-availability", {
        vehicle_id: vehicle.id, start_date: localPickup, end_date: localReturn,
      })
      if (res.data.available) {
        navigate(`/location/car/${vehicle.id}`, { state: { pickupDate: localPickup, returnDate: localReturn } })
      } else {
        setErrorMsg("Non disponible pour ces dates")
      }
    } catch { setErrorMsg("Erreur serveur") }
    finally { setChecking(false) }
  }

  return (
    <Box bg="white" borderRadius="2xl"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.06)"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "translateY(-3px)", boxShadow: "0 8px 28px rgba(0,0,0,0.1)" }}
      overflow="hidden">

      {/* Image */}
      <Box p={4} pb={3}>
        <ImageSlider images={vehicle.images} vehicleId={vehicle.id} />
      </Box>

      <VStack align="stretch" px={4} pb={4} spacing={3}>

        {/* Name + agency */}
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

        {/* Specs */}
        <Flex gap={3} flexWrap="wrap">
          <Flex align="center" gap={1.5} fontSize="xs" color="gray.500">
            <FaUsers size={11} />{vehicle.seats} places
          </Flex>
          <Flex align="center" gap={1.5} fontSize="xs" color="gray.500">
            <FaGasPump size={11} />{FUEL_LABELS[vehicle.fuel] ?? vehicle.fuel}
          </Flex>
          <Flex align="center" gap={1.5} fontSize="xs" color="gray.500">
            <LuShieldCheck size={11} />{vehicle.min_age}+ ans
          </Flex>
        </Flex>

        {/* Features */}
        {vehicle.features?.length > 0 && (
          <Flex gap={1.5} flexWrap="wrap">
            {vehicle.features.slice(0, 4).map(f => <FeatureTag key={f} feat={f} />)}
          </Flex>
        )}

        {/* Description */}
        {vehicle.description && (
          <Text fontSize="sm" color="gray.600" lineHeight="1.6" noOfLines={2}>
            {vehicle.description}
          </Text>
        )}

        <Flex align="center" justify="space-between" gap={3}>
          <Box>
            <Text fontSize="9px" color="gray.400" textTransform="uppercase" letterSpacing="wide">
              {totalPrice ? `${nights} jour${nights > 1 ? "s" : ""} · total` : "À partir de"}
            </Text>
            <Flex align="baseline" gap={1}>
              <Text fontSize="xl" fontWeight={900} color="blue.600" lineHeight={1}>
                {totalPrice ?? Number(vehicle.price_per_day).toFixed(0)}
              </Text>
              <Text fontSize="xs" fontWeight={600} color="blue.400">
                TND{!totalPrice ? " / jour" : ""}
              </Text>
            </Flex>
            {totalPrice && (
              <Text fontSize="9px" color="gray.400">
                ({Number(vehicle.price_per_day).toFixed(0)} TND/jour)
              </Text>
            )}
          </Box>

          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button colorScheme="blue" borderRadius="xl" fontWeight={700} size="sm" h="40px" px={5}>
                Réserver
                <FaChevronRight size={10} />
              </Button>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content borderRadius="2xl" maxW="380px">
                  <Dialog.Header borderBottom="1px solid" borderColor="gray.100" pb={4}>
                    <Flex align="center" gap={3}>
                      <Flex w="36px" h="36px" borderRadius="xl" bg="blue.50"
                        color="blue.500" align="center" justify="center" flexShrink={0}>
                        <FaCar size={15} />
                      </Flex>
                      <Box>
                        <Dialog.Title fontSize="md" fontWeight={700} color="gray.900">
                          {vehicle.brand} {vehicle.model}
                        </Dialog.Title>
                        <Text fontSize="xs" color="gray.500" mt={0.5}>
                          {Number(vehicle.price_per_day).toFixed(0)} TND / jour
                        </Text>
                      </Box>
                    </Flex>
                    <Dialog.CloseTrigger asChild>
                      <CloseButton size="sm" position="absolute" top={3} right={3} />
                    </Dialog.CloseTrigger>
                  </Dialog.Header>
                  <Dialog.Body px={5} py={5}>
                    <VStack spacing={4} align="stretch">
                      <DateFieldBordered label="Date de début"
                        value={localPickup} onChange={setLocalPickup} min={today} />
                      <DateFieldBordered label="Date de fin"
                        value={localReturn} onChange={setLocalReturn} min={localPickup || today} />

                      {/* Live total in dialog */}
                      {localPickup && localReturn && (() => {
                        const d = Math.round((new Date(localReturn) - new Date(localPickup)) / 86400000)
                        return d > 0 ? (
                          <Flex align="center" justify="space-between"
                            bg="blue.50" borderRadius="xl" px={4} py={3}
                            border="1px solid" borderColor="blue.100">
                            <Text fontSize="sm" color="gray.500">
                              {Number(vehicle.price_per_day).toFixed(0)} TND × {d} jour{d > 1 ? "s" : ""}
                            </Text>
                            <Flex align="baseline" gap={1}>
                              <Text fontSize="lg" fontWeight={900} color="blue.600">
                                {(Number(vehicle.price_per_day) * d).toFixed(0)}
                              </Text>
                              <Text fontSize="xs" color="blue.400">TND</Text>
                            </Flex>
                          </Flex>
                        ) : null
                      })()}

                      {errorMsg && <Text fontSize="sm" color="red.500">{errorMsg}</Text>}

                      <Button colorScheme="blue" h="46px" borderRadius="xl"
                        fontWeight={700} onClick={checkAvailability}
                        loading={checking} loadingText="Vérification…">
                        Voir les détails et réserver
                      </Button>
                    </VStack>
                  </Dialog.Body>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>

        </Flex>
      </VStack>
    </Box>
  )
}

function CarCardSkeleton() {
  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100">
      <Box p={4} pb={3}><Skeleton height="200px" borderRadius="xl" /></Box>
      <VStack align="stretch" px={4} pb={4} spacing={3}>
        <SkeletonText noOfLines={2} spacing={2} />
        <Flex gap={2}>
          {[1, 2, 3].map(i => <Skeleton key={i} h="20px" w="60px" borderRadius="full" />)}
        </Flex>
        <Skeleton h="36px" borderRadius="xl" />
      </VStack>
    </Box>
  )
}

const HomeLocation = () => {
  useEffect(() => { localStorage.removeItem("searchData") }, [])

  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]

  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [destination, setDestination] = useState("")
  const [pickupDate, setPickupDate] = useState(today)
  const [returnDate, setReturnDate] = useState(tomorrow)
  const [category, setCategory] = useState("all")

  const navigate = useNavigate()

  useEffect(() => {
    ; (async () => {
      try {
        setLoading(true)
        const res = await Axios.get("/service/location/public/get")
        setAgencies(res.data.data ?? [])
      } catch {
        setError("Impossible de charger les véhicules. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const allVehicles = agencies.flatMap(agency =>
    (agency.vehicles ?? []).map(v => ({
      ...v,
      agencyName: agency.name,
      agencyAddress: agency.address,
      agencyId: agency.id,
    }))
  )

  const filtered = allVehicles.filter(v => {
    const matchCat = category === "all" || v.category === category
    const matchDest = !destination ||
      v.agencyName?.toLowerCase().includes(destination.toLowerCase()) ||
      v.agencyAddress?.toLowerCase().includes(destination.toLowerCase())
    return matchCat && matchDest
  })

  const days = (() => {
    if (!pickupDate || !returnDate) return null
    const d = (new Date(returnDate) - new Date(pickupDate)) / 86400000
    return d > 0 ? d : null
  })()

  const categories = ["all", ...new Set(allVehicles.map(v => v.category))]

  return (
    <>
      <Header />

      {/* ── Hero with search bar ── */}
      <Box
        bg="linear-gradient(160deg, #0D1B3E 0%, #1A3260 50%, #0D1B3E 100%)"
        pt={12} pb={8} px={4}>

        <Box maxW="1100px" mx="auto">

          {/* Title */}
          <Box textAlign="center" mb={7}>
            <Flex align="center" justify="center" gap={2} mb={3}>
              <Box color="blue.200"><FaCar size={14} /></Box>
              <Text fontSize="xs" fontWeight={700} color="blue.200"
                textTransform="uppercase" letterSpacing="widest">
                Location de voitures
              </Text>
            </Flex>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight={900}
              color="white" letterSpacing="-0.5px">
              Trouvez votre véhicule idéal
            </Text>
            <Text fontSize="sm" color="blue.200" mt={1}>
              {allVehicles.length} véhicule{allVehicles.length !== 1 ? "s" : ""} ·{" "}
              {agencies.length} agence{agencies.length !== 1 ? "s" : ""}
            </Text>
          </Box>

          {/* Search bar — same structure as HomeAirline */}
          <Box bg="white" borderRadius="2xl"
            boxShadow="0 8px 40px rgba(0,0,0,0.25)"
            overflow="hidden">

            <Grid
              templateColumns={{ base: "1fr", md: "1.4fr 1fr 1fr auto" }}
              align="stretch">

              {/* Destination */}
              <Box px={4} py={3} position="relative"
                borderRight="1px solid" borderColor="gray.150">
                <LocationCombobox value={destination} onChange={setDestination} />
              </Box>

              {/* Pickup date */}
              <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150">
                <DateField
                  label="Prise en charge"
                  min={today}
                  value={pickupDate}
                  onChange={v => { setPickupDate(v); if (v >= returnDate) setReturnDate(v) }}
                />
              </Box>

              {/* Return date */}
              <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150">
                <DateField
                  label="Retour"
                  min={pickupDate || today}
                  value={returnDate}
                  onChange={setReturnDate}
                />
              </Box>

              {/* Search CTA */}
              <Flex
                as="button"
                align="center" justify="center"
                px={6}
                bg="blue.600" color="white"
                fontWeight={700} fontSize="sm"
                cursor="pointer" transition="background 0.15s"
                _hover={{ bg: "blue.700" }}>
                Rechercher
              </Flex>
            </Grid>

            {/* Duration pill row */}
            {days && (
              <Flex px={5} py={3} gap={6}
                borderTop="1px solid" borderColor="gray.100"
                bg="gray.50" align="center">
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

          {/* Category filter pills — same style as status pills in HomeAirline */}
          {!loading && allVehicles.length > 0 && (
            <Flex gap={2} mt={5} flexWrap="wrap" justify="center">
              {categories.map(cat => (
                <Box key={cat} as="button"
                  px={3} py={1} borderRadius="full"
                  fontSize="xs" fontWeight={600}
                  bg={category === cat ? "white" : "whiteAlpha.100"}
                  color={category === cat ? "blue.700" : "white"}
                  border="1.5px solid"
                  borderColor={category === cat ? "white" : "whiteAlpha.300"}
                  cursor="pointer" transition="all 0.15s"
                  onClick={() => setCategory(cat)}>
                  {cat === "all" ? "Tous les véhicules" : (CATEGORY_LABELS[cat] ?? cat)}
                </Box>
              ))}
            </Flex>
          )}

        </Box>
      </Box>

      {/* ── Vehicle grid ── */}
      <Box bg="#f5f6fa" minH="60vh">
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={8}>

          {!loading && (
            <Text fontSize="sm" color="gray.500" mb={6}>
              {filtered.length} véhicule{filtered.length !== 1 ? "s" : ""}
              {destination ? ` · ${destination}` : ""}
              {category !== "all" ? ` · ${CATEGORY_LABELS[category] ?? category}` : ""}
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
            <Flex direction="column" align="center" py={20} gap={3}>
              <Text fontSize="3xl">🚗</Text>
              <Text fontWeight={600} color="gray.700">Aucun véhicule trouvé</Text>
              <Text fontSize="sm" color="gray.400">
                {category !== "all" || destination
                  ? "Essayez d'autres filtres."
                  : "Aucun véhicule disponible pour le moment."}
              </Text>
              {(category !== "all" || destination) && (
                <Button size="sm" colorScheme="blue" variant="outline"
                  borderRadius="xl"
                  onClick={() => { setCategory("all"); setDestination("") }}>
                  Réinitialiser
                </Button>
              )}
            </Flex>
          )}

        </Box>
      </Box>
      <FooterPage />
    </>
  )
}

export default HomeLocation