import React, { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box, Flex, Grid, Text, Button, Badge, Image,
  Skeleton, SkeletonText, HStack, VStack, Avatar,
} from "@chakra-ui/react"
import {
  FaMapMarkerAlt, FaWifi, FaParking, FaSwimmingPool,
  FaSpa, FaDumbbell, FaStar, FaStarHalfAlt, FaRegStar,
  FaChevronLeft, FaChevronRight, FaArrowLeft,
  FaUserFriends, FaMoon, FaCheck,
} from "react-icons/fa"
import Header from "./components/home/Header"
import { Axios, imageURL } from "./Api/Api"

const IMAGE_BASE = "http://localhost:3000/uploads/"

/* ── Equipment config ───────────────────────────────────────────── */
const EQUIPMENT_LIST = [
  { key: "spa",     label: "Spa & Bien-être", Icon: FaSpa,          desc: "Hammam, massages, soins"       },
  { key: "gym",     label: "Salle de sport",  Icon: FaDumbbell,     desc: "Équipements modernes"           },
  { key: "piscine", label: "Piscine",         Icon: FaSwimmingPool, desc: "Extérieure & intérieure chauffée" },
  { key: "wifi",    label: "Wi-Fi gratuit",   Icon: FaWifi,         desc: "Dans tout l'établissement"     },
  { key: "parking", label: "Parking",         Icon: FaParking,      desc: "Parking privé sécurisé"        },
]

/* ── Dummy reviews (replace with real API when ready) ───────────── */
const DUMMY_REVIEWS = [
  { id: 1, author: "Sophie M.",    avatar: "SM", rating: 5, date: "Février 2026", comment: "Séjour absolument parfait ! La plage privée est magnifique et le personnel est aux petits soins. Les bungalows avec piscine privée valent vraiment le détour." },
  { id: 2, author: "Karim B.",     avatar: "KB", rating: 4, date: "Janvier 2026", comment: "Très bel hôtel avec un cadre exceptionnel. Le spa est excellent. Seul bémol : le restaurant du soir était un peu lent le week-end." },
  { id: 3, author: "Marie-Claire", avatar: "MC", rating: 5, date: "Décembre 2025", comment: "Notre troisième séjour ici et toujours aussi enchanteur. L'animation pour les enfants est top et les chambres familiales dans les houchs sont authentiques." },
  { id: 4, author: "Ahmed T.",     avatar: "AT", rating: 4, date: "Novembre 2025", comment: "Excellent rapport qualité-prix. La piscine intérieure chauffée est un vrai plus en dehors saison. Je recommande vivement." },
]

/* ── Star rating display ────────────────────────────────────────── */
function StarRating({ rating, size = 13 }) {
  return (
    <Flex align="center" gap="2px">
      {[1, 2, 3, 4, 5].map(i => {
        const Icon = i <= Math.floor(rating)
          ? FaStar
          : i - 0.5 <= rating
          ? FaStarHalfAlt
          : FaRegStar
        return <Icon key={i} size={size} color="#F59E0B" />
      })}
    </Flex>
  )
}

/* ── Full-screen image gallery ──────────────────────────────────── */
function ImageGallery({ images }) {
  const [active, setActive] = useState(0)

  if (!images?.length) return <Skeleton height="480px" borderRadius="2xl" />

  const prev = () => setActive(i => (i - 1 + images.length) % images.length)
  const next = () => setActive(i => (i + 1) % images.length)

  return (
    <Box>
      {/* Main image */}
      <Box position="relative" height="480px" borderRadius="2xl" overflow="hidden" mb={3}>
        <Image
          src={`${imageURL}/services/${images[active].image_url}`}
          alt="hotel"
          w="100%" h="100%"
          objectFit="cover"
          transition="opacity 0.3s"
        />

        {/* Counter badge */}
        <Badge
          position="absolute" bottom={4} right={4}
          bg="blackAlpha.700" color="white"
          borderRadius="full" px={3} py={1}
          fontSize="xs" fontWeight={600}
        >
          {active + 1} / {images.length}
        </Badge>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <Button
              position="absolute" left={3} top="50%" transform="translateY(-50%)"
              borderRadius="full" bg="white" color="gray.700"
              w="38px" h="38px" minW="38px" p={0}
              boxShadow="md" _hover={{ bg: "gray.100" }}
              onClick={prev}
            >
              <FaChevronLeft size={13} />
            </Button>
            <Button
              position="absolute" right={3} top="50%" transform="translateY(-50%)"
              borderRadius="full" bg="white" color="gray.700"
              w="38px" h="38px" minW="38px" p={0}
              boxShadow="md" _hover={{ bg: "gray.100" }}
              onClick={next}
            >
              <FaChevronRight size={13} />
            </Button>
          </>
        )}
      </Box>

      {/* Thumbnails */}
      <Flex gap={2} overflowX="auto" pb={1}>
        {images.map((img, i) => (
          <Box
            key={img.id}
            flexShrink={0}
            w="80px" h="60px"
            borderRadius="lg"
            overflow="hidden"
            cursor="pointer"
            border="2.5px solid"
            borderColor={i === active ? "blue.500" : "transparent"}
            opacity={i === active ? 1 : 0.65}
            transition="all 0.15s"
            _hover={{ opacity: 1 }}
            onClick={() => setActive(i)}
          >
            <Image
              src={`${imageURL}/services/${img.image_url}`}
              w="100%" h="100%" objectFit="cover"
            />
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

/* ── Rooms section with integrated booking search ───────────────── */
function GuestCounter({ label, sublabel, value, min, onIncrease, onDecrease }) {
  return (
    <Flex justify="space-between" align="center" py={2.5}>
      <Box>
        <Text fontSize="sm" fontWeight={600} color="gray.800">{label}</Text>
        {sublabel && <Text fontSize="xs" color="gray.400">{sublabel}</Text>}
      </Box>
      <Flex align="center" gap={3}>
        <Box
          as="button"
          onClick={onDecrease}
          w="28px" h="28px"
          border="1px solid"
          borderColor={value <= min ? "gray.200" : "blue.300"}
          borderRadius="full"
          display="flex" alignItems="center" justifyContent="center"
          color={value <= min ? "gray.300" : "blue.500"}
          bg="white"
          cursor={value <= min ? "not-allowed" : "pointer"}
          fontSize="lg"
          lineHeight={1}
          transition="all 0.15s"
          _hover={value > min ? { bg: "blue.50" } : {}}
        >–</Box>
        <Text fontSize="sm" fontWeight={700} minW="16px" textAlign="center" color="gray.800">
          {value}
        </Text>
        <Box
          as="button"
          onClick={onIncrease}
          w="28px" h="28px"
          border="1px solid"
          borderColor="blue.300"
          borderRadius="full"
          display="flex" alignItems="center" justifyContent="center"
          color="blue.500"
          bg="white"
          cursor="pointer"
          fontSize="lg"
          lineHeight={1}
          transition="all 0.15s"
          _hover={{ bg: "blue.50" }}
        >+</Box>
      </Flex>
    </Flex>
  )
}

function RoomGuestSelector({ guestRooms, setGuestRooms }) {
  const [open, setOpen] = useState(false)
  const ref = React.useRef(null)

  // Close on outside click
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const totalRooms    = guestRooms.length
  const totalAdults   = guestRooms.reduce((s, r) => s + r.adults, 0)
  const totalChildren = guestRooms.reduce((s, r) => s + r.children, 0)

  const updateRoom = (idx, field, val) =>
    setGuestRooms(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r))

  const addRoom    = () => setGuestRooms(prev => [...prev, { adults: 1, children: 0 }])
  const removeRoom = (idx) => setGuestRooms(prev => prev.filter((_, i) => i !== idx))

  return (
    <Box position="relative" ref={ref}>
      {/* Trigger */}
      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>Chambres & voyageurs</Text>
        <Box
          as="button"
          w="full"
          h="42px"
          display="flex"
          alignItems="center"
          gap={2}
          px={3}
          border="1px solid"
          borderColor={open ? "blue.400" : "gray.200"}
          borderRadius="lg"
          bg="gray.50"
          cursor="pointer"
          textAlign="left"
          boxShadow={open ? "0 0 0 2px rgba(49,130,206,0.15)" : "none"}
          transition="all 0.15s"
          onClick={() => setOpen(o => !o)}
          _hover={{ borderColor: "blue.300" }}
        >
          <Box as={FaUserFriends} color="gray.400" flexShrink={0} />
          <Text fontSize="sm" fontWeight={500} color="gray.700" noOfLines={1}>
            {totalRooms} Chambre{totalRooms > 1 ? "s" : ""} · {totalAdults} Adulte{totalAdults > 1 ? "s" : ""}{totalChildren > 0 ? ` · ${totalChildren} Enfant${totalChildren > 1 ? "s" : ""}` : ""}
          </Text>
        </Box>
      </Box>

      {/* Dropdown */}
      {open && (
        <Box
          position="absolute"
          top="calc(100% + 6px)"
          left={0}
          zIndex={1500}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="xl"
          boxShadow="0 8px 32px rgba(0,0,0,0.12)"
          w="300px"
          p={4}
        >
          {guestRooms.map((room, idx) => (
            <Box key={idx} mb={idx < guestRooms.length - 1 ? 3 : 0}>
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="sm" fontWeight={700} color="gray.800">Chambre {idx + 1}</Text>
                {guestRooms.length > 1 && (
                  <Box
                    as="button"
                    onClick={() => removeRoom(idx)}
                    color="gray.400"
                    _hover={{ color: "red.500" }}
                    bg="none" border="none" cursor="pointer"
                    display="flex" alignItems="center"
                    transition="color 0.15s"
                  >
                    <Box as="svg" w="14px" h="14px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                    </Box>
                  </Box>
                )}
              </Flex>
              <GuestCounter
                label="Adulte(s)" min={1}
                value={room.adults}
                onIncrease={() => updateRoom(idx, "adults", room.adults + 1)}
                onDecrease={() => updateRoom(idx, "adults", Math.max(1, room.adults - 1))}
              />
              <Box borderTop="1px solid" borderColor="gray.50" />
              <GuestCounter
                label="Enfant(s)" sublabel="De 0 à 12 ans" min={0}
                value={room.children}
                onIncrease={() => updateRoom(idx, "children", room.children + 1)}
                onDecrease={() => updateRoom(idx, "children", Math.max(0, room.children - 1))}
              />
              {idx < guestRooms.length - 1 && <Box mt={3} borderTop="1px solid" borderColor="gray.100" />}
            </Box>
          ))}

          <Box
            as="button"
            onClick={addRoom}
            mt={3}
            color="blue.500"
            fontSize="sm"
            fontWeight={600}
            bg="none" border="none" cursor="pointer"
            _hover={{ textDecoration: "underline" }}
          >
            + Ajouter une chambre
          </Box>

          <Flex justify="flex-end" mt={3} pt={3} borderTop="1px solid" borderColor="gray.100">
            <Button
              colorScheme="blue"
              size="sm"
              borderRadius="lg"
              px={6}
              onClick={() => setOpen(false)}
            >
              Valider
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  )
}

function RoomsSection({ rooms }) {
  const [checkIn,    setCheckIn]    = useState("")
  const [checkOut,   setCheckOut]   = useState("")
  const [guestRooms, setGuestRooms] = useState([{ adults: 1, children: 0 }])

  const nights = (() => {
    if (!checkIn || !checkOut) return null
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    return diff > 0 ? diff : null
  })()

  const totalAdults   = guestRooms.reduce((s, r) => s + r.adults, 0)
  const totalChildren = guestRooms.reduce((s, r) => s + r.children, 0)

  return (
    <Box>
      <SectionTitle>Chambres disponibles</SectionTitle>

      {/* Search bar */}
      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        borderRadius="2xl"
        boxShadow="0 2px 16px rgba(0,0,0,0.06)"
        p={5}
        mb={5}
      >
        <Grid
          templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "1fr 1fr 1fr auto" }}
          gap={4}
          align="flex-end"
        >
          {/* Check-in */}
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>Arrivée</Text>
            <Box
              as="input"
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
              w="full"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              px={3}
              py={2.5}
              fontSize="sm"
              color="gray.700"
              bg="gray.50"
              _focus={{ outline: "none", borderColor: "blue.400", bg: "white" }}
            />
          </Box>

          {/* Check-out */}
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>Départ</Text>
            <Box
              as="input"
              type="date"
              value={checkOut}
              onChange={e => setCheckOut(e.target.value)}
              min={checkIn}
              w="full"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              px={3}
              py={2.5}
              fontSize="sm"
              color="gray.700"
              bg="gray.50"
              _focus={{ outline: "none", borderColor: "blue.400", bg: "white" }}
            />
          </Box>

          {/* Room + guest selector */}
          <RoomGuestSelector guestRooms={guestRooms} setGuestRooms={setGuestRooms} />

          {/* Search button */}
          <Button
            colorScheme="blue"
            borderRadius="xl"
            px={6}
            h="42px"
            fontWeight={600}
            fontSize="sm"
            alignSelf="flex-end"
          >
            Vérifier
          </Button>
        </Grid>

        {/* Nights summary */}
        {nights && (
          <Flex align="center" gap={2} mt={3} pt={3} borderTop="1px solid" borderColor="gray.100">
            <FaMoon size={11} color="#718096" />
            <Text fontSize="xs" color="gray.500">
              <Text as="span" fontWeight={700} color="gray.700">{nights} nuit{nights > 1 ? "s" : ""}</Text>
              {" "}· du {new Date(checkIn).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              {" "}au {new Date(checkOut).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
            </Text>
          </Flex>
        )}
      </Box>

      {/* Room cards */}
      <VStack spacing={4} align="stretch">
        {rooms.map(room => (
          <RoomCard
            key={room.id}
            room={room}
            nights={nights}
            adults={totalAdults}
            children={totalChildren}
          />
        ))}
      </VStack>
    </Box>
  )
}

/* ── Room card ──────────────────────────────────────────────────── */
function RoomCard({ room, nights, adults, children }) {
  // Total price = (base/night × nights) + (adult supplement × adults) + (child supplement × children)
  const totalPrice = nights
    ? room.price_by_day * nights
      + room.price_by_adult * adults
      + room.price_by_children * children
    : null

  return (
    <Box
      border="1px solid"
      borderColor="gray.100"
      borderRadius="xl"
      p={5}
      bg="white"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)"
      transition="box-shadow 0.2s, border-color 0.2s"
      _hover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderColor: "blue.100" }}
    >
      <Flex justify="space-between" align="flex-start" gap={4} flexWrap="wrap">
        {/* Left — room info */}
        <Box flex={1} minW="200px">
          <Text fontWeight={700} fontSize="md" color="gray.800" mb={3}>
            {room.name}
          </Text>
          <VStack align="stretch" spacing={2}>
            <Flex align="center" gap={2}>
              <Box color="blue.400"><FaUserFriends size={13} /></Box>
              <Text fontSize="sm" color="gray.600">
                Capacité : <Text as="span" fontWeight={600}>{room.capacity} personnes</Text>
              </Text>
            </Flex>
            <Flex align="center" gap={2}>
              <Box color="blue.400"><FaCheck size={11} /></Box>
              <Text fontSize="sm" color="gray.600">
                <Text as="span" fontWeight={600}>{room.count}</Text> chambre{room.count > 1 ? "s" : ""} disponible{room.count > 1 ? "s" : ""}
              </Text>
            </Flex>
            <Flex gap={3} mt={1} flexWrap="wrap">
              <Text fontSize="xs" color="gray.400">+{room.price_by_adult} TND / adulte</Text>
              <Text fontSize="xs" color="gray.300">·</Text>
              <Text fontSize="xs" color="gray.400">+{room.price_by_children} TND / enfant</Text>
            </Flex>
          </VStack>
        </Box>

        <Box textAlign="right" flexShrink={0}>
          <Flex align="baseline" gap={1} justify="flex-end" mt={0.5}>
            <Text fontSize="2xl" fontWeight={900} color="blue.600" lineHeight="1.1">
              {totalPrice ?? room.price_by_day}
            </Text>
            <Text fontSize="xs" color="gray.500">{nights ? "TND total" : "TND / nuit"}</Text>
          </Flex>
          {totalPrice && (
            <Text fontSize="xs" color="gray.400" mt={0.5}>
              ({room.price_by_day} TND × {nights} nuit{nights > 1 ? "s" : ""})
            </Text>
          )}
          <Button colorScheme="blue" size="sm" borderRadius="lg" mt={3} px={6} fontWeight={600}>
            Réserver
          </Button>
        </Box>
      </Flex>
    </Box>
  )
}

/* ── Review card ────────────────────────────────────────────────── */
function ReviewCard({ review }) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="xl"
      p={4}
      boxShadow="0 1px 6px rgba(0,0,0,0.04)"
    >
      <Flex align="center" gap={3} mb={3}>
        <Avatar.Root size="sm" w="38px" h="38px">
          <Avatar.Fallback
            bg="blue.100" color="blue.700"
            fontSize="xs" fontWeight={700}
            name={review.author}
          />
        </Avatar.Root>
        <Box flex={1}>
          <Text fontWeight={600} fontSize="sm" color="gray.800">{review.author}</Text>
          <Text fontSize="xs" color="gray.400">{review.date}</Text>
        </Box>
        <StarRating rating={review.rating} size={12} />
      </Flex>
      <Text fontSize="sm" color="gray.600" lineHeight="1.7">
        {review.comment}
      </Text>
    </Box>
  )
}

/* ── Skeleton for detail page ───────────────────────────────────── */
function DetailSkeleton() {
  return (
    <Box maxW="1100px" mx="auto" px={6} py={10}>
      <Skeleton height="480px" borderRadius="2xl" mb={3} />
      <Flex gap={2} mb={8}>
        {[1,2,3,4].map(i => <Skeleton key={i} w="80px" h="60px" borderRadius="lg" />)}
      </Flex>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap={10}>
        <Box>
          <SkeletonText noOfLines={3} spacing={3} skeletonHeight={4} mb={6} />
          <SkeletonText noOfLines={6} spacing={2} skeletonHeight={3} />
        </Box>
        <Skeleton height="300px" borderRadius="xl" />
      </Grid>
    </Box>
  )
}

/* ── Section heading ────────────────────────────────────────────── */
function SectionTitle({ children }) {
  return (
    <Text
      fontSize="xl"
      fontWeight={800}
      color="gray.800"
      mb={4}
      pb={2}
      borderBottom="2px solid"
      borderColor="blue.100"
    >
      {children}
    </Text>
  )
}

/* ── Average rating compute ─────────────────────────────────────── */
function avgRating(reviews) {
  if (!reviews?.length) return 0
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
}

/* ── Main HotelDetail page ──────────────────────────────────────── */
export default function Test() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [hotel,   setHotel]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Use dummy reviews — swap this for a real API call when ready:
  // const [reviews, setReviews] = useState([])
  const reviews = DUMMY_REVIEWS
  const avg     = avgRating(reviews)

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setLoading(true)
        const response = await Axios.get(`/service/get/hotel/1`)
        // Support both { hotel: {...} } and { hotel: [{...}] }
        const data = response.data.hotel
        setHotel(Array.isArray(data) ? data[0] : data)
      } catch {
        setError("Impossible de charger cet hôtel.")
      } finally {
        setLoading(false)
      }
    }
    fetchHotel()
  }, [id])

  if (loading) return (
    <>
      <Header />
      <DetailSkeleton />
    </>
  )

  if (error || !hotel) return (
    <>
      <Header />
      <Flex direction="column" align="center" justify="center" py={32} gap={3}>
        <Text fontSize="3xl">😕</Text>
        <Text color="gray.500">{error ?? "Hôtel introuvable."}</Text>
        <Button size="sm" colorScheme="blue" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </Flex>
    </>
  )

  const hotelEquipments = EQUIPMENT_LIST.filter(e => hotel.equipments?.includes(e.key))

  return (
    <>
      <Header />

      <Box maxW="1100px" mx="auto" px={{ base: 4, md: 6 }} py={8}>

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          color="gray.500"
          mb={5}
          pl={0}
          _hover={{ color: "blue.600", bg: "transparent" }}
          onClick={() => navigate(-1)}
        >
          <Flex align="center" gap={2}>
            <FaArrowLeft size={12} />
            Retour aux hôtels
          </Flex>
        </Button>

        {/* Title row */}
        <Flex justify="space-between" align="flex-start" mb={6} gap={4} flexWrap="wrap">
          <Box>
            <Text fontSize="3xl" fontWeight={900} color="gray.900" lineHeight="1.1" mb={2}>
              {hotel.name ?? "Vincci Helios Beach"}
            </Text>
            <Flex align="center" gap={3} flexWrap="wrap">
              <Flex align="center" gap={1.5}>
                <Box color="gray.400"><FaMapMarkerAlt size={13} /></Box>
                <Text fontSize="sm" color="gray.500">{hotel.address}</Text>
              </Flex>
              <Flex align="center" gap={1.5}>
                <StarRating rating={avg} />
                <Text fontSize="sm" color="gray.500" fontWeight={500}>
                  {avg.toFixed(1)} ({reviews.length} avis)
                </Text>
              </Flex>
            </Flex>
          </Box>
        </Flex>

        {/* Image gallery */}
        <Box mb={10}>
          <ImageGallery images={hotel.images} />
        </Box>

        {/* Single column content */}
        <VStack align="stretch" spacing={10}>

          {/* Description */}
          <Box>
            <SectionTitle>À propos</SectionTitle>
            <Text
              fontSize="sm"
              color="gray.600"
              lineHeight="1.9"
              whiteSpace="pre-line"
            >
              {hotel.description}
            </Text>
          </Box>

          {/* Equipments */}
          {hotelEquipments.length > 0 && (
            <Box>
              <SectionTitle>Équipements & services</SectionTitle>
              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={3}>
                {hotelEquipments.map(({ key, label, Icon, desc }) => (
                  <Flex
                    key={key}
                    align="center"
                    gap={3}
                    p={3}
                    bg="gray.50"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Flex
                      w="38px" h="38px"
                      align="center" justify="center"
                      bg="blue.50"
                      color="blue.500"
                      borderRadius="lg"
                      flexShrink={0}
                    >
                      <Icon size={16} />
                    </Flex>
                    <Box>
                      <Text fontSize="sm" fontWeight={600} color="gray.800">{label}</Text>
                      <Text fontSize="xs" color="gray.400">{desc}</Text>
                    </Box>
                  </Flex>
                ))}
              </Grid>
            </Box>
          )}

          {/* Rooms with integrated booking search */}
          {hotel.rooms?.length > 0 && (
            <RoomsSection rooms={hotel.rooms} />
          )}

          {/* Reviews */}
          <Box>
            <Flex align="center" justify="space-between" mb={4} pb={2} borderBottom="2px solid" borderColor="blue.100">
              <Text fontSize="xl" fontWeight={800} color="gray.800">
                Avis clients
              </Text>
              <Flex align="center" gap={2}>
                <StarRating rating={avg} size={14} />
                <Text fontWeight={700} color="gray.700">{avg.toFixed(1)}</Text>
                <Text fontSize="sm" color="gray.400">/ 5 · {reviews.length} avis</Text>
              </Flex>
            </Flex>

            {/* Rating bar breakdown */}
            <Box mb={6}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => r.rating === star).length
                const pct   = reviews.length ? (count / reviews.length) * 100 : 0
                return (
                  <Flex key={star} align="center" gap={3} mb={1.5}>
                    <Flex align="center" gap={1} w="40px" flexShrink={0}>
                      <Text fontSize="xs" color="gray.500">{star}</Text>
                      <FaStar size={10} color="#F59E0B" />
                    </Flex>
                    <Box flex={1} bg="gray.100" borderRadius="full" h="6px" overflow="hidden">
                      <Box
                        bg="yellow.400"
                        h="100%"
                        borderRadius="full"
                        w={`${pct}%`}
                        transition="width 0.4s"
                      />
                    </Box>
                    <Text fontSize="xs" color="gray.400" w="20px" textAlign="right">{count}</Text>
                  </Flex>
                )
              })}
            </Box>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
              {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
            </Grid>
          </Box>

        </VStack>
      </Box>
    </>
  )
}