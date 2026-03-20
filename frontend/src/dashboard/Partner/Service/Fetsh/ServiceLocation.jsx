import { useEffect, useState } from "react"
import {
  Box, Container, Text, Image, Flex, Grid, Button,
  Badge, VStack, HStack, IconButton, Textarea,
  Input, Skeleton,
} from "@chakra-ui/react"
import {
  LuChevronLeft, LuChevronRight, LuPencil, LuTrash2,
  LuPlus, LuUsers, LuBanknote, LuCheck,
  LuMapPin, LuSettings, LuX,
  LuCar, LuShieldCheck, LuCalendar,
} from "react-icons/lu"
import { FaGasPump, FaSnowflake, FaWifi } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { AxiosToken, imageURL } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"

/* ── Constants ──────────────────────────────────────────────────── */
const IMAGE_BASE = `${imageURL}/services/`

const LOCATION_STATUS = {
  accept:       { colorScheme: "green",  label: "Approuvé"   },
  refuse:       { colorScheme: "red",    label: "Refusé"     },
  "En attente": { colorScheme: "yellow", label: "En attente" },
}

const VEHICLE_STATUS = {
  available:    { colorScheme: "green",  label: "Disponible"  },
  booked:       { colorScheme: "orange", label: "En location" },
  maintenance:  { colorScheme: "red",    label: "Maintenance" },
}

const CATEGORIES = [
  { value: "economy",  label: "Economy"  },
  { value: "standard", label: "Standard" },
  { value: "luxury",   label: "Luxury"   },
]

const FUELS = [
  { value: "petrol",   label: "Essence"    },
  { value: "diesel",   label: "Diesel"     },
  { value: "electric", label: "Électrique" },
  { value: "hybrid",   label: "Hybride"    },
]

const FEATURE_META = {
  ac:        { Icon: FaSnowflake, label: "Climatisation" },
  gps:       { Icon: LuMapPin,   label: "GPS"            },
  wifi:      { Icon: FaWifi,     label: "Wi-Fi"          },
  automatic: { Icon: LuSettings, label: "Automatique"    },
  bluetooth: { Icon: LuSettings, label: "Bluetooth"      },
  usb:       { Icon: LuSettings, label: "Port USB"       },
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

/* ── Vehicle image slider ───────────────────────────────────────── */
function VehicleImageSlider({ images }) {
  const [idx, setIdx] = useState(0)

  if (!images?.length) {
    return (
      <Flex h="180px" bg="gray.100" align="center" justify="center" color="gray.300">
        <LuCar size={40} />
      </Flex>
    )
  }

  return (
    <Box position="relative" h="180px" overflow="hidden">
      <Image
        src={`${IMAGE_BASE}${images[idx].image_url}`}
        w="100%" h="100%" objectFit="cover"
      />
      {images.length > 1 && (
        <>
          <Button size="xs" position="absolute" left={1.5} top="50%"
            transform="translateY(-50%)" borderRadius="full"
            bg="blackAlpha.600" color="white" minW="24px" h="24px" p={0}
            _hover={{ bg: "blackAlpha.800" }}
            onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }}>
            <LuChevronLeft size={10} />
          </Button>
          <Button size="xs" position="absolute" right={1.5} top="50%"
            transform="translateY(-50%)" borderRadius="full"
            bg="blackAlpha.600" color="white" minW="24px" h="24px" p={0}
            _hover={{ bg: "blackAlpha.800" }}
            onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }}>
            <LuChevronRight size={10} />
          </Button>
          <HStack position="absolute" bottom={2} left="50%"
            transform="translateX(-50%)" spacing={1}>
            {images.map((_, i) => (
              <Box key={i}
                w={i === idx ? "14px" : "5px"} h="5px"
                borderRadius="full"
                bg={i === idx ? "white" : "whiteAlpha.600"}
                transition="all 0.2s" cursor="pointer"
                onClick={e => { e.stopPropagation(); setIdx(i) }}
              />
            ))}
          </HStack>
        </>
      )}
    </Box>
  )
}

function VehicleCard({ vehicle, onEdit, onDelete }) {
  const images = vehicle.imagesVehicle ?? []
  const vs     = VEHICLE_STATUS[vehicle.status] ?? { colorScheme: "gray", label: vehicle.status }
  const catLabel = CATEGORIES.find(c => c.value === vehicle.category)?.label ?? vehicle.category
  const fuelLabel = FUELS.find(f => f.value === vehicle.fuel)?.label ?? vehicle.fuel

  return (
    <Box bg="white" borderRadius="2xl" overflow="hidden"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)"
      transition="transform 0.2s, box-shadow 0.2s, border-color 0.2s"
      _hover={{ transform: "translateY(-3px)", boxShadow: "0 8px 28px rgba(0,0,0,0.1)", borderColor: "blue.100" }}
    >
      {/* Image with slider */}
      <Box position="relative">
        <VehicleImageSlider images={images} />
        {/* Status badge */}
        <Badge position="absolute" top={2} right={2}
          colorScheme={vs.colorScheme}
          borderRadius="full" px={2} py={0.5} fontSize="xs">
          {vs.label}
        </Badge>
        {/* Category badge */}
        {catLabel && (
          <Badge position="absolute" top={2} left={2}
            bg="white" color="gray.700"
            borderRadius="md" px={2} py={0.5} fontSize="xs" fontWeight={600}>
            {catLabel}
          </Badge>
        )}
      </Box>

      <Box p={4}>
        {/* Name */}
        <Text fontWeight={800} fontSize="md" color="gray.900" mb={1}>
          {vehicle.brand} {vehicle.model}
        </Text>

        {/* Meta */}
        <Flex align="center" gap={3} mb={2} flexWrap="wrap">
          {vehicle.year && (
            <Flex align="center" gap={1}>
              <LuCalendar size={11} color="gray" />
              <Text fontSize="xs" color="gray.400">{vehicle.year}</Text>
            </Flex>
          )}
          {vehicle.seats && (
            <Flex align="center" gap={1}>
              <LuUsers size={11} color="gray" />
              <Text fontSize="xs" color="gray.400">{vehicle.seats} pers.</Text>
            </Flex>
          )}
          {vehicle.fuel && (
            <Flex align="center" gap={1}>
              <FaGasPump size={10} color="gray" />
              <Text fontSize="xs" color="gray.400">{fuelLabel}</Text>
            </Flex>
          )}
        </Flex>

        {/* Features — API returns ["AC","GPS","Bluetooth"] */}
        {vehicle.features?.length > 0 && (
          <Flex gap={1.5} flexWrap="wrap" mb={3}>
            {vehicle.features.map(f => (
              <Badge key={f} colorScheme="blue" borderRadius="full"
                px={2} py={0.5} fontSize="10px">
                {f}
              </Badge>
            ))}
          </Flex>
        )}

        {/* Conditions mini row */}
        <Flex gap={3} mb={3} flexWrap="wrap">
          {vehicle.min_age && (
            <Flex align="center" gap={1}>
              <LuShieldCheck size={11} color="gray" />
              <Text fontSize="xs" color="gray.400">+{vehicle.min_age} ans</Text>
            </Flex>
          )}
          {vehicle.license_years && (
            <Flex align="center" gap={1}>
              <LuShieldCheck size={11} color="gray" />
              <Text fontSize="xs" color="gray.400">Permis {vehicle.license_years} ans</Text>
            </Flex>
          )}
          {vehicle.caution_standard && (
            <Flex align="center" gap={1}>
              <LuBanknote size={11} color="gray" />
              <Text fontSize="xs" color="gray.400">Caution {vehicle.caution_standard} TND</Text>
            </Flex>
          )}
        </Flex>

        {/* Price + Actions */}
        <Flex align="center" justify="space-between">
          <Box>
            <Text fontSize="xs" color="gray.400" lineHeight={1}>À partir de</Text>
            <Flex align="baseline" gap={1}>
              <Text fontSize="xl" fontWeight={900} color="blue.600" lineHeight={1.2}>
                {Number(vehicle.price_per_day).toFixed(0)}
              </Text>
              <Text fontSize="xs" color="gray.500">TND/jour</Text>
            </Flex>
          </Box>
          <HStack gap={2}>
            <IconButton size="xs" variant="outline" borderRadius="lg"
              color="blue.500" borderColor="blue.200" _hover={{ bg: "blue.50" }}
              onClick={() => console.log("vehicle")}>
              <LuPencil size={12} />
            </IconButton>
            <IconButton size="xs" variant="outline" borderRadius="lg"
              color="red.400" borderColor="red.200" _hover={{ bg: "red.50" }}
              onClick={() => console.log("vehicle")}>
              <LuTrash2 size={12} />
            </IconButton>
          </HStack>
        </Flex>
      </Box>
    </Box>
  )
}


const ServiceLocation = () => {
  const [location,   setLocation]   = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [editTarget, setEditTarget] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await AxiosToken.get("/service/location/get")
        // API: { message: "location found", location: { ...fields, vehicle: [...] } }
        setLocation(res.data.location ?? null)
      } catch {
        console.error("Failed to load location")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDeleteVehicle = async (id) => {
    try {
      await AxiosToken.delete(`/service/location/vehicle/${id}`)
      setLocation(prev => ({
        ...prev,
        vehicle: prev.vehicle.filter(v => v.id !== id),
      }))
      toaster.create({ description: "Véhicule supprimé.", type: "info", closable: true })
    } catch {
      toaster.create({ description: "Erreur de suppression.", type: "error", closable: true })
    }
  }

  const handleEditVehicle = (v) => { setEditTarget(v); }
  const handleSaved        = () => {
    setEditTarget(null)
    // Refresh data after save
    AxiosToken.get("/service/location/get")
      .then(res => setLocation(res.data.location ?? null))
      .catch(() => {})
  }

  /* ── No location yet ── */
  if (!loading && !location) {
    return (
      <Container maxW="6xl" py={24}>
        <Flex direction="column" align="center" gap={4} textAlign="center">
          <Text fontSize="2xl" fontWeight={900} color="gray.800">
            Aucune agence de location enregistrée
          </Text>
          <Text color="gray.500" maxW="360px" fontSize="sm">
            Vous n'avez pas encore ajouté votre agence. Commencez dès maintenant.
          </Text>
          <Button colorScheme="blue" borderRadius="xl" px={8} size="lg" fontWeight={700}
            onClick={() => navigate("location/add")}>
            <Flex align="center" gap={2}><LuPlus size={16} />Créer mon agence</Flex>
          </Button>
        </Flex>
      </Container>
    )
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack gap={4} align="stretch">
          <Skeleton h="48px" w="300px" borderRadius="xl" />
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

  const vehicles       = location.vehicle ?? []
  const availableCount = vehicles.filter(v => v.status === "available").length
  const bookedCount    = vehicles.filter(v => v.status === "booked").length
  const minPrice       = vehicles.length
    ? Math.min(...vehicles.map(v => Number(v.price_per_day || 0)))
    : null
  const ls = LOCATION_STATUS[location.status] ?? { colorScheme: "gray", label: location.status }

  return (
    <Container maxW="6xl" py={8}>

      {/* ── Header ── */}
      <Flex justify="space-between" align="flex-start" mb={7} gap={4} flexWrap="wrap">
        <Box>
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={1}>
            Mon service
          </Text>
          <Text fontSize="3xl" fontWeight={900} color="gray.900"
            lineHeight="1.1" letterSpacing="-0.5px" mb={2}>
            {location.name}
          </Text>
          <VStack align="stretch" gap={1.5}>
            <Flex align="center" gap={2}>
              <Box color="blue.400"><LuMapPin size={14} /></Box>
              <Text fontSize="sm" color="gray.600">{location.address}</Text>
            </Flex>
            <Flex align="center" gap={2} mt={0.5}>
              <Badge colorScheme={ls.colorScheme} borderRadius="full"
                px={2.5} py={0.5} fontSize="xs" fontWeight={600}>
                {ls.label}
              </Badge>
              <Text fontSize="xs" color="gray.400">
                Créée le {new Date(location.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </Text>
            </Flex>
          </VStack>
        </Box>
        <Button colorScheme="blue" size="sm" borderRadius="xl" px={5} fontWeight={600}
          onClick={() => navigate("location/edit")}>
          <Flex align="center" gap={2}><LuPencil size={13} />Modifier l'agence</Flex>
        </Button>
      </Flex>

      {/* ── Stats ── */}
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={3} mb={8}>
        <StatCard icon={LuCar}      label="Total véhicules" value={vehicles.length}                              color="blue"   />
        <StatCard icon={LuCheck}    label="Disponibles"     value={availableCount}                              color="green"  />
        <StatCard icon={LuUsers}    label="En location"     value={bookedCount}                                 color="orange" />
        <StatCard icon={LuBanknote} label="Prix min / jour" value={minPrice ? `${Math.round(minPrice)} TND` : "—"} color="purple" />
      </Grid>

      <Box>
        <SectionHeading
          action={
              <Button colorScheme="blue" size="sm" borderRadius="xl"
                fontWeight={600} px={4}
                onClick={() => { navigate("location/vehicle/add") }}>
                <Flex align="center" gap={2}>
                  <LuPlus size={13} />
                  Ajouter un véhicule
                </Flex>
              </Button>
          }
        >
          Flotte de véhicules ({vehicles.length})
        </SectionHeading>
        

        {/* Empty state */}
        {vehicles.length === 0  ? (
          <Flex direction="column" align="center" py={14} gap={3}
            bg="white" borderRadius="2xl"
            border="1px dashed" borderColor="gray.200">
            <Text fontWeight={600} color="gray.600">Aucun véhicule dans la flotte</Text>
            <Text fontSize="sm" color="gray.400">Ajoutez votre premier véhicule.</Text>
            <Button colorScheme="blue" borderRadius="xl" size="sm" mt={1}
            >
              <Flex align="center" gap={2}><LuPlus size={13} />Ajouter</Flex>
            </Button>
          </Flex>
        ) : (
          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={5}>
            {vehicles.map(v => (
              <VehicleCard key={v.id} vehicle={v}
                onEdit={handleEditVehicle}
                onDelete={handleDeleteVehicle}
              />
            ))}
          </Grid>
        )}
      </Box>

    </Container>
  )
}

export default ServiceLocation