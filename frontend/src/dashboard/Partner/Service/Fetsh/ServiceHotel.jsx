import { useEffect, useState } from "react";
import {
  Box, Container, Heading, Text, Image, SimpleGrid,
  Badge, Stack, Flex, Button, IconButton, HStack,
  VStack, Grid, Carousel,
  Icon,
} from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight, LuPencil, LuTrash2, LuPlus, LuBed, LuUsers, LuBanknote, LuHash } from "react-icons/lu";
import { FaStar, FaRegStar, FaWifi, FaParking, FaSwimmingPool, FaSpa, FaDumbbell, FaUtensils, FaSnowflake } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AxiosToken, imageURL } from "../../../../Api/Api";
import { Bed, MessageCircle } from "lucide-react";

/* ── Equipment icon map ─────────────────────────────────────────── */
const EQUIP_META = {
  wifi: { Icon: FaWifi, label: "Wi-Fi" },
  piscine: { Icon: FaSwimmingPool, label: "Piscine" },
  parking: { Icon: FaParking, label: "Parking" },
  spa: { Icon: FaSpa, label: "Spa" },
  gym: { Icon: FaDumbbell, label: "Gym" },
  restaurant: { Icon: FaUtensils, label: "Restaurant" },
  climatisation: { Icon: FaSnowflake, label: "Climatisation" },
}

/* ── Star display ───────────────────────────────────────────────── */
function Stars({ rating, size = 13 }) {
  return (
    <Flex align="center" gap="2px">
      {[1, 2, 3, 4, 5].map(i => {
        const Icon = i <= rating ? FaStar : FaRegStar
        return <Icon key={i} size={size} color={i <= rating ? "#F59E0B" : "#D1D5DB"} />
      })}
    </Flex>
  )
}

/* ── Section heading ────────────────────────────────────────────── */
function SectionHeading({ children, action }) {
  return (
    <Flex align="center" justify="space-between" mb={5}>
      <Box>
        <Text fontSize="xs" fontWeight={700} color="blue.500" textTransform="uppercase"
          letterSpacing="widest" mb={0.5}>
          Gestion
        </Text>
        <Heading size="md" color="gray.800" fontWeight={800}>{children}</Heading>
      </Box>
      {action}
    </Flex>
  )
}

/* ── Stat card ──────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color = "blue" }) {
  return (
    <Box
      bg="white" borderRadius="xl" p={4}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)"
    >
      <Flex align="center" gap={3}>
        <Flex
          w="40px" h="40px" borderRadius="lg"
          bg={`${color}.50`} color={`${color}.500`}
          align="center" justify="center" flexShrink={0}
        >
          <Icon size={16} />
        </Flex>
        <Box>
          <Text fontSize="xs" color="gray.400" fontWeight={500}>{label}</Text>
          <Text fontSize="lg" fontWeight={800} color="gray.800" lineHeight={1.2}>{value}</Text>
        </Box>
      </Flex>
    </Box>
  )
}

/* ── Room card ──────────────────────────────────────────────────── */
function RoomCard({ room, onEdit, onDelete }) {
  return (
    <Box
      bg="white" borderRadius="xl" p={5}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)"
      transition="box-shadow 0.2s, border-color 0.2s"
      _hover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.09)", borderColor: "blue.100" }}
    >
      <Flex justify="space-between" align="flex-start" gap={4}>
        <Box flex={1}>
          <Text fontWeight={700} fontSize="md" color="gray.800" mb={3}>{room.name}</Text>
          <Grid templateColumns="1fr 1fr" gap={2.5}>
            <Flex align="center" gap={2}>
              <Box color="blue.400"><LuUsers size={13} /></Box>
              <Text fontSize="sm" color="gray.600">
                Capacité : <Text as="span" fontWeight={600}>{room.capacity}</Text>
              </Text>
            </Flex>
            <Flex align="center" gap={2}>
              <Box color="blue.400"><LuBanknote size={13} /></Box>
              <Text fontSize="sm" color="gray.600">
                <Text as="span" fontWeight={700} color="blue.600">{room.price_by_day}</Text>
                <Text as="span" color="gray.400"> TND/nuit</Text>
              </Text>
            </Flex>
            <Flex align="center" gap={2}>
              <Box color="blue.400"><LuBed size={13} /></Box>
              <Text fontSize="sm" color="gray.600">
                <Text as="span" fontWeight={600}>{room.count}</Text> disponible{room.count > 1 ? "s" : ""}
              </Text>
            </Flex>
            {room.price_by_adult && (
              <Flex align="center" gap={2}>
                <Box color="blue.400"><LuHash size={13} /></Box>
                <Text fontSize="sm" color="gray.600">
                  +<Text as="span" fontWeight={600}>{room.price_by_adult}</Text> TND/adulte
                </Text>
              </Flex>
            )}
          </Grid>
        </Box>

        {/* Actions */}
        <VStack spacing={2} flexShrink={0}>
          <IconButton
            size="sm" variant="outline" borderRadius="lg"
            color="blue.500" borderColor="blue.200"
            _hover={{ bg: "blue.50" }}
            aria-label="Modifier"
            onClick={() => onEdit?.(room)}
          >
            <LuPencil size={13} />
          </IconButton>
          <IconButton
            size="sm" variant="outline" borderRadius="lg"
            color="red.400" borderColor="red.200"
            _hover={{ bg: "red.50" }}
            aria-label="Supprimer"
            onClick={() => onDelete?.(room.id)}
          >
            <LuTrash2 size={13} />
          </IconButton>
        </VStack>
      </Flex>
    </Box>
  )
}

/* ── Review card ────────────────────────────────────────────────── */
function ReviewCard({ review, index }) {
  const initials = review?.clientReview?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  return (
    <Box
      bg="white" borderRadius="xl" p={4}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 6px rgba(0,0,0,0.04)"
    >
      <Flex align="center" gap={3} mb={3}>
        <Flex
          w="36px" h="36px" borderRadius="full"
          bg="blue.100" color="blue.700"
          align="center" justify="center"
          fontSize="xs" fontWeight={700} flexShrink={0}
        >
          {initials}
        </Flex>
        <Box flex={1}>
          <Text fontWeight={600} fontSize="sm" color="gray.800">{review?.clientReview?.name}</Text>
          <Stars rating={review.rate} size={11} />
        </Box>
        <Badge
          colorScheme={review.rate >= 4 ? "green" : review.rating >= 3 ? "yellow" : "red"}
          borderRadius="full" px={2} fontSize="xs"
        >
          {review.rate}/5
        </Badge>
      </Flex>
      <Text fontSize="sm" color="gray.600" lineHeight="1.7" fontStyle="italic">
        "{review.review}"
      </Text>
    </Box>
  )
}

/* ── Empty state ────────────────────────────────────────────────── */
function EmptyState({ icon, title, subtitle }) {
  return (
    <Flex
      direction="column" align="center" justify="center"
      py={10} gap={2}
      bg="gray.50" borderRadius="xl"
      border="1px dashed" borderColor="gray.200"
    >
      <Icon as={icon} fontSize="2xl"/>
      <Text fontWeight={600} color="gray.600" fontSize="sm">{title}</Text>
      {subtitle && <Text fontSize="xs" color="gray.400">{subtitle}</Text>}
    </Flex>
  )
}


const ServiceHotel = () => {
  const [hotel, setHotel] = useState(null)
  const [showMore, setShowMore] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AxiosToken.get("/service/hotel/get")
        setHotel(response.data.hotel)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  if (!hotel) {
    return (
      <Container maxW="6xl" py={24}>
        <Flex direction="column" align="center" gap={4} textAlign="center">
          <Heading size="lg" color="gray.800">Aucun hôtel enregistré</Heading>
          <Text color="gray.500" maxW="360px">
            Vous n'avez pas encore ajouté d'hôtel. Commencez par créer votre établissement.
          </Text>
          <Button
            colorScheme="blue" borderRadius="xl" px={8} size="lg"
            leftIcon={<LuPlus />}
            onClick={() => navigate("hotel/add")}
          >
            Ajouter un hôtel
          </Button>
        </Flex>
      </Container>
    )
  }

  const avgRating = hotel.hotelReview?.length
    ? (hotel.hotelReview.reduce((s, r) => s + r.rate, 0) / hotel.hotelReview.length).toFixed(1)
    : null

  const minPrice = hotel.rooms?.length
    ? Math.min(...hotel.rooms.map(r => r.price_by_day))
    : null
  console.log(hotel)

  return (
    <Container maxW="6xl" py={8}>

      <Flex justify="space-between" align="flex-start" mb={8} gap={4} flexWrap="wrap">
        <Box>
          <Text fontSize="xs" fontWeight={700} color="blue.500" textTransform="uppercase"
            letterSpacing="widest" mb={1}>
            Mon établissement
          </Text>
          <Heading size="xl" color="gray.900" fontWeight={900} mb={1}>
            {hotel.name ?? hotel.address}
          </Heading>
          <Flex align="center" gap={2} flexWrap="wrap">
            <Badge colorScheme="green" borderRadius="full" px={2.5} py={0.5} fontSize="xs">
              Actif
            </Badge>
            {avgRating && (
              <Flex align="center" gap={1.5}>
                <Stars rating={parseFloat(avgRating)} size={12} />
                <Text fontSize="sm" color="gray.500">{avgRating} / 5</Text>
              </Flex>
            )}
          </Flex>
        </Box>
        <Button
          colorScheme="blue" borderRadius="xl" leftIcon={<LuPencil size={13} />}
          size="sm" px={5}
        >
          Modifier l'hôtel
        </Button>
      </Flex>

      {(hotel.rooms?.length > 0 || minPrice) && (
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={3} mb={8}>
          <StatCard icon={LuBed} label="Chambres" value={hotel.rooms?.length ?? 0} color="blue" />
          <StatCard icon={LuBanknote} label="Prix min/nuit" value={minPrice ? `${minPrice} TND` : "—"} color="green" />
          <StatCard icon={FaStar} label="Note moyenne" value={avgRating ? `${avgRating}/5` : "—"} color="yellow" />
          <StatCard icon={LuUsers} label="Avis clients" value={hotel.hotelReview?.length ?? 0} color="purple" />
        </Grid>
      )}

      {hotel.images?.length > 0 && (
        <Box mb={10} borderRadius="2xl" overflow="hidden" boxShadow="0 4px 24px rgba(0,0,0,0.1)">
          <Carousel.Root slideCount={hotel.images.length}>
            <Box position="relative">
              <Carousel.ItemGroup>
                {hotel.images.map((item, index) => (
                  <Carousel.Item key={index} index={index}>
                    <Image
                      src={`${imageURL}/services/${item.image_url}`}
                      w="100%" h="420px" objectFit="cover"
                    />
                  </Carousel.Item>
                ))}
              </Carousel.ItemGroup>

              <Carousel.Control>
                <Carousel.PrevTrigger asChild>
                  <IconButton
                    size="sm" borderRadius="full"
                    bg="white" color="gray.700"
                    boxShadow="md" _hover={{ bg: "gray.100" }}
                    position="absolute" left={3} top="50%" transform="translateY(-50%)"
                    aria-label="Précédent"
                  >
                    <LuChevronLeft />
                  </IconButton>
                </Carousel.PrevTrigger>
                <Carousel.NextTrigger asChild>
                  <IconButton
                    size="sm" borderRadius="full"
                    bg="white" color="gray.700"
                    boxShadow="md" _hover={{ bg: "gray.100" }}
                    position="absolute" right={3} top="50%" transform="translateY(-50%)"
                    aria-label="Suivant"
                  >
                    <LuChevronRight />
                  </IconButton>
                </Carousel.NextTrigger>
              </Carousel.Control>
            </Box>

            <Flex gap={2} p={3} bg="gray.50" overflowX="auto">
              <Carousel.IndicatorGroup style={{ display: "flex", gap: "8px" }}>
                {hotel.images.map((item, index) => (
                  <Carousel.Indicator
                    key={index} index={index} unstyled
                    _current={{ outline: "2.5px solid #3182CE", outlineOffset: "2px" }}
                    style={{ borderRadius: "6px", overflow: "hidden", cursor: "pointer", flexShrink: 0 }}
                  >
                    <Image
                      w="72px" h="52px"
                      src={`${imageURL}/services/${item.image_url}`}
                      objectFit="cover"
                    />
                  </Carousel.Indicator>
                ))}
              </Carousel.IndicatorGroup>
            </Flex>
          </Carousel.Root>
        </Box>
      )}

      <Box
        bg="white" borderRadius="2xl" p={6} mb={8}
        border="1px solid" borderColor="gray.100"
        boxShadow="0 1px 8px rgba(0,0,0,0.05)"
      >
        <Text fontSize="xs" fontWeight={700} color="blue.500" textTransform="uppercase"
          letterSpacing="widest" mb={2}>
          À propos
        </Text>
        <Text color="gray.600" lineHeight="1.9" fontSize="sm" whiteSpace="pre-line">
          {showMore || hotel.description.length <= 200
            ? hotel.description
            : hotel.description.slice(0, 200) + "…"}
        </Text>
        {hotel.description.length > 200 && (
          <Button
            mt={3} size="sm" variant="ghost" colorScheme="blue" px={0}
            _hover={{ bg: "transparent", textDecoration: "underline" }}
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "Voir moins ↑" : "Voir plus ↓"}
          </Button>
        )}
      </Box>

      <Box mb={8}>
        <SectionHeading>Équipements & services</SectionHeading>
        <Grid templateColumns={{ base: "repeat(2,1fr)", sm: "repeat(3,1fr)", md: "repeat(4,1fr)" }} gap={3}>
          {hotel.equipments.map((item, i) => {
            const key = item.toLowerCase()
            const meta = EQUIP_META[key]
            const Icon = meta?.Icon ?? null
            return (
              <Flex
                key={i} align="center" gap={3} p={3}
                bg="white" borderRadius="xl"
                border="1px solid" borderColor="gray.100"
                boxShadow="0 1px 6px rgba(0,0,0,0.04)"
              >
                {Icon && (
                  <Flex w="32px" h="32px" borderRadius="lg" bg="blue.50" color="blue.500"
                    align="center" justify="center" flexShrink={0}>
                    <Icon size={14} />
                  </Flex>
                )}
                <Text fontSize="sm" fontWeight={600} color="gray.700" textTransform="capitalize">
                  {meta?.label ?? item}
                </Text>
              </Flex>
            )
          })}
        </Grid>
      </Box>

      {/* ── Rooms ── */}
      <Box mb={8}>
        <SectionHeading
          action={
            <Button
              colorScheme="blue" size="sm" borderRadius="xl"
              leftIcon={<LuPlus size={13} />} px={4}
              onClick={() => navigate("hotel/room/add")}
            >
              Ajouter une chambre
            </Button>
          }
        >
          Chambres
        </SectionHeading>

        {hotel.rooms?.length > 0 ? (
          <Stack spacing={3}>
            {hotel.rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEdit={(r) => navigate(`hotel/room/edit/${r.id}`)}
                onDelete={(id) => console.log("delete", id)}
              />
            ))}
          </Stack>
        ) : (
          <EmptyState icon={LuBed} title="Aucune chambre" subtitle="Ajoutez vos premières chambres pour commencer à recevoir des réservations." />
        )}
      </Box>

      {/* ── Reviews ── */}
      <Box>
        <SectionHeading>Avis clients</SectionHeading>

        {hotel.hotelReview?.length > 0 ? (
          <>
            {/* Rating summary bar */}
            <Box
              bg="white" borderRadius="xl" p={5} mb={5}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 8px rgba(0,0,0,0.05)"
            >
              <Flex align="center" gap={6} flexWrap="wrap">
                <Box textAlign="center">
                  <Text fontSize="4xl" fontWeight={900} color="gray.800" lineHeight={1}>{avgRating}</Text>
                  <Stars rating={parseFloat(avgRating)} size={14} />
                  <Text fontSize="xs" color="gray.400" mt={1}>{hotel.hotelReview.length} avis</Text>
                </Box>
                <Box flex={1} minW="180px">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = hotel.hotelReview.filter(r => r.rate === star).length
                    const pct = hotel.hotelReview.length ? (count / hotel.hotelReview.length) * 100 : 0
                    return (
                      <Flex key={star} align="center" gap={3} mb={1.5}>
                        <Flex align="center" gap={1} w="32px" flexShrink={0}>
                          <Text fontSize="xs" color="gray.500">{star}</Text>
                          <FaStar size={9} color="#F59E0B" />
                        </Flex>
                        <Box flex={1} bg="gray.100" borderRadius="full" h="6px" overflow="hidden">
                          <Box bg="yellow.400" h="100%" borderRadius="full" w={`${pct}%`} transition="width 0.4s" />
                        </Box>
                        <Text fontSize="xs" color="gray.400" w="16px" textAlign="right">{count}</Text>
                      </Flex>
                    )
                  })}
                </Box>
              </Flex>
            </Box>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
              {hotel.hotelReview.map((review, i) => (
                <ReviewCard key={i} review={review} index={i} />
              ))}
            </Grid>
          </>
        ) : (
          <EmptyState icon={MessageCircle} title="Aucun avis pour le moment" subtitle="Les avis de vos clients apparaîtront ici." />
        )}
      </Box>

    </Container>
  )
}

export default ServiceHotel;