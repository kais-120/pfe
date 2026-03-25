import { Badge, Box, Button, Combobox, Flex, Grid, HStack, Image, Portal, Skeleton, SkeletonText, Text, useFilter, useListCollection, VStack } from "@chakra-ui/react"
import Header from "./components/home/Header"
import { useColorMode } from "./components/ui/color-mode"
import { useEffect, useState } from "react"
import DatePicker from "./components/ui/DatePicker"
import RoomSelector from "./components/ui/RoomSelector"
import { Axios, imageURL } from "./Api/Api"
import { FaChevronLeft, FaChevronRight, FaDumbbell, FaMapMarkerAlt, FaParking, FaSearch, FaSpa, FaStar, FaSwimmingPool, FaWifi } from "react-icons/fa"
import { useNavigate } from "react-router-dom"


const EQUIPMENT_LIST = [
  { key: "spa",label: "Spa",Icon: FaSpa},
  { key: "gym",label: "Gym",Icon: FaDumbbell},
  { key: "piscine",label: "Piscine",Icon: FaSwimmingPool },
  { key: "wifi",label: "Wi-Fi",Icon: FaWifi},
  { key: "parking",label: "Parking", Icon: FaParking},
]

const LOCATIONS = [
  { label: "Nabeul", value: "nabeul"},
  { label: "Korbous",value: "korbous"},
  { label: "Gammarth",value: "gammarth"},
  { label: "Tunis",value: "tunis"},
  { label: "Korba",value: "korba"},
  { label: "Kelibia",value: "kelibia"},
  { label: "Djerba",value: "djerba"},
  { label: "Monastir",value: "monastir"},
  { label: "Mahdia",value: "mahdia"},
  { label: "Sousse",value: "sousse"},
  { label: "Tabarka",value: "tabarka"},
  { label: "Hammamet",value: "hammamet"},
]


function LocationCombobox({ value, onChange }) {
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({
    initialItems: LOCATIONS,
    filter: contains,
  })
  return (
    <Box flex={1} minW="180px">
      <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>Destination</Text>
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
              height: "42px",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "0 12px",
              fontSize: "14px",
              background: "#F7FAFC",
              width: "100%",
              outline: "none",
            }}
          />
          <Combobox.IndicatorGroup style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}>
            <Combobox.ClearTrigger />
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
  const minPrice  = hotel.rooms?.length
    ? Math.min(...hotel.rooms.map(r => r.price_by_day))
    : null
  const navigate = useNavigate()
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
          <Button onClick={()=>navigate(`/hotel/${hotel.id}`)} colorScheme="blue" borderRadius="xl" size="sm" fontWeight={600} px={5}>
            Details
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

  const [hotels,      setHotels]      = useState([])
  const [room, setRoom] = useState([{ adults: 2, children: 0 }])
  const [loading,     setLoading]     = useState(true)
  const [destination, setDestination] = useState("")
  const [error,       setError]       = useState(null)
  const [checkIn,     setCheckIn]     = useState(null)
  const [checkOut,    setCheckOut]    = useState(null)

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
  const dIn = new Date(checkIn)
  const dOut = new Date(checkOut)

  const dateIn = dIn.toISOString().split("T")[0]
  const dateOut = dOut.toISOString().split("T")[0]

   const roomsString = room
    .map(r => `${r.adults}-${r.children}`)
    .join(",");
    const roomsArray = room.map(r => [r.adults, r.children])

  const searchData = {
    destination: destination,
    checkIn: dateIn ?? "",
    checkOut: dateOut ?? "",
    rooms: roomsArray
  }

  localStorage.setItem("searchData", JSON.stringify(searchData))


 
  // navigate(
  //   `/search?destination=${destination}` +
  //   `&checkIn=${dateIn ?? ""}` +
  //   `&checkOut=${dateOut ?? ""}` +
  //   `&rooms=${roomsString}`
  // )
}
  return (
    <>
      <Header />

      {/* ── Search bar ── */}
      <Flex justify="center" alignItems="center" mt={10} px={4}>
        <Box width="full" maxW="1100px" bg="white" p={5} borderRadius="2xl" boxShadow="0 4px 24px rgba(0,0,0,0.08)">

          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "1.2fr 1fr 1fr auto" }}
            gap={4}
            align="flex-end"
          >
            {/* Destination — new styled combobox */}
            <LocationCombobox value={destination} onChange={setDestination} />

            {/* DatePicker — your existing component, wrapped with label */}
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>Dates de séjour</Text>
              <DatePicker checkIn={setCheckIn} checkOut={setCheckOut} />
            </Box>

            {/* RoomSelector — your existing component, wrapped with label */}
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>Chambres & voyageurs</Text>
              <RoomSelector room={setRoom} />
            </Box>

            {/* Search button */}
            <Button
              colorScheme="blue"
              h="42px" px={7}
              borderRadius="xl"
              fontWeight={700}
              fontSize="sm"
              alignSelf="flex-end"
              leftIcon={<FaSearch size={12} />}
              isDisabled={!destination}
              onClick={handleSearch}
            >
              Rechercher
            </Button>
          </Grid>

          {/* Nights summary pill — appears once both dates are picked */}
          {nights && checkIn && checkOut && (
            <Flex align="center" gap={2} mt={3} pt={3} borderTop="1px solid" borderColor="gray.100">
              <Badge colorScheme="blue" borderRadius="full" px={2.5} py={0.5} fontSize="xs">
                {nights} nuit{nights > 1 ? "s" : ""}
              </Badge>
              <Text fontSize="xs" color="gray.400">
                du {new Date(checkIn).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                {" "}au {new Date(checkOut).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              </Text>
            </Flex>
          )}

        </Box>
      </Flex>

      {/* ── Hotel listing ── */}
      <Box maxW="1200px" mx="auto" px={6} py={10}>
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="2xl" fontWeight={800} color="gray.800">
            Nos Plus Belles Thématiques
          </Text>
        </Flex>

        {error && (
          <Flex direction="column" align="center" justify="center" py={20} gap={3}>
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
            <Text fontSize="3xl"></Text>
            <Text fontWeight={600} color="gray.700">Aucun hôtel trouvé</Text>
            <Text fontSize="sm" color="gray.500">Essayez de modifier vos critères de recherche.</Text>
          </Flex>
        )}
      </Box>
    </>
  )
}

export default Home