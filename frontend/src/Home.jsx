import { Badge, Box, Button, Combobox, DatePicker, Flex, Grid, HStack, Image, parseDate, Portal, Skeleton, SkeletonText, Text, useFilter, useListCollection, VStack } from "@chakra-ui/react"
import Header from "./components/home/Header"
import { useColorMode } from "./components/ui/color-mode"
import { useEffect, useState } from "react"
// import DatePicker from "./components/ui/DatePicker"
import RoomSelector from "./components/ui/RoomSelector"
import { Axios, imageURL } from "./Api/Api"
import { FaChevronLeft, FaChevronRight, FaDumbbell, FaMapMarkerAlt, FaParking, FaSearch, FaSpa, FaStar, FaSwimmingPool, FaWifi } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { LuCalendar } from "react-icons/lu"


const EQUIPMENT_LIST = [
  { key: "spa", label: "Spa", Icon: FaSpa },
  { key: "gym", label: "Gym", Icon: FaDumbbell },
  { key: "piscine", label: "Piscine", Icon: FaSwimmingPool },
  { key: "wifi", label: "Wi-Fi", Icon: FaWifi },
  { key: "parking", label: "Parking", Icon: FaParking },
]

const LOCATIONS = [
  { label: "Nabeul", value: "nabeul" },
  { label: "Korbous", value: "korbous" },
  { label: "Gammarth", value: "gammarth" },
  { label: "Tunis", value: "tunis" },
  { label: "Korba", value: "korba" },
  { label: "Kelibia", value: "kelibia" },
  { label: "Djerba", value: "djerba" },
  { label: "Monastir", value: "monastir" },
  { label: "Mahdia", value: "mahdia" },
  { label: "Sousse", value: "sousse" },
  { label: "Tabarka", value: "tabarka" },
  { label: "Hammamet", value: "hammamet" },
]


/* ── Location combobox (same style as SearchHotels) ─────────────── */
function LocationCombobox({ value, onChange }) {
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({
    initialItems: LOCATIONS,
    filter: contains,
  })
  return (
    <Box flex={1} minW="180px">
      <Combobox.Root
        width="full"
        collection={collection}
        inputValue={value}
        onInputValueChange={(e) => { filter(e.inputValue); onChange(e.inputValue) }}
        onValueChange={(e) => onChange(e.value[0] ?? "")}
      >
        <Combobox.Control>
          <Combobox.Input
            placeholder="Où allez-vous ?"
            style={{
              width: "100%", border: "none", outline: "none",
              fontSize: "15px", fontWeight: "600",
              color: "var(--chakra-colors-gray-800)",
              background: "transparent", height: "32px",
            }}
          />
          <Combobox.IndicatorGroup style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}>
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.Empty>Aucune destination trouvée</Combobox.Empty>
              {collection.items.map((item) => (
                <Combobox.Item item={item} key={item.value}>
                  {item.label}
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
    </Box>
  )
}


function ImageSlider({ images, hotelId }) {
  const [idx, setIdx] = useState(0)

  if (!images?.length) return <Skeleton height="220px" borderRadius="xl" />

  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }

  return (
    <Box position="relative" height="220px" overflow="hidden" borderRadius="xl">
      <Image
        src={`${imageURL}/services/${images[idx].image_url}`}
        alt={`hotel-${hotelId}-${idx}`}
        w="100%" h="100%"
        objectFit="cover"
        transition="opacity 0.3s"
      />
      {images.length > 1 && (
        <>
          <Button
            size="xs" position="absolute" left={2} top="50%"
            transform="translateY(-50%)" borderRadius="full"
            bg="blackAlpha.600" color="white"
            minW="28px" h="28px" p={0} _hover={{ bg: "blackAlpha.800" }}
            onClick={prev}
          ><FaChevronLeft size={10} /></Button>
          <Button
            size="xs" position="absolute" right={2} top="50%"
            transform="translateY(-50%)" borderRadius="full"
            bg="blackAlpha.600" color="white"
            minW="28px" h="28px" p={0} _hover={{ bg: "blackAlpha.800" }}
            onClick={next}
          ><FaChevronRight size={10} /></Button>
          <HStack position="absolute" bottom={2} left="50%" transform="translateX(-50%)" spacing={1}>
            {images.map((_, i) => (
              <Box
                key={i} w={i === idx ? "16px" : "6px"} h="6px"
                borderRadius="full" bg={i === idx ? "white" : "whiteAlpha.600"}
                transition="all 0.2s" cursor="pointer"
                onClick={(e) => { e.stopPropagation(); setIdx(i) }}
              />
            ))}
          </HStack>
        </>
      )}
      <Badge
        position="absolute" top={3} left={3}
        bg="white" color="orange.400" borderRadius="lg"
        px={2} py={1} fontSize="xs" fontWeight={700} boxShadow="sm"
      >
        <Flex align="center" gap={1}><FaStar size={10} />4 étoiles</Flex>
      </Badge>
    </Box>
  )
}


function EquipmentTag({ equipKey }) {
  const match = EQUIPMENT_LIST.find(e => e.key === equipKey)
  if (!match) return null
  const { Icon, label } = match
  return (
    <Flex align="center" gap={1.5} px={2.5} py={1}
      bg="blue.50" color="blue.600" borderRadius="full"
      fontSize="xs" fontWeight={500}
    >
      <Icon size={10} />
      <Text as="span">{label}</Text>
    </Flex>
  )
}


function HotelCard({ hotel }) {
  const shortDesc = (hotel.description ?? "").slice(0, 130).trim() + "…"
  const minPrice = hotel.rooms?.length
    ? Math.min(...hotel.rooms.map(r => r.price_by_day))
    : null

  return (
    <Box
      bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.06)"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "translateY(-4px)", boxShadow: "0 8px 28px rgba(0,0,0,0.12)" }}
      cursor="pointer"
    >
      <Box p={4} pb={3}>
        <ImageSlider images={hotel.imagesHotel} hotelId={hotel.id} />
      </Box>
      <VStack align="stretch" px={4} pb={4} spacing={3}>
        <Box>
          <Text fontWeight={700} fontSize="md" color="gray.800" noOfLines={1}>
            {hotel.name ?? "Vincci Helios Beach"}
          </Text>
          <Flex align="center" gap={1.5} mt={1}>
            <Box color="gray.400" flexShrink={0}><FaMapMarkerAlt size={11} /></Box>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>{hotel.address}</Text>
          </Flex>
        </Box>
        <Text fontSize="sm" color="gray.600" lineHeight="1.6" noOfLines={3}>
          {shortDesc}
        </Text>
        <Flex gap={2} flexWrap="wrap">
          {hotel.equipments?.map(eq => <EquipmentTag key={eq} equipKey={eq} />)}
        </Flex>
        <Flex align="center" justify="space-between" mt={1}>
          {minPrice != null ? (
            <Box>
              <Text fontSize="xs" color="gray.400" lineHeight="1">À partir de</Text>
              <Flex align="baseline" gap={1}>
                <Text fontSize="xl" fontWeight={800} color="blue.600" lineHeight="1.2">{minPrice}</Text>
                <Text fontSize="xs" color="gray.500" fontWeight={500}>TND / nuit</Text>
              </Flex>
            </Box>
          ) : <Box />}
          <Button colorScheme="blue" borderRadius="xl" size="sm" fontWeight={600} px={5}>
            Réserver
          </Button>
        </Flex>
      </VStack>
    </Box>
  )
}


function HotelCardSkeleton() {
  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100" boxShadow="sm">
      <Box p={4} pb={3}><Skeleton height="220px" borderRadius="xl" /></Box>
      <VStack align="stretch" px={4} pb={4} spacing={3}>
        <SkeletonText noOfLines={2} spacing={2} skeletonHeight={3} />
        <SkeletonText noOfLines={3} spacing={2} skeletonHeight={2} />
        <Flex gap={2}>
          <Skeleton height="24px" width="60px" borderRadius="full" />
          <Skeleton height="24px" width="60px" borderRadius="full" />
          <Skeleton height="24px" width="60px" borderRadius="full" />
        </Flex>
        <Skeleton height="36px" borderRadius="xl" />
      </VStack>
    </Box>
  )
}


const Home = () => {
  const { setColorMode } = useColorMode()
  useEffect(() => { setColorMode("light") }, [setColorMode])
  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]

  const [hotels, setHotels] = useState([])
  const [room, setRoom] = useState([])
  const [loading, setLoading] = useState(true)
  const [destination, setDestination] = useState("")
  const [error, setError] = useState(null)
  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(tomorrow)
  
  // Compute nights between selected dates
  const nights = (() => {
    if (!checkIn || !checkOut) return null
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    return diff > 0 ? diff : null
  })()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await Axios.get("/service/get/hotels")
        setHotels(response.data.hotel ?? response.data)
      } catch {
        setError("Impossible de charger les hôtels. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const navigate = useNavigate()

  const handleSearch = () => {
    if (!destination) return
    // Extract room/guest counts from RoomSelector state
    const numberRoom = room?.rooms ?? 1
    const numberAdult = room?.adults ?? 2
    const numberChildren = room?.children ?? 0
    navigate(
      `/search?destination=${destination}` +
      `&checkIn=${checkIn ?? ""}` +
      `&checkOut=${checkOut ?? ""}` +
      `&numberAdult=${numberAdult}` +
      `&numberChildren=${numberChildren}` +
      `&numberRoom=${numberRoom}`
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

  return (
    <>
      <Header />

      {/* ── Hero with BA-style search ── */}
      <Box
        bg="linear-gradient(160deg, #0D1B3E 0%, #1A3260 50%, #0D1B3E 100%)"
        pt={14} pb={8} px={4}>

        <Box maxW="1100px" mx="auto">

          {/* Title */}
          <Box textAlign="center" mb={8}>
            <Flex align="center" justify="center" gap={2} mb={3}>
              <Box color="blue.200"><FaStar size={12} /></Box>
              <Text fontSize="xs" fontWeight={700} color="blue.200"
                textTransform="uppercase" letterSpacing="widest">
                Hôtels & Hébergements
              </Text>
            </Flex>
            <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight={900}
              color="white" lineHeight="1.15" letterSpacing="-0.5px">
              Trouvez votre hôtel idéal
            </Text>
            <Text color="blue.100" fontSize="sm" mt={2}>
              {hotels.length > 0
                ? `${hotels.length} hôtel${hotels.length > 1 ? "s" : ""} disponibles en Tunisie`
                : "Les meilleures adresses sélectionnées pour vous"}
            </Text>
          </Box>

          {/* Search bar */}
          <Box
            bg="white" borderRadius="2xl"
            boxShadow="0 8px 40px rgba(0,0,0,0.25)"
            border="1px solid" borderColor="gray.100">

            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr 1fr 1.3fr auto" }}
              align="stretch">
              <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150"
                borderLeftRadius="2xl">
                <Text fontSize="xs" fontWeight={700} color="gray.500">
                  Destination
                </Text>
                <LocationCombobox />
              </Box>
              {/* <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150"
                borderLeftRadius="2xl">
                <Text fontSize="xs" fontWeight={700} color="gray.500" mb={1.5}>
                  Destination
                </Text>
                <Box as="input"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="Djerba, Sousse, Tunis…"
                  style={{
                    width: "100%", border: "none", outline: "none",
                    fontSize: "15px", fontWeight: "600",
                    color: "var(--chakra-colors-gray-800)",
                    background: "transparent",
                  }} />
              </Box> */}

              {/* Dates */}
              {/* Pickup date */}
              <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150">
                <DateField
                  label="Prise en charge"
                  min={today}
                  value={checkIn}
                  onChange={v => { setCheckIn(v); if (v >= checkOut) setCheckOut(v) }}
                />
              </Box>

              {/* Return date */}
              <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150">
                <DateField
                  label="Retour"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={setCheckOut}
                />
              </Box>

              {/* Rooms */}
              <Box px={4} py={3} borderRight="1px solid" borderColor="gray.150">
                <Text fontSize="xs" fontWeight={700} color="gray.500" mb={1.5}>
                  Chambres & voyageurs
                </Text>
                <RoomSelector room={setRoom} />
              </Box>

              {/* Search button */}
              <Flex
                as="button"
                align="center" justify="center"
                px={6} gap={2} minH="70px"
                bg="blue.600" color="white"
                fontWeight={700} fontSize="sm"
                borderRightRadius="2xl"
                cursor={!destination ? "not-allowed" : "pointer"}
                opacity={!destination ? 0.6 : 1}
                transition="background 0.15s"
                _hover={destination ? { bg: "blue.700" } : {}}
                onClick={handleSearch}>
                <FaSearch size={13} />
                Rechercher
              </Flex>

            </Grid>

            {/* Nights summary */}
            {nights && checkIn && checkOut && (
              <Flex align="center" gap={2} px={5} py={3}
                borderTop="1px solid" borderColor="gray.100"
                bg="grey.50" borderBottomRadius="2xl">
                <Badge colorScheme="blue" borderRadius="full" px={2.5} py={0.5} fontSize="xs">
                  {nights} nuit{nights > 1 ? "s" : ""}
                </Badge>
                <Text fontSize="xs" color="gray.400" >
                  du {new Date(checkIn).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                  {" "}au {new Date(checkOut).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                </Text>
              </Flex>
            )}
          </Box>

        </Box>
      </Box>

      {/* ── Hotel listing ── */}
      <Box maxW="1200px" mx="auto" px={6} py={10}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight={800} color="gray.800">
              Nos Plus Belles Thématiques
            </Text>
            {!loading && hotels.length > 0 && (
              <Text fontSize="sm" color="gray.500" mt={0.5}>
                {hotels.length} hôtel{hotels.length > 1 ? "s" : ""} disponible{hotels.length > 1 ? "s" : ""}
              </Text>
            )}
          </Box>
        </Flex>

        {error && (
          <Flex direction="column" align="center" justify="center" py={20} gap={3}>
            <Text fontSize="xl">😕</Text>
            <Text color="gray.500">{error}</Text>
            <Button size="sm" colorScheme="blue" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </Flex>
        )}

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <HotelCardSkeleton key={i} />)
            : hotels.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)
          }
        </Grid>

        {!loading && !error && hotels.length === 0 && (
          <Flex direction="column" align="center" justify="center" py={20} gap={2}>
            <Text fontWeight={600} color="gray.700">Aucun hôtel trouvé</Text>
            <Text fontSize="sm" color="gray.500">Essayez de modifier vos critères de recherche.</Text>
          </Flex>
        )}
      </Box>
    </>
  )
}

export default Home