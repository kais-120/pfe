import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box, Button, Flex, Grid, Text, VStack,
  Badge, Image, Skeleton, SkeletonText, HStack,
} from "@chakra-ui/react"
import {
  FaChevronLeft, FaChevronRight, FaMapMarkerAlt,
  FaPhone, FaCheck, FaSearch, FaMountain,
} from "react-icons/fa"
import {
  LuCompass, LuCalendar, LuUsers, LuClock,
  LuMapPin, LuTag, LuMountain,
} from "react-icons/lu"
import Header from "./components/home/Header"
import { Axios, imageURL } from "./Api/Api"

/* ── Category meta ──────────────────────────────────────────────── */
const CAT_META = {
  desert:   { color: "orange", label: "Désert"    },
  aventure: { color: "red",    label: "Aventure"  },
  camping:  { color: "green",  label: "Camping"   },
  voyage:   { color: "blue",   label: "Voyage"    },
  montagne: { color: "purple", label: "Montagne"  },
  plage:    { color: "teal",   label: "Plage"     },
  culturel: { color: "yellow", label: "Culturel"  },
}

const DIFF_META = {
  "facile":        { color: "green"  },
  "modéré":        { color: "yellow" },
  "difficile":     { color: "orange" },
  "très difficile":{ color: "red"    },
}

/* ── Circuit image slider ───────────────────────────────────────── */
function CircuitSlider({ images, circuitId }) {
  const [idx, setIdx] = useState(0)
  if (!images?.length) return (
    <Flex h="210px" borderRadius="xl" bg="gray.100"
      align="center" justify="center" color="gray.300">
      <LuMountain size={36} />
    </Flex>
  )
  const prev = e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }
  const next = e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }
  return (
    <Box position="relative" h="210px" overflow="hidden" borderRadius="xl">
      <Image
        src={`${imageURL}/travel/${images[idx].image_url}`}
        alt={`circuit-${circuitId}`}
        w="100%" h="100%" objectFit="cover"
        transition="opacity 0.3s"
        onError={e => { e.target.src = `${imageURL}/services/${images[idx].image_url}` }}
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

/* ── Circuit card ───────────────────────────────────────────────── */
function CircuitCard({ circuit, voyage }) {
  const navigate = useNavigate()
  const diff = DIFF_META[circuit.difficulty] ?? { color: "gray" }
  const cat  = CAT_META[circuit.category?.toLowerCase()] ??
               { color: "blue", label: circuit.category }

  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.06)"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "translateY(-4px)", boxShadow: "0 8px 28px rgba(0,0,0,0.12)" }}>

      <Box p={4} pb={0} position="relative">
        <CircuitSlider images={circuit.imagesCircuits} circuitId={circuit.id} />
        {/* Difficulty badge */}
        <Badge position="absolute" top={7} right={7}
          colorScheme={diff.color} borderRadius="full"
          px={2.5} py={0.5} fontSize="xs" fontWeight={700} boxShadow="sm">
          {circuit.difficulty}
        </Badge>
      </Box>

      <VStack align="stretch" px={4} pt={3} pb={4} spacing={3}>

        {/* Title + location */}
        <Box>
          <Flex align="center" gap={2} mb={1} flexWrap="wrap">
            <Badge colorScheme={cat.color} borderRadius="full"
              px={2.5} py={0.5} fontSize="xs" fontWeight={700}>
              {cat.label}
            </Badge>
          </Flex>
          <Text fontWeight={800} fontSize="md" color="gray.900" noOfLines={2}>
            {circuit.title}
          </Text>
          <Flex align="center" gap={1.5} mt={1}>
            <Box color="blue.400"><FaMapMarkerAlt size={11} /></Box>
            <Text fontSize="xs" color="gray.500">{circuit.location}</Text>
          </Flex>
        </Box>

        {/* Description */}
        {circuit.description && (
          <Text fontSize="sm" color="gray.600" lineHeight="1.7" noOfLines={2}>
            {circuit.description}
          </Text>
        )}

        {/* Specs */}
        <Flex gap={3} flexWrap="wrap">
          {circuit.duration_days && (
            <Flex align="center" gap={1.5} fontSize="xs" color="gray.500">
              <LuCalendar size={12} />
              <Text fontWeight={600}>{circuit.duration_days}</Text>
              &nbsp;j
            </Flex>
          )}
          {circuit.max_people && (
            <Flex align="center" gap={1.5} fontSize="xs" color="gray.500">
              <LuUsers size={12} />
              Max&nbsp;<Text as="span" fontWeight={600}>{circuit.max_people}</Text>&nbsp;pers.
            </Flex>
          )}
          {circuit.available_dates?.length > 0 && (
            <Flex align="center" gap={1.5} fontSize="xs" color="green.600">
              <LuCalendar size={12} />
              <Text fontWeight={600}>{circuit.available_dates.length}</Text>
              &nbsp;date{circuit.available_dates.length > 1 ? "s" : ""}
            </Flex>
          )}
        </Flex>

        {/* Inclusions */}
        {circuit.inclusions?.length > 0 && (
          <Flex gap={1.5} flexWrap="wrap">
            {circuit.inclusions.slice(0, 3).map((item, i) => (
              <Flex key={i} align="center" gap={1} px={2} py={0.5}
                bg="green.50" color="green.600" borderRadius="full"
                fontSize="xs" fontWeight={500}>
                <FaCheck size={8} />{item}
              </Flex>
            ))}
            {circuit.inclusions.length > 3 && (
              <Box px={2} py={0.5} bg="gray.50" color="gray.400"
                borderRadius="full" fontSize="xs">
                +{circuit.inclusions.length - 3}
              </Box>
            )}
          </Flex>
        )}

        {/* Divider + voyage info */}
        <Box borderTop="1px solid" borderColor="gray.100" />
        <Flex align="center" gap={2.5}>
          <Flex w="30px" h="30px" borderRadius="lg" flexShrink={0}
            bg="orange.50" color="orange.500"
            align="center" justify="center"
            border="1px solid" borderColor="orange.100">
            <LuCompass size={13} />
          </Flex>
          <Box flex={1} minW={0}>
            <Text fontSize="sm" fontWeight={700} color="gray.800" noOfLines={1}>
              {voyage.name}
            </Text>
            <Flex align="center" gap={1} mt={0.5}>
              <Box color="gray.300"><FaMapMarkerAlt size={9} /></Box>
              <Text fontSize="xs" color="gray.400" noOfLines={1}>{voyage.location}</Text>
            </Flex>
          </Box>
          {voyage.phone && (
            <Flex as="a" href={`tel:${voyage.phone}`}
              w="28px" h="28px" borderRadius="md"
              bg="gray.50" color="gray.400"
              align="center" justify="center"
              _hover={{ bg: "blue.50", color: "blue.500" }}
              transition="all 0.15s" flexShrink={0}>
              <FaPhone size={10} />
            </Flex>
          )}
        </Flex>

        {/* Price + CTA */}
        <Flex align="center" justify="space-between">
          <Box>
            <Text fontSize="xs" color="gray.400">À partir de</Text>
            <Flex align="baseline" gap={1}>
              <Text fontSize="xl" fontWeight={900} color="orange.500" lineHeight="1.2">
                {Number(circuit.price_per_person).toFixed(0)}
              </Text>
              <Text fontSize="xs" color="gray.500">TND / pers.</Text>
            </Flex>
          </Box>
          <Button colorScheme="orange" borderRadius="xl"
            size="sm" fontWeight={700} px={5}
            onClick={() => navigate(`/voyage/circuit/${circuit.id}`, {
              state: { circuit, voyage }
            })}>
            Voir le circuit
          </Button>
        </Flex>

      </VStack>
    </Box>
  )
}

/* ── Card skeleton ──────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100">
      <Box p={4}><Skeleton h="210px" borderRadius="xl" /></Box>
      <VStack align="stretch" px={4} pb={4} spacing={3}>
        <SkeletonText noOfLines={2} spacing={2} skeletonHeight={4} />
        <SkeletonText noOfLines={2} spacing={2} skeletonHeight={2} />
        <Flex gap={2}>
          <Skeleton h="22px" w="70px" borderRadius="full" />
          <Skeleton h="22px" w="60px" borderRadius="full" />
        </Flex>
        <Skeleton h="1px" />
        <Flex gap={3} align="center">
          <Skeleton w="30px" h="30px" borderRadius="lg" />
          <SkeletonText flex={1} noOfLines={2} spacing={1} />
        </Flex>
        <Skeleton h="36px" borderRadius="xl" />
      </VStack>
    </Box>
  )
}

/* ── Main page ──────────────────────────────────────────────────── */
export default function HomeVoyage() {
  const [voyages,setVoyages] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const [search,setSearch] = useState("")
  const [catFilter,setCatFilter] = useState("all")

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const res = await Axios.get("/service/voyage/public/get")
        setVoyages(res.data.voyages ?? [])
      } catch {
        setError("Impossible de charger les voyages.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  /* Flatten all circuits */
  const allCircuits = voyages.flatMap(voyage =>
    (voyage.circuits ?? []).map(circuit => ({ circuit, voyage }))
  )

  /* All categories from data */
  const allCats = [...new Set(
    voyages.flatMap(v => v.categories ?? [])
  )]

  /* Filter */
  const filtered = allCircuits.filter(({ circuit, voyage }) => {
    const matchCat  = catFilter === "all" ||
      voyage.categories?.includes(catFilter) ||
      circuit.category?.toLowerCase() === catFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      circuit.title?.toLowerCase().includes(q) ||
      circuit.location?.toLowerCase().includes(q) ||
      voyage.name?.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  return (
    <>
      <Header />

      {/* ── Hero ── */}
      <Box
        bg="linear-gradient(160deg, #0D1B3E 0%, #1A3260 50%, #0D1B3E 100%)"
        py={14} px={4}>
        <Flex direction="column" align="center" gap={5} textAlign="center">

          <Flex align="center" gap={2} bg="whiteAlpha.200"
            borderRadius="full" px={4} py={1.5}>
            <LuCompass size={13} color="white" />
            <Text fontSize="xs" fontWeight={700} color="white"
              textTransform="uppercase" letterSpacing="widest">
              Circuits & Aventures
            </Text>
          </Flex>

          <Box>
            <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight={900}
              color="white" lineHeight="1.15" letterSpacing="-0.5px">
              Partez à l'aventure
            </Text>
            <Text color="orange.100" fontSize="sm" mt={2}>
              {allCircuits.length} circuit{allCircuits.length !== 1 ? "s" : ""} ·{" "}
              {voyages.length} organisateur{voyages.length !== 1 ? "s" : ""}
            </Text>
          </Box>

          {/* Search */}
          <Flex w="full" maxW="520px" align="center"
            bg="white" borderRadius="2xl" px={4} h="52px"
            boxShadow="0 4px 24px rgba(0,0,0,0.2)"
            _focusWithin={{ boxShadow: "0 4px 32px rgba(210,105,30,0.3)" }}
            transition="box-shadow 0.2s">
            <Box color="gray.400" mr={3}><FaSearch size={14} /></Box>
            <Box as="input"
              placeholder="Circuit, ville, organisateur…"
              value={search} onChange={e => setSearch(e.target.value)}
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

      {/* ── Category filter ── */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.100"
        py={3} px={4} position="sticky" top={0} zIndex={10}
        boxShadow="0 1px 8px rgba(0,0,0,0.04)">
        <Flex justify="center" gap={2} flexWrap="wrap">
          {[{ key: "all", label: "Tous", color: "orange" },
            ...allCats.map(c => ({
              key: c,
              ...(CAT_META[c] ?? { color: "gray", label: c })
            }))
          ].map(({ key, label, color }) => (
            <Box key={key} as="button"
              px={4} py={1.5} borderRadius="full"
              fontSize="sm" fontWeight={600}
              border="1.5px solid"
              borderColor={catFilter === key ? `${color}.400` : "gray.200"}
              bg={catFilter === key ? `${color}.50` : "white"}
              color={catFilter === key ? `${color}.600` : "gray.500"}
              cursor="pointer" transition="all 0.15s"
              onClick={() => setCatFilter(key)}>
              {label}
            </Box>
          ))}
        </Flex>
      </Box>

      {/* ── Grid ── */}
      <Box bg="#f5f6fa" minH="60vh">
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={8}>

          {!loading && (
            <Text fontSize="sm" color="gray.500" mb={6}>
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
              {search ? ` pour "${search}"` : ""}
              {catFilter !== "all" ? ` · ${CAT_META[catFilter]?.label ?? catFilter}` : ""}
            </Text>
          )}

          {error && (
            <Flex direction="column" align="center" py={20} gap={3}>
              <Text color="gray.500">{error}</Text>
              <Button size="sm" colorScheme="orange"
                onClick={() => window.location.reload()}>Réessayer</Button>
            </Flex>
          )}

          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }}
            gap={6}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              : filtered.map(({ circuit, voyage }) => (
                  <CircuitCard key={circuit.id} circuit={circuit} voyage={voyage} />
                ))
            }
          </Grid>

          {!loading && !error && filtered.length === 0 && (
            <Flex direction="column" align="center" py={20} gap={3}>
              <Text fontWeight={600} color="gray.700">Aucun circuit trouvé</Text>
              <Text fontSize="sm" color="gray.400">
                {search || catFilter !== "all"
                  ? "Essayez d'autres filtres."
                  : "Aucun circuit disponible pour le moment."}
              </Text>
              {(search || catFilter !== "all") && (
                <Button size="sm" colorScheme="orange" variant="outline"
                  borderRadius="xl"
                  onClick={() => { setSearch(""); setCatFilter("all") }}>
                  Réinitialiser
                </Button>
              )}
            </Flex>
          )}

        </Box>
      </Box>
    </>
  )
}