import { useEffect, useState } from "react"
import {
  Box, Container, Text, Image, Flex, Grid, Button,
  Badge, VStack, HStack, IconButton, Skeleton, SkeletonText,
} from "@chakra-ui/react"
import {
  LuChevronLeft, LuChevronRight, LuPencil, LuTrash2,
  LuPlus, LuUsers, LuBanknote, LuCheck, LuMapPin,
  LuPhone, LuMail, LuGlobe, LuPackage, LuClock,
  LuLink, LuFacebook, LuInstagram, LuTag,
} from "react-icons/lu"
import { useNavigate } from "react-router-dom"
import { AxiosToken, imageURL } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"

const IMAGE_BASE = `${imageURL}/services/`

const AGENCY_STATUS = {
  accept:{ colorScheme: "green",  label: "Approuvée"  },
  refuse:{ colorScheme: "red",    label: "Refusée"    },
  "En attente":{ colorScheme: "yellow", label: "En attente" },
}

const OFFER_TYPES = [
  { value: "circuit",   label: "Circuit"   },
  { value: "package",   label: "Package"   },
  { value: "sejour",    label: "Séjour"    },
  { value: "croisiere", label: "Croisière" },
  { value: "aventure",  label: "Aventure"  },
]

/* ── Stat card ──────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color = "blue" }) {
  return (
    <Box bg="white" borderRadius="xl" p={4}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)">
      <Flex align="center" gap={3}>
        <Flex w="40px" h="40px" borderRadius="lg"
          bg={`${color}.50`} color={`${color}.500`}
          align="center" justify="center" flexShrink={0}>
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

/* ── Section heading ────────────────────────────────────────────── */
function SectionHeading({ children, action }) {
  return (
    <Flex align="center" justify="space-between" mb={5}>
      <Box>
        <Text fontSize="xs" fontWeight={700} color="blue.500"
          textTransform="uppercase" letterSpacing="widest" mb={0.5}>
          Gestion
        </Text>
        <Text fontSize="xl" fontWeight={800} color="gray.800">{children}</Text>
      </Box>
      {action}
    </Flex>
  )
}

/* ── Image carousel ─────────────────────────────────────────────── */
function ImageCarousel({ images }) {
  const [idx, setIdx] = useState(0)
  if (!images?.length) return null

  return (
    <Box mb={8} borderRadius="2xl" overflow="hidden"
      boxShadow="0 4px 24px rgba(0,0,0,0.1)">
      <Box position="relative" h="340px">
        <Image src={`${IMAGE_BASE}${images[idx]?.image_url ?? images[idx]}`}
          w="100%" h="100%" objectFit="cover" />
        {images.length > 1 && (
          <>
            <Button position="absolute" left={3} top="50%" transform="translateY(-50%)"
              borderRadius="full" bg="white" color="gray.700"
              w="36px" h="36px" minW="36px" p={0} boxShadow="md" _hover={{ bg: "gray.100" }}
              onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}>
              <LuChevronLeft size={14} />
            </Button>
            <Button position="absolute" right={3} top="50%" transform="translateY(-50%)"
              borderRadius="full" bg="white" color="gray.700"
              w="36px" h="36px" minW="36px" p={0} boxShadow="md" _hover={{ bg: "gray.100" }}
              onClick={() => setIdx(i => (i + 1) % images.length)}>
              <LuChevronRight size={14} />
            </Button>
            <Badge position="absolute" bottom={3} right={3}
              bg="blackAlpha.700" color="white"
              borderRadius="full" px={3} py={1} fontSize="xs">
              {idx + 1} / {images.length}
            </Badge>
          </>
        )}
      </Box>
      <Flex gap={2} p={3} bg="gray.50" overflowX="auto">
        {images.map((img, i) => (
          <Box key={i} flexShrink={0} w="72px" h="52px" borderRadius="lg"
            overflow="hidden" cursor="pointer"
            border="2.5px solid" borderColor={i === idx ? "blue.500" : "transparent"}
            opacity={i === idx ? 1 : 0.6} transition="all 0.15s" _hover={{ opacity: 1 }}
            onClick={() => setIdx(i)}>
            <Image src={`${IMAGE_BASE}${img?.image_url ?? img}`}
              w="100%" h="100%" objectFit="cover" />
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

/* ── Offer card ─────────────────────────────────────────────────── */
function OfferCard({ offer, onEdit, onDelete }) {
  const mainImg  = offer.images?.[0]
  const typeLabel = OFFER_TYPES.find(t => t.value === offer.type)?.label ?? offer.type

  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.06)"
      transition="transform 0.2s, box-shadow 0.2s, border-color 0.2s"
      _hover={{ transform: "translateY(-3px)", boxShadow: "0 8px 28px rgba(0,0,0,0.1)", borderColor: "blue.100" }}>

      {/* Image */}
      <Box h="180px" bg="gray.100" position="relative">
        {mainImg
          ? <Image src={`${IMAGE_BASE}${mainImg?.image_url ?? mainImg}`}
              w="100%" h="100%" objectFit="cover" />
          : <Flex h="100%" align="center" justify="center" color="gray.300">
              <LuGlobe size={40} />
            </Flex>
        }
        {typeLabel && (
          <Badge position="absolute" top={2} left={2}
            colorScheme="blue" borderRadius="full" px={2.5} py={0.5}
            fontSize="xs" fontWeight={600}>
            {typeLabel}
          </Badge>
        )}
        {offer.promotion && (
          <Badge position="absolute" top={2} right={2}
            colorScheme="red" borderRadius="full" px={2.5} py={0.5}
            fontSize="xs" fontWeight={700}>
            -{offer.promotion}%
          </Badge>
        )}
      </Box>

      <Box p={4}>
        <Text fontWeight={800} fontSize="md" color="gray.900" noOfLines={1} mb={1}>
          {offer.title}
        </Text>

        <Flex align="center" gap={2} mb={2} flexWrap="wrap">
          {offer.destination && (
            <Flex align="center" gap={1}>
              <LuMapPin size={11} color="gray" />
              <Text fontSize="xs" color="gray.500">{offer.destination}</Text>
            </Flex>
          )}
          {offer.duration && (
            <>
              <Text fontSize="xs" color="gray.300">·</Text>
              <Flex align="center" gap={1}>
                <LuClock size={11} color="gray" />
                <Text fontSize="xs" color="gray.500">{offer.duration}</Text>
              </Flex>
            </>
          )}
          {offer.max_persons && (
            <>
              <Text fontSize="xs" color="gray.300">·</Text>
              <Flex align="center" gap={1}>
                <LuUsers size={11} color="gray" />
                <Text fontSize="xs" color="gray.500">max {offer.max_persons} pers.</Text>
              </Flex>
            </>
          )}
        </Flex>

        {offer.description && (
          <Text fontSize="xs" color="gray.500" noOfLines={2} mb={3} lineHeight="1.6">
            {offer.description}
          </Text>
        )}

        <Flex align="center" justify="space-between">
          <Box>
            <Text fontSize="xs" color="gray.400" lineHeight={1}>À partir de</Text>
            <Flex align="baseline" gap={1}>
              {offer.promotion ? (
                <>
                  <Text fontSize="lg" fontWeight={900} color="red.500" lineHeight={1.2}>
                    {Math.round(Number(offer.price) * (1 - offer.promotion / 100))}
                  </Text>
                  <Text fontSize="xs" color="gray.400" textDecoration="line-through" ml={1}>
                    {Number(offer.price).toFixed(0)}
                  </Text>
                  <Text fontSize="xs" color="gray.500">TND/pers.</Text>
                </>
              ) : (
                <>
                  <Text fontSize="xl" fontWeight={900} color="blue.600" lineHeight={1.2}>
                    {Number(offer.price).toFixed(0)}
                  </Text>
                  <Text fontSize="xs" color="gray.500">TND/pers.</Text>
                </>
              )}
            </Flex>
          </Box>
          <HStack gap={2}>
            <IconButton size="xs" variant="outline" borderRadius="lg"
              color="blue.500" borderColor="blue.200" _hover={{ bg: "blue.50" }}
              onClick={() => onEdit?.(offer)}>
              <LuPencil size={12} />
            </IconButton>
            <IconButton size="xs" variant="outline" borderRadius="lg"
              color="red.400" borderColor="red.200" _hover={{ bg: "red.50" }}
              onClick={() => onDelete?.(offer.id)}>
              <LuTrash2 size={12} />
            </IconButton>
          </HStack>
        </Flex>
      </Box>
    </Box>
  )
}

/* ── Page skeleton ──────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <Container maxW="6xl" py={8}>
      <VStack gap={4} align="stretch">
        <Skeleton h="48px" w="300px" borderRadius="xl" />
        <Skeleton h="340px" borderRadius="2xl" />
        <Grid templateColumns="repeat(4, 1fr)" gap={3}>
          {[1,2,3,4].map(i => <Skeleton key={i} h="80px" borderRadius="xl" />)}
        </Grid>
        <Grid templateColumns="repeat(3, 1fr)" gap={5}>
          {[1,2,3].map(i => <Skeleton key={i} h="280px" borderRadius="2xl" />)}
        </Grid>
      </VStack>
    </Container>
  )
}

const ServiceAgency = () => {
  const [agency,     setAgency]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [showMore,   setShowMore]   = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await AxiosToken.get("/service/agency/get")
        // Expects: { agency: { ...fields, offers: [...] } }
        setAgency(res.data.agency ?? null)
      } catch {
        console.error("Failed to load agency")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDeleteOffer = async (id) => {
    try {
      await AxiosToken.delete(`/service/agency/offer/${id}`)
      setAgency(prev => ({
        ...prev,
        offers: prev.offers.filter(o => o.id !== id),
      }))
      toaster.create({ description: "Offre supprimée.", type: "info", closable: true })
    } catch {
      toaster.create({ description: "Erreur de suppression.", type: "error", closable: true })
    }
  }

  /* ── No agency yet ── */
  if (!loading && !agency) {
    return (
      <Container maxW="6xl" py={24}>
        <Flex direction="column" align="center" gap={4} textAlign="center">
          <Text fontSize="2xl" fontWeight={900} color="gray.800">
            Aucune agence enregistrée
          </Text>
          <Text color="gray.500" maxW="380px" fontSize="sm">
            Vous n'avez pas encore créé votre espace agence de voyage. Commencez dès maintenant.
          </Text>
          <Button colorScheme="blue" borderRadius="xl" px={8} size="lg" fontWeight={700}
            onClick={() => navigate("agency/add")}>
            <Flex align="center" gap={2}><LuPlus size={16} />Créer mon agence</Flex>
          </Button>
        </Flex>
      </Container>
    )
  }

  if (loading) return <PageSkeleton />

  const offers = agency.offers ?? []
  const totalOffers = offers.length
  const withPromo = offers.filter(o => !!o.promotion).length
  const minPrice = offers.length
    ? Math.min(...offers.map(o => Number(o.price || 0)))
    : null
  const as = AGENCY_STATUS[agency.status] ?? { colorScheme: "gray", label: agency.status }

  return (
    <Container maxW="6xl" py={8}>

      <Flex justify="space-between" align="flex-start" mb={7} gap={4} flexWrap="wrap">
        <Box>
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={1}>
            Mon service
          </Text>
          {/* Logo + name */}
          <Flex align="center" gap={4} mb={3}>
            {agency.logo && (
              <Box w="60px" h="60px" borderRadius="xl" overflow="hidden"
                border="1px solid" borderColor="gray.100"
                boxShadow="0 2px 8px rgba(0,0,0,0.08)" flexShrink={0}>
                <Image src={`${IMAGE_BASE}${agency.logo}`}
                  w="100%" h="100%" objectFit="cover" />
              </Box>
            )}
            <Text fontSize="3xl" fontWeight={900} color="gray.900"
              lineHeight="1.1" letterSpacing="-0.5px">
              {agency.name}
            </Text>
          </Flex>

          {/* Contact info */}
          <VStack align="stretch" gap={1.5}>
            {agency.address && (
              <Flex align="center" gap={2}>
                <Box color="blue.400"><LuMapPin size={13} /></Box>
                <Text fontSize="sm" color="gray.600">{agency.address}</Text>
              </Flex>
            )}
            {agency.phone && (
              <Flex align="center" gap={2}>
                <Box color="blue.400"><LuPhone size={13} /></Box>
                <Text fontSize="sm" color="gray.600">{agency.phone}</Text>
              </Flex>
            )}
            {agency.email && (
              <Flex align="center" gap={2}>
                <Box color="blue.400"><LuMail size={13} /></Box>
                <Text fontSize="sm" color="gray.600">{agency.email}</Text>
              </Flex>
            )}
            {agency.website && (
              <Flex align="center" gap={2}>
                <Box color="blue.400"><LuLink size={13} /></Box>
                <Text fontSize="sm" color="blue.500">{agency.website}</Text>
              </Flex>
            )}
            {/* Social */}
            <Flex align="center" gap={3} mt={1}>
              {agency.facebook && (
                <Flex align="center" gap={1} color="blue.600">
                  <LuFacebook size={14} />
                  <Text fontSize="xs">Facebook</Text>
                </Flex>
              )}
              {agency.instagram && (
                <Flex align="center" gap={1} color="pink.500">
                  <LuInstagram size={14} />
                  <Text fontSize="xs">Instagram</Text>
                </Flex>
              )}
            </Flex>

            {/* Status badge */}
            <Flex align="center" gap={2} mt={1}>
              <Badge colorScheme={as.colorScheme} borderRadius="full"
                px={2.5} py={0.5} fontSize="xs" fontWeight={600}>
                {as.label}
              </Badge>
              <Text fontSize="xs" color="gray.400">
                Créée le {new Date(agency.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </Text>
            </Flex>
          </VStack>
        </Box>

        <Button colorScheme="blue" size="sm" borderRadius="xl" px={5} fontWeight={600}
          onClick={() => navigate("edit")}>
          <Flex align="center" gap={2}><LuPencil size={13} />Modifier l'agence</Flex>
        </Button>
      </Flex>

      {/* ── Image carousel ── */}
      {agency.images?.length > 0 && (
        <ImageCarousel images={agency.images} />
      )}

      {/* ── Description ── */}
      {agency.description && (
        <Box bg="white" borderRadius="2xl" p={6} mb={8}
          border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 8px rgba(0,0,0,0.05)">
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={2}>
            À propos
          </Text>
          <Text color="gray.600" lineHeight="1.9" fontSize="sm">
            {showMore || agency.description.length <= 220
              ? agency.description
              : agency.description.slice(0, 220) + "…"}
          </Text>
          {agency.description.length > 220 && (
            <Button mt={3} size="sm" variant="ghost" colorScheme="blue" px={0}
              _hover={{ bg: "transparent", textDecoration: "underline" }}
              onClick={() => setShowMore(s => !s)}>
              {showMore ? "Voir moins ↑" : "Voir plus ↓"}
            </Button>
          )}
        </Box>
      )}

      {/* ── Stats ── */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={3} mb={8}>
        <StatCard icon={LuPackage}  label="Total offres"       value={totalOffers}                              color="blue"   />
        <StatCard icon={LuUsers}    label="Types d'offres"     value={new Set(offers.map(o => o.type)).size}   color="purple" />
        <StatCard icon={LuTag}      label="Avec promotion"     value={withPromo}                                color="red"    />
        <StatCard icon={LuBanknote} label="Prix min / pers."   value={minPrice ? `${Math.round(minPrice)} TND` : "—"} color="green" />
      </Grid>

      {/* ── Offers section ── */}
      <Box>
        <SectionHeading
          action={
            <Button colorScheme="blue" size="sm" borderRadius="xl"
              fontWeight={600} px={4}
              onClick={() => navigate("agency/offer/add")}>
              <Flex align="center" gap={2}>
                <LuPlus size={13} />
                Ajouter une offre
              </Flex>
            </Button>
          }
        >
          Offres de voyage ({totalOffers})
        </SectionHeading>

        {offers.length === 0 ? (
          <Flex direction="column" align="center" py={14} gap={3}
            bg="white" borderRadius="2xl"
            border="1px dashed" borderColor="gray.200">
            <Text fontWeight={600} color="gray.600">Aucune offre publiée</Text>
            <Text fontSize="sm" color="gray.400">
              Ajoutez votre première offre de voyage.
            </Text>
            <Button colorScheme="blue" borderRadius="xl" size="sm" mt={1}
              onClick={() => navigate("agency/offer/add")}>
              <Flex align="center" gap={2}><LuPlus size={13} />Ajouter une offre</Flex>
            </Button>
          </Flex>
        ) : (
          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={5}>
            {offers.map(o => (
              <OfferCard key={o.id} offer={o}
                onEdit={() => navigate(`agency/offer/edit/${o.id}`)}
                onDelete={handleDeleteOffer}
              />
            ))}
          </Grid>
        )}
      </Box>

    </Container>
  )
}

export default ServiceAgency