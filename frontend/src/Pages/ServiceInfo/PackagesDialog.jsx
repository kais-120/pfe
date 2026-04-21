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
  LuCreditCard,
  LuCalendarDays,
  LuArrowUpRight,
} from "react-icons/lu"
import { Plane } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AxiosToken } from "../../Api/Api"

const formatDate = (date) =>
  new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })

const isPackageExpired = (departureDate) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const depDate = new Date(departureDate)
  depDate.setHours(0, 0, 0, 0)
  return depDate < today
}

/* ── Payment Method Selector (Inline) - 2 Options Only ────────────────────────── */
function PaymentMethodSelector({ pkg, onConfirm, onCancel, isLoading }) {
  const [paymentMethod, setPaymentMethod] = useState("total")

  const totalPrice = pkg.price
  const installmentCount = parseInt(pkg.installment)
  const totalWithFee = totalPrice * 1.05
  const installmentAmount = Math.ceil(totalWithFee / installmentCount)

  return (
    <Box
      bg="white"
      borderRadius="xl"
      p={6}
      border="1px solid"
      borderColor="gray.200"
      boxShadow="0 4px 16px rgba(0,0,0,0.12)"
      mb={4}
    >
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <Text fontSize="md" fontWeight={700} color="gray.900">
          Options de paiement
        </Text>

        {/* Payment Options - Only 2 */}
        <VStack align="stretch" gap={3}>
          {/* Option 1: Paiement unique */}
          <Box
            p={4}
            borderRadius="lg"
            border="2px solid"
            borderColor={paymentMethod === "total" ? "#E91E8C" : "gray.200"}
            bg={paymentMethod === "total" ? "pink.50" : "transparent"}
            cursor="pointer"
            transition="all 0.2s"
            onClick={() => setPaymentMethod("total")}
            _hover={{ borderColor: "#E91E8C", bg: "pink.50" }}
          >
            <HStack justify="space-between" align="center" gap={4}>
              <VStack align="start" gap={1} flex={1}>
                <HStack gap={2}>
                  <Box
                    w="18px"
                    h="18px"
                    borderRadius="full"
                    border="2px solid"
                    borderColor={paymentMethod === "total" ? "#E91E8C" : "gray.300"}
                    display="flex"
                    align="center"
                    justify="center"
                    bg={paymentMethod === "total" ? "#E91E8C" : "transparent"}
                    flexShrink={0}
                  >
                    {paymentMethod === "total" && <LuCheck size={11} color="white" />}
                  </Box>
                  <Text fontWeight={700} color="gray.900" fontSize="sm">
                    Paiement unique
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600" ml={8}>
                  {totalPrice.toLocaleString()} TND 
                </Text>
              </VStack>
              <HStack gap={1} align="center" minW="fit-content">
                <Text fontSize="20px" fontWeight={700} color="gray.900">
                  {totalPrice.toLocaleString()}
                </Text>
                <Text fontSize="xs" fontWeight={600} color="gray.600">
                  TND
                </Text>
              </HStack>
            </HStack>
          </Box>

          {/* Option 2: Installment Payment */}
          <Box
            p={4}
            borderRadius="lg"
            border="2px solid"
            borderColor={paymentMethod === "installment" ? "#E91E8C" : "gray.200"}
            bg={paymentMethod === "installment" ? "pink.50" : "transparent"}
            cursor="pointer"
            transition="all 0.2s"
            onClick={() => setPaymentMethod("installment")}
            _hover={{ borderColor: "#E91E8C", bg: "pink.50" }}
          >
            <HStack justify="space-between" align="center" gap={4}>
              <VStack align="start" gap={1} flex={1}>
                <HStack gap={2}>
                  <Box
                    w="18px"
                    h="18px"
                    borderRadius="full"
                    border="2px solid"
                    borderColor={paymentMethod === "installment" ? "#E91E8C" : "gray.300"}
                    display="flex"
                    align="center"
                    justify="center"
                    bg={paymentMethod === "installment" ? "#E91E8C" : "transparent"}
                    flexShrink={0}
                  >
                    {paymentMethod === "installment" && <LuCheck size={11} color="white" />}
                  </Box>
                  <Text fontWeight={700} color="gray.900" fontSize="sm">
                    {installmentCount} fois
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600" ml={8}>
                  {installmentAmount.toLocaleString()} TND / mois
                </Text>
              </VStack>
              <HStack gap={1} align="center" minW="fit-content">
                <Text fontSize="20px" fontWeight={700} color="gray.900">
                  {totalPrice.toLocaleString()}
                </Text>
                <Text fontSize="xs" fontWeight={600} color="gray.600">
                  TND
                </Text>
              </HStack>
            </HStack>
          </Box>
        </VStack>

        {/* CTA Button - Single Continue Button */}
        <Grid templateColumns={"1fr 1fr"} gap={6}>
        <Button
         w="full"
        bg="gray.100"
        color="gray.700"
        onClick={onCancel}
        borderRadius="lg"
        fontWeight={700}
        py={6}
        fontSize="md"
        _hover={{ bg: "gray.200" }}
        >
          Annuler
        </Button>
        <Button
          w="full"
          bg="#E91E8C"
          color="white"
          onClick={() => onConfirm(paymentMethod)}
          borderRadius="lg"
          fontWeight={700}
          py={6}
          fontSize="md"
          isLoading={isLoading}
          _hover={{ bg: "#d01478" }}
        >
          Continuer
        </Button>
        </Grid>
      </VStack>
    </Box>
  )
}

function PackageCard({ pkg, onBook,type }) {
  const expired = isPackageExpired(pkg.departureDate)
  const [showPaymentSelector, setShowPaymentSelector] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePaymentConfirm = async (paymentMethod) => {
    setIsProcessing(true)
    try {
      const url =
      type === "circuit"
        ? `/booking/circuit/${pkg.circuit_id}`
        : `/booking/offer/${pkg.offer_id}`

      const res = await AxiosToken.post(url , {
        package_id: pkg.id,
        total_price: pkg.price,
        payment_method: paymentMethod,
      })
      window.location = res.data.url
    } catch (error) {
      console.error("Payment error:", error)
      setIsProcessing(false)
    }
  }

  if (showPaymentSelector && !expired) {
    return (
      <PaymentMethodSelector
        pkg={pkg}
        onConfirm={handlePaymentConfirm}
        onCancel={() => setShowPaymentSelector(false)}
        isLoading={isProcessing}
      />
    )
  }

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      p={6}
      border="1px solid"
      borderColor={expired ? "gray.200" : "gray.100"}
      boxShadow={expired ? "none" : "0 1px 8px rgba(0,0,0,0.05)"}
      mb={4}
      opacity={expired ? 0.5 : 1}
      transition="all 0.2s"
      _hover={
        !expired
          ? {
              borderColor: "gray.200",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }
          : {}
      }
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
          <Icon as={Plane} />
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
              <Text
                fontSize="xs"
                fontWeight={700}
                color={expired ? "gray.400" : "gray.600"}
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Départ
              </Text>
              <Text fontSize="sm" fontWeight={700} color={expired ? "gray.500" : "gray.900"}>
                {formatDate(pkg.departureDate)}
              </Text>
              <Text fontSize="xs" color={expired ? "gray.400" : "gray.500"}>
                {pkg.departureTime}
              </Text>
              <Text fontSize="xs" color={expired ? "gray.400" : "gray.600"} fontWeight={600}>
                {pkg.departureAirport}
              </Text>
            </VStack>

            {/* Arrow & Duration */}
            <VStack
              align="center"
              justify="center"
              gap={1}
              display={{ base: "none", sm: "flex" }}
            >
              <LuArrowRight size={18} color={expired ? "#CBD5E0" : "#CBD5E0"} />
              <Text fontSize="xs" fontWeight={600} color={expired ? "gray.400" : "gray.600"}>
                {pkg.duration}
              </Text>
            </VStack>

            {/* Return */}
            <VStack align="start" gap={1} minW="120px">
              <Text
                fontSize="xs"
                fontWeight={700}
                color={expired ? "gray.400" : "gray.600"}
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Retour
              </Text>
              <Text fontSize="sm" fontWeight={700} color={expired ? "gray.500" : "gray.900"}>
                {formatDate(pkg.returnDate)}
              </Text>
              <Text fontSize="xs" color={expired ? "gray.400" : "gray.500"}>
                {pkg.returnTime}
              </Text>
              <Text fontSize="xs" color={expired ? "gray.400" : "gray.600"} fontWeight={600}>
                {pkg.returnAirport}
              </Text>
            </VStack>

            {/* Destinations List */}
            <VStack align="start" gap={2}>
              {pkg.destination.map((dest, idx) => (
                <HStack key={idx} gap={2} fontSize="sm">
                  <LuMapPin
                    size={14}
                    color={expired ? "#D1D5DB" : "#A0AEC0"}
                    flexShrink={0}
                  />
                  <Text color={expired ? "gray.400" : "gray.700"} fontWeight={500}>
                    {dest.name}
                    <Text as="span" color={expired ? "gray.300" : "gold"} ml={1}>
                      {Array.from({ length: dest.rating }).map((_, i) => (
                        <Text as="span" key={i} color={expired ? "gray.300" : "gold"}>
                          ★
                        </Text>
                      ))}
                    </Text>
                  </Text>
                  <Text color={expired ? "gray.400" : "gray.500"} fontSize="xs">
                    ({dest.nights} Nuits)
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Grid>
        </VStack>

        {/* Right: Price & CTA */}
        <VStack align={{ base: "stretch", lg: "flex-end" }} gap={3} justify="center">
          <VStack align={{ base: "start", lg: "end" }} gap={1}>
            <HStack gap={1}>
              <Text
                fontSize="32px"
                fontWeight={700}
                color={expired ? "gray.500" : "gray.900"}
                lineHeight={1}
              >
                {pkg.price.toLocaleString()}
              </Text>
              <Text fontSize="sm" fontWeight={600} color={expired ? "gray.400" : "gray.500"}>
                TND
              </Text>
            </HStack>
            <Flex align="center" gap={1} fontSize="xs">
              <Text color={expired ? "gray.400" : "gray.500"}>Ou</Text>
              <Text
                fontWeight={700}
                color={expired ? "gray.400" : "#E91E8C"}
              >
                {pkg.installment} TND × {Math.ceil(pkg.price / parseInt(pkg.installment))}
              </Text>
            </Flex>
          </VStack>
          {pkg.number_place > 0 ? (
            <Button
              bg={expired ? "gray.300" : "#E91E8C"}
              color={expired ? "gray.500" : "white"}
              borderRadius="xl"
              fontWeight={700}
              fontSize="sm"
              px={6}
              py={5}
              h="auto"
              w={{ base: "full", lg: "auto" }}
              cursor={expired ? "not-allowed" : "pointer"}
              transition="all 0.2s"
              isDisabled={expired}
              _hover={
                !expired
                  ? {
                      bg: "#d01478",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(233, 30, 140, 0.25)",
                    }
                  : {}
              }
              onClick={() => !expired && setShowPaymentSelector(true)}
            >
              <Flex align="center" gap={2}>
                <LuGlobe size={14} />
                {expired ? "Expiré" : "Obtenir un Devis"}
              </Flex>
            </Button>
          ) : (
            <Badge borderRadius={"md"} fontSize={"sm"}>
              Épuisé!
            </Badge>
          )}
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
          <Icon as={Plane} /> {month} {year} au départ de Tunis
        </Text>
      </Box>
      <VStack align="stretch" gap={4}>
        {children}
      </VStack>
    </Box>
  )
}

function PackagesDialog({ isOpen, onClose, packageData,type }) {
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => { if (!e.open) onClose() }} size="2xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxH="90vh" w="90%" mx="auto" overflowY="auto">
          <Dialog.Body pt={6}>
            <Container maxW="1200px">
              <VStack align="stretch" gap={0}>
                {Object.entries(groupedPackages).map(([monthKey, packages]) => {
                  const [month, year] = monthKey.split(" ")
                  return (
                    <MonthSection key={monthKey} month={month} year={year}>
                      {packages.map((pkg) => (
                        <PackageCard key={pkg.id} pkg={pkg} type={type} />
                      ))}
                    </MonthSection>
                  )
                })}
              </VStack>
            </Container>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

export default PackagesDialog