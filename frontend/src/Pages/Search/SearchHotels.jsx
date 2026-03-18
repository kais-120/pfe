import React, { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  Box, Flex, Grid, Text, Button, Badge, Image,
  Skeleton, SkeletonText, HStack, VStack, Tag,
  Combobox, Portal, useListCollection, useFilter,
} from "@chakra-ui/react"
import {
  FaMapMarkerAlt, FaWifi, FaParking, FaSwimmingPool,
  FaSpa, FaDumbbell, FaChevronLeft, FaChevronRight,
  FaStar, FaCalendarAlt, FaUserFriends, FaSearch,
  FaExclamationCircle,
} from "react-icons/fa"
import Header from "../../components/home/Header"
import { Axios } from "../../Api/Api"
import { Hotel } from "lucide-react"

const IMAGE_BASE = "http://localhost:3000/uploads/"

const EQUIPMENT_LIST = [
  { key: "spa",     label: "Spa",     Icon: FaSpa          },
  { key: "gym",     label: "Gym",     Icon: FaDumbbell     },
  { key: "piscine", label: "Piscine", Icon: FaSwimmingPool },
  { key: "wifi",    label: "Wi-Fi",   Icon: FaWifi         },
  { key: "parking", label: "Parking", Icon: FaParking      },
]

const LOCATIONS = [
  { label: "Tunis",     value: "Tunis"     },
  { label: "Djerba",    value: "Djerba"    },
  { label: "Sousse",    value: "Sousse"    },
  { label: "Hammamet",  value: "Hammamet"  },
  { label: "Sfax",      value: "Sfax"      },
  { label: "Bizerte",   value: "Bizerte"   },
  { label: "Monastir",  value: "Monastir"  },
  { label: "Nabeul",    value: "Nabeul"    },
  { label: "Tabarka",   value: "Tabarka"   },
  { label: "Tozeur",    value: "Tozeur"    },
]


function LocationCombobox({ value, onChange }) {
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({
    initialItems: LOCATIONS,
    filter: contains,
  })

  return (
    <Box>
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


function DateInput({ label, value, onChange, min }) {
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>{label}</Text>
      <Flex
        align="center" gap={2} px={3} h="42px"
        border="1px solid" borderColor="gray.200"
        borderRadius="lg" bg="gray.50"
      >
        <Box color="gray.400" flexShrink={0}><FaCalendarAlt size={12} /></Box>
        <Box
          as="input"
          type="date"
          value={value}
          min={min}
          onChange={e => onChange(e.target.value)}
          flex={1}
          border="none"
          bg="transparent"
          fontSize="sm"
          color="gray.700"
          _focus={{ outline: "none" }}
        />
      </Flex>
    </Box>
  )
}


function GuestRoomSelector({ adults, children, rooms, setAdults, setChildren, setRooms }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const CounterRow = ({ label, sublabel, value, min, onDec, onInc }) => (
    <Flex justify="space-between" align="center" py={2.5}>
      <Box>
        <Text fontSize="sm" fontWeight={600} color="gray.800">{label}</Text>
        {sublabel && <Text fontSize="xs" color="gray.400">{sublabel}</Text>}
      </Box>
      <Flex align="center" gap={3}>
        <Box
          as="button" onClick={onDec}
          w="28px" h="28px" borderRadius="full"
          border="1px solid" borderColor={value <= min ? "gray.200" : "blue.300"}
          color={value <= min ? "gray.300" : "blue.500"}
          display="flex" alignItems="center" justifyContent="center"
          bg="white" cursor={value <= min ? "not-allowed" : "pointer"}
          fontSize="md" lineHeight={1} transition="all 0.15s"
        >–</Box>
        <Text fontSize="sm" fontWeight={700} minW="16px" textAlign="center">{value}</Text>
        <Box
          as="button" onClick={onInc}
          w="28px" h="28px" borderRadius="full"
          border="1px solid" borderColor="blue.300"
          color="blue.500" bg="white" cursor="pointer"
          display="flex" alignItems="center" justifyContent="center"
          fontSize="md" lineHeight={1} transition="all 0.15s"
          _hover={{ bg: "blue.50" }}
        >+</Box>
      </Flex>
    </Flex>
  )

  return (
    <Box>
      <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>Voyageurs & chambres</Text>
      <Box position="relative" ref={ref}>
        <Flex
          as="button"
          align="center" gap={2}
          w="full" h="42px" px={3}
          border="1px solid"
          borderColor={open ? "blue.400" : "gray.200"}
          borderRadius="lg" bg="gray.50"
          cursor="pointer" textAlign="left"
          boxShadow={open ? "0 0 0 2px rgba(49,130,206,0.15)" : "none"}
          transition="all 0.15s"
          onClick={() => setOpen(o => !o)}
        >
          <Box color="gray.400"><FaUserFriends size={13} /></Box>
          <Text fontSize="sm" color="gray.700" noOfLines={1}>
            {rooms} Chambre{rooms > 1 ? "s" : ""} · {adults} Adulte{adults > 1 ? "s" : ""}
            {children > 0 ? ` · ${children} Enfant${children > 1 ? "s" : ""}` : ""}
          </Text>
        </Flex>

        {open && (
          <Box
            position="absolute" top="calc(100% + 6px)" left={0} zIndex={1500}
            bg="white" border="1px solid" borderColor="gray.200"
            borderRadius="xl" boxShadow="0 8px 32px rgba(0,0,0,0.12)"
            w="280px" p={4}
          >
            <CounterRow
              label="Chambres" min={1} value={rooms}
              onDec={() => setRooms(r => Math.max(1, r - 1))}
              onInc={() => setRooms(r => r + 1)}
            />
            <Box borderTop="1px solid" borderColor="gray.50" />
            <CounterRow
              label="Adultes" min={1} value={adults}
              onDec={() => setAdults(a => Math.max(1, a - 1))}
              onInc={() => setAdults(a => a + 1)}
            />
            <Box borderTop="1px solid" borderColor="gray.50" />
            <CounterRow
              label="Enfants" sublabel="De 0 à 12 ans" min={0} value={children}
              onDec={() => setChildren(c => Math.max(0, c - 1))}
              onInc={() => setChildren(c => c + 1)}
            />
            <Flex justify="flex-end" mt={3} pt={3} borderTop="1px solid" borderColor="gray.100">
              <Button colorScheme="blue" size="sm" borderRadius="lg" px={6} onClick={() => setOpen(false)}>
                Valider
              </Button>
            </Flex>
          </Box>
        )}
      </Box>
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


function ImageSlider({ images, hotelId }) {
  const [idx, setIdx] = useState(0)

  if (!images?.length) {
    return (
      <Box h="200px" borderRadius="xl" bg="gray.100"
        display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="xs" color="gray.400">Pas d'image</Text>
      </Box>
    )
  }

  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }

  return (
    <Box position="relative" height="200px" overflow="hidden" borderRadius="xl">
      <Image
        src={`${IMAGE_BASE}${images[idx].image_url}`}
        alt={`hotel-${hotelId}-${idx}`}
        w="100%" h="100%" objectFit="cover"
        transition="opacity 0.3s"
      />
      {images.length > 1 && (
        <>
          <Button
            size="xs" position="absolute" left={2} top="50%"
            transform="translateY(-50%)" borderRadius="full"
            bg="blackAlpha.600" color="white"
            minW="26px" h="26px" p={0}
            _hover={{ bg: "blackAlpha.800" }} onClick={prev}
          ><FaChevronLeft size={9} /></Button>
          <Button
            size="xs" position="absolute" right={2} top="50%"
            transform="translateY(-50%)" borderRadius="full"
            bg="blackAlpha.600" color="white"
            minW="26px" h="26px" p={0}
            _hover={{ bg: "blackAlpha.800" }} onClick={next}
          ><FaChevronRight size={9} /></Button>
          <HStack position="absolute" bottom={2} left="50%" transform="translateX(-50%)" spacing={1}>
            {images.map((_, i) => (
              <Box key={i} w={i === idx ? "14px" : "5px"} h="5px"
                borderRadius="full" bg={i === idx ? "white" : "whiteAlpha.600"}
                transition="all 0.2s" cursor="pointer"
                onClick={(e) => { e.stopPropagation(); setIdx(i) }}
              />
            ))}
          </HStack>
        </>
      )}
      <Badge
        position="absolute" top={2} left={2}
        bg="white" color="orange.400" borderRadius="md"
        px={2} py={0.5} fontSize="xs" fontWeight={700} boxShadow="sm"
      >
        <Flex align="center" gap={1}><FaStar size={9} />4★</Flex>
      </Badge>
    </Box>
  )
}


function HotelCard({ hotel, nights, adults, children }) {
  const navigate = useNavigate()
  const shortDesc = (hotel.description ?? "").slice(0, 110).trim() + "…"
  const minPrice  = hotel.rooms?.length
    ? Math.min(...hotel.rooms.map(r => r.price_by_day))
    : null
  const totalPrice = (minPrice && nights)
    ? minPrice * nights + (hotel.rooms?.[0]?.price_by_adult ?? 0) * adults
      + (hotel.rooms?.[0]?.price_by_children ?? 0) * children
    : null

  return (
    <Box
      bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.06)"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "translateY(-4px)", boxShadow: "0 8px 28px rgba(0,0,0,0.12)" }}
      cursor="pointer"
      onClick={() => navigate(`/hotels/${hotel.id}`)}
    >
      <Box p={4} pb={3}>
        <ImageSlider images={hotel.imagesHotel} hotelId={hotel.id} />
      </Box>

      <VStack align="stretch" px={4} pb={4} spacing={3}>
        <Box>
          <Text fontWeight={700} fontSize="md" color="gray.800" noOfLines={1}>
            {hotel.name ?? hotel.address?.split(",")[0]}
          </Text>
          <Flex align="center" gap={1.5} mt={1}>
            <Box color="gray.400" flexShrink={0}><FaMapMarkerAlt size={11} /></Box>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>{hotel.address}</Text>
          </Flex>
        </Box>

        <Text fontSize="sm" color="gray.600" lineHeight="1.6" noOfLines={2}>
          {shortDesc}
        </Text>

        <Flex gap={2} flexWrap="wrap">
          {hotel.equipments?.map(eq => <EquipmentTag key={eq} equipKey={eq} />)}
        </Flex>

        <Flex align="center" justify="space-between" mt={1}>
          <Box>
            <Text fontSize="xs" color="gray.400" lineHeight="1">
              {totalPrice ? `${nights} nuit${nights > 1 ? "s" : ""} · total` : "À partir de"}
            </Text>
            <Flex align="baseline" gap={1}>
              <Text fontSize="xl" fontWeight={800} color="blue.600" lineHeight="1.2">
                {totalPrice ?? minPrice ?? "—"}
              </Text>
              <Text fontSize="xs" color="gray.500">TND{!totalPrice ? " / nuit" : ""}</Text>
            </Flex>
          </Box>
          <Button colorScheme="blue" borderRadius="xl" size="sm" fontWeight={600} px={5}>
            Voir
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
      <Box p={4} pb={3}><Skeleton height="200px" borderRadius="xl" /></Box>
      <VStack align="stretch" px={4} pb={4} spacing={3}>
        <SkeletonText noOfLines={2} spacing={2} skeletonHeight={3} />
        <SkeletonText noOfLines={2} spacing={2} skeletonHeight={2} />
        <Flex gap={2}>
          <Skeleton height="22px" width="55px" borderRadius="full" />
          <Skeleton height="22px" width="55px" borderRadius="full" />
          <Skeleton height="22px" width="55px" borderRadius="full" />
        </Flex>
        <Skeleton height="34px" borderRadius="xl" />
      </VStack>
    </Box>
  )
}


export default function SearchHotels() {
  const today    = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]

  const [searchParams] = useSearchParams()
  const [destination,    setDestination]    = useState(searchParams.get("destination")    ?? "")
  const [checkIn,  setCheckIn]  = useState(searchParams.get("checkIn")  ?? today)
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") ?? tomorrow)
  const [adults,   setAdults]   = useState(Number(searchParams.get("numberAdult")    ?? 2))
  const [children, setChildren] = useState(Number(searchParams.get("numberChildren") ?? 0))
  const [rooms,    setRooms]    = useState(Number(searchParams.get("numberRoom")      ?? 1))

  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)
  const [error,    setError]    = useState(null)

  const nights = (() => {
    if (!checkIn || !checkOut) return null
    const d = (new Date(checkOut) - new Date(checkIn)) / 86400000
    return d > 0 ? d : null
  })()

  // ── Auto-search on mount if URL has params ────────────────────
  useEffect(() => {
    const urlPlace = searchParams.get("destination")
    if (!urlPlace) return
    const search = async () => {
      try {
        setLoading(true)
        setError(null)
        setSearched(true)
        const response = await Axios.post("/service/get/hotels/search", {
          destination:          destination,
          checkIn:        searchParams.get("checkIn")        ?? today,
          checkOut:       searchParams.get("checkOut")       ?? tomorrow,
          numberAdult:    Number(searchParams.get("numberAdult")    ?? 2),
          numberChildren: Number(searchParams.get("numberChildren") ?? 0),
          numberRoom:     Number(searchParams.get("numberRoom")     ?? 1),
        })
        setResults(response.data.hotel ?? response.data ?? [])
      } catch {
        setError("La recherche a échoué. Veuillez réessayer.")
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    search()
  }, []) // runs once on mount

  // ── Manual search from the form ───────────────────────────────
  const handleSearch = async () => {
    if (!destination) return
    try {
      setLoading(true)
      setError(null)
      setSearched(true)
      const response = await Axios.post("/service/get/hotels/search", {
        destination,
        checkIn,
        checkOut,
        numberAdult:    adults,
        numberChildren: children,
        numberRoom:     rooms,
      })
      setResults(response.data.hotel ?? response.data ?? [])
    } catch {
      setError("La recherche a échoué. Veuillez réessayer.")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch() }

  return (
    <>
      <Header />

      {/* ── Hero search bar ── */}
      <Box bg="blue.600" px={{ base: 4, md: 8 }} pt={10} pb={16}>
        <Text
          textAlign="center" color="white"
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight={900} mb={1} letterSpacing="-0.5px"
        >
          Trouvez votre hôtel idéal
        </Text>
        <Text textAlign="center" color="blue.100" fontSize="sm" mb={8}>
          Comparez les meilleurs hôtels en Tunisie
        </Text>

        <Box
          maxW="900px" mx="auto"
          bg="white" borderRadius="2xl"
          boxShadow="0 8px 40px rgba(0,0,0,0.18)"
          p={5}
          onKeyDown={handleKeyDown}
        >
          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "1.2fr 1fr 1fr 1.4fr auto" }}
            gap={4}
            align="flex-end"
          >
            <LocationCombobox value={destination} onChange={setDestination} />
            <DateInput
              label="Arrivée" value={checkIn} min={today}
              onChange={v => { setCheckIn(v); if (v >= checkOut) setCheckOut(v) }}
            />
            <DateInput
              label="Départ" value={checkOut} min={checkIn || today}
              onChange={setCheckOut}
            />
            <GuestRoomSelector
              adults={adults} children={children} rooms={rooms}
              setAdults={setAdults} setChildren={setChildren} setRooms={setRooms}
            />
            <Button
              colorScheme="blue"
              h="42px" px={7}
              borderRadius="xl"
              fontWeight={700}
              fontSize="sm"
              alignSelf="flex-end"
              leftIcon={<FaSearch size={12} />}
              onClick={handleSearch}
              isLoading={loading}
              loadingText="Recherche…"
              isDisabled={!destination}
            >
              Rechercher
            </Button>
          </Grid>

          {/* Nights pill */}
          {nights && checkIn && checkOut && (
            <Flex align="center" gap={2} mt={3} pt={3} borderTop="1px solid" borderColor="gray.100">
              <Badge colorScheme="blue" borderRadius="full" px={2.5} py={0.5} fontSize="xs">
                {nights} nuit{nights > 1 ? "s" : ""}
              </Badge>
              <Text fontSize="xs" color="gray.400">
                du {new Date(checkIn).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                {" "}au {new Date(checkOut).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                {" "}· {adults} adulte{adults > 1 ? "s" : ""}
                {children > 0 ? ` · ${children} enfant${children > 1 ? "s" : ""}` : ""}
                {" "}· {rooms} chambre{rooms > 1 ? "s" : ""}
              </Text>
            </Flex>
          )}
        </Box>
      </Box>

      {/* ── Results area ── */}
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={10} mt={-6}>

        {/* Results header */}
        {searched && !loading && (
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Text fontSize="xl" fontWeight={800} color="gray.800">
                {error
                  ? "Erreur de recherche"
                  : results.length === 0
                  ? "Aucun résultat"
                  : `${results.length} hôtel${results.length > 1 ? "s" : ""} trouvé${results.length > 1 ? "s" : ""}`
                }
              </Text>
              {!error && results.length > 0 && (
                <Text fontSize="sm" color="gray.500" mt={0.5}>
                  {destination} · {nights} nuit{nights > 1 ? "s" : ""} · {adults} adulte{adults > 1 ? "s" : ""}
                  {children > 0 ? ` · ${children} enfant${children > 1 ? "s" : ""}` : ""}
                </Text>
              )}
            </Box>
          </Flex>
        )}

        {/* Loading skeletons */}
        {loading && (
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={6}
          >
            {Array.from({ length: 6 }).map((_, i) => <HotelCardSkeleton key={i} />)}
          </Grid>
        )}

        {/* Error state */}
        {!loading && error && (
          <Flex direction="column" align="center" justify="center" py={20} gap={3}>
            <Box color="red.400"><FaExclamationCircle size={32} /></Box>
            <Text color="gray.500">{error}</Text>
            <Button size="sm" colorScheme="blue" onClick={handleSearch}>Réessayer</Button>
          </Flex>
        )}

        {/* Empty state */}
        {!loading && !error && searched && results.length === 0 && (
          <Flex direction="column" align="center" justify="center" py={20} gap={3}>
            <Text fontSize="4xl"><Hotel /></Text>
            <Text fontWeight={700} color="gray.700" fontSize="lg">Aucun hôtel disponible</Text>
            <Text fontSize="sm" color="gray.500" textAlign="center" maxW="320px">
              Essayez une autre destination ou modifiez vos dates et le nombre de voyageurs.
            </Text>
          </Flex>
        )}

        {/* Initial state — not yet searched */}
        {!loading && !searched && (
          <Flex direction="column" align="center" justify="center" py={24} gap={3}>
            <Text fontSize="5xl">🔍</Text>
            <Text fontWeight={700} color="gray.700" fontSize="lg">
              Recherchez votre prochaine destination
            </Text>
            <Text fontSize="sm" color="gray.400">
              Entrez une ville et vos dates pour voir les hôtels disponibles.
            </Text>
          </Flex>
        )}

        {/* Results grid */}
        {!loading && !error && results.length > 0 && (
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={6}
          >
            {results.map(hotel => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                nights={nights}
                adults={adults}
                children={children}
              />
            ))}
          </Grid>
        )}
      </Box>
    </>
  )
}