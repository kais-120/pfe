import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box, Button, Flex, Grid, Text, VStack,
  Badge, Image, Skeleton, SkeletonText, HStack,
  Stack,
  Icon,
  Clipboard,
  IconButton,
} from "@chakra-ui/react"
import {
  FaChevronLeft, FaChevronRight, FaMapMarkerAlt,
  FaPhone, FaCheck, FaTimes, FaFacebook, FaInstagram,
  FaTwitter, FaArrowLeft, FaUsers, FaGlobe, FaEnvelope,
} from "react-icons/fa"
import {
  LuCompass, LuBadgeCheck, LuCalendar,
  LuUsers, LuTag, LuShare2, LuClock,
} from "react-icons/lu"
import Header from "../../components/home/Header"
import { Axios, imageURL, AxiosToken } from "../../Api/Api"
import { Check, Mail, X } from "lucide-react"
import { FaXTwitter } from "react-icons/fa6"
import BookingDialog from "./PackagesDialog"
import { Helmet } from "react-helmet"

/* ── Helpers ────────────────────────────────────────────────────── */
const TYPE_META = {
  circuit: { color: "blue", label: "Circuit" },
  excursion: { color: "green", label: "Excursion" },
  sejour: { color: "purple", label: "Séjour" },
  camping: { color: "orange", label: "Camping" },
  haj: { color: "blue", label: "Haj / Umrah" },
}

/* ── Gallery ────────────────────────────────────────────────────── */
function Gallery({ images }) {
  const [active, setActive] = useState(0)

  if (!images?.length) return (
    <Flex h="460px" borderRadius="2xl" bg="gray.100"
      align="center" justify="center" color="gray.300">
      <LuCompass size={60} />
    </Flex>
  )

  const prev = () => setActive(i => (i - 1 + images.length) % images.length)
  const next = () => setActive(i => (i + 1) % images.length)

  const src = (img) => {
    const base = `${imageURL}/services/${img.image_url}`
    return base
  }

  return (
    <Box>
      <Box position="relative" h="460px" borderRadius="2xl" overflow="hidden" mb={3}>
        <Image
          src={src(images[active])}
          w="100%" h="100%" objectFit="cover"
          transition="opacity 0.3s"
          onError={e => { e.target.src = `${imageURL}/partner_files/${images[active].image_url}` }}
        />
        <Badge position="absolute" bottom={4} right={4}
          bg="blackAlpha.700" color="white"
          borderRadius="full" px={3} py={1} fontSize="xs" fontWeight={600}>
          {active + 1} / {images.length}
        </Badge>
        {images.length > 1 && (
          <>
            <Button position="absolute" left={3} top="50%"
              transform="translateY(-50%)"
              borderRadius="full" bg="white" color="gray.700"
              w="38px" h="38px" minW="38px" p={0}
              boxShadow="md" _hover={{ bg: "gray.100" }} onClick={prev}>
              <FaChevronLeft size={13} />
            </Button>
            <Button position="absolute" right={3} top="50%"
              transform="translateY(-50%)"
              borderRadius="full" bg="white" color="gray.700"
              w="38px" h="38px" minW="38px" p={0}
              boxShadow="md" _hover={{ bg: "gray.100" }} onClick={next}>
              <FaChevronRight size={13} />
            </Button>
          </>
        )}
      </Box>
      {/* Thumbnails */}
      <Flex gap={2} overflowX="auto" pb={1}>
        {images.map((img, i) => (
          <Box key={img.id} flexShrink={0} w="80px" h="60px"
            borderRadius="lg" overflow="hidden" cursor="pointer"
            border="2.5px solid"
            borderColor={i === active ? "blue.500" : "transparent"}
            opacity={i === active ? 1 : 0.6}
            transition="all 0.15s" _hover={{ opacity: 1 }}
            onClick={() => setActive(i)}>
            <Image
              src={src(img)} w="100%" h="100%" objectFit="cover"
              onError={e => { e.target.src = `${imageURL}/partner_files/${img.image_url}` }}
            />
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

function SectionTitle({ children }) {
  return (
    <Text fontSize="xl" fontWeight={800} color="gray.800"
      mb={4} pb={2} borderBottom="2px solid" borderColor="blue.100">
      {children}
    </Text>
  )
}

/* ── Skeleton ───────────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <Box maxW="1100px" mx="auto" px={6} py={10}>
      <Skeleton h="460px" borderRadius="2xl" mb={3} />
      <Flex gap={2} mb={8}>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} w="80px" h="60px" borderRadius="lg" />)}
      </Flex>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap={10}>
        <VStack align="stretch" spacing={6}>
          <SkeletonText noOfLines={3} spacing={3} />
          <SkeletonText noOfLines={6} spacing={2} />
        </VStack>
        <Skeleton h="420px" borderRadius="2xl" />
      </Grid>
    </Box>
  )
}

export default function OfferDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [offerData, setOfferData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMore, setShowMore] = useState(false)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await AxiosToken.get(`/service/offer/get/${id}`)
        setOfferData(res.data)
      } catch (err) {
        console.error("Error fetching offer:", err)
        setError("Impossible de charger cette offre.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <><Header /><PageSkeleton /></>

  if (error || !offerData?.offer) return (
    <>
      <Header />
      <Flex direction="column" align="center" justify="center" py={32} gap={3}>
        <Text color="gray.500">{error ?? "Offre introuvable."}</Text>
        <Button size="sm" colorScheme="blue" onClick={() => navigate(-1)}>Retour</Button>
      </Flex>
    </>
  )

  const offer = offerData.offer
  const meta = TYPE_META[offer.type] ?? { color: "gray", label: offer.type }

  return (
    <>
    <Helmet title={offer.title}></Helmet>
      <Header />
      <BookingDialog
        isOpen={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        packageData={offerData?.offer?.packages}
      />

      <Box maxW="1100px" mx="auto" px={{ base: 4, md: 6 }} py={8}>

        {/* Back */}
        <Button variant="ghost" size="sm" color="gray.500" mb={5} pl={0}
          _hover={{ color: "blue.600", bg: "transparent" }}
          onClick={() => navigate(-1)}>
          <Flex align="center" gap={2}>
            <FaArrowLeft size={12} />Retour aux offres
          </Flex>
        </Button>

        {/* Title row */}
        <Flex justify="space-between" align="flex-start"
          mb={6} gap={4} flexWrap="wrap">
          <Box>
            <Flex align="center" gap={2} mb={2} flexWrap="wrap">
              <Badge colorScheme={meta.color} borderRadius="full"
                px={3} py={1} fontSize="sm" fontWeight={700}>
                {meta.label}
              </Badge>
            </Flex>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight={900}
              color="gray.900" lineHeight="1.2" letterSpacing="-0.5px" mb={2}>
              {offer.title}
            </Text>
            {offer.destination && (
              <Flex align="center" gap={1.5}>
                <Box color="blue.400"><FaMapMarkerAlt size={13} /></Box>
                <Text fontSize="sm" color="gray.500">{offer.destination}</Text>
              </Flex>
            )}
          </Box>

          {/* Price hero */}
          <Box bg="blue.600" color="white" borderRadius="2xl"
            px={5} py={4} textAlign="center" minW="150px"
            boxShadow="0 4px 20px rgba(24,95,165,0.35)">
            <Text fontSize="xs" opacity={0.8} mb={0.5}>À partir de</Text>
            <Flex align="baseline" gap={1} justify="center">
              <Text fontSize="3xl" fontWeight={900} lineHeight={1}>
                {offer.packages?.[0]?.price ? Number(offer.packages[0].price).toFixed(0) : offer.price ? Number(offer.price).toFixed(0) : "—"}
              </Text>
              <Text fontSize="sm" opacity={0.8}>TND</Text>
            </Flex>
            <Text fontSize="xs" opacity={0.7}>par personne</Text>
          </Box>
        </Flex>

        {/* 2-col layout */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap={10}>

          {/* LEFT */}
          <VStack align="stretch" spacing={8}>

            {/* Gallery */}
            <Gallery images={offer.images} />

            {/* Quick specs strip */}
            <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3,1fr)" }} gap={3}>
              {[
                offer.duration && { icon: LuCalendar, label: "Durée", value: `${offer.duration} jour${offer.duration > 1 ? "s" : ""}` },
                offer.packages?.length && { icon: LuTag, label: "Packages", value: `${offer.packages.length}` },
                offer.type && { icon: LuCompass, label: "Type", value: meta.label },
              ].filter(Boolean).map(({ icon: Icon, label, value }) => (
                <Flex key={label} align="center" gap={3} p={3}
                  bg="gray.50" borderRadius="xl"
                  border="1px solid" borderColor="gray.100">
                  <Flex w="34px" h="34px" borderRadius="lg"
                    bg="blue.50" color="blue.500"
                    align="center" justify="center" flexShrink={0}>
                    <Icon size={14} />
                  </Flex>
                  <Box>
                    <Text fontSize="xs" color="gray.400">{label}</Text>
                    <Text fontSize="sm" fontWeight={700} color="gray.800">{value}</Text>
                  </Box>
                </Flex>
              ))}
            </Grid>

            {/* Description */}
            {offer.description && (
              <Box>
                <SectionTitle>Description</SectionTitle>
                <Text fontSize="sm" color="gray.600" lineHeight="1.9"
                  whiteSpace="pre-line">
                  {showMore || offer.description.length <= 300
                    ? offer.description
                    : offer.description.slice(0, 300) + "…"}
                </Text>
                {offer.description.length > 300 && (
                  <Button mt={2} size="sm" variant="ghost" colorScheme="blue" px={0}
                    onClick={() => setShowMore(s => !s)}>
                    {showMore ? "Voir moins ↑" : "Voir plus ↓"}
                  </Button>
                )}
              </Box>
            )}

            {/* Included / Not included */}
            {(offer.included?.length > 0 || offer.not_included?.length > 0) && (
              <Box>
                <SectionTitle>Ce qui est inclus</SectionTitle>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                  {offer.included?.length > 0 && (
                    <Box>
                      <HStack mb={3}>
                        <Icon fontSize="xs" fontWeight={700} color="green.600">
                          <Check />
                        </Icon>
                        <Text fontSize="xs" fontWeight={700} color="green.600"
                          textTransform="uppercase" letterSpacing="wider">
                          Inclus
                        </Text>
                      </HStack>
                      <VStack align="stretch" spacing={2}>
                        {offer.included.map((item, i) => (
                          <Flex key={i} align="center" gap={2.5}
                            bg="green.50" borderRadius="xl" px={3} py={2.5}
                            border="1px solid" borderColor="green.100">
                            <Flex w="20px" h="20px" borderRadius="full"
                              bg="green.400" align="center" justify="center"
                              flexShrink={0}>
                              <FaCheck size={9} color="white" />
                            </Flex>
                            <Text fontSize="sm" color="green.700" fontWeight={500}>
                              {item}
                            </Text>
                          </Flex>
                        ))}
                      </VStack>
                    </Box>
                  )}
                  {offer.not_included?.length > 0 && (
                    <Box>
                      <HStack mb={3}>
                        <Icon fontSize="xs" fontWeight={700} color="red.500">
                          <X />
                        </Icon>
                        <Text fontSize="xs" fontWeight={700} color="red.500"
                          textTransform="uppercase" letterSpacing="wider" >
                          Non inclus
                        </Text>
                      </HStack>

                      <VStack align="stretch" spacing={2}>
                        {offer.not_included.map((item, i) => (
                          <Flex key={i} align="center" gap={2.5}
                            bg="red.50" borderRadius="xl" px={3} py={2.5}
                            border="1px solid" borderColor="red.100">
                            <Flex w="20px" h="20px" borderRadius="full"
                              bg="red.300" align="center" justify="center"
                              flexShrink={0}>
                              <FaTimes size={9} color="white" />
                            </Flex>
                            <Text fontSize="sm" color="red.600" fontWeight={500}>
                              {item}
                            </Text>
                          </Flex>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </Grid>
              </Box>
            )}

          </VStack>

          {/* RIGHT — sticky sidebar */}
          <Box>
            <VStack align="stretch" spacing={4}
              position={{ base: "static", lg: "sticky" }} top="88px">

              {/* Book CTA card */}
              <Box bg="white" borderRadius="2xl" overflow="hidden"
                border="1px solid" borderColor="gray.100"
                boxShadow="0 4px 24px rgba(0,0,0,0.08)">
                <Box bg="blue.600" px={5} py={4}>
                  <Text color="white" fontWeight={700} fontSize="md">
                    Réserver cette offre
                  </Text>
                  <Text color="blue.100" fontSize="xs" mt={0.5}>
                    {offer.packages?.length ? `${offer.packages.length} packages disponibles` : "À partir de"}
                  </Text>
                </Box>
                <VStack align="stretch" spacing={3} p={5}>
                  {offer.packages?.length > 0 && (
                    <>
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="gray.500">Prix min</Text>
                        <Text fontSize="sm" fontWeight={700} color="gray.800">
                          {Math.min(...offer.packages.map(p => p.price)).toFixed(0)} TND
                        </Text>
                      </Flex>
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="gray.500">Prix max</Text>
                        <Text fontSize="sm" fontWeight={700} color="gray.800">
                          {Math.max(...offer.packages.map(p => p.price)).toFixed(0)} TND
                        </Text>
                      </Flex>
                    </>
                  )}
                  {offer.duration && (
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.500">Durée</Text>
                      <Text fontSize="sm" fontWeight={700} color="gray.800">
                        {offer.duration} jour{offer.duration > 1 ? "s" : ""}
                      </Text>
                    </Flex>
                  )}
                  <Box borderTop="1px solid" borderColor="gray.100" pt={3}>
                    <Button w="full" h="46px" colorScheme="blue"
                      borderRadius="xl" fontWeight={700}
                      disabled={offerData?.offer?.packages.length > 0 ? false : true}
                      onClick={() => setBookingDialogOpen(true)}
                      isDisabled={!offer.packages?.length}>
                      <Flex align="center" gap={2}>
                        <LuCompass size={15} />
                        Réserver maintenant
                      </Flex>
                    </Button>
                    <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
                      Contactez l'agence pour confirmer
                    </Text>
                  </Box>
                </VStack>
              </Box>

              {/* Agency card */}
              {offer.agencyOffer && (
                <Box bg="white" borderRadius="2xl" overflow="hidden"
                  border="1px solid" borderColor="gray.100"
                  boxShadow="0 1px 8px rgba(0,0,0,0.05)">

                  {/* Mini banner */}
                  <Box h="50px"
                    bg="linear-gradient(135deg,#2B6CB0,#3182CE,#63B3ED)"
                    position="relative">
                    <Box position="absolute" top="-20px" right="-20px"
                      w="80px" h="80px" borderRadius="full" bg="whiteAlpha.100" />
                  </Box>

                  <Box px={5} pb={5}>
                    <Flex align="flex-end" gap={3} mt={5} mb={4}>
                      {offer.agencyOffer.logo && (
                        <Box w="48px" h="48px" borderRadius="xl"
                          overflow="hidden"
                          bg="white" border="2.5px solid white"
                          boxShadow="0 4px 12px rgba(0,0,0,0.12)"
                          flexShrink={0}>
                          <Image
                            src={`${imageURL}/services/${offer.agencyOffer.logo}`}
                            w="100%" h="100%" objectFit="cover"
                          />
                        </Box>
                      )}
                      <Box flex={1} pb={0.5}>
                        <Flex align="center" gap={1.5}>
                          <Text fontWeight={800} fontSize="md" color="gray.900"
                            noOfLines={1}>
                            {offer.agencyOffer.name}
                          </Text>
                          <LuBadgeCheck size={14}
                            color="var(--chakra-colors-green-500)" />
                        </Flex>
                        <Flex align="center" gap={1} mt={0.5}>
                          <Box color="gray.400"><FaMapMarkerAlt size={9} /></Box>
                          <Text fontSize="xs" color="gray.400" noOfLines={1}>
                            {offer.agencyOffer.address}
                          </Text>
                        </Flex>
                      </Box>
                    </Flex>

                    <VStack align="stretch" spacing={2} mb={4}>
                      {offer.agencyOffer.phone && (
                        <Clipboard.Root value={offer.agencyOffer.phone}>
                          <Clipboard.Trigger asChild>
                            <Flex cursor={"pointer"}
                              align="center" gap={2.5}
                              bg="gray.50" borderRadius="lg" px={3} py={2}
                              border="1px solid" borderColor="gray.100"
                              _hover={{ bg: "blue.50", borderColor: "blue.100" }}
                              transition="all 0.15s">
                              <Box color="gray.400"><FaPhone size={11} /></Box>
                              <Text fontSize="sm" color="gray.600">{offer.agencyOffer.phone}</Text>
                              <IconButton
                                size="xs"
                                variant="ghost"
                                ml="auto"
                              >
                                <Clipboard.Indicator />
                              </IconButton>
                            </Flex>
                          </Clipboard.Trigger>
                        </Clipboard.Root>
                      )}
                      {offer.agencyOffer.email && (
                        <Clipboard.Root value={offer.agencyOffer.email}>
                          <Clipboard.Trigger asChild>
                            <Flex cursor={"pointer"}
                              align="center" gap={2.5}
                              bg="gray.50" borderRadius="lg" px={3} py={2}
                              border="1px solid" borderColor="gray.100"
                              _hover={{ bg: "blue.50", borderColor: "blue.100" }}
                              transition="all 0.15s">
                              <Box color="gray.400"><Mail size={11} /></Box>
                              <Text fontSize="sm" color="gray.600">{offer.agencyOffer.email}</Text>
                              <IconButton
                                size="xs"
                                variant="ghost"
                                ml="auto"
                              >
                                <Clipboard.Indicator />
                              </IconButton>
                            </Flex>
                          </Clipboard.Trigger>
                        </Clipboard.Root>
                      )}
                      {offer.agencyOffer.website && (
                        <Flex as="a" href={offer.agencyOffer.website} target="_blank"
                          align="center" gap={2.5}
                          bg="gray.50" borderRadius="lg" px={3} py={2}
                          border="1px solid" borderColor="gray.100"
                          _hover={{ bg: "blue.50", borderColor: "blue.100" }}
                          transition="all 0.15s">
                          <Box color="gray.400"><FaGlobe size={11} /></Box>
                          <Text fontSize="sm" color="blue.500" noOfLines={1}>
                            {offer.agencyOffer.website}
                          </Text>
                        </Flex>
                      )}
                    </VStack>

                    {/* Social links */}
                    {(offer.agencyOffer.facebook || offer.agencyOffer.instagram || offer.agencyOffer.twitter) && (
                      <Flex gap={2}>
                        {offer.agencyOffer.facebook && (
                          <Flex as="a"
                            href={offer.agencyOffer.facebook.startsWith("http")
                              ? offer.agencyOffer.facebook : `https://${offer.agencyOffer.facebook}`}
                            target="_blank"
                            flex={1} align="center" justify="center" gap={1.5}
                            h="34px" borderRadius="lg"
                            bg="blue.50" color="blue.500" fontSize="xs" fontWeight={600}
                            border="1px solid" borderColor="blue.100"
                            _hover={{ bg: "blue.100" }} transition="all 0.15s">
                            <FaFacebook size={12} />Facebook
                          </Flex>
                        )}
                        {offer.agencyOffer.instagram && (
                          <Flex as="a"
                            href={`https://instagram.com/${offer.agencyOffer.instagram.replace("@", "")}`}
                            target="_blank"
                            flex={1} align="center" justify="center" gap={1.5}
                            h="34px" borderRadius="lg"
                            bg="pink.50" color="pink.500" fontSize="xs" fontWeight={600}
                            border="1px solid" borderColor="pink.100"
                            _hover={{ bg: "pink.100" }} transition="all 0.15s">
                            <FaInstagram size={12} />Instagram
                          </Flex>
                        )}
                        {offer.agencyOffer.twitter && (
                          <Flex as="a"
                            href={`https://x.com/${offer.agencyOffer.twitter.replace("@", "")}`}
                            target="_blank"
                            flex={1} align="center" justify="center" gap={1.5}
                            h="34px" borderRadius="lg"
                            bg="blackAlpha.250" color="black.400" fontSize="xs" fontWeight={600}
                            border="1px solid" borderColor="black.100"
                            _hover={{ bg: "black.100" }} transition="all 0.15s">
                            <FaXTwitter size={12} />X
                          </Flex>
                        )}
                      </Flex>
                    )}
                  </Box>
                </Box>
              )}

            </VStack>
          </Box>

        </Grid>
      </Box>

      {/* Booking Dialog */}
      
    </>
  )
}