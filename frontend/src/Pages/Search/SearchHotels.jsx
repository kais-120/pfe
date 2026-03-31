import { useEffect, useState } from "react"
import {
  Box, Button, Flex, Grid, Text, Badge,
  Image, Skeleton, SkeletonText, VStack, HStack,
  Combobox, Portal, useFilter, useListCollection,
} from "@chakra-ui/react"
import {
  FaMapMarkerAlt, FaSearch, FaWifi,
  FaDumbbell, FaSwimmingPool, FaSpa, FaParking,
  FaChevronLeft, FaChevronRight,
} from "react-icons/fa"
import {
  LuSlidersHorizontal, LuX, LuUsers, LuCheck,
} from "react-icons/lu"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Axios, imageURL } from "../../Api/Api"
import DatePicker from "../../components/ui/DatePicker"
import RoomSelector from "../../components/ui/RoomSelector"
import Header from "../../components/home/Header"

/* ── Constants ──────────────────────────────────────────────────── */
const EQUIPMENT_LIST = [
  { key: "spa", label: "Spa & Bien-être", Icon: FaSpa },
  { key: "gym", label: "Salle de sport", Icon: FaDumbbell },
  { key: "piscine", label: "Piscine", Icon: FaSwimmingPool },
  { key: "wifi", label: "Wi-Fi gratuit", Icon: FaWifi },
  { key: "parking", label: "Parking", Icon: FaParking },
]

const LOCATIONS = [
  { label: "Nabeul", value: "nabeul" }, { label: "Korbous", value: "korbous" },
  { label: "Gammarth", value: "gammarth" }, { label: "Tunis", value: "tunis" },
  { label: "Djerba", value: "djerba" }, { label: "Monastir", value: "monastir" },
  { label: "Sousse", value: "sousse" }, { label: "Hammamet", value: "hammamet" },
  { label: "Mahdia", value: "mahdia" }, { label: "Tabarka", value: "tabarka" },
]

const PRICE_RANGES = [
  { label: "Moins de 100 TND", min: 0, max: 100 },
  { label: "100 – 200 TND", min: 100, max: 200 },
  { label: "200 – 400 TND", min: 200, max: 400 },
  { label: "Plus de 400 TND", min: 400, max: 99999 },
]

/* ── Destination combobox ───────────────────────────────────────── */
function DestCombobox({ value, onChange }) {
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({ initialItems: LOCATIONS, filter: contains })
  return (
    <Combobox.Root width="full" collection={collection}
      inputValue={value}
      onInputValueChange={e => { filter(e.inputValue); onChange(e.inputValue) }}
      onValueChange={e => onChange(e.value[0] ?? "")}>
      <Combobox.Control>
        <Combobox.Input placeholder="Destination…"
          style={{
            height: "40px", border: "none", outline: "none",
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
            <Combobox.Empty>Aucune destination</Combobox.Empty>
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

function ImageSlider({ images }) {
  const [idx, setIdx] = useState(0)
  if (!images?.length) return (
    <Flex h="200px" borderRadius="xl" bg="gray.100"
      align="center" justify="center">
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
    </Box>
  )
}

/* ── Equipment tag ──────────────────────────────────────────────── */
function EquipTag({ equipKey }) {
  const m = EQUIPMENT_LIST.find(e => e.key === equipKey)
  if (!m) return null
  return (
    <Flex align="center" gap={1.5} px={2.5} py={1}
      bg="blue.50" color="blue.600" borderRadius="full" fontSize="xs" fontWeight={500}>
      <m.Icon size={10} />{m.label}
    </Flex>
  )
}

/* ── Hotel card ─────────────────────────────────────────────────── */
function HotelCard({ hotel, nights,rooms,checkIn,checkOut }) {
  const navigate = useNavigate()
  const minPrice = hotel.rooms?.length
    ? Math.min(...hotel.rooms.map(r => r.price_by_day)) : null
  const total = minPrice && nights ? minPrice * nights : null
  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.06)"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "translateY(-3px)", boxShadow: "0 8px 28px rgba(0,0,0,0.1)" }}>
      <Box p={4} pb={3}>
        <ImageSlider images={hotel.imagesHotel} hotelId={hotel.id} />
      </Box>
      <VStack align="stretch" px={4} pb={4} spacing={3}>
        <Box>
          <Text fontWeight={700} fontSize="md" color="gray.800" noOfLines={1}>
            {hotel.name}
          </Text>
          <Flex align="center" gap={1.5} mt={1}>
            <Box color="gray.400"><FaMapMarkerAlt size={11} /></Box>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>{hotel.address}</Text>
          </Flex>
        </Box>
        <Text fontSize="sm" color="gray.600" lineHeight="1.6" noOfLines={2}>
          {(hotel.description ?? "").slice(0, 120)}…
        </Text>
        <Flex gap={1.5} flexWrap="wrap">
          {hotel.equipments?.slice(0, 3).map(eq => <EquipTag key={eq} equipKey={eq} />)}
          {hotel.equipments?.length > 3 && (
            <Box px={2} py={0.5} bg="gray.50" color="gray.400"
              borderRadius="full" fontSize="xs">
              +{hotel.equipments.length - 3}
            </Box>
          )}
        </Flex>
        <Flex align="center" justify="space-between"
          pt={3} borderTop="1px solid" borderColor="gray.50">
          <Box>
            {minPrice != null ? (
              <>
                <Text fontSize="xs" color="gray.400">
                  {total && nights
                    ? `${nights} nuit${nights > 1 ? "s" : ""} · total`
                    : "À partir de"}
                </Text>
                <Flex align="baseline" gap={1}>
                  <Text fontSize="xl" fontWeight={900} color="blue.600" lineHeight="1.2">
                    {total ?? minPrice}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    TND{!total ? " / nuit" : ""}
                  </Text>
                </Flex>
                {total && (
                  <Text fontSize="9px" color="gray.400">
                    ({minPrice} TND × {nights} nuit{nights > 1 ? "s" : ""})
                  </Text>
                )}
              </>
            ) : (
              <Text fontSize="xs" color="gray.400">Prix non disponible</Text>
            )}
          </Box>
          <Button colorScheme="blue" borderRadius="xl" size="sm"
            fontWeight={600} px={5}
            onClick={() => navigate(`/hotel/${hotel.id}`,{state:{checkIn,checkOut,rooms}})}>
            Voir l'hôtel
          </Button>
        </Flex>
      </VStack>
    </Box>
  )
}

function CardSkeleton() {
  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100">
      <Box p={4}><Skeleton h="200px" borderRadius="xl" /></Box>
      <VStack align="stretch" px={4} pb={4} spacing={3}>
        <SkeletonText noOfLines={2} spacing={2} />
        <SkeletonText noOfLines={2} spacing={2} />
        <Flex gap={2}>
          <Skeleton h="22px" w="70px" borderRadius="full" />
          <Skeleton h="22px" w="60px" borderRadius="full" />
        </Flex>
        <Skeleton h="36px" borderRadius="xl" />
      </VStack>
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

export default function SearchHotels() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const initDest = searchParams.get("destination") ?? ""
  const initCheckIn = searchParams.get("checkIn") ?? ""
  const initCheckOut = searchParams.get("checkOut") ?? ""
  const initAdults = Number(searchParams.get("numberAdult") ?? 2)
  const initChildren = Number(searchParams.get("numberChildren") ?? 0)
  const initRooms = Number(searchParams.get("numberRoom") ?? 1)

  const [destination, setDestination] = useState(initDest)
  const [checkIn, setCheckIn] = useState(initCheckIn)
  const [checkOut, setCheckOut] = useState(initCheckOut)
  const [room, setRoom] = useState(
  Array.from({ length: initRooms }, () => ({
    adults: initAdults,
    children: initChildren
  }))
)


  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selEquip, setSelEquip] = useState([])
  const [selPrice, setSelPrice] = useState(null)
  const [mobileFilter, setMobileFilter] = useState(false)

  const nights = (() => {
    if (!initCheckIn || !initCheckOut) return null
    const d = (new Date(initCheckOut) - new Date(initCheckIn)) / 86400000
    return d > 0 ? Math.round(d) : null
  })()
const formatDate = (d) => new Date(d).toISOString().split('T')[0]

  useEffect(() => {
    ; (async () => {
      try {
        setLoading(true)
        const res = await Axios.post("/service/get/hotels/search", {
          destination: initDest,
          checkIn:formatDate(initCheckIn),
          checkOut: formatDate(initCheckOut),
          rooms:room
        })
        setHotels(res.data.hotels ?? res.data.hotel ?? [])
      } catch {
        setError("Aucun résultat. Essayez d'autres critères.")
      } finally {
        setLoading(false)
      }
    })()
  }, [searchParams.toString()])

  const handleSearch = () => {
    if (!destination) return
    const numberRoom = room?.rooms ?? initRooms
    const numberAdult = room?.adults ?? initAdults
    const numberChildren = room?.children ?? initChildren
    navigate(
      `/search"hotel?destination=${destination}` +
      `&checkIn=${checkIn ?? ""}` +
      `&checkOut=${checkOut ?? ""}` +
      `&numberAdult=${numberAdult}` +
      `&numberChildren=${numberChildren}` +
      `&numberRoom=${numberRoom}`
    )
  }

  const filtered = hotels.filter(h => {
    const matchEquip = selEquip.length === 0 ||
      selEquip.every(e => h.equipments?.includes(e))
    const minP = h.rooms?.length
      ? Math.min(...h.rooms.map(r => r.price_by_day)) : null
    const matchPrice = !selPrice || (minP !== null && minP >= selPrice.min && minP <= selPrice.max)
    return matchEquip && matchPrice
  })

  const toggleEquip = key => setSelEquip(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])
  const activeCount = selEquip.length + (selPrice ? 1 : 0)
  const resetFilters = () => { setSelEquip([]); setSelPrice(null) }

  /* ── Sidebar filter content ── */
  const Filters = () => (
    <VStack align="stretch" spacing={6}>

      <Box>
        <Text fontSize="xs" fontWeight={700} color="gray.400"
          textTransform="uppercase" letterSpacing="wider" mb={3}>
          Équipements
        </Text>
        <VStack align="stretch" spacing={0}>
          {EQUIPMENT_LIST.map(({ key, label }) => (
            <FilterBox key={key} label={label}
              checked={selEquip.includes(key)}
              onChange={() => toggleEquip(key)} />
          ))}
        </VStack>
      </Box>

      <Box>
        <Text fontSize="xs" fontWeight={700} color="gray.400"
          textTransform="uppercase" letterSpacing="wider" mb={3}>
          Prix / nuit
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

      <Box>
        <Text fontSize="xs" fontWeight={700} color="gray.400"
          textTransform="uppercase" letterSpacing="wider" mb={3}>
          Classement
        </Text>
        <Flex gap={2} flexWrap="wrap">
          {[3, 4, 5].map(stars => (
            <Box key={stars} as="button" type="button"
              px={3} py={1.5} borderRadius="full"
              border="1.5px solid" borderColor="gray.200"
              bg="white" color="gray.600" fontSize="xs" fontWeight={600}
              cursor="pointer" transition="all 0.15s"
              _hover={{ borderColor: "yellow.400", bg: "yellow.50", color: "yellow.700" }}>
              {"★".repeat(stars)}
            </Box>
          ))}
        </Flex>
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
                <Text fontSize="10px" fontWeight={700} color="gray.400"
                  textTransform="uppercase" letterSpacing="wider" mb={0.5}>
                  Destination
                </Text>
                <DestCombobox value={destination} onChange={setDestination} />
              </Box>

              <Box px={4} py={2.5} borderRight="1px solid" borderColor="gray.150">
                <Text fontSize="10px" fontWeight={700} color="gray.400"
                  textTransform="uppercase" letterSpacing="wider" mb={1}>
                  Dates de séjour
                </Text>
                <DatePicker checkIn={checkIn} checkOut={checkOut} setCheckIn={setCheckIn} setCheckOut={setCheckOut} />
              </Box>

              <Box px={4} py={2.5} borderRight="1px solid" borderColor="gray.150">
                <Text fontSize="10px" fontWeight={700} color="gray.400"
                  textTransform="uppercase" letterSpacing="wider" mb={1}>
                  Chambres & voyageurs
                </Text>
                <RoomSelector room={setRoom} />
              </Box>

              <Flex as="button" align="center" justify="center"
                px={6} gap={2} minH="68px"
                bg="blue.600" color="white" fontWeight={700} fontSize="sm"
                borderRightRadius="2xl"
                cursor={!destination ? "not-allowed" : "pointer"}
                opacity={!destination ? 0.6 : 1}
                transition="background 0.15s"
                _hover={destination ? { bg: "blue.700" } : {}}
                onClick={handleSearch}>
                <FaSearch size={14} />Rechercher
              </Flex>
            </Grid>

            {/* Summary strip */}
            {(initDest || nights || initAdults) && (
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
                {nights && (
                  <Badge colorScheme="blue" borderRadius="full" px={2} py={0.5} fontSize="xs">
                    {nights} nuit{nights > 1 ? "s" : ""}
                  </Badge>
                )}
                <Flex align="center" gap={1.5} fontSize="xs" color="gray.500">
                  <LuUsers size={11} />
                  {initAdults} adulte{initAdults > 1 ? "s" : ""}
                  {initChildren > 0 && `, ${initChildren} enfant${initChildren > 1 ? "s" : ""}`}
                  {" · "}{initRooms} chambre{initRooms > 1 ? "s" : ""}
                </Flex>
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
              {loading ? "Recherche en cours…"
                : `${filtered.length} hôtel${filtered.length !== 1 ? "s" : ""} trouvé${filtered.length !== 1 ? "s" : ""}`}
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

            {/* ── Left sidebar ── */}
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
              {/* Count + active filter pills */}
              <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
                <Box>
                  {loading ? (
                    <Skeleton h="20px" w="200px" borderRadius="md" />
                  ) : (
                    <>
                      <Text fontSize="lg" fontWeight={800} color="gray.900">
                        {filtered.length} hôtel{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
                      </Text>
                      {initDest && (
                        <Text fontSize="sm" color="gray.400" mt={0.5}>
                          à <Text as="span" fontWeight={600} color="gray.600"
                            textTransform="capitalize">{initDest}</Text>
                          {nights && ` · ${nights} nuit${nights > 1 ? "s" : ""}`}
                        </Text>
                      )}
                    </>
                  )}
                </Box>
              </Flex>

              {/* Active filter pills row */}
              {activeCount > 0 && (
                <Flex gap={2} flexWrap="wrap" mb={4}>
                  {selEquip.map(key => {
                    const m = EQUIPMENT_LIST.find(e => e.key === key)
                    return (
                      <Flex key={key} align="center" gap={1.5}
                        bg="blue.50" color="blue.600" borderRadius="full"
                        px={3} py={1} fontSize="xs" fontWeight={600}
                        border="1px solid" borderColor="blue.200">
                        {m?.label}
                        <Box as="button" onClick={() => toggleEquip(key)} ml={1}>
                          <LuX size={10} />
                        </Box>
                      </Flex>
                    )
                  })}
                  {selPrice && (
                    <Flex align="center" gap={1.5}
                      bg="purple.50" color="purple.600" borderRadius="full"
                      px={3} py={1} fontSize="xs" fontWeight={600}
                      border="1px solid" borderColor="purple.200">
                      {selPrice.label}
                      <Box as="button" onClick={() => setSelPrice(null)} ml={1}>
                        <LuX size={10} />
                      </Box>
                    </Flex>
                  )}
                </Flex>
              )}

              {/* Grid */}
              {loading ? (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={5}>
                  {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
                </Grid>
              ) : error && hotels.length === 0 ? (
                <Flex direction="column" align="center" py={20} gap={3}
                  bg="white" borderRadius="2xl"
                  border="1px dashed" borderColor="gray.200">
                  <Text fontWeight={700} color="gray.600">Aucun hôtel trouvé</Text>
                  <Text fontSize="sm" color="gray.400">{error}</Text>
                </Flex>
              ) : filtered.length === 0 ? (
                <Flex direction="column" align="center" py={20} gap={3}
                  bg="white" borderRadius="2xl"
                  border="1px dashed" borderColor="gray.200">
                  <Text fontSize="4xl">🔍</Text>
                  <Text fontWeight={700} color="gray.600">Aucun résultat avec ces filtres</Text>
                  <Text fontSize="sm" color="gray.400">Essayez de retirer certains filtres.</Text>
                  <Button size="sm" colorScheme="blue" variant="outline"
                    borderRadius="xl" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                </Flex>
              ) : (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={5}>
                  {filtered.map(hotel => (
                    <HotelCard key={hotel.id} hotel={hotel} nights={nights} rooms={room} checkIn={initCheckIn} checkOut={initCheckOut} />
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