import { useEffect, useState } from "react"
import {
  Box, Container, Heading, Text, Button, Badge,
  Flex, VStack, Grid, HStack, Image,
  Skeleton, SkeletonText,
} from "@chakra-ui/react"
import {
  LuMapPin, LuPlus, LuPencil, LuTrash2,
  LuUsers, LuTag, LuClock, LuCalendar,
  LuStar, LuMountain, LuCompass, LuCheck,
  LuChevronRight, LuImage,
} from "react-icons/lu"
import { FaCampground, FaMountain, FaUmbrellaBeach, FaHiking } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { AxiosToken, imageURL } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"

const CATEGORY_META = {
  voyage:{ Icon: LuCompass,label: "Voyage",color: "blue"   },
  camping:{ Icon: FaCampground,label: "Camping",color: "green"  },
  desert:{ Icon: LuMountain,label: "Désert",color: "orange" },
  aventure:{ Icon: FaHiking,label: "Aventure",color: "red"    },
  plage:{ Icon: FaUmbrellaBeach,label: "Plage",color: "teal"   },
  montagne:{ Icon: FaMountain,label: "Montagne",color: "purple" },
  culturel:{ Icon: LuStar,label: "Culturel",color: "yellow" },
}

const DIFFICULTY_STYLE = {
  "facile":{ color: "green"  },
  "modéré":{ color: "yellow" },
  "difficile":{ color: "orange" },
  "très difficile":{ color: "red"   },
}

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
  : "—"

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
          <Text fontSize="lg" fontWeight={900} color="gray.800" lineHeight={1}>{value}</Text>
          <Text fontSize="xs" color="gray.400" mt={0.5}>{label}</Text>
        </Box>
      </Flex>
    </Box>
  )
}

function SectionTitle({ children, action }) {
  return (
    <Flex align="center" justify="space-between" mb={4}
      pb={2} borderBottom="2px solid" borderColor="blue.100">
      <Text fontSize="xl" fontWeight={800} color="gray.800">{children}</Text>
      {action}
    </Flex>
  )
}

function CircuitCard({ circuit, onDelete }) {
  const cat   = CATEGORY_META[circuit.category] ?? { Icon: LuCompass, label: circuit.category, color: "blue" }
  const CatIcon = cat.Icon
  const diff  = DIFFICULTY_STYLE[circuit.difficulty] ?? { color: "gray" }
  const mainImg = circuit.imagesCircuits?.[0]?.image_url
    ? `${imageURL}/services/${circuit.imagesCircuits[0]?.image_url}`
    : null

  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 2px 12px rgba(0,0,0,0.06)"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "translateY(-3px)", boxShadow: "0 8px 28px rgba(0,0,0,0.1)" }}>

      {/* Image */}
      <Box position="relative" h="180px" bg="gray.100">
        {mainImg ? (
          <Box as="img" src={mainImg} w="100%" h="100%"
            style={{ objectFit: "cover" }} />
        ) : (
          <Flex h="100%" align="center" justify="center" color="gray.300">
            <LuImage size={36} />
          </Flex>
        )}
        <Flex position="absolute" top={2} left={2} gap={1.5}>
          <Badge colorScheme={cat.color} borderRadius="full" px={2} py={0.5}
            fontSize="xs" fontWeight={600}>
            <Flex align="center" gap={1}>
              <CatIcon size={10} />{cat.label}
            </Flex>
          </Badge>
          {circuit.difficulty && (
            <Badge colorScheme={diff.color} borderRadius="full"
              px={2} py={0.5} fontSize="xs" fontWeight={600}>
              {circuit.difficulty}
            </Badge>
          )}
        </Flex>
        <Button size="xs" position="absolute" top={2} right={2}
          variant="solid" bg="blackAlpha.600" color="white"
          borderRadius="lg" _hover={{ bg: "red.500" }}
          onClick={() => onDelete?.(circuit.id)}>
          <LuTrash2 size={12} />
        </Button>
      </Box>

      <Box p={4}>
        <Text fontWeight={800} fontSize="md" color="gray.900" mb={1} noOfLines={1}>
          {circuit.title}
        </Text>
        <Flex align="center" gap={1.5} mb={3}>
          <LuMapPin size={11} color="gray" />
          <Text fontSize="xs" color="gray.500" noOfLines={1}>{circuit.location}</Text>
        </Flex>
        <Text fontSize="sm" color="gray.600" lineHeight="1.6" noOfLines={2} mb={3}>
          {circuit.description}
        </Text>

        <Grid templateColumns="1fr 1fr 1fr" gap={2} mb={3}>
          <Box bg="gray.50" borderRadius="lg" p={2} textAlign="center">
            <Text fontSize="xs" color="gray.400" mb={0.5}>Durée</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">
              {circuit.duration_days ? `${circuit.duration_days}j` : "—"}
            </Text>
          </Box>
          <Box bg="gray.50" borderRadius="lg" p={2} textAlign="center">
            <Text fontSize="xs" color="gray.400" mb={0.5}>Groupe</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">
              {circuit.max_people ? `${circuit.max_people} pers.` : "—"}
            </Text>
          </Box>
          <Box bg="blue.50" borderRadius="lg" p={2} textAlign="center">
            <Text fontSize="xs" color="gray.400" mb={0.5}>Prix</Text>
            <Text fontSize="sm" fontWeight={800} color="blue.600">
              {circuit.price_per_person ? `${circuit.price_per_person} TND` : "—"}
            </Text>
          </Box>
        </Grid>

        {/* Available dates */}
        {circuit.available_dates?.length > 0 && (
          <Flex gap={1.5} flexWrap="wrap">
            {circuit.available_dates.slice(0, 3).map((d, i) => (
              <Badge key={i} colorScheme="blue" borderRadius="md"
                px={2} py={0.5} fontSize="xs">
                {formatDate(d)}
              </Badge>
            ))}
            {circuit.available_dates.length > 3 && (
              <Badge colorScheme="gray" borderRadius="md" px={2} py={0.5} fontSize="xs">
                +{circuit.available_dates.length - 3}
              </Badge>
            )}
          </Flex>
        )}
      </Box>
    </Box>
  )
}

/* ── Option card ────────────────────────────────────────────────── */
function OptionCard({ option, onDelete }) {
  return (
    <Box bg="white" borderRadius="xl" p={4}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 6px rgba(0,0,0,0.04)"
      transition="box-shadow 0.2s, border-color 0.2s"
      _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)", borderColor: "blue.100" }}>
      <Flex justify="space-between" align="flex-start">
        <Flex align="center" gap={3} flex={1} mr={3}>
          <Flex w="36px" h="36px" borderRadius="lg"
            bg="purple.50" color="purple.500"
            align="center" justify="center" flexShrink={0}>
            <LuTag size={15} />
          </Flex>
          <Box>
            <Text fontWeight={700} fontSize="sm" color="gray.800">{option.name}</Text>
            {option.description && (
              <Text fontSize="xs" color="gray.500" mt={0.5} noOfLines={1}>
                {option.description}
              </Text>
            )}
          </Box>
        </Flex>
        <Flex align="center" gap={3} flexShrink={0}>
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.400">Prix</Text>
            <Text fontSize="md" fontWeight={800} color="blue.600">
              +{option.price} TND
            </Text>
          </Box>
          <Button size="xs" variant="ghost" color="red.400"
            borderRadius="lg" _hover={{ bg: "red.50" }}
            onClick={() => onDelete?.(option.id)}>
            <LuTrash2 size={12} />
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

function PageSkeleton() {
  return (
    <Container maxW="6xl" py={8}>
      <Skeleton h="32px" w="250px" borderRadius="lg" mb={2} />
      <Skeleton h="16px" w="180px" borderRadius="md" mb={8} />
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={3} mb={6}>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="80px" borderRadius="xl" />)}
      </Grid>
      <VStack gap={5} align="stretch">
        <Skeleton h="180px" borderRadius="2xl" />
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h="320px" borderRadius="2xl" />)}
        </Grid>
      </VStack>
    </Container>
  )
}

/* ── Main component ─────────────────────────────────────────────── */
const ServiceVoyage = () => {
  const [agency,   setAgency]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [showMore, setShowMore] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await AxiosToken.get("/service/voyage/get")
        setAgency(res.data.voyage)
      } catch {
        console.error("Failed to load agency")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDeleteCircuit = async (id) => {
    try {
      await AxiosToken.delete(`/service/travel/circuit/${id}`)
      setAgency(prev => ({ ...prev, circuits: prev.circuits.filter(c => c.id !== id) }))
      toaster.create({ description: "Circuit supprimé.", type: "info", closable: true })
    } catch {
      toaster.create({ description: "Erreur de suppression.", type: "error", closable: true })
    }
  }

  const handleDeleteOption = async (id) => {
    try {
      await AxiosToken.delete(`/service/travel/option/${id}`)
      setAgency(prev => ({ ...prev, options: prev.options.filter(o => o.id !== id) }))
      toaster.create({ description: "Option supprimée.", type: "info", closable: true })
    } catch {
      toaster.create({ description: "Erreur de suppression.", type: "error", closable: true })
    }
  }

  if (loading) return <PageSkeleton />

  if (!agency) {
    return (
      <Container maxW="6xl" py={24}>
        <Flex direction="column" align="center" gap={4} textAlign="center">
          <Heading size="lg" color="gray.800">Aucune agence de voyage</Heading>
          <Text color="gray.500" maxW="400px" lineHeight="1.7">
            Vous n'avez pas encore créé votre espace voyage. Commencez par renseigner
            votre profil, vos circuits et vos options.
          </Text>
          <Button colorScheme="blue" borderRadius="xl" px={8} size="lg"
            onClick={() => navigate("voyage/add")}>
            <Flex align="center" gap={2}>
              <LuPlus size={16} />Créer mon agence
            </Flex>
          </Button>
        </Flex>
      </Container>
    )
  }

  /* ── Computed stats ── */
  const totalCircuits = agency.circuits?.length ?? 0
  const totalOptions  = agency.options?.length  ?? 0
  const minPrice      = agency.circuits?.length
    ? Math.min(...agency.circuits.map(c => Number(c.price_per_person) || 0))
    : null
  const categories    = [...new Set(agency.circuits?.map(c => c.category).filter(Boolean))]

  return (
    <Container maxW="6xl" py={8}>

      {/* ── Header ── */}
      <Flex justify="space-between" align="flex-start" mb={7} gap={4} flexWrap="wrap">
        <Box>
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={1}>
            Mon service
          </Text>
          <Heading size="xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
            {agency.agency_name ?? "Mon Agence Voyage"}
          </Heading>
          <Flex align="center" gap={3} mt={1} flexWrap="wrap">
            {agency.location && (
              <Flex align="center" gap={1.5}>
                <LuMapPin size={13} color="gray" />
                <Text fontSize="sm" color="gray.500">{agency.location}</Text>
              </Flex>
            )}
            {categories.length > 0 && (
              <Flex gap={1.5}>
                {categories.map(cat => {
                  const m = CATEGORY_META[cat]
                  if (!m) return null
                  return (
                    <Badge key={cat} colorScheme={m.color} borderRadius="full"
                      px={2} py={0.5} fontSize="xs">
                      {m.label}
                    </Badge>
                  )
                })}
              </Flex>
            )}
          </Flex>
        </Box>
        <Button colorScheme="blue" borderRadius="xl" size="sm" px={5} fontWeight={600}
          onClick={() => navigate("edit")}>
          <Flex align="center" gap={2}><LuPencil size={13} />Modifier</Flex>
        </Button>
      </Flex>

      {/* ── Stats ── */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={3} mb={8}>
        <StatCard icon={LuCompass}  label="Circuits"       value={totalCircuits}                color="blue"   />
        <StatCard icon={LuTag}      label="Options extra"  value={totalOptions}                 color="purple" />
        <StatCard icon={LuUsers}    label="Capacité max"   value={agency.circuits?.reduce((s,c) => s + (Number(c.max_people)||0), 0) || "—"} color="green" />
        <StatCard icon={LuStar}     label="Prix min/pers." value={minPrice ? `${minPrice} TND` : "—"} color="orange" />
      </Grid>

      <VStack gap={8} align="stretch">

        {/* ── About ── */}
        <Box bg="white" borderRadius="2xl" p={6}
          border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 8px rgba(0,0,0,0.05)">
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={2}>
            À propos
          </Text>

          {agency.description ? (
            <>
              <Text fontSize="sm" color="gray.600" lineHeight="1.9" whiteSpace="pre-line">
                {showMore || agency.description.length <= 200
                  ? agency.description
                  : agency.description.slice(0, 200) + "…"}
              </Text>
              {agency.description.length > 200 && (
                <Button mt={2} size="sm" variant="ghost" colorScheme="blue" px={0}
                  onClick={() => setShowMore(!showMore)}>
                  {showMore ? "Voir moins ↑" : "Voir plus ↓"}
                </Button>
              )}
            </>
          ) : (
            <Text fontSize="sm" color="gray.400">Aucune description.</Text>
          )}

          {/* Equipment tags */}
          {agency.equipments?.length > 0 && (
            <Box mt={5} pt={5} borderTop="1px solid" borderColor="gray.100">
              <Text fontSize="xs" fontWeight={700} color="gray.400"
                textTransform="uppercase" letterSpacing="wider" mb={3}>
                Équipements fournis
              </Text>
              <Flex gap={2} flexWrap="wrap">
                {agency.equipments.map((eq, i) => (
                  <Flex key={i} align="center" gap={1.5}
                    bg="green.50" color="green.700" borderRadius="full"
                    px={3} py={1} fontSize="xs" fontWeight={500}
                    border="1px solid" borderColor="green.200">
                    <LuCheck size={10} />{eq}
                  </Flex>
                ))}
              </Flex>
            </Box>
          )}

          {/* categories tags */}
          {agency.categories?.length > 0 && (
            <Box mt={5} pt={5} borderTop="1px solid" borderColor="gray.100">
              <Text fontSize="xs" fontWeight={700} color="gray.400"
                textTransform="uppercase" letterSpacing="wider" mb={3}>
                Categories fournis
              </Text>
              <Flex gap={2} flexWrap="wrap">
                {agency.categories.map((eq, i) => (
                  <Flex key={i} align="center" gap={1.5}
                    bg="blue.50" color="blue.700" borderRadius="full"
                    px={3} py={1} fontSize="xs" fontWeight={500}
                    border="1px solid" borderColor="blue.200">
                    <LuCheck size={10} />{eq}
                  </Flex>
                ))}
              </Flex>
            </Box>
          )}
        </Box>

        <Box>
          <SectionTitle
            action={
              <Button colorScheme="blue" size="sm" borderRadius="xl"
                px={4} fontWeight={600}
                onClick={() => navigate("voyage/circuit/add")}>
                <Flex align="center" gap={2}><LuPlus size={13} />Ajouter un circuit</Flex>
              </Button>
            }
          >
            Circuits
          </SectionTitle>

          {agency.circuits?.length > 0 ? (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={5}>
              {agency.circuits.map(circuit => (
                <CircuitCard key={circuit.id} circuit={circuit}
                  onDelete={handleDeleteCircuit} />
              ))}
            </Grid>
          ) : (
            <Flex direction="column" align="center" py={12} gap={3}
              bg="white" borderRadius="2xl"
              border="1px dashed" borderColor="gray.200">
              <Text fontWeight={600} color="gray.600">Aucun circuit ajouté</Text>
              <Text fontSize="sm" color="gray.400">
                Créez vos premiers circuits pour attirer des voyageurs.
              </Text>
              <Button colorScheme="blue" borderRadius="xl" size="sm" mt={1}
                onClick={() => navigate("voyage/circuit/add")}>
                <Flex align="center" gap={2}><LuPlus size={13} />Ajouter un circuit</Flex>
              </Button>
            </Flex>
          )}
        </Box>

        {/* ── Options ── */}
        <Box>
          <SectionTitle
            action={
              <Button colorScheme="purple" size="sm" borderRadius="xl"
                px={4} fontWeight={600}
                onClick={() => navigate("voyage/travel/add")}>
                <Flex align="center" gap={2}><LuPlus size={13} />Ajouter une option</Flex>
              </Button>
            }
          >
            Options personnalisées
          </SectionTitle>

          {agency.options?.length > 0 ? (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
              {agency.options.map(option => (
                <OptionCard key={option.id} option={option}
                  onDelete={handleDeleteOption} />
              ))}
            </Grid>
          ) : (
            <Flex direction="column" align="center" py={12} gap={3}
              bg="white" borderRadius="2xl"
              border="1px dashed" borderColor="gray.200">
              <Text fontWeight={600} color="gray.600">Aucune option créée</Text>
              <Text fontSize="sm" color="gray.400">
                Ajoutez des excursions, guides ou équipements supplémentaires.
              </Text>
              <Button colorScheme="purple" borderRadius="xl" size="sm" mt={1}
                onClick={() => navigate("voyage/travel/add")}>
                <Flex align="center" gap={2}><LuPlus size={13} />Ajouter une option</Flex>
              </Button>
            </Flex>
          )}
        </Box>

      </VStack>
    </Container>
  )
}

export default ServiceVoyage