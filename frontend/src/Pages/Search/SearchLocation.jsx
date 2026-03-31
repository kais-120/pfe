import {
  Badge, Box, Button, CloseButton, Combobox, DatePicker,
  Dialog, Flex, Grid, HStack, Image, parseDate, Portal,
  Skeleton, SkeletonText, Text, useFilter, useListCollection, VStack,
} from "@chakra-ui/react"
import Header from "../../components/home/Header"
import { useEffect, useState } from "react"
import { Axios, imageURL } from "../../Api/Api"
import {
  FaChevronLeft, FaChevronRight, FaMapMarkerAlt,
  FaCar, FaSearch, FaGasPump, FaUsers,
  FaSnowflake, FaWifi, FaBluetooth, FaRoute,
} from "react-icons/fa"
import {
  LuCalendar, LuShieldCheck, LuSlidersHorizontal,
  LuX, LuCheck,
} from "react-icons/lu"
import { useNavigate, useSearchParams } from "react-router-dom"

const LOCATIONS = [
  { label: "Tunis", value: "tunis" }, { label: "Sfax", value: "sfax" },
  { label: "Sousse", value: "sousse" }, { label: "Nabeul", value: "nabeul" },
  { label: "Hammamet", value: "hammamet" }, { label: "Monastir", value: "monastir" },
  { label: "Djerba", value: "djerba" }, { label: "Tabarka", value: "tabarka" },
  { label: "Bizerte", value: "bizerte" }, { label: "Tozeur", value: "tozeur" },
]

const CATEGORY_LABELS = {
  economy: "Économique", sedan: "Berline",
  suv: "SUV", luxury: "Luxe",
  electric: "Électrique", utility: "Utilitaire",
}

const FUEL_LABELS = {
  petrol: "Essence", diesel: "Diesel",
  electric: "Électrique", hybrid: "Hybride",
}

const FEATURE_META = {
  AC: { Icon: FaSnowflake, label: "Clim" },
  GPS: { Icon: FaRoute, label: "GPS" },
  Bluetooth: { Icon: FaBluetooth, label: "Bluetooth" },
  WiFi: { Icon: FaWifi, label: "Wi-Fi" },
}

const PRICE_RANGES = [
  { label: "Moins de 100 TND/j", min: 0, max: 100 },
  { label: "100 – 200 TND/j", min: 100, max: 200 },
  { label: "200 – 400 TND/j", min: 200, max: 400 },
  { label: "Plus de 400 TND/j", min: 400, max: 99999 },
]

/* ── Location combobox ──────────────────────────────────────────── */
function LocationCombobox({ value, onChange }) {
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({ initialItems: LOCATIONS, filter: contains })
  return (
    <Box>
      <Text fontSize="10px" fontWeight={700} color="gray.400"
        textTransform="uppercase" letterSpacing="wider" mb={0.5}>
        Lieu de prise en charge
      </Text>
      <Combobox.Root width="full" collection={collection} inputValue={value}
        onInputValueChange={e => { filter(e.inputValue); onChange(e.inputValue) }}
        onValueChange={e => onChange(e.value[0] ?? "")}>
        <Combobox.Control>
          <Combobox.Input placeholder="Ville ou agence…"
            style={{
              width: "100%", border: "none", outline: "none",
              fontSize: "14px", fontWeight: "600",
              color: "var(--chakra-colors-gray-800)",
              background: "transparent", height: "40px",
            }} />
          <Combobox.IndicatorGroup style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
            <Combobox.ClearTrigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content style={{ zIndex: 9999 }}>
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

/* ── Inline date field ──────────────────────────────────────────── */
function DateField({ label, value, onChange, min }) {
  return (
    <Box>
      <Text fontSize="10px" fontWeight={700} color="gray.400"
        textTransform="uppercase" letterSpacing="wider" mb={0.5}>
        {label}
      </Text>
      <DatePicker.Root locale="fr-FR"
        min={parseDate(min)}
        value={value ? [parseDate(value)] : []}
        onValueChange={details => {
          const d = details.value?.[0]
          if (d) {
            const js = new Date(d.year, d.month - 1, d.day + 1)
            onChange(js.toISOString().split("T")[0])
          }
        }}>
        <DatePicker.Control h="40px" border="none" bg="white">
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
    </Box>
  )
}

/* ── Bordered date field (for dialog) ──────────────────────────── */
function DateFieldBordered({ label, value, onChange, min }) {
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>{label}</Text>
      <DatePicker.Root locale="fr-FR"
        min={parseDate(min)}
        value={value ? [parseDate(value)] : []}
        onValueChange={details => {
          const d = details.value?.[0]
          if (d) {
            const js = new Date(d.year, d.month - 1, d.day + 1)
            onChange(js.toISOString().split("T")[0])
          }
        }}>
        <DatePicker.Control px={3} h="42px"
          border="1px solid" borderColor="gray.200"
          borderRadius="lg" bg="gray.50"
          _focusWithin={{ borderColor: "blue.400", boxShadow: "0 0 0 2px rgba(49,130,206,0.12)" }}>
          <DatePicker.Input outline="none" border="none" bg="transparent"
            fontSize="sm" color="gray.700" />
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

function ImageSlider({ images }) {
  const [idx, setIdx] = useState(0)
  if (!images?.length) return (
    <Flex h="200px" borderRadius="xl" bg="gray.100" align="center" justify="center" color="gray.300">
      <FaCar size={36} />
    </Flex>
  )
  const prev = e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }
  const next = e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }
  return (
    <Box position="relative" h="200px" overflow="hidden" borderRadius="xl">
      <Image src={`${imageURL}/services/${images[idx].image_url}`}
        w="100%" h="100%" objectFit="cover" transition="opacity 0.3s" />
      {images.length > 1 && (
        <>
          <Button size="xs" position="absolute" left={2} top="50%" transform="translateY(-50%)"
            borderRadius="full" bg="blackAlpha.600" color="white" minW="26px" h="26px" p={0}
            _hover={{ bg: "blackAlpha.800" }} onClick={prev}><FaChevronLeft size={9} /></Button>
          <Button size="xs" position="absolute" right={2} top="50%" transform="translateY(-50%)"
            borderRadius="full" bg="blackAlpha.600" color="white" minW="26px" h="26px" p={0}
            _hover={{ bg: "blackAlpha.800" }} onClick={next}><FaChevronRight size={9} /></Button>
          <HStack position="absolute" bottom={2} left="50%" transform="translateX(-50%)" spacing={1}>
            {images.map((_, i) => (
              <Box key={i} w={i === idx ? "14px" : "5px"} h="5px" borderRadius="full"
                bg={i === idx ? "white" : "whiteAlpha.600"} transition="all 0.2s"
                cursor="pointer" onClick={e => { e.stopPropagation(); setIdx(i) }} />
            ))}
          </HStack>
        </>
      )}
    </Box>
  )
}

/* ── Feature tag ────────────────────────────────────────────────── */
function FeatureTag({ feat }) {
  const meta = FEATURE_META[feat]
  const Icon = meta?.Icon
  return (
    <Flex align="center" gap={1.5} px={2.5} py={1}
      bg="blue.50" color="blue.600" borderRadius="full" fontSize="xs" fontWeight={500}>
      {Icon && <Icon size={9} />}{meta?.label ?? feat}
    </Flex>
  )
}

/* ── Filter checkbox ────────────────────────────────────────────── */
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

/* ── Vehicle card ───────────────────────────────────────────────── */
function VehicleCard({ vehicle, agencyName, agencyAddress, pickupDate, returnDate, navigate }) {
  const days = (() => {
    if (!pickupDate || !returnDate) return null
    const d = (new Date(returnDate) - new Date(pickupDate)) / 86400000
    return d > 0 ? d : null
  })()
  const totalPrice = days ? (Number(vehicle.price_per_day) * days).toFixed(0) : null

  const [localPickup, setLocalPickup] = useState(pickupDate)
  const [localReturn, setLocalReturn] = useState(returnDate)
  const [checking, setChecking] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const today = new Date().toISOString().split("T")[0]

  const checkAndNavigate = async () => {
    if (!localPickup || !localReturn) { setErrorMsg("Choisissez les dates"); return }
    try {
      setChecking(true); setErrorMsg("")
      navigate(`/cars/${vehicle.id}`, {
        state: { pickupDate: localPickup, returnDate: localReturn }
      })
    } catch { setErrorMsg("Erreur serveur") }
    finally { setChecking(false) }
  }

  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.06)"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "translateY(-3px)", boxShadow: "0 8px 28px rgba(0,0,0,0.1)" }}>

      <Box p={4} pb={3}>
        <ImageSlider images={vehicle.images} vehicleId={vehicle.id} />
      </Box>

      <VStack align="stretch" px={4} pb={4} spacing={3}>
        <Box>
          <Text fontWeight={700} fontSize="md" color="gray.800" noOfLines={1}>
            {vehicle.brand} {vehicle.model}
            <Text as="span" fontSize="sm" color="gray.400" fontWeight={400} ml={1}>
              {vehicle.year}
            </Text>
          </Text>
          {vehicle.category && (
            <Badge colorScheme="blue" borderRadius="full" px={2} py={0.5} fontSize="xs" mt={1}>
              {CATEGORY_LABELS[vehicle.category] ?? vehicle.category}
            </Badge>
          )}
          <Flex align="center" gap={1.5} mt={1}>
            <Box color="gray.400"><FaMapMarkerAlt size={11} /></Box>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {agencyName} · {agencyAddress}
            </Text>
          </Flex>
        </Box>

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

        {vehicle.features?.length > 0 && (
          <Flex gap={1.5} flexWrap="wrap">
            {vehicle.features.slice(0, 3).map(f => <FeatureTag key={f} feat={f} />)}
          </Flex>
        )}

        {vehicle.description && (
          <Text fontSize="sm" color="gray.600" lineHeight="1.6" noOfLines={2}>
            {vehicle.description}
          </Text>
        )}

        {/* Price + reserve CTA */}
        <Flex align="center" justify="space-between"
          pt={3} borderTop="1px solid" borderColor="gray.50">
          <Box>
            <Text fontSize="9px" color="gray.400" textTransform="uppercase" letterSpacing="wide">
              {totalPrice ? `${days} jour${days > 1 ? "s" : ""} · total` : "À partir de"}
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
                ({Number(vehicle.price_per_day).toFixed(0)} TND × {days} j)
              </Text>
            )}
          </Box>

          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button colorScheme="blue" borderRadius="xl" fontWeight={700} size="sm" h="40px" px={5}>
                Réserver
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
                        fontWeight={700} onClick={checkAndNavigate}
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

/* ── Card skeleton ──────────────────────────────────────────────── */
function CarCardSkeleton() {
  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden" border="1px solid" borderColor="gray.100">
      <Box p={4}><Skeleton h="200px" borderRadius="xl" /></Box>
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


export default function SearchLocation() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]

  /* URL params */
  const initDest = searchParams.get("destination") ?? ""
  const initPickup = searchParams.get("pickup") ?? today
  const initReturn = searchParams.get("return") ?? tomorrow

  /* Search bar state */
  const [destination, setDestination] = useState(initDest)
  const [pickupDate, setPickupDate] = useState(initPickup)
  const [returnDate, setReturnDate] = useState(initReturn)

  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selCategory, setSelCategory] = useState("all")
  const [selFeats, setSelFeats] = useState([])
  const [selPrice, setSelPrice] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    ; (async () => {
      try {
        setLoading(true)
        const res = await Axios.post("/service/location/search/get",{
          pickupLocation:destination.toLowerCase(),
          pickupDate,
          returnDate
        })
        console.log(res.data.vehicles)
        setAgencies(res.data.vehicles ?? [])
      } catch {
        setError("Impossible de charger les véhicules.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

const allVehicles = agencies.map(v => ({
  ...v,
  agencyName: v.locationVehicle?.name,
  agencyAddress: v.locationVehicle?.zone,
  agencyId: v.locationVehicle?.id,
}))

  const days = (() => {
    if (!initPickup || !initReturn) return null
    const d = (new Date(initReturn) - new Date(initPickup)) / 86400000
    return d > 0 ? Math.round(d) : null
  })()

const categories = ["all", ...new Set(allVehicles.map(v => v.category).filter(Boolean))]

const filtered = allVehicles.filter(v => {
  const matchCat = selCategory === "all" || v.category === selCategory

  const matchDest = !initDest ||
    v.agencyName?.toLowerCase().includes(initDest.toLowerCase()) ||
    v.agencyAddress?.toLowerCase().includes(initDest.toLowerCase())

  const matchFeat = selFeats.length === 0 ||
    selFeats.every(f => v.features?.includes(f))

  const price = Number(v.price_per_day || 0)

  const matchPrice = !selPrice ||
    (price >= selPrice.min && price <= selPrice.max)

  return matchCat && matchDest && matchFeat && matchPrice
})

  const toggleFeat = key => setSelFeats(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])
  const activeCount = selFeats.length + (selPrice ? 1 : 0) + (selCategory !== "all" ? 1 : 0)
  const resetFilters = () => { setSelFeats([]); setSelPrice(null); setSelCategory("all") }

  const handleSearch = () => {
    navigate(
      `/search/location?destination=${destination}` +
      `&pickup=${pickupDate}` +
      `&return=${returnDate}`
    )
  }
console.log(filtered)
  const Filters = () => (
    <VStack align="stretch" spacing={6}>

      {/* Catégorie */}
      <Box>
        <Text fontSize="xs" fontWeight={700} color="gray.400"
          textTransform="uppercase" letterSpacing="wider" mb={3}>
          Catégorie
        </Text>
        <VStack align="stretch" spacing={0}>
          {categories.map(cat => (
            <FilterBox key={cat}
              label={cat === "all" ? "Tous" : (CATEGORY_LABELS[cat] ?? cat)}
              checked={selCategory === cat}
              onChange={() => setSelCategory(cat)} />
          ))}
        </VStack>
      </Box>

      {/* Équipements */}
      <Box>
        <Text fontSize="xs" fontWeight={700} color="gray.400"
          textTransform="uppercase" letterSpacing="wider" mb={3}>
          Équipements
        </Text>
        <VStack align="stretch" spacing={0}>
          {Object.entries(FEATURE_META).map(([key, { label }]) => (
            <FilterBox key={key} label={label}
              checked={selFeats.includes(key)}
              onChange={() => toggleFeat(key)} />
          ))}
        </VStack>
      </Box>

      {/* Prix par jour */}
      <Box>
        <Text fontSize="xs" fontWeight={700} color="gray.400"
          textTransform="uppercase" letterSpacing="wider" mb={3}>
          Prix / jour
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

            <Grid templateColumns={{ base: "1fr", md: "1.4fr 1fr 1fr auto" }} align="stretch">

              <Box px={4} py={2.5} borderRight="1px solid" borderColor="gray.150"
                borderLeftRadius="2xl">
                <LocationCombobox value={destination} onChange={setDestination} />
              </Box>

              <Box px={4} py={2.5} borderRight="1px solid" borderColor="gray.150">
                <DateField label="Prise en charge"
                  value={pickupDate} min={today}
                  onChange={v => { setPickupDate(v); if (v >= returnDate) setReturnDate(v) }} />
              </Box>

              <Box px={4} py={2.5} borderRight="1px solid" borderColor="gray.150">
                <DateField label="Retour"
                  value={returnDate} min={pickupDate || today}
                  onChange={setReturnDate} />
              </Box>

              <Flex as="button" align="center" justify="center"
                px={6} gap={2} minH="68px"
                bg="blue.600" color="white" fontWeight={700} fontSize="sm"
                borderRightRadius="2xl"
                transition="background 0.15s"
                _hover={destination ? { bg: "blue.700" } :{bg : "null"}}
                cursor={destination ? "pointer" : "no-drop"}
                opacity={!destination ? ".7" : "1"}
                onClick={destination ? handleSearch : null}>
                <FaSearch size={13} />Rechercher
              </Flex>
            </Grid>

            {/* Summary strip */}
            {(initDest || days) && (
              <Flex align="center" gap={3} px={5} py={2.5}
                borderTop="1px solid" borderColor="gray.100"
                bg="blue.50" borderBottomRadius="2xl" flexWrap="wrap">
                {initDest && (
                  <Flex align="center" gap={1.5}>
                    <FaMapMarkerAlt size={10} color="var(--chakra-colors-blue-500)" />
                    <Text fontSize="xs" color="blue.700" fontWeight={700}
                      textTransform="capitalize">{initDest}</Text>
                  </Flex>
                )}
                {days && (
                  <Badge colorScheme="blue" borderRadius="full" px={2} py={0.5} fontSize="xs">
                    {days} jour{days > 1 ? "s" : ""}
                  </Badge>
                )}
                {initPickup && initReturn && (
                  <Text fontSize="xs" color="gray.500">
                    du {new Date(initPickup).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                    {" "}au {new Date(initReturn).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                  </Text>
                )}
              </Flex>
            )}
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
              {loading ? "Chargement…"
                : `${filtered.length} véhicule${filtered.length !== 1 ? "s" : ""}`}
            </Text>
            <Button size="sm" variant="outline" borderRadius="xl"
              borderColor="gray.200" color="gray.600"
              onClick={() => setMobileOpen(o => !o)}>
              <Flex align="center" gap={2}>
                <LuSlidersHorizontal size={14} />Filtres
                {activeCount > 0 && (
                  <Badge colorScheme="blue" borderRadius="full">{activeCount}</Badge>
                )}
              </Flex>
            </Button>
          </Flex>

          {/* Mobile filter panel */}
          {mobileOpen && (
            <Box display={{ base: "block", lg: "none" }}
              bg="white" borderRadius="2xl" p={5} mb={5}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 4px 20px rgba(0,0,0,0.08)">
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight={700} color="gray.800">Filtres</Text>
                <Button size="xs" variant="ghost" color="gray.400"
                  onClick={() => setMobileOpen(false)}><LuX size={15} /></Button>
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
                        {filtered.length} véhicule{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
                      </Text>
                      {initDest && (
                        <Text fontSize="sm" color="gray.400" mt={0.5}>
                          à <Text as="span" fontWeight={600} color="gray.600"
                            textTransform="capitalize">{initDest}</Text>
                          {days && ` · ${days} jour${days > 1 ? "s" : ""}`}
                        </Text>
                      )}
                    </>
                  )}
                </Box>
              </Flex>

              {/* Active filter pills */}
              {activeCount > 0 && (
                <Flex gap={2} flexWrap="wrap" mb={4}>
                  {selFeats.map(k => (
                    <Flex key={k} align="center" gap={1.5}
                      bg="blue.50" color="blue.600" borderRadius="full"
                      px={3} py={1} fontSize="xs" fontWeight={600}
                      border="1px solid" borderColor="blue.200">
                      {FEATURE_META[k]?.label}
                      <Box as="button" onClick={() => toggleFeat(k)} ml={1}><LuX size={10} /></Box>
                    </Flex>
                  ))}
                  {selPrice && (
                    <Flex align="center" gap={1.5}
                      bg="purple.50" color="purple.600" borderRadius="full"
                      px={3} py={1} fontSize="xs" fontWeight={600}
                      border="1px solid" borderColor="purple.200">
                      {selPrice.label}
                      <Box as="button" onClick={() => setSelPrice(null)} ml={1}><LuX size={10} /></Box>
                    </Flex>
                  )}
                  {selCategory !== "all" && (
                    <Flex align="center" gap={1.5}
                      bg="green.50" color="green.600" borderRadius="full"
                      px={3} py={1} fontSize="xs" fontWeight={600}
                      border="1px solid" borderColor="green.200">
                      {CATEGORY_LABELS[selCategory] ?? selCategory}
                      <Box as="button" onClick={() => setSelCategory("all")} ml={1}><LuX size={10} /></Box>
                    </Flex>
                  )}
                </Flex>
              )}

              {/* Vehicle grid */}
              {loading ? (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={5}>
                  {Array.from({ length: 4 }).map((_, i) => <CarCardSkeleton key={i} />)}
                </Grid>
              ) : error && allVehicles.length === 0 ? (
                <Flex direction="column" align="center" py={20} gap={3}
                  bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                  <Text fontWeight={700} color="gray.600">Erreur de chargement</Text>
                  <Text fontSize="sm" color="gray.400">{error}</Text>
                  <Button size="sm" colorScheme="blue"
                    onClick={() => window.location.reload()}>Réessayer</Button>
                </Flex>
              ) : filtered.length === 0 ? (
                <Flex direction="column" align="center" py={20} gap={3}
                  bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                  <Text fontWeight={700} color="gray.600">Aucun véhicule trouvé</Text>
                  <Text fontSize="sm" color="gray.400">
                    {activeCount > 0 ? "Essayez de retirer certains filtres." : "Aucun véhicule disponible."}
                  </Text>
                  {activeCount > 0 && (
                    <Button size="sm" colorScheme="blue" variant="outline"
                      borderRadius="xl" onClick={resetFilters}>Réinitialiser les filtres</Button>
                  )}
                </Flex>
              ) : (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={5}>
                  {filtered.map(v => (
                    <VehicleCard key={v.id} vehicle={v}
                      agencyName={v.agencyName}
                      agencyAddress={v.agencyAddress}
                      pickupDate={initPickup}
                      returnDate={initReturn}
                      navigate={navigate} />
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