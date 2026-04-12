import React, { useEffect, useRef, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  Box, Flex, Grid, Text, Button, Badge, Image,
  Skeleton, SkeletonText, HStack, VStack, Avatar,
} from "@chakra-ui/react"
import {
  FaMapMarkerAlt, FaWifi, FaParking, FaSwimmingPool,
  FaSpa, FaDumbbell, FaStar, FaStarHalfAlt, FaRegStar,
  FaChevronLeft, FaChevronRight, FaArrowLeft,
  FaUserFriends, FaMoon, FaCheck, FaBed,
} from "react-icons/fa"
import {
  LuCheck, LuChevronDown, LuChevronUp,
  LuUsers, LuShoppingCart, LuX,
} from "react-icons/lu"
import Header from "../../components/home/Header"
import { Axios, AxiosToken, imageURL } from "../../Api/Api"
import DatePicker from "../../components/ui/DatePicker"
import { useProfile } from "../../Context/useProfile"
import { Helmet } from "react-helmet"
import { Tooltip } from '../../components/ui/tooltip'

/* ── Equipment list ─────────────────────────────────────────────── */
const EQUIPMENT_LIST = [
  { key: "spa", label: "Spa & Bien-être", Icon: FaSpa, desc: "Hammam, massages, soins" },
  { key: "gym", label: "Salle de sport", Icon: FaDumbbell, desc: "Équipements modernes" },
  { key: "piscine", label: "Piscine", Icon: FaSwimmingPool, desc: "Extérieure & intérieure chauffée" },
  { key: "wifi", label: "Wi-Fi gratuit", Icon: FaWifi, desc: "Dans tout l'établissement" },
  { key: "parking", label: "Parking", Icon: FaParking, desc: "Parking privé sécurisé" },
]

/* ── Star rating ────────────────────────────────────────────────── */
function StarRating({ rating, size = 13 }) {
  return (
    <Flex align="center" gap="2px">
      {[1, 2, 3, 4, 5].map(i => {
        const Icon = i <= Math.floor(rating) ? FaStar
          : i - 0.5 <= rating ? FaStarHalfAlt : FaRegStar
        return <Icon key={i} size={size} color="#F59E0B" />
      })}
    </Flex>
  )
}

/* ── Image gallery ──────────────────────────────────────────────── */
function ImageGallery({ images }) {
  const [active, setActive] = useState(0)
  if (!images?.length) return <Skeleton height="480px" borderRadius="2xl" />
  const prev = () => setActive(i => (i - 1 + images.length) % images.length)
  const next = () => setActive(i => (i + 1) % images.length)
  return (
    <Box>
      <Box position="relative" height="480px" borderRadius="2xl" overflow="hidden" mb={3}>
        <Image src={`${imageURL}/services/${images[active].image_url}`}
          alt="hotel" w="100%" h="100%" objectFit="cover" transition="opacity 0.3s" />
        <Badge position="absolute" bottom={4} right={4}
          bg="blackAlpha.700" color="white" borderRadius="full" px={3} py={1}
          fontSize="xs" fontWeight={600}>
          {active + 1} / {images.length}
        </Badge>
        {images.length > 1 && (
          <>
            <Button position="absolute" left={3} top="50%" transform="translateY(-50%)"
              borderRadius="full" bg="white" color="gray.700"
              w="38px" h="38px" minW="38px" p={0}
              boxShadow="md" _hover={{ bg: "gray.100" }} onClick={prev}>
              <FaChevronLeft size={13} />
            </Button>
            <Button position="absolute" right={3} top="50%" transform="translateY(-50%)"
              borderRadius="full" bg="white" color="gray.700"
              w="38px" h="38px" minW="38px" p={0}
              boxShadow="md" _hover={{ bg: "gray.100" }} onClick={next}>
              <FaChevronRight size={13} />
            </Button>
          </>
        )}
      </Box>
      <Flex gap={2} overflowX="auto" pb={1}>
        {images.map((img, i) => (
          <Box key={img.id} flexShrink={0} w="80px" h="60px" borderRadius="lg"
            overflow="hidden" cursor="pointer" border="2.5px solid"
            borderColor={i === active ? "blue.500" : "transparent"}
            opacity={i === active ? 1 : 0.65} transition="all 0.15s"
            _hover={{ opacity: 1 }} onClick={() => setActive(i)}>
            <Image src={`${imageURL}/services/${img.image_url}`}
              w="100%" h="100%" objectFit="cover" />
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

function GuestCounter({ label, sublabel, value, min, onIncrease, onDecrease }) {
  return (
    <Flex justify="space-between" align="center" py={2.5}>
      <Box>
        <Text fontSize="sm" fontWeight={600} color="gray.800">{label}</Text>
        {sublabel && <Text fontSize="xs" color="gray.400">{sublabel}</Text>}
      </Box>
      <Flex align="center" gap={3}>
        <Box as="button" onClick={onDecrease}
          w="28px" h="28px" border="1px solid"
          borderColor={value <= min ? "gray.200" : "blue.300"}
          borderRadius="full" display="flex" alignItems="center" justifyContent="center"
          color={value <= min ? "gray.300" : "blue.500"} bg="white"
          cursor={value <= min ? "not-allowed" : "pointer"}
          fontSize="lg" lineHeight={1} transition="all 0.15s"
          _hover={value > min ? { bg: "blue.50" } : {}}>–</Box>
        <Text fontSize="sm" fontWeight={700} minW="16px" textAlign="center" color="gray.800">
          {value}
        </Text>
        <Box as="button" onClick={onIncrease}
          w="28px" h="28px" border="1px solid" borderColor="blue.300"
          borderRadius="full" display="flex" alignItems="center" justifyContent="center"
          color="blue.500" bg="white" cursor="pointer"
          fontSize="lg" lineHeight={1} transition="all 0.15s"
          _hover={{ bg: "blue.50" }}>+</Box>
      </Flex>
    </Flex>
  )
}

function RoomGuestSelector({ guestRooms, setGuestRooms }) {
  const [open, setOpen] = useState(false)
  const ref = React.useRef(null)

  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const totalRooms = guestRooms.length
  const totalAdults = guestRooms.reduce((s, r) => s + r.adults, 0)
  const totalChildren = guestRooms.reduce((s, r) => s + r.children, 0)

  const updateRoom = (idx, field, val) =>
    setGuestRooms(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  const addRoom = () => setGuestRooms(prev => [...prev, { adults: 1, children: 0 }])
  const removeRoom = idx => setGuestRooms(prev => prev.filter((_, i) => i !== idx))

  return (
    <Box position="relative" ref={ref}>
      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>
          Chambres & voyageurs
        </Text>
        <Box as="button" w="full" h="42px" display="flex" alignItems="center" gap={2}
          px={3} border="1px solid"
          borderColor={open ? "blue.400" : "gray.200"}
          borderRadius="lg" bg="gray.50" cursor="pointer" textAlign="left"
          boxShadow={open ? "0 0 0 2px rgba(49,130,206,0.15)" : "none"}
          transition="all 0.15s" onClick={() => setOpen(o => !o)}
          _hover={{ borderColor: "blue.300" }}>
          <Box as={FaUserFriends} color="gray.400" flexShrink={0} />
          <Text fontSize="sm" fontWeight={500} color="gray.700" noOfLines={1}>
            {totalRooms} Chambre{totalRooms > 1 ? "s" : ""} ·{" "}
            {totalAdults} Adulte{totalAdults > 1 ? "s" : ""}
            {totalChildren > 0 ? ` · ${totalChildren} Enfant${totalChildren > 1 ? "s" : ""}` : ""}
          </Text>
        </Box>
      </Box>

      {open && (
        <Box position="absolute" top="calc(100% + 6px)" left={0}
          zIndex={1500} bg="white" border="1px solid" borderColor="gray.200"
          borderRadius="xl" boxShadow="0 8px 32px rgba(0,0,0,0.12)"
          w="300px" p={4}>
          {guestRooms.map((room, idx) => (
            <Box key={idx} mb={idx < guestRooms.length - 1 ? 3 : 0}>
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="sm" fontWeight={700} color="gray.800">
                  Chambre {idx + 1}
                </Text>
                {guestRooms.length > 1 && (
                  <Box as="button" onClick={() => removeRoom(idx)}
                    color="gray.400" _hover={{ color: "red.500" }}
                    bg="none" border="none" cursor="pointer"
                    display="flex" alignItems="center" transition="color 0.15s">
                    <Box as="svg" w="14px" h="14px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                    </Box>
                  </Box>
                )}
              </Flex>
              <GuestCounter label="Adulte(s)" min={1} value={room.adults}
                onIncrease={() => updateRoom(idx, "adults", room.adults + 1)}
                onDecrease={() => updateRoom(idx, "adults", Math.max(1, room.adults - 1))} />
              <Box borderTop="1px solid" borderColor="gray.50" />
              <GuestCounter label="Enfant(s)" sublabel="De 0 à 12 ans" min={0}
                value={room.children}
                onIncrease={() => updateRoom(idx, "children", room.children + 1)}
                onDecrease={() => updateRoom(idx, "children", Math.max(0, room.children - 1))} />
              {idx < guestRooms.length - 1 && (
                <Box mt={3} borderTop="1px solid" borderColor="gray.100" />
              )}
            </Box>
          ))}
          <Box as="button" onClick={addRoom} mt={3} color="blue.500"
            fontSize="sm" fontWeight={600} bg="none" border="none" cursor="pointer"
            _hover={{ textDecoration: "underline" }}>
            + Ajouter une chambre
          </Box>
          <Flex justify="flex-end" mt={3} pt={3} borderTop="1px solid" borderColor="gray.100">
            <Button colorScheme="blue" size="sm" borderRadius="lg" px={6}
              onClick={() => setOpen(false)}>
              Valider
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  )
}


function RoomCard({ slotIndex, room, nights, selected, onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const isSelected = !!selected

  return (
    <Box
      border="1.5px solid"
      borderColor={isSelected ? "blue.400" : "gray.200"}
      borderRadius="2xl"
      bg={isSelected ? "blue.50" : "white"}
      overflow="hidden"
      boxShadow={isSelected
        ? "0 0 0 3px rgba(49,130,206,0.12)"
        : "0 1px 8px rgba(0,0,0,0.05)"}
      transition="all 0.2s">

      {/* Slot header strip */}
      <Flex px={5} py={3}
        bg={isSelected ? "blue.600" : "gray.50"}
        borderBottom="1px solid"
        borderColor={isSelected ? "blue.500" : "gray.100"}
        align="center" justify="space-between">
        <Flex align="center" gap={2.5}>
          <Flex w="26px" h="26px" borderRadius="lg"
            bg={isSelected ? "whiteAlpha.200" : "blue.50"}
            color={isSelected ? "white" : "blue.500"}
            align="center" justify="center" flexShrink={0}>
            <FaBed size={12} />
          </Flex>
          <Text fontSize="sm" fontWeight={700}
            color={isSelected ? "white" : "gray.700"}>
            Chambre {slotIndex + 1}
          </Text>
          {(room.requestedAdults > 0 || room.requestedChildren > 0) && (
            <Flex align="center" gap={1.5}
              bg={isSelected ? "whiteAlpha.200" : "blue.100"}
              borderRadius="full" px={2} py={0.5}>
              <LuUsers size={10} color={isSelected ? "white" : "#2B6CB0"} />
              <Text fontSize="xs" fontWeight={600}
                color={isSelected ? "white" : "blue.700"}>
                {room.requestedAdults} adulte{room.requestedAdults > 1 ? "s" : ""}
                {room.requestedChildren > 0
                  ? ` + ${room.requestedChildren} enfant${room.requestedChildren > 1 ? "s" : ""}`
                  : ""}
              </Text>
            </Flex>
          )}
        </Flex>
        {isSelected && (
          <Flex align="center" gap={1.5} bg="whiteAlpha.200"
            borderRadius="full" px={2.5} py={1}>
            <LuCheck size={12} color="white" />
            <Text fontSize="xs" fontWeight={700} color="white">Sélectionné</Text>
          </Flex>
        )}
      </Flex>

      {/* Room body */}
      <Box px={5} py={4}>
        <Flex justify="space-between" align="flex-start" gap={4} flexWrap="wrap">

          {/* Left */}
          <Box flex={1} minW="220px">
            <Text fontWeight={800} fontSize="md" color="gray.900" mb={2}>
              {room.name}
            </Text>
            <VStack align="stretch" spacing={1.5} mb={3}>
              <Flex align="center" gap={2}>
                <Box color="blue.400"><FaUserFriends size={12} /></Box>
                <Text fontSize="sm" color="gray.600">
                  Capacité :{" "}
                  <Text as="span" fontWeight={600}>
                    {room.capacity} personne{room.capacity > 1 ? "s" : ""}
                  </Text>
                </Text>
              </Flex>
              {nights && (
                <Flex align="center" gap={2}>
                  <Box color="blue.400"><FaMoon size={12} /></Box>
                  <Text fontSize="sm" color="gray.600">
                    <Text as="span" fontWeight={600}>
                      {nights} nuit{nights > 1 ? "s" : ""}
                    </Text>
                  </Text>
                </Flex>
              )}
            </VStack>

            {/* Price breakdown toggle */}
            <Box as="button" type="button"
              onClick={() => setExpanded(e => !e)}
              fontSize="xs" color="blue.500" fontWeight={600}
              cursor="pointer" _hover={{ textDecoration: "underline" }}>
              <Flex align="center" gap={1}>
                {expanded ? <LuChevronUp size={12} /> : <LuChevronDown size={12} />}
                {expanded ? "Masquer" : "Voir"} le détail du prix
              </Flex>
            </Box>

            {expanded && (
              <Box mt={3} p={3} bg="gray.50" borderRadius="xl"
                border="1px solid" borderColor="gray.100">
                <VStack align="stretch" spacing={1.5}>
                  <Flex justify="space-between">
                    <Text fontSize="xs" color="gray.500">
                      {room.priceByDay} TND × {nights} nuit{nights > 1 ? "s" : ""}
                    </Text>
                    <Text fontSize="xs" fontWeight={600} color="gray.700">
                      {room.priceByDay * nights} TND
                    </Text>
                  </Flex>
                  {room.requestedAdults > 0 && (
                    <Flex justify="space-between">
                      <Text fontSize="xs" color="gray.500">
                        +{room.priceByAdult} TND × {room.requestedAdults} adulte{room.requestedAdults > 1 ? "s" : ""}
                      </Text>
                      <Text fontSize="xs" fontWeight={600} color="gray.700">
                        {room.priceByAdult * room.requestedAdults} TND
                      </Text>
                    </Flex>
                  )}
                  {room.requestedChildren > 0 && (
                    <Flex justify="space-between">
                      <Text fontSize="xs" color="gray.500">
                        +{room.priceByChildren} TND × {room.requestedChildren} enfant{room.requestedChildren > 1 ? "s" : ""}
                      </Text>
                      <Text fontSize="xs" fontWeight={600} color="gray.700">
                        {room.priceByChildren * room.requestedChildren} TND
                      </Text>
                    </Flex>
                  )}
                  <Box borderTop="1px solid" borderColor="gray.200" pt={1.5}>
                    <Flex justify="space-between">
                      <Text fontSize="xs" fontWeight={700} color="gray.700">Prix / nuit total</Text>
                      <Text fontSize="xs" fontWeight={700} color="blue.600">
                        {room.pricePerNight} TND
                      </Text>
                    </Flex>
                  </Box>
                </VStack>
              </Box>
            )}
          </Box>

          {/* Right */}
          <Box textAlign="right" flexShrink={0} minW="130px">
            <Text fontSize="xs" color="gray.400" mb={0.5}>
              {nights ? "Total" : "À partir de"}
            </Text>
            <Flex align="baseline" gap={1} justify="flex-end">
              <Text fontSize="2xl" fontWeight={900} lineHeight="1.1"
                color={isSelected ? "blue.600" : "gray.800"}>
                {room.totalPrice ?? room.pricePerNight}
              </Text>
              <Text fontSize="xs" color="gray.500">TND</Text>
            </Flex>
            {nights && room.pricePerNight && (
              <Text fontSize="9px" color="gray.400" mt={0.5}>
                {room.pricePerNight} TND/nuit × {nights}
              </Text>
            )}
            <Button mt={3} size="sm" borderRadius="xl" px={5} fontWeight={700}
              colorScheme={isSelected ? "red" : "blue"}
              variant={isSelected ? "outline" : "solid"}
              onClick={() => onSelect(isSelected ? null : room)}>
              {isSelected
                ? <Flex align="center" gap={1.5}><LuX size={12} />Retirer</Flex>
                : <Flex align="center" gap={1.5}><LuCheck size={12} />Choisir</Flex>}
            </Button>
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

function BookingSummary({ selections, nights, totalRooms, id, checkIn, checkOut, guestRooms }) {
  const { user } = useProfile();
  const handlePayment = async () => {
    try {
      const updatedGuestRooms = guestRooms.map((guest, index) => {
        return {
          ...guest,
          room_id: selections[index].roomId
        };
      });
      const res = await AxiosToken.post(`/booking/hotel/${id}`, {
        check_in_date: checkIn,
        check_out_date: checkOut,
        rooms: updatedGuestRooms
      });
      window.location = res.data.url
    } catch {
      console.error("error")
    }
  }
  const selectedCount = Object.values(selections).filter(Boolean).length
  const grandTotal = Object.values(selections)
    .filter(Boolean)
    .reduce((s, r) => s + (r.totalPrice ?? 0), 0)

  if (selectedCount === 0) return null

  return (
    <Box mt={5} bg="white" borderRadius="2xl" p={5}
      border="1.5px solid" borderColor="blue.300"
      boxShadow="0 4px 24px rgba(49,130,206,0.15)"
      position="sticky" bottom={4} zIndex={10}>
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="sm" fontWeight={700} color="gray.700" mb={0.5}>
            Récapitulatif de votre sélection
          </Text>
          <Flex align="center" gap={2} flexWrap="wrap">
            <Badge colorScheme="blue" borderRadius="full" px={2}>
              {selectedCount}/{totalRooms} chambre{selectedCount > 1 ? "s" : ""} sélectionnée{selectedCount > 1 ? "s" : ""}
            </Badge>
            {nights && (
              <Text fontSize="xs" color="gray.500">
                · {nights} nuit{nights > 1 ? "s" : ""}
              </Text>
            )}
          </Flex>
          <Flex gap={2} mt={2} flexWrap="wrap">
            {Object.entries(selections).map(([slotIdx, room]) =>
              room ? (
                <Flex key={slotIdx} align="center" gap={1.5}
                  bg="blue.50" borderRadius="lg" px={2.5} py={1}>
                  <FaBed size={10} color="#2B6CB0" />
                  <Text fontSize="xs" color="blue.700" fontWeight={600}>
                    Ch.{Number(slotIdx) + 1}: {room.totalPrice} TND
                  </Text>
                </Flex>
              ) : null
            )}
          </Flex>
        </Box>
        <Flex align="center" gap={5}>
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.400">Total général</Text>
            <Flex align="baseline" gap={1}>
              <Text fontSize="2xl" fontWeight={900} color="blue.600" lineHeight={1}>
                {grandTotal}
              </Text>
              <Text fontSize="sm" color="gray.500">TND</Text>
            </Flex>
          </Box>
          <Tooltip content={
            !user
              ? "Vous devez vous connecter pour réserver"
              : user.role !== "client"
                ? "Seuls les clients peuvent effectuer une réservation"
                : selectedCount < totalRooms
                  ? `Sélectionnez encore ${totalRooms - selectedCount} chambre${totalRooms - selectedCount > 1 ? "s" : ""
                  }`
                  : "Prêt à réserver"
          }
          >
            <Button colorScheme="blue" borderRadius="xl" px={7} h="46px"
              onClick={handlePayment}
              fontWeight={700}
              disabled={((!user || user.role !== "client") || selectedCount < totalRooms)}
              isDisabled={selectedCount < totalRooms}>
              <Flex align="center" gap={2}>
                <LuShoppingCart size={15} />
                {selectedCount < totalRooms
                  ? `Sélectionnez encore ${totalRooms - selectedCount} chambre${totalRooms - selectedCount > 1 ? "s" : ""}`
                  : "Réserver maintenant"}
              </Flex>
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  )
}

/* ── RoomsSection ───────────────────────────────────────────────── */
function RoomsSection({ id, location }) {
  const [checkIn, setCheckIn] = useState(location?.checkIn ?? "")
  const [checkOut, setCheckOut] = useState(location?.checkOut ?? "")
  const [guestRooms, setGuestRooms] = useState(
    location?.rooms || [{ adults: 2, children: 0 }]
  )
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selections, setSelections] = useState({})
  const formatDate = (d) => new Date(d).toISOString().split('T')[0]

  const nights = (() => {
    if (!checkIn || !checkOut) return null
    const d = (new Date(checkOut) - new Date(checkIn)) / 86400000
    return d > 0 ? Math.round(d) : null
  })()

  const fetchRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      setSelections({})
      const roomsArray = guestRooms.map(r => [r.adults, r.children])
      const res = await Axios.post(`/service/get/hotel/room/search/${id}`, {
        checkIn: formatDate(checkIn), checkOut: formatDate(checkOut), rooms: roomsArray,
      })
      setHotel(res.data.hotel)
    } catch {
      setError("Aucune chambre disponible pour ces dates.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRooms() }, [])

  const totalRooms = hotel?.rooms?.length ?? 0
  const handleSelect = (slotIndex, room) =>
    setSelections(prev => ({ ...prev, [slotIndex]: room }))

  return (
    <Box>
      <SectionTitle>Chambres disponibles</SectionTitle>

      {/* Search bar */}
      <Box bg="white" border="1px solid" borderColor="gray.100"
        borderRadius="2xl" boxShadow="0 2px 16px rgba(0,0,0,0.06)"
        p={5} mb={6}>
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr auto" }}
          gap={4} align="flex-end">
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>
              Dates de séjour
            </Text>
            <DatePicker checkIn={checkIn} checkOut={checkOut}
              setCheckIn={setCheckIn} setCheckOut={setCheckOut} isBorder={true} />
          </Box>
          <RoomGuestSelector guestRooms={guestRooms} setGuestRooms={setGuestRooms} />
          <Button colorScheme="blue" borderRadius="xl" px={6} h="42px"
            fontWeight={600} fontSize="sm" alignSelf="flex-end"
            loading={loading} loadingText="Recherche…"
            onClick={fetchRooms}>
            Vérifier les disponibilités
          </Button>
        </Grid>

        {nights && (
          <Flex align="center" gap={2} mt={3} pt={3}
            borderTop="1px solid" borderColor="gray.100">
            <FaMoon size={11} color="#718096" />
            <Text fontSize="xs" color="gray.500">
              <Text as="span" fontWeight={700} color="gray.700">
                {nights} nuit{nights > 1 ? "s" : ""}
              </Text>
              {" "}· du {new Date(checkIn).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              {" "}au {new Date(checkOut).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
            </Text>
          </Flex>
        )}
      </Box>

      {/* Loading */}
      {loading && (
        <VStack spacing={4} align="stretch">
          {[1, 2].map(i => (
            <Box key={i} bg="white" borderRadius="2xl" overflow="hidden"
              border="1px solid" borderColor="gray.100">
              <Skeleton h="52px" />
              <Box p={5}><SkeletonText noOfLines={4} spacing={3} /></Box>
            </Box>
          ))}
        </VStack>
      )}

      {/* Error */}
      {!loading && error && (
        <Flex direction="column" align="center" py={12} gap={3}
          bg="white" borderRadius="2xl"
          border="1px dashed" borderColor="gray.200">
          <Text fontWeight={600} color="gray.600">{error}</Text>
          <Text fontSize="sm" color="gray.400">
            Modifiez les dates ou le nombre de voyageurs.
          </Text>
        </Flex>
      )}

      {/* Results */}
      {!loading && !error && hotel && (
        <>
          <Flex align="center" gap={3} mb={5} flexWrap="wrap">
            <Text fontSize="sm" color="gray.500">
              <Text as="span" fontWeight={700} color="gray.800">
                {totalRooms} chambre{totalRooms > 1 ? "s" : ""} à sélectionner
              </Text>
              {" "}pour votre séjour
            </Text>
            {Object.values(selections).filter(Boolean).length > 0 && (
              <Badge colorScheme="green" borderRadius="full" px={2.5} py={0.5}>
                {Object.values(selections).filter(Boolean).length}/{totalRooms} sélectionnée{Object.values(selections).filter(Boolean).length > 1 ? "s" : ""}
              </Badge>
            )}
          </Flex>

          <VStack spacing={4} align="stretch">
            {hotel.rooms.map((room, idx) => (
              <RoomCard
                key={idx}
                slotIndex={idx}
                room={room}
                nights={nights ?? hotel.nights}
                selected={selections[idx] ?? null}
                onSelect={roomOrNull => handleSelect(idx, roomOrNull)}
              />
            ))}
          </VStack>

          <BookingSummary
            id={id}
            guestRooms={guestRooms}
            checkIn={checkIn}
            checkOut={checkOut}
            selections={selections}
            nights={nights ?? hotel.nights}
            totalRooms={totalRooms}
          />
        </>
      )}
    </Box>
  )
}

/* ── ReviewCard ─────────────────────────────────────────────────── */
function ReviewCard({ review }) {
  return (
    <Box bg="white" border="1px solid" borderColor="gray.100"
      borderRadius="xl" p={4} boxShadow="0 1px 6px rgba(0,0,0,0.04)">
      <Flex align="center" gap={3} mb={3}>
        <Avatar.Root size="sm" w="38px" h="38px">
          <Avatar.Fallback bg="blue.100" color="blue.700"
            fontSize="xs" fontWeight={700} name={review.author} />
        </Avatar.Root>
        <Box flex={1}>
          <Text fontWeight={600} fontSize="sm" color="gray.800">{review.author}</Text>
          <Text fontSize="xs" color="gray.400">{review.date}</Text>
        </Box>
        <StarRating rating={review.rating} size={12} />
      </Flex>
      <Text fontSize="sm" color="gray.600" lineHeight="1.7">{review.comment}</Text>
    </Box>
  )
}

/* ── DetailSkeleton ─────────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <Box maxW="1100px" mx="auto" px={6} py={10}>
      <Skeleton height="480px" borderRadius="2xl" mb={3} />
      <Flex gap={2} mb={8}>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} w="80px" h="60px" borderRadius="lg" />)}
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

/* ── SectionTitle ───────────────────────────────────────────────── */
function SectionTitle({ children }) {
  return (
    <Text fontSize="xl" fontWeight={800} color="gray.800"
      mb={4} pb={2} borderBottom="2px solid" borderColor="blue.100">
      {children}
    </Text>
  )
}

function avgRating(reviews) {
  if (!reviews?.length) return 0
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
}


export default function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reviews = (hotel?.hotelReview ?? []).map(r => ({
    id: r.id,
    author: r.clientReview?.name ?? "Anonyme",
    rating: r.rate,
    date: new Date(r.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    comment: r.review,
  }))
  const avg = avgRating(reviews)

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setLoading(true)
        const res = await Axios.get(`/service/get/hotel/${id}`)
        const data = res.data.hotel
        setHotel(Array.isArray(data) ? data[0] : data)
      } catch {
        setError("Impossible de charger cet hôtel.")
      } finally {
        setLoading(false)
      }
    }
    fetchHotel()
  }, [id])

  if (loading) return <><Header /><DetailSkeleton /></>

  if (error || !hotel) return (
    <>
      <Header />
      <Flex direction="column" align="center" justify="center" py={32} gap={3}>
        <Text color="gray.500">{error ?? "Hôtel introuvable."}</Text>
        <Button size="sm" colorScheme="blue" onClick={() => navigate(-1)}>Retour</Button>
      </Flex>
    </>
  )

  const hotelEquipments = EQUIPMENT_LIST.filter(e => hotel.equipments?.includes(e.key))

  return (
    <>
      <Helmet title={hotel.name}></Helmet>
      <Header />

      <Box maxW="1100px" mx="auto" px={{ base: 4, md: 6 }} py={8}>

        {/* Back */}
        <Button variant="ghost" size="sm" color="gray.500" mb={5} pl={0}
          _hover={{ color: "blue.600", bg: "transparent" }}
          onClick={() => navigate(-1)}>
          <Flex align="center" gap={2}>
            <FaArrowLeft size={12} />Retour aux hôtels
          </Flex>
        </Button>

        {/* Title */}
        <Flex justify="space-between" align="flex-start" mb={6} gap={4} flexWrap="wrap">
          <Box>
            <Text fontSize="3xl" fontWeight={900} color="gray.900" lineHeight="1.1" mb={2}>
              {hotel.name}
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

        {/* Gallery */}
        <Box mb={10}>
          <ImageGallery images={hotel.imagesHotel} />
        </Box>

        <VStack align="stretch" spacing={10}>

          {/* About */}
          <Box>
            <SectionTitle>À propos</SectionTitle>
            <Text fontSize="sm" color="gray.600" lineHeight="1.9" whiteSpace="pre-line">
              {hotel.description}
            </Text>
          </Box>

          {/* Equipments */}
          {hotelEquipments.length > 0 && (
            <Box>
              <SectionTitle>Équipements & services</SectionTitle>
              <Grid templateColumns={{ base: "1fr", sm: "repeat(2,1fr)", md: "repeat(3,1fr)" }} gap={3}>
                {hotelEquipments.map(({ key, label, Icon, desc }) => (
                  <Flex key={key} align="center" gap={3} p={3}
                    bg="gray.50" borderRadius="xl"
                    border="1px solid" borderColor="gray.100">
                    <Flex w="38px" h="38px" align="center" justify="center"
                      bg="blue.50" color="blue.500" borderRadius="lg" flexShrink={0}>
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

          {/* Rooms — slot-based */}
          <RoomsSection id={hotel.id} location={location.state} />

          {/* Reviews */}
          <Box>
            <Flex align="center" justify="space-between" mb={4} pb={2}
              borderBottom="2px solid" borderColor="blue.100">
              <Text fontSize="xl" fontWeight={800} color="gray.800">Avis clients</Text>
              <Flex align="center" gap={2}>
                <StarRating rating={avg} size={14} />
                <Text fontWeight={700} color="gray.700">{avg.toFixed(1)}</Text>
                <Text fontSize="sm" color="gray.400">/ 5 · {reviews.length} avis</Text>
              </Flex>
            </Flex>

            <Box mb={6}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => r.rating === star).length
                const pct = reviews.length ? (count / reviews.length) * 100 : 0
                return (
                  <Flex key={star} align="center" gap={3} mb={1.5}>
                    <Flex align="center" gap={1} w="40px" flexShrink={0}>
                      <Text fontSize="xs" color="gray.500">{star}</Text>
                      <FaStar size={10} color="#F59E0B" />
                    </Flex>
                    <Box flex={1} bg="gray.100" borderRadius="full" h="6px" overflow="hidden">
                      <Box bg="yellow.400" h="100%" borderRadius="full"
                        w={`${pct}%`} transition="width 0.4s" />
                    </Box>
                    <Text fontSize="xs" color="gray.400" w="20px" textAlign="right">
                      {count}
                    </Text>
                  </Flex>
                )
              })}
            </Box>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4}>
              {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
            </Grid>
          </Box>

        </VStack>
      </Box>
    </>
  )
}