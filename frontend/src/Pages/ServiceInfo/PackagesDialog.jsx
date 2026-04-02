import {
  Dialog,
  Button,
  Box,
  Text,
  VStack,
  HStack,
  Grid,
  Flex,
  Badge,
  Textarea,
  Input,
  Field,
  Icon,
  createListCollection,
  Container,
  Select,
  Portal,
} from "@chakra-ui/react"
import {
  LuX,
  LuMapPin,
  LuCheck,
  LuArrowRight,
  LuChevronLeft,
  LuGlobe,
  LuSearch,
} from "react-icons/lu"
import { Plane } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const formatDate = (date) =>
  new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })


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
                {formatDate(pkg.departureDate)}
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
                {formatDate(pkg.returnDate)}
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
              {pkg.destination.map((dest, idx) => (
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
              {pkg.number_place > 0 ?
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
          :
          <Badge borderRadius={"md"} fontSize={"sm"}>Épuisé!</Badge>          
          }
        </VStack>
      </Grid>
    </Box>
  )
}

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


function PackagesDialog({ isOpen, onClose, packageData }) {
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [searchText, setSearchText] = useState("")

  // Get unique months
  const uniqueMonths = {}
  packageData.forEach((pkg) => {
    const key = `${pkg.month} ${pkg.year}`
    if (!uniqueMonths[key]) {
      uniqueMonths[key] = true
    }
  })

  const filteredPackages = packageData.filter((pkg) => {
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
  }
 

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => {if (!e.open) onClose()}} size="2xl">
      <Dialog.Backdrop />
        <Dialog.Positioner>
      <Dialog.Content maxH="90vh"
      w="90%"
      mx="auto"   
      overflowY="auto">

        <Dialog.Body pt={6}>
           <Container maxW="1200px">
              
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
              </Container>

        </Dialog.Body>

        {/* Footer */}
          
      </Dialog.Content>
        </Dialog.Positioner>
    </Dialog.Root>
  )
}

export default PackagesDialog