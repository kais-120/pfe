import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  Box, Button, Flex, Grid, Text, VStack,
  Badge, Image, Skeleton, SkeletonText, HStack,
  Icon,
} from "@chakra-ui/react"
import {
  FaChevronLeft, FaChevronRight, FaMapMarkerAlt,
  FaPhone, FaCheck, FaTimes, FaArrowLeft,
  FaMountain, FaGlobe,
} from "react-icons/fa"
import {
  LuCompass, LuCalendar, LuUsers, LuClock,
  LuTag, LuMountain, LuCheck, LuShieldCheck,
  LuTentTree,
} from "react-icons/lu"
import Header from "../../components/home/Header"
import { Axios, imageURL } from "../../Api/Api"
import { FaBottleWater, FaMapLocationDot } from "react-icons/fa6"
import { GiMeal, GiSleepingBag } from "react-icons/gi";
import { RiFirstAidKitFill } from "react-icons/ri";
import { IoFlashlightSharp } from "react-icons/io5";
import { Phone } from "lucide-react"
import { Helmet } from "react-helmet"
import PackagesDialog from "./PackagesDialog"
import { useProfile } from "../../Context/useProfile"
import { Tooltip } from "../../components/ui/tooltip"




/* ── Helpers ────────────────────────────────────────────────────── */
const CAT_META = {
  "désert": { color: "orange", label: "Désert" },
  "desert": { color: "orange", label: "Désert" },
  "aventure": { color: "red", label: "Aventure" },
  "camping": { color: "green", label: "Camping" },
  "voyage": { color: "blue", label: "Voyage" },
  "montagne": { color: "purple", label: "Montagne" },
  "plage": { color: "teal", label: "Plage" },
  "culturel": { color: "yellow", label: "Culturel" },
}

const DIFF_META = {
  "facile": { color: "green", label: "Facile" },
  "modéré": { color: "yellow", label: "Modéré" },
  "difficile": { color: "orange", label: "Difficile" },
  "très difficile": { color: "red", label: "Très difficile" },
}

const EQUIP_ICONS = {
  "Tente": LuTentTree,
  "Sac de couchage": GiSleepingBag,
  "Lampe frontale": IoFlashlightSharp,
  "GPS": FaMapLocationDot,
  "Kit premiers secours": RiFirstAidKitFill,
  "Gourde": FaBottleWater,
  "Repas inclus": GiMeal,
}

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  })
  : "—"

const fmtDateShort = (d) => d
  ? new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric"
  })
  : "—"

/* ── Gallery ────────────────────────────────────────────────────── */
function Gallery({ images }) {
  const [active, setActive] = useState(0)

  if (!images?.length) return (
    <Flex h="440px" borderRadius="2xl" bg="gray.100"
      align="center" justify="center" color="gray.300">
      <LuMountain size={60} />
    </Flex>
  )

  const prev = () => setActive(i => (i - 1 + images.length) % images.length)
  const next = () => setActive(i => (i + 1) % images.length)

  const src = (img) => `${imageURL}/travel/${img.image_url}`

  return (
    <Box>
      <Box position="relative" h="440px" borderRadius="2xl" overflow="hidden" mb={3}>
        <Image src={src(images[active])}
          w="100%" h="100%" objectFit="cover" transition="opacity 0.3s"
          onError={e => { e.target.src = `${imageURL}/services/${images[active].image_url}` }}
        />
        <Badge position="absolute" bottom={4} right={4}
          bg="blackAlpha.700" color="white" borderRadius="full"
          px={3} py={1} fontSize="xs" fontWeight={600}>
          {active + 1} / {images.length}
        </Badge>
        {images.length > 1 && (
          <>
            <Button position="absolute" left={3} top="50%"
              transform="translateY(-50%)" borderRadius="full"
              bg="white" color="gray.700" w="38px" h="38px" minW="38px" p={0}
              boxShadow="md" _hover={{ bg: "gray.100" }} onClick={prev}>
              <FaChevronLeft size={13} />
            </Button>
            <Button position="absolute" right={3} top="50%"
              transform="translateY(-50%)" borderRadius="full"
              bg="white" color="gray.700" w="38px" h="38px" minW="38px" p={0}
              boxShadow="md" _hover={{ bg: "gray.100" }} onClick={next}>
              <FaChevronRight size={13} />
            </Button>
          </>
        )}
      </Box>
      <Flex gap={2} overflowX="auto" pb={1}>
        {images.map((img, i) => (
          <Box key={img.id} flexShrink={0} w="80px" h="60px"
            borderRadius="lg" overflow="hidden" cursor="pointer"
            border="2.5px solid"
            borderColor={i === active ? "orange.500" : "transparent"}
            opacity={i === active ? 1 : 0.6}
            transition="all 0.15s" _hover={{ opacity: 1 }}
            onClick={() => setActive(i)}>
            <Image src={src(img)} w="100%" h="100%" objectFit="cover"
              onError={e => { e.target.src = `${imageURL}/services/${img.image_url}` }} />
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

/* ── Section title ──────────────────────────────────────────────── */
function SectionTitle({ children }) {
  return (
    <Text fontSize="xl" fontWeight={800} color="gray.800"
      mb={4} pb={2} borderBottom="2px solid" borderColor="orange.100">
      {children}
    </Text>
  )
}

/* ── Spec card ──────────────────────────────────────────────────── */
function SpecCard({ icon: Icon, label, value, color = "orange" }) {
  return (
    <Flex align="center" gap={3} p={3}
      bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100">
      <Flex w="36px" h="36px" borderRadius="lg"
        bg={`${color}.50`} color={`${color}.500`}
        align="center" justify="center" flexShrink={0}>
        <Icon size={15} />
      </Flex>
      <Box>
        <Text fontSize="xs" color="gray.400">{label}</Text>
        <Text fontSize="sm" fontWeight={700} color="gray.800">{value}</Text>
      </Box>
    </Flex>
  )
}

/* ── Skeleton ───────────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <Box maxW="1100px" mx="auto" px={6} py={10}>
      <Skeleton h="440px" borderRadius="2xl" mb={3} />
      <Flex gap={2} mb={8}>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} w="80px" h="60px" borderRadius="lg" />)}
      </Flex>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 360px" }} gap={10}>
        <VStack align="stretch" spacing={5}>
          <Grid templateColumns="1fr 1fr" gap={3}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} h="76px" borderRadius="xl" />)}
          </Grid>
          <SkeletonText noOfLines={4} spacing={3} />
        </VStack>
        <Skeleton h="500px" borderRadius="2xl" />
      </Grid>
    </Box>
  )
}

export default function CircuitDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [circuit, setCircuit] = useState(null)
  const [voyage, setVoyage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showMore, setShowMore] = useState(false)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const { user } = useProfile();

  useEffect(() => {
    ; (async () => {
      try {
        setLoading(true)
        const res = await Axios.get(`/service/voyage/circuit/public/get/${id}`)
        setCircuit(res.data.circuit)
        setVoyage(res.data.circuit?.voyagesCircuit ?? null)
      } catch {
        setError("Impossible de charger ce circuit.")
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <><Header /><PageSkeleton /></>

  if (error || !circuit) return (
    <>
      <Header />
      <Flex direction="column" align="center" justify="center" py={32} gap={3}>
        <Text color="gray.500">{error ?? "Circuit introuvable."}</Text>
        <Button size="sm" colorScheme="orange" onClick={() => navigate(-1)}>Retour</Button>
      </Flex>
    </>
  )

  const images = circuit.imagesCircuits ?? circuit.images ?? []
  const cat = CAT_META[circuit.category?.toLowerCase()] ?? { color: "orange", label: circuit.category }
  const diff = DIFF_META[circuit.difficulty] ?? { color: "gray", label: circuit.difficulty }

  return (
    <>
      <Header />

      <PackagesDialog
        type={"circuit"}
        isOpen={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        packageData={circuit?.packagesCircuit}
      />

      <Helmet title={circuit.title}></Helmet>
      <Box maxW="1100px" mx="auto" px={{ base: 4, md: 6 }} py={8}>

        {/* Back */}
        <Button variant="ghost" size="sm" color="gray.500" mb={5} pl={0}
          _hover={{ color: "orange.500", bg: "transparent" }}
          onClick={() => navigate(-1)}>
          <Flex align="center" gap={2}>
            <FaArrowLeft size={12} />Retour aux circuits
          </Flex>
        </Button>

        {/* Title row */}
        <Flex justify="space-between" align="flex-start" mb={6} gap={4} flexWrap="wrap">
          <Box>
            <Flex align="center" gap={2} mb={2} flexWrap="wrap">
              <Badge colorScheme={cat.color} borderRadius="full"
                px={3} py={1} fontSize="sm" fontWeight={700}>
                {cat.label}
              </Badge>
              <Badge colorScheme={diff.color} borderRadius="full"
                px={2.5} py={0.5} fontSize="xs" fontWeight={600}>
                {diff.label}
              </Badge>
            </Flex>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight={900}
              color="gray.900" lineHeight="1.2" letterSpacing="-0.5px" mb={2}>
              {circuit.title}
            </Text>
            <Flex align="center" gap={1.5}>
              <Box color="orange.400"><FaMapMarkerAlt size={13} /></Box>
              <Text fontSize="sm" color="gray.500">{circuit.location}</Text>
            </Flex>
          </Box>

          {/* Price hero */}
          <Box
            bg="linear-gradient(135deg,#2B6CB0,#3182CE,#63B3ED)"
            color="white" borderRadius="2xl"
            px={5} py={4} textAlign="center" minW="150px"
            boxShadow="0 4px 20px rgba(193,85,33,0.4)">
            <Text fontSize="xs" opacity={0.85} mb={0.5}>À partir de</Text>
            <Flex align="baseline" gap={1} justify="center">
              <Text fontSize="3xl" fontWeight={900} lineHeight={1}>
                {Math.min(...circuit.packagesCircuit.map(p => p.price)).toFixed(0)}
              </Text>
              <Text fontSize="sm" opacity={0.85}>TND</Text>
            </Flex>
            <Text fontSize="xs" opacity={0.75}>par personne</Text>
          </Box>
        </Flex>

        {/* 2-col layout */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 360px" }} gap={10}>

          {/* LEFT */}
          <VStack align="stretch" spacing={8}>

            {/* Gallery */}
            <Gallery images={images} />

            {/* Quick specs */}
            <Box>
              <SectionTitle>Informations du circuit</SectionTitle>
              <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3,1fr)" }} gap={3}>
                {circuit.duration_days && (
                  <SpecCard icon={LuCalendar} label="Durée"
                    value={`${circuit.duration_days} jour${circuit.duration_days > 1 ? "s" : ""}`} />
                )}
                {circuit.max_people && (
                  <SpecCard icon={LuUsers} label="Groupe max"
                    value={`${circuit.max_people} personnes`} color="blue" />
                )}
                {circuit.price_per_person && (
                  <SpecCard icon={LuTag} label="Prix / pers."
                    value={`${Number(circuit.price_per_person).toFixed(0)} TND`} />
                )}
                {circuit.difficulty && (
                  <SpecCard icon={LuMountain} label="Difficulté"
                    value={diff.label} color={diff.color} />
                )}
                {circuit.available_dates?.length > 0 && (
                  <SpecCard icon={LuCalendar} label="Dates dispo."
                    value={`${circuit.available_dates.length} départ${circuit.available_dates.length > 1 ? "s" : ""}`}
                    color="green" />
                )}
                {circuit.category && (
                  <SpecCard icon={LuCompass} label="Catégorie"
                    value={cat.label} color={cat.color} />
                )}
              </Grid>
            </Box>

            {/* Description */}
            {circuit.description && (
              <Box>
                <SectionTitle>Description</SectionTitle>
                <Text fontSize="sm" color="gray.600" lineHeight="1.9" whiteSpace="pre-line">
                  {showMore || circuit.description.length <= 300
                    ? circuit.description
                    : circuit.description.slice(0, 300) + "…"}
                </Text>
                {circuit.description.length > 300 && (
                  <Button mt={2} size="sm" variant="ghost" colorScheme="orange" px={0}
                    onClick={() => setShowMore(s => !s)}>
                    {showMore ? "Voir moins ↑" : "Voir plus ↓"}
                  </Button>
                )}
              </Box>
            )}

            {/* Inclusions */}
            {circuit.inclusions?.length > 0 && (
              <Box>
                <SectionTitle>Ce qui est inclus</SectionTitle>
                <Grid templateColumns="repeat(auto-fill, minmax(160px,1fr))" gap={3}>
                  {circuit.inclusions.map((item, i) => (
                    <Flex key={i} align="center" gap={2.5} p={3}
                      bg="green.50" borderRadius="xl"
                      border="1px solid" borderColor="green.100">
                      <Flex w="22px" h="22px" borderRadius="full"
                        bg="green.400" align="center" justify="center" flexShrink={0}>
                        <FaCheck size={9} color="white" />
                      </Flex>
                      <Text fontSize="sm" fontWeight={600} color="green.700">{item}</Text>
                    </Flex>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Voyage equipments */}
            {voyage?.equipments?.length > 0 && (
              <Box>
                <SectionTitle>Équipements fournis</SectionTitle>
                <Grid templateColumns="repeat(auto-fill, minmax(180px,1fr))" gap={3}>
                  {voyage.equipments.map((eq, i) => (
                    <Flex key={i} align="center" gap={2.5} p={3}
                      bg="orange.50" borderRadius="xl"
                      border="1px solid" borderColor="orange.100">
                      <Icon as={EQUIP_ICONS[eq] || LuCompass} />
                      {/* <Text fontSize="lg">{EQUIP_ICONS[eq] ?? "🎒"}</Text> */}
                      <Text fontSize="sm" fontWeight={600} color="orange.700">{eq}</Text>
                    </Flex>
                  ))}
                </Grid>
              </Box>
            )}

          </VStack>

          {/* RIGHT — sticky sidebar */}
          <Box>
            <VStack align="stretch" spacing={4}
              position={{ base: "static", lg: "sticky" }} top="88px">

              {/* Booking card */}
              <Box bg="white" borderRadius="2xl" overflow="hidden"
                border="1px solid" borderColor="gray.100"
                boxShadow="0 4px 24px rgba(0,0,0,0.08)">
                <Box bg="blue.600" px={5} py={4}>
                  <Text color="white" fontWeight={700} fontSize="md">
                    Réserver ce circuit


                  </Text>
                  <Text color="blue.100" fontSize="xs" mt={0.5}>
                    {circuit.packagesCircuit?.length ? `${circuit.packagesCircuit.length} packages disponibles` : "À partir de"}
                  </Text>
                </Box>
                <VStack align="stretch" spacing={3} p={5}>
                  {circuit.packagesCircuit?.length > 0 && (
                    <>
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="gray.500">Prix min</Text>
                        <Text fontSize="sm" fontWeight={700} color="gray.800">
                          {Math.min(...circuit.packagesCircuit.map(p => p.price)).toFixed(0)} TND
                        </Text>
                      </Flex>
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="gray.500">Prix max</Text>
                        <Text fontSize="sm" fontWeight={700} color="gray.800">
                          {Math.max(...circuit.packagesCircuit.map(p => p.price)).toFixed(0)} TND
                        </Text>
                      </Flex>
                    </>
                  )}
                  {circuit.duration && (
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.500">Durée</Text>
                      <Text fontSize="sm" fontWeight={700} color="gray.800">
                        {circuit.duration} jour{circuit.duration > 1 ? "s" : ""}
                      </Text>
                    </Flex>
                  )}
                  <Box borderTop="1px solid" borderColor="gray.100" pt={3}>
                    <Tooltip content={
                      !user ?
                        "Vous devez vous connecter pour réserver"
                        : user?.role !== "client"
                          ? "Seuls les clients peuvent effectuer une réservation"
                          : undefined
                    }>
                      <Button w="full" h="46px" colorScheme="blue"
                        borderRadius="xl" fontWeight={700}
                        disabled={circuit?.packagesCircuit?.length === 0 || !user || user?.role !== "client"}
                        onClick={() => setBookingDialogOpen(true)}
                      >
                        <Flex align="center" gap={2}>
                          <LuCompass size={15} />
                          Réserver maintenant
                        </Flex>
                      </Button>
                    </Tooltip>
                    <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
                      Contactez l'agence pour confirmer
                    </Text>
                  </Box>
                </VStack>
              </Box>

              {voyage && (
                <Box bg="white" borderRadius="2xl" overflow="hidden"
                  border="1px solid" borderColor="gray.100"
                  boxShadow="0 1px 8px rgba(0,0,0,0.05)">

                  <Box h="50px"
                    bg="linear-gradient(135deg,#2B6CB0,#3182CE,#63B3ED)"
                    position="relative">
                    <Box position="absolute" top="-20px" right="-20px"
                      w="80px" h="80px" borderRadius="full" bg="whiteAlpha.100" />
                  </Box>

                  <Box px={5} pb={5}>
                    <Flex align="flex-end" gap={3} mt={5} mb={4}>
                      <Flex w="48px" h="48px" borderRadius="xl"
                        bg="white" border="2.5px solid white"
                        boxShadow="0 4px 12px rgba(0,0,0,0.12)"
                        align="center" justify="center"
                        color="orange.500" flexShrink={0}>
                        <LuCompass size={20} />
                      </Flex>
                      <Box flex={1}>
                        <Text fontWeight={800} fontSize="md" color="gray.900"
                          noOfLines={1}>
                          {voyage.name}
                        </Text>
                        <Flex align="center" gap={1} mt={0.5}>
                          <Box color="gray.400"><FaMapMarkerAlt size={9} /></Box>
                          <Text fontSize="xs" color="gray.400">{voyage.location}</Text>
                        </Flex>
                      </Box>
                    </Flex>

                    {voyage.description && (
                      <Text fontSize="xs" color="gray.500" lineHeight="1.7"
                        noOfLines={3} mb={4}>
                        {voyage.description}
                      </Text>
                    )}

                    {/* Category tags */}
                    {voyage.categories?.length > 0 && (
                      <Flex gap={1.5} flexWrap="wrap" mb={4}>
                        {voyage.categories.map(c => {
                          const m = CAT_META[c] ?? { color: "gray", label: c }
                          return (
                            <Badge key={c} colorScheme={m.color}
                              borderRadius="full" px={2} py={0.5} fontSize="xs">
                              {m.label}
                            </Badge>
                          )
                        })}
                      </Flex>
                    )}

                    {/* Contact */}
                    <VStack align="stretch" spacing={2}>
                      {voyage.phone && (
                        <Flex as="a" href={`tel:${voyage.phone}`}
                          align="center" gap={2.5} bg="gray.50"
                          borderRadius="lg" px={3} py={2}
                          border="1px solid" borderColor="gray.100"
                          _hover={{ bg: "orange.50", borderColor: "orange.100" }}
                          transition="all 0.15s">
                          <Icon fontSize={"xs"} as={FaPhone} />
                          <Text fontSize="sm" color="gray.600">{voyage.phone}</Text>
                        </Flex>
                      )}
                      {voyage.website && (
                        <Flex as="a" href={voyage.website} target="_blank"
                          align="center" gap={2.5} bg="gray.50"
                          borderRadius="lg" px={3} py={2}
                          border="1px solid" borderColor="gray.100"
                          _hover={{ bg: "orange.50", borderColor: "orange.100" }}
                          transition="all 0.15s">
                          <Box color="gray.400"><FaGlobe size={12} /></Box>
                          <Text fontSize="sm" color="orange.500" noOfLines={1}>
                            {voyage.website}
                          </Text>
                        </Flex>
                      )}
                    </VStack>
                  </Box>
                </Box>
              )}

            </VStack>
          </Box>

        </Grid>
      </Box>
    </>
  )
}