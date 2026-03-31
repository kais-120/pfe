import {
  Container, Input, Button,
  VStack, Grid, Flex, Text, Box,
  Select, Badge, HStack,
  Portal,
  createListCollection,
  Icon,
} from "@chakra-ui/react"
import { Plane } from "lucide-react"

import { useState } from "react"
import {
  LuMapPin,
  LuGlobe,
  LuChevronLeft,
  LuSearch,
  LuArrowRight,
} from "react-icons/lu"

import { useNavigate } from "react-router-dom"

const PACKAGES_DATA = [
  {
    id: 1,
    title: "Umrah Premium - Medine & Makkah",
    month: "Août",
    year: 2026,
    departureDate: "Jeu. 27 Août",
    departureTime: "11h40",
    departureAirport: "TUN-JED",
    returnDate: "Dim. 06 Sept.",
    returnTime: "06h25",
    returnAirport: "JED-TUN",
    duration: "11J / 10N",
    destinations: [
      { name: "Medine, Shaza Regency Plaza 3", rating: 3, nights: 4 },
      { name: "Makkah, Swissotel Makkah 5", rating: 5, nights: 6 },
    ],
    price: 5451,
    installment: "6X",
    type: "haj",
  },
  {
    id: 2,
    title: "Umrah Standard - Medine & Makkah",
    month: "Septembre",
    year: 2026,
    departureDate: "Jeu. 10 Sept.",
    departureTime: "11h40",
    departureAirport: "TUN-JED",
    returnDate: "Dim. 20 Sept.",
    returnTime: "06h25",
    returnAirport: "JED-TUN",
    duration: "11J / 10N",
    destinations: [
      { name: "Medine, Shaza Regency Plaza 3", rating: 3, nights: 4 },
      { name: "Makkah, Swissotel Makkah 5", rating: 5, nights: 6 },
    ],
    price: 5306,
    installment: "6X",
    type: "haj",
  },
  {
    id: 3,
    title: "Umrah Gold - Medine & Makkah",
    month: "Septembre",
    year: 2026,
    departureDate: "Jeu. 24 Sept.",
    departureTime: "11h40",
    departureAirport: "TUN-JED",
    returnDate: "Dim. 04 Oct.",
    returnTime: "06h25",
    returnAirport: "JED-TUN",
    duration: "11J / 10N",
    destinations: [
      { name: "Medine, Shaza Regency Plaza 3", rating: 3, nights: 4 },
      { name: "Makkah, Swissotel Makkah 5", rating: 5, nights: 6 },
    ],
    price: 5306,
    installment: "6X",
    type: "haj",
  },
  {
    id: 4,
    title: "Umrah Economy - Medine & Makkah",
    month: "Octobre",
    year: 2026,
    departureDate: "Jeu. 01 Oct.",
    departureTime: "11h40",
    departureAirport: "TUN-JED",
    returnDate: "Dim. 11 Oct.",
    returnTime: "06h25",
    returnAirport: "JED-TUN",
    duration: "11J / 10N",
    destinations: [
      { name: "Medine, Shaza Regency Plaza 3", rating: 3, nights: 4 },
      { name: "Makkah, Swissotel Makkah 5", rating: 5, nights: 6 },
    ],
    price: 4950,
    installment: "6X",
    type: "haj",
  },
]

function PackageCard({ pkg, onBook }) {
  return (
    <Box
      bg="white"
      borderRadius="2xl"
      p={6}
      border="1px solid"
      borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)"
      mb={4}
      transition="all 0.2s"
      _hover={{
        borderColor: "gray.200",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <Grid
        templateColumns={{ base: "1fr", lg: "auto 1fr auto" }}
        gap={6}
        alignItems="start"
      >
        {/* Left: Airline Icon */}
        <Flex
          w="32px"
          h="32px"
          borderRadius="lg"
          bg="gray.50"
          align="center"
          justify="center"
          flexShrink={0}
          display={{ base: "none", lg: "flex" }}
        >
          <Icon as={Plane}/>
        </Flex>

        {/* Center: Flight Details */}
        <VStack align="stretch" gap={4}>
          {/* Main Flight Info */}
          <Grid
            templateColumns={{ base: "1fr", sm: "auto auto auto 1fr" }}
            gap={{ base: 4, sm: 6 }}
            alignItems="center"
            w="full"
          >
            {/* Departure */}
            <VStack align="start" gap={1} minW="120px">
              <Text fontSize="xs" fontWeight={700} color="gray.600" textTransform="uppercase" letterSpacing="0.5px">
                Départ
              </Text>
              <Text fontSize="sm" fontWeight={700} color="gray.900">
                {pkg.departureDate}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {pkg.departureTime}
              </Text>
              <Text fontSize="xs" color="gray.600" fontWeight={600}>
                {pkg.departureAirport}
              </Text>
            </VStack>

            {/* Arrow & Duration */}
            <VStack align="center" justify="center" gap={1} display={{ base: "none", sm: "flex" }}>
              <LuArrowRight size={18} color="#CBD5E0" />
              <Text fontSize="xs" fontWeight={600} color="gray.600">
                {pkg.duration}
              </Text>
            </VStack>

            {/* Return */}
            <VStack align="start" gap={1} minW="120px">
              <Text fontSize="xs" fontWeight={700} color="gray.600" textTransform="uppercase" letterSpacing="0.5px">
                Retour
              </Text>
              <Text fontSize="sm" fontWeight={700} color="gray.900">
                {pkg.returnDate}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {pkg.returnTime}
              </Text>
              <Text fontSize="xs" color="gray.600" fontWeight={600}>
                {pkg.returnAirport}
              </Text>
            </VStack>

            {/* Destinations List */}
            <VStack align="start" gap={2}>
              {pkg.destinations.map((dest, idx) => (
                <HStack key={idx} gap={2} fontSize="sm">
                  <LuMapPin size={14} color="#A0AEC0" flexShrink={0} />
                  <Text color="gray.700" fontWeight={500}>
                    {dest.name}
                    <Text as="span" color="gray.400" ml={1}>
                      {Array.from({ length: dest.rating }).map((_, i) => (
                        <Text as="span" key={i} color="gold">★</Text>
                      ))}
                    </Text>
                  </Text>
                  <Text color="gray.500" fontSize="xs">
                    ({dest.nights} Nuits)
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Grid>
        </VStack>

        {/* Right: Price & CTA */}
        <VStack
          align={{ base: "stretch", lg: "flex-end" }}
          gap={3}
          justify="center"
        >
          <VStack align={{ base: "start", lg: "end" }} gap={1}>
            <HStack gap={1}>
              <Text fontSize="32px" fontWeight={700} color="gray.900" lineHeight={1}>
                {pkg.price.toLocaleString()}
              </Text>
              <Text fontSize="sm" fontWeight={600} color="gray.500">
                TND
              </Text>
            </HStack>
            <Flex align="center" gap={1} fontSize="xs">
              <Text color="gray.500">Payez en</Text>
              <Text fontWeight={700} color="#E91E8C">
                {pkg.installment}
              </Text>
            </Flex>
          </VStack>

          <Button
            bg="#E91E8C"
            color="white"
            borderRadius="xl"
            fontWeight={700}
            fontSize="sm"
            px={6}
            py={5}
            h="auto"
            w={{ base: "full", lg: "auto" }}
            transition="all 0.2s"
            _hover={{
              bg: "#d01478",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(233, 30, 140, 0.25)",
            }}
            onClick={() => onBook(pkg)}
          >
            <Flex align="center" gap={2}>
              <LuGlobe size={14} />
              Obtenir un Devis
            </Flex>
          </Button>
        </VStack>
      </Grid>
    </Box>
  )
}

/* ── Section Header Component ─────────────────────────────────────── */
function MonthSection({ month, year, children }) {
  return (
    <Box mb={8}>
      <Box
        bg="gray.100"
        borderRadius="lg"
        px={4}
        py={3}
        mb={4}
        borderLeft="4px solid"
        borderColor="pink.400"
      >
        <Text fontSize="sm" fontWeight={700} color="gray.700">
           <Icon as={Plane}/> {month} {year} au départ de Tunis
        </Text>
      </Box>
      <VStack align="stretch" gap={4}>
        {children}
      </VStack>
    </Box>
  )
}

const PackagesList = () => {
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [searchText, setSearchText] = useState("")

  // Get unique months
  const uniqueMonths = {}
  PACKAGES_DATA.forEach((pkg) => {
    const key = `${pkg.month} ${pkg.year}`
    if (!uniqueMonths[key]) {
      uniqueMonths[key] = true
    }
  })

  const monthsCollection = createListCollection({
  items: [
    { label: "Tous les mois", value: "all" },
    ...Object.keys(uniqueMonths).map((monthKey) => ({
      label: monthKey,
      value: monthKey,
    })),
  ],
})

  // Filter packages
  const filteredPackages = PACKAGES_DATA.filter((pkg) => {
    const monthKey = `${pkg.month} ${pkg.year}`
    const matchMonth = selectedMonth === "all" || monthKey === selectedMonth
    const matchSearch =
      searchText === "" ||
      pkg.title.toLowerCase().includes(searchText.toLowerCase()) ||
      pkg.destinations.some((d) =>
        d.name.toLowerCase().includes(searchText.toLowerCase())
      )
    return matchMonth && matchSearch
  })

  // Group by month
  const groupedPackages = {}
  filteredPackages.forEach((pkg) => {
    const key = `${pkg.month} ${pkg.year}`
    if (!groupedPackages[key]) {
      groupedPackages[key] = []
    }
    groupedPackages[key].push(pkg)
  })

  const handleBook = (pkg) => {
    console.log("Booking:", pkg)
    // TODO: Navigate to booking page or show modal
  }

  return (
    <Container maxW="1400px" py={8} px={{ base: 4, md: 8 }}>
      {/* Back Button */}
      <Flex
        as="button"
        type="button"
        align="center"
        gap={1.5}
        color="gray.400"
        fontSize="sm"
        fontWeight={500}
        mb={8}
        _hover={{ color: "blue.500" }}
        transition="color 0.15s"
        onClick={() => navigate(-1)}
      >
        <LuChevronLeft size={14} />
        Retour
      </Flex>

      {/* Header Section */}
      <Box mb={8}>
        <Text
          fontSize="xs"
          fontWeight={700}
          color="blue.500"
          textTransform="uppercase"
          letterSpacing="0.1em"
          mb={2}
        >
          Packages
        </Text>
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight={900}
          color="gray.900"
          letterSpacing="-0.02em"
          mb={2}
        >
          Voyages au départ de Tunis
        </Text>
        <Text fontSize="sm" color="gray.500">
          Découvrez nos meilleures offres et réservez votre prochain voyage
        </Text>
      </Box>

      {/* Filters Section */}
      <Flex
        gap={4}
        mb={8}
        flexWrap={{ base: "wrap", md: "nowrap" }}
        align="center"
      >
        {/* Search Input */}

        <Select.Root
  collection={monthsCollection}
  value={[selectedMonth]}
  onValueChange={(e) => setSelectedMonth(e.value[0])}
  size="sm"
  width="200px"
>
  <Select.HiddenSelect />

  <Select.Control>
    <Select.Trigger borderRadius="xl">
      <Select.ValueText placeholder="Tous les mois" />
    </Select.Trigger>

    <Select.IndicatorGroup>
      <Select.Indicator />
    </Select.IndicatorGroup>
  </Select.Control>

  <Portal>
    <Select.Positioner>
      <Select.Content>
        {monthsCollection.items.map((item) => (
          <Select.Item item={item} key={item.value}>
            {item.label}
            <Select.ItemIndicator />
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Positioner>
  </Portal>
</Select.Root>
      </Flex>

      {/* Packages List */}
      {Object.keys(groupedPackages).length === 0 ? (
        <Box
          bg="white"
          borderRadius="2xl"
          p={12}
          border="1px solid"
          borderColor="gray.100"
          textAlign="center"
        >
          <LuSearch size={32} color="gray.300" mx="auto" mb={4} />
          <Text color="gray.600" fontSize="sm" fontWeight={500}>
            Aucun package trouvé
          </Text>
          <Text color="gray.400" fontSize="xs" mt={1}>
            Essayez de modifier vos critères de recherche
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={0}>
          {Object.entries(groupedPackages).map(([monthKey, packages]) => {
            const [month, year] = monthKey.split(" ")
            return (
              <MonthSection key={monthKey} month={month} year={year}>
                {packages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} onBook={handleBook} />
                ))}
              </MonthSection>
            )
          })}
        </VStack>
      )}
    </Container>
  )
}

export default PackagesList