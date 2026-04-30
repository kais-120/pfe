import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box, Button, Flex, Grid, Text, VStack,
  Badge, Image, Skeleton, SkeletonText, HStack,
} from "@chakra-ui/react"
import {
  FaChevronLeft, FaChevronRight, FaMapMarkerAlt,
  FaPhone, FaCheck, FaFacebook, FaInstagram,
} from "react-icons/fa"
import {
  LuCompass, LuBadgeCheck, LuCalendar,
  LuUsers, LuSearch,
} from "react-icons/lu"
import Header from "./components/home/Header"
import { Axios, imageURL } from "./Api/Api"
import { Helmet } from "react-helmet"
import FooterPage from "./components/home/Footer"

const TYPE_META = {
  circuit: { color: "blue", label: "Circuit" },
  excursion: { color: "green", label: "Excursion" },
  sejour: { color: "purple", label: "Séjour" },
  camping: { color: "orange", label: "Camping" },
}

/* ── Image slider ───────────────────────────────────────────────── */
function OfferSlider({ images, offerId }) {
  const [idx, setIdx] = useState(0)
  if (!images?.length) return (
    <Flex h="220px" borderRadius="xl" bg="gray.100"
      align="center" justify="center" color="gray.300">
      <LuCompass size={40} />
    </Flex>
  )
  const prev = e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }
  const next = e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }
  return (
    <Box position="relative" h="220px" overflow="hidden" borderRadius="xl">
      <Image
  src={`${imageURL}/travel/${images[idx].image_url}`}
  onError={(e) => {
    if (!e.target.dataset.fallback) {
      e.target.dataset.fallback = "true"
      e.target.src = `${imageURL}/services/${images[idx].image_url}`
    }
  }}
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
              <Box key={i} w={i === idx ? "14px" : "5px"} h="5px"
                borderRadius="full"
                bg={i === idx ? "white" : "whiteAlpha.600"}
                transition="all 0.2s" cursor="pointer"
                onClick={e => { e.stopPropagation(); setIdx(i) }} />
            ))}
          </HStack>
        </>
      )}
    </Box>
  )
}

/* ── Offer card ─────────────────────────────────────────────────── */
function OfferCard({ offer, agency }) {
  const navigate = useNavigate()
  const meta = TYPE_META[offer.type] ?? { color: "gray", label: offer.type }

  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.06)"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "translateY(-4px)", boxShadow: "0 8px 28px rgba(0,0,0,0.12)" }}>

      {/* Image */}
      <Box p={4} pb={3} position="relative">
        <OfferSlider images={offer.images} offerId={offer.id} />
        <Badge position="absolute" top={7} right={7}
          colorScheme={meta.color} borderRadius="full"
          px={2.5} py={0.5} fontSize="xs" fontWeight={700} boxShadow="sm">
          {meta.label}
        </Badge>
      </Box>

      <VStack align="stretch" px={4} pb={4} spacing={3}>

        {/* Title + destination */}
        <Box>
          <Text fontWeight={800} fontSize="md" color="gray.900"
            noOfLines={2} lineHeight="1.35">
            {offer.title}
          </Text>
          {offer.destination && (
            <Flex align="center" gap={1.5} mt={1}>
              <Box color="blue.400"><FaMapMarkerAlt size={11} /></Box>
              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                {offer.destination}
              </Text>
            </Flex>
          )}
        </Box>

        {/* Description */}
        {offer.description && (
          <Text fontSize="sm" color="gray.600" lineHeight="1.7" noOfLines={2}>
            {offer.description}
          </Text>
        )}

        {/* Duration + capacity */}
        <Flex gap={4}>
          {offer.duration && (
            <Flex align="center" gap={1.5} fontSize="xs" color="gray.500">
              <LuCalendar size={12} />
              <Text fontWeight={600}>{offer.duration}</Text>
              &nbsp;jour{offer.duration > 1 ? "s" : ""}
            </Flex>
          )}
          {offer.max_persons && (
            <Flex align="center" gap={1.5} fontSize="xs" color="gray.500">
              <LuUsers size={12} />
              Max&nbsp;<Text as="span" fontWeight={600}>{offer.max_persons}</Text>&nbsp;pers.
            </Flex>
          )}
        </Flex>

        {/* Included */}
        {offer.included?.length > 0 && (
          <Flex gap={1.5} flexWrap="wrap">
            {offer.included.slice(0, 3).map((item, i) => (
              <Flex key={i} align="center" gap={1} px={2} py={0.5}
                bg="green.50" color="green.600" borderRadius="full"
                fontSize="xs" fontWeight={500}>
                <FaCheck size={8} />{item}
              </Flex>
            ))}
            {offer.included.length > 3 && (
              <Box px={2} py={0.5} bg="gray.50" color="gray.400"
                borderRadius="full" fontSize="xs">
                +{offer.included.length - 3}
              </Box>
            )}
          </Flex>
        )}

        {/* Divider */}
        <Box borderTop="1px solid" borderColor="gray.100" />

        {/* Agency info row */}
        <Flex align="center" gap={3}>
          <Flex w="36px" h="36px" borderRadius="lg" flexShrink={0}
            bg="blue.50" color="blue.500"
            align="center" justify="center"
            border="1px solid" borderColor="blue.100">
              {agency.logo ? 
              <Image src={`${imageURL}/services/${agency.logo}`} alt="logo"/>  
              :
              <LuCompass size={15} />
            }
          </Flex>
          <Box flex={1} minW={0}>
            <Flex align="center" gap={1.5}>
              <Text fontSize="sm" fontWeight={700} color="gray.800" noOfLines={1}>
                {agency.name}
              </Text>
              <LuBadgeCheck size={13} color="var(--chakra-colors-green-500)" />
            </Flex>

          </Box>
          {/* Quick contact icons */}
          <Flex gap={1.5} flexShrink={0}>
            {agency.phone && (
              <Flex as="a" href={`tel:${agency.phone}`}
                w="28px" h="28px" borderRadius="md"
                bg="gray.50" color="gray.400"
                align="center" justify="center"
                _hover={{ bg: "blue.50", color: "blue.500" }}
                transition="all 0.15s">
                <FaPhone size={10} />
              </Flex>
            )}
            {agency.facebook && (
              <Flex as="a"
                href={agency.facebook.startsWith("http")
                  ? agency.facebook : `https://${agency.facebook}`}
                target="_blank"
                w="28px" h="28px" borderRadius="md"
                bg="gray.50" color="gray.400"
                align="center" justify="center"
                _hover={{ bg: "blue.50", color: "blue.600" }}
                transition="all 0.15s">
                <FaFacebook size={10} />
              </Flex>
            )}
            {agency.instagram && (
              <Flex as="a"
                href={`https://instagram.com/${agency.instagram.replace("@", "")}`}
                target="_blank"
                w="28px" h="28px" borderRadius="md"
                bg="gray.50" color="gray.400"
                align="center" justify="center"
                _hover={{ bg: "pink.50", color: "pink.500" }}
                transition="all 0.15s">
                <FaInstagram size={10} />
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Price + CTA */}
        <Flex align="center" justify="space-between">
          <Box>
            <Text fontSize="xs" color="gray.400">À partir de</Text>
            <Flex align="baseline" gap={1}>
              <Text fontSize="xl" fontWeight={900} color="blue.600" lineHeight="1.2">
                {  offer?.packages?.length > 0 ? Math.min(...offer?.packages?.map(p => p.price)).toFixed(0) : "100"}
              </Text>
              <Text fontSize="xs" color="gray.500">TND / pers.</Text>
            </Flex>
          </Box>
          <Button colorScheme="blue" borderRadius="xl"
            size="sm" fontWeight={700} px={5}
            onClick={() => navigate(`/agency/offer/${offer.id}`)}>
            Voir l'offre
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
      <Box p={4}><Skeleton h="220px" borderRadius="xl" /></Box>
      <VStack align="stretch" px={4} pb={4} spacing={3}>
        <SkeletonText noOfLines={2} spacing={2} skeletonHeight={4} />
        <SkeletonText noOfLines={2} spacing={2} skeletonHeight={2} />
        <Flex gap={2}>
          <Skeleton h="22px" w="70px" borderRadius="full" />
          <Skeleton h="22px" w="60px" borderRadius="full" />
        </Flex>
        <Skeleton h="1px" />
        <Flex gap={3} align="center">
          <Skeleton w="36px" h="36px" borderRadius="lg" flexShrink={0} />
          <SkeletonText flex={1} noOfLines={2} spacing={1} />
        </Flex>
        <Skeleton h="36px" borderRadius="xl" />
      </VStack>
    </Box>
  )
}

export default function HomeAgency() {
  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    ; (async () => {
      try {
        setLoading(true)
        const res = await Axios.get("/service/agency/public/get")
        setAgencies(res.data.data ?? [])
      } catch {
        setError("Impossible de charger les offres.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  /* Flatten all offers + attach agency */
  const allOffers = agencies.flatMap(agency =>
    (agency.offers ?? []).map(offer => ({ offer, agency }))
  )

  /* Filter */
  const filtered = allOffers.filter(({ offer, agency }) => {
    const matchType = typeFilter === "all" || offer.type === typeFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      offer.title?.toLowerCase().includes(q) ||
      offer.destination?.toLowerCase().includes(q) ||
      agency.name?.toLowerCase().includes(q)
    return matchType && matchSearch
  })

  return (
    <>
    <Helmet title="Voyage et Omra"></Helmet>
      <Header />
      <Box
        bg="linear-gradient(160deg, #0D1B3E 0%, #1A3260 50%, #0D1B3E 100%)"
        py={14} px={4}>
        <Flex direction="column" align="center" gap={5} textAlign="center">

          <Flex align="center" gap={2} bg="whiteAlpha.200"
            borderRadius="full" px={4} py={1.5}>
            <LuCompass size={13} color="white" />
            <Text fontSize="xs" fontWeight={700} color="white"
              textTransform="uppercase" letterSpacing="widest">
              Voyages
            </Text>
          </Flex>

          <Box>
            <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight={900}
              color="white" lineHeight="1.15" letterSpacing="-0.5px">
              Trouvez votre prochain voyage
            </Text>
            <Text color="blue.100" fontSize="sm" mt={2} lineHeight="1.8">
              {allOffers.length} offre{allOffers.length !== 1 ? "s" : ""} ·{" "}
              {agencies.length} agence{agencies.length !== 1 ? "s" : ""} certifiée{agencies.length !== 1 ? "s" : ""}
            </Text>
          </Box>

          {/* Search */}
          <Flex w="full" maxW="520px" align="center"
            bg="white" borderRadius="2xl" px={4} h="52px"
            boxShadow="0 4px 24px rgba(0,0,0,0.15)"
            _focusWithin={{ boxShadow: "0 4px 32px rgba(49,130,206,0.3)" }}
            transition="box-shadow 0.2s">
            <Box color="gray.400" mr={3} flexShrink={0}><LuSearch size={16} /></Box>
            <Box as="input"
              placeholder="Destination, circuit, agence…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              flex={1} border="none" bg="transparent"
              fontSize="sm" color="gray.700"
              style={{ outline: "none" }} />
            {search && (
              <Button size="xs" variant="ghost" color="gray.400"
                minW="auto" onClick={() => setSearch("")}>✕</Button>
            )}
          </Flex>

        </Flex>
      </Box>

      {/* ── Type filter bar ── */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.100"
        py={3} px={4} position="sticky" top={0} zIndex={10}
        boxShadow="0 1px 8px rgba(0,0,0,0.04)">
        <Flex justify="center" gap={2} flexWrap="wrap">
          {[{ key: "all", label: "Tous", color: "blue" },
          ...Object.entries(TYPE_META).map(([k, v]) => ({ key: k, ...v }))
          ].map(({ key, label, color }) => (
            <Box key={key} as="button"
              px={4} py={1.5} borderRadius="full"
              fontSize="sm" fontWeight={600}
              border="1.5px solid"
              borderColor={typeFilter === key ? `${color}.400` : "gray.200"}
              bg={typeFilter === key ? `${color}.50` : "white"}
              color={typeFilter === key ? `${color}.600` : "gray.500"}
              cursor="pointer" transition="all 0.15s"
              onClick={() => setTypeFilter(key)}>
              {label}
            </Box>
          ))}
        </Flex>
      </Box>
      <Box bg="#f5f6fa" minH="60vh">
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={8}>

          {!loading && (
            <Text fontSize="sm" color="gray.500" mb={6}>
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
              {search ? ` pour "${search}"` : ""}
              {typeFilter !== "all" ? ` · ${TYPE_META[typeFilter]?.label}` : ""}
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
            gap={6}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              : filtered.map(({ offer, agency }) => (
                <OfferCard key={offer.id} offer={offer} agency={agency} />
              ))
            }
          </Grid>

          {!loading && !error && filtered.length === 0 && (
            <Flex direction="column" align="center" py={20} gap={3}>
              <Text fontWeight={600} color="gray.700">Aucune offre trouvée</Text>
              <Text fontSize="sm" color="gray.400">
                {search || typeFilter !== "all"
                  ? "Essayez d'autres filtres."
                  : "Aucune offre disponible pour le moment."}
              </Text>
              {(search || typeFilter !== "all") && (
                <Button size="sm" colorScheme="blue" variant="outline"
                  borderRadius="xl"
                  onClick={() => { setSearch(""); setTypeFilter("all") }}>
                  Réinitialiser les filtres
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