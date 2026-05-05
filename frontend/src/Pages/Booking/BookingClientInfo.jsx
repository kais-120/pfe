import { Badge, Box, Button, Flex, Grid, QrCode, Text, VStack, Spinner, IconButton, Dialog, Portal, CloseButton, Field, Textarea, RatingGroup, Tabs, Table } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { FaHotel, FaMapMarkerAlt, FaMoon, FaBed, FaCalendarAlt, FaEye, FaPlane, FaCar, FaRoute } from "react-icons/fa"
import { AxiosToken } from "../../Api/Api"
import { LuChevronLeft, LuScanLine, LuShieldAlert, LuClock, LuUsers, LuMapPin, LuRepeat2, LuCheck } from "react-icons/lu"
import { Link } from "react-router-dom"
import { Bus, MessageSquareCode, PlaneTakeoff, QrCode as QrCodeIcon, Send, CreditCard, LucideAlertCircle } from "lucide-react"
import { Helmet } from "react-helmet"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toaster } from "../../components/ui/toaster"

const validationSchema = Yup.object({
  review: Yup.string()
    .required("Le commentaire est obligatoire")
    .min(5, "Minimum 5 caractères")
    .max(500, "Maximum 500 caractères"),

  rate: Yup.number()
    .required("La note est obligatoire")
    .min(1, "Minimum 1 étoile")
    .max(5, "Maximum 5 étoiles"),
})

const STATUS_CONFIG = {
  "confirmée": { label: "Confirmée", color: "green" },
  "confirmé": { label: "Confirmé", color: "green" },
  "en attente": { label: "En attente", color: "yellow" },
  "annulée": { label: "Annulée", color: "red" },
  "annulé": { label: "Annulé", color: "red" },
  "terminée": { label: "Terminée", color: "gray" },
  "programmé": { label: "Programmé", color: "blue" },
  "payé": { label: "Payé", color: "green" },
}

const BOOKING_TYPES = {
  hotel: { icon: FaHotel, label: "Hôtel", color: "#3182CE" },
  "compagnies aériennes": { icon: FaPlane, label: "Vol", color: "#DD6B20" },
  "location de voitures": { icon: FaCar, label: "Voiture", color: "#38A169" },
  "voyages circuits": { icon: Bus, label: "Circuit", color: "#C05621" },
  "agence de voyage": { icon: FaRoute, label: "Offre Voyage", color: "#9F7AEA" },
}

const BookingClientInfo = () => {
  const [filter, setFilter] = useState("all")
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await AxiosToken.get("/booking/get/client")
        setBookings(data.booking || [])
        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const cancelDisabled = (booking) => {
  const now = new Date();
  const limit = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const dates = [];

  if (booking.carDetails?.[0]?.pickup_date)
    dates.push(new Date(booking.carDetails[0].pickup_date));

  if (booking.circuitBooking?.[0]?.departureDate)
    dates.push(new Date(booking.circuitBooking[0].departureDate));

  if (booking.flightBooking?.[0]?.departure)
    dates.push(new Date(booking.flightBooking[0].departure));

  if (booking.bookingHotelDetails?.[0]?.check_in_date)
    dates.push(new Date(booking.bookingHotelDetails[0].check_in_date));

  if (booking.offerBooking?.[0]?.departureDate)
    dates.push(new Date(booking.offerBooking[0].departureDate));

  if (dates.length === 0) return true; 

  const nearestDate = new Date(
    Math.min(...dates.map(d => d.getTime()))
  );

  return nearestDate < limit;
};
  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status.toLowerCase() === filter)

  if (loading) return <Flex justify="center" py={20}><Spinner size="xl" /></Flex>

  return (
    <>
    <Helmet title="Mes réservation"></Helmet>
    <Box maxW="1000px" mx="auto" px={4} py={8}>
      <Flex as={Link} to="/" align="center" gap={1.5}
        color="gray.400" fontSize="sm" mb={8}
        _hover={{ color: "blue.500" }} transition="color 0.15s"
        display="inline-flex">
        <LuChevronLeft size={14} />
        Retour à la page d'accueil
      </Flex>

      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight={800} color="gray.800">Mes Réservations</Text>
          <Text fontSize="sm" color="gray.500" mt={0.5}>
            {bookings.length} réservation{bookings.length > 1 ? "s" : ""}
          </Text>
        </Box>
        <Badge
          colorScheme="blue"
          borderRadius="full"
          px={3} py={1}
          fontSize="sm"
          fontWeight={700}
        >
          {bookings.filter(b => b.status.toLowerCase() === "confirmée" || b.status.toLowerCase() === "confirmé").length} confirmée{bookings.filter(b => b.status.toLowerCase() === "confirmée" || b.status.toLowerCase() === "confirmé").length > 1 ? "s" : ""}
        </Badge>
      </Flex>

      {/* Filter Tabs */}
      <Flex gap={2} mb={6} flexWrap="wrap">
        {["all", "confirmée", "annulée", "terminée"].map(key => (
          <Button
            key={key}
            size="sm"
            borderRadius="full"
            fontWeight={600}
            px={4}
            variant={filter === key ? "solid" : "outline"}
            colorScheme={filter === key ? "blue" : "gray"}
            onClick={() => setFilter(key)}
          >
            {key === "all" ? "Toutes" : STATUS_CONFIG[key]?.label || key}
            <Badge ml={2} borderRadius="full" colorScheme={filter === key ? "whiteAlpha" : "gray"} fontSize="xs">
              {key === "all" ? bookings.length : bookings.filter(b => b.status.toLowerCase() === key).length}
            </Badge>
          </Button>
        ))}
      </Flex>

      {filtered.length === 0 ? (
        <Box textAlign="center" py={16} border="2px dashed" borderColor="gray.200" borderRadius="2xl" color="gray.400">
          <FaCalendarAlt size={32} style={{ margin: "0 auto 12px" }} />
          <Text fontWeight={600} fontSize="md">Aucune réservation trouvée</Text>
          <Text fontSize="sm" mt={1}>Essayez un autre filtre</Text>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          {filtered.map(booking => (
            <BookingCard key={booking.id} booking={booking} cancelDisabled={cancelDisabled(booking)} />
          ))}
        </VStack>
      )}
    </Box>
    </>
  )
}

function QrCodeModal({ value }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          size="sm" variant="ghost"
          color="white" borderRadius="lg"
          _hover={{ bg: "blackAlpha.700", }}
          bg={"black"}
          fontWeight={600}
        >
          QR Code
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="2xl" overflow="hidden">
            <Box bg="blue.50" px={6} py={5}
              borderBottom="1px solid" borderColor="blue.100">
              <Flex align="center" gap={3}>
                <Flex w="36px" h="36px" borderRadius="xl"
                  bg="blue.100" color="blue.500"
                  align="center" justify="center" flexShrink={0}>
                  <LuScanLine size={16} />
                </Flex>
                <Dialog.Title fontSize="md" fontWeight={700} color="gray.900">
                  Code QR
                </Dialog.Title>
              </Flex>
            </Box>

            <Dialog.Body px={6} py={5}>
              <Flex justifyContent="center">
                <QrCode.Root size="lg" value={value}>
                  <QrCode.Frame>
                    <QrCode.Pattern />
                  </QrCode.Frame>
                </QrCode.Root>
              </Flex>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

function AddReviewModal({ id,status }) {
  const [open,setOpen] = useState(false)
  const formik = useFormik({
    initialValues: {
      review: "",
      rate: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await AxiosToken.post(`/review/add/${id}`,values)
        formik.resetForm();
        setOpen(false)

      } catch {
        console.error("error")
      } 
    }
  })

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        <Button
        disabled={status !== "terminée"}
          variant="ghost"
          size="sm" colorScheme="blue"
          fontWeight={600}
          _hover={{ bg: "blue.700" }}
          bg={"blue.600"}
          color={"white"}
        >
          Ajouter avis
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="2xl" overflow="hidden">
            <form onSubmit={formik.handleSubmit}>
              <Box bg="blue.50" px={6} py={5}
                borderBottom="1px solid" borderColor="blue.100">
                <Flex align="center" gap={3}>
                  <Flex w="36px" h="36px" borderRadius="xl"
                    bg="blue.100" color="blue.500"
                    align="center" justify="center" flexShrink={0}>
                    <MessageSquareCode size={16} />
                  </Flex>
                  <Dialog.Title fontSize="md" fontWeight={700} color="gray.900">
                    Ajouter avis
                  </Dialog.Title>
                </Flex>
              </Box>

              <Dialog.Body px={6} py={5}>
                <VStack spacing={4} align="stretch">
                  <Field.Root invalid={!!formik.errors.review && formik.touched.review}>
                    <Field.Label>
                      <Text fontSize="xs" fontWeight={700} color="gray.600"
                        textTransform="uppercase" letterSpacing="wider">
                        Commentaire
                      </Text>
                    </Field.Label>
                    <Flex
                      w="full" align="start"
                      border="1.5px solid"
                      borderColor={formik.errors.review && formik.touched.review ? "red.200" : "gray.200"}
                      borderRadius="xl" bg="white" px={3} py={2}
                      transition="all 0.15s"
                      _focusWithin={{
                        borderColor: formik.errors.review && formik.touched.review ? "red.400" : "blue.400",
                        boxShadow: formik.errors.review && formik.touched.review
                          ? "0 0 0 3px rgba(245,101,101,0.12)"
                          : "0 0 0 3px rgba(49,130,206,0.12)",
                      }}
                    >
                      <Textarea
                        outline="none"
                        name="review"
                        value={formik.values.review}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        border="none" bg="transparent" px={0}
                        flex={1} w="full" minH="100px"
                        fontSize="sm" color="gray.800" resize="vertical"
                        placeholder="Partagez votre expérience..."
                        _focus={{ boxShadow: "none" }}
                        _placeholder={{ color: "gray.300" }}
                      />
                    </Flex>
                    {formik.touched.review && formik.errors.review && (
                      <Text fontSize="xs" color="red.500" mt={1}>{formik.errors.review}</Text>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!formik.errors.rate && formik.touched.rate}>
                    <Field.Label>
                      <Text fontSize="xs" fontWeight={700} color="gray.600" textTransform="uppercase">
                        Note
                      </Text>
                    </Field.Label>
                    <RatingGroup.Root
                      value={formik.values.rate}
                      name="rate"
                      onValueChange={(e) => formik.setFieldValue("rate", e.value)}
                      colorPalette="yellow" count={5} size="lg">
                      <RatingGroup.HiddenInput />
                      <RatingGroup.Control />
                    </RatingGroup.Root>
                    {formik.touched.rate && formik.errors.rate && (
                      <Text fontSize="xs" color="red.500" mt={1}>{formik.errors.rate}</Text>
                    )}
                  </Field.Root>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer
                px={6} py={4}
                borderTop="1px solid" borderColor="gray.100"
                gap={3}
              >
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" borderRadius="xl" size="sm">
                    Annuler
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  type="submit"
                  colorScheme="blue" borderRadius="xl"
                  size="sm" fontWeight={700}
                >
                  <Flex align="center" gap={1.5}>
                    <Send size={13} />
                    Envoyer avis
                  </Flex>
                </Button>
              </Dialog.Footer>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} />
              </Dialog.CloseTrigger>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

function BookingCard({ booking,cancelDisabled }) {
  const { id, status, type, total_price, payment_method, payment } = booking
  console.log(booking)
  const statusLower = status.toLowerCase()
  const { label, color } = STATUS_CONFIG[statusLower] ?? STATUS_CONFIG["confirmée"]
  const bookingTypeInfo = BOOKING_TYPES[type] || { icon: FaHotel, label: type, color: "#666" }
  const IconComponent = bookingTypeInfo.icon
  const fmt = d => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
  const today = new Date()

  return (
    <>
      <Helmet title="Réservation"></Helmet>
      <Box border="1px solid" borderColor="gray.100" borderRadius="2xl" bg="white" boxShadow="0 2px 12px rgba(0,0,0,0.06)" overflow="hidden" transition="box-shadow 0.2s, border-color 0.2s" _hover={{ boxShadow: "0 6px 24px rgba(0,0,0,0.1)", borderColor: "blue.100" }}>
        <Flex justify="space-between" align="center" px={5} py={3} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
          <Flex align="center" gap={2}>
            <Box color={bookingTypeInfo.color}>
              <IconComponent size={14} />
            </Box>
            <Text fontSize="xs" color="gray.400" fontWeight={600}>Res-{id}</Text>
          </Flex>
          <Badge colorScheme={color} borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight={700}>{label}</Badge>
        </Flex>

        <Box p={5}>
          {/* Hotel Booking */}
          {type === "hotel" && booking.bookingHotelDetails?.length > 0 && (
            <HotelBookingContent booking={booking} fmt={fmt} today={today} disabled={cancelDisabled} />
          )}

          {/* Flight Booking */}
          {type === "compagnies aériennes" && booking.flightBooking?.length > 0 && (
            <FlightBookingContent booking={booking} fmt={fmt} />
          )}

          {/* Car Rental Booking */}
          {type === "location de voitures" && booking.carDetails?.length > 0 && (
            <CarBookingContent booking={booking} fmt={fmt} />
          )}

          {/* Travel Circuit Booking */}
          {type === "voyages circuits" && booking.circuitBooking?.length > 0 && (
            <CircuitBookingContent booking={booking} fmt={fmt} payment_method={payment_method} paymentInstallments={payment?.[0]?.paymentInstallments} />
          )}

          {/* Travel Offer Booking */}
          {type === "agence de voyage" && booking.offerBooking?.length > 0 && (
            <OfferBookingContent booking={booking} fmt={fmt} payment_method={payment_method} paymentInstallments={payment?.[0]?.paymentInstallments} />
          )}

          {/* Payment Method Section for Offer/Circuit */}
          {(type === "agence de voyage" || type === "voyages circuits") && (
            <PaymentMethodSection payment_method={payment_method} total_price={total_price} paymentInstallments={payment?.[0]?.paymentInstallments} />
          )}

          {/* Footer with Price and Actions */}
          {type !== "hotel" &&
          <Flex justify="flex-end" align="center" mt={5} pt={5} borderTop="1px solid" borderColor="gray.100" gap={3}>
            <Box textAlign="right" flex={1}>
              <Text fontSize="xs" color="gray.400" fontWeight={600}>Total</Text>
              <Text fontSize="2xl" fontWeight={900} color="blue.600">{total_price}</Text>
              <Text fontSize="xs" color="gray.400">TND</Text>
            </Box>
            <VStack spacing={2} align="stretch" minW="140px">
              <Button size="sm" disabled={cancelDisabled} colorScheme="blue" bg={"red.500"} _hover={{bg:"red.600"}} borderRadius="lg" fontWeight={600}>Annuler</Button>
              <QrCodeModal value={id} />
              {type === "hotel" &&
                <AddReviewModal id={id} />
              }
            </VStack>
          </Flex>
          }
        </Box>
      </Box>
    </>
  )
}

function PaymentMethodSection({ payment_method, total_price, paymentInstallments }) {
  const isInstallment = payment_method === "installment"
  console.log(paymentInstallments)
  const handlePayment = async (id,amount) => {
    try{
      const res = await AxiosToken.put(`/payment/${id}`,{amount})
      window.location = res.data.url;
    }catch{
        toaster.create({ description: "erreur en paiment.", type: "error", closable: true })
    }
  }
  const isTodayPaymentDay = (dateString) => {
  const dueDate = new Date(dateString);
  const today = new Date();

  dueDate.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  return dueDate < today;
};

  if (!isInstallment) {
    return (
      <Box mt={5} pt={5} borderTop="1px solid" borderColor="gray.100">
        <Flex align="center" gap={2} mb={3}>
          <Flex w="32px" h="32px" borderRadius="lg" bg="green.100" color="green.600" align="center" justify="center">
            <LuCheck size={16} />
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight={700} color="gray.800">Paiement Total</Text>
            <Text fontSize="xs" color="gray.500">Montant entièrement payé</Text>
          </Box>
        </Flex>
        <Box bg="green.50" borderRadius="xl" p={4} borderLeft="4px solid" borderColor="green.400">
          <Text fontSize="sm" color="gray.600">
            Montant: <Text as="span" fontWeight={800} color="green.600">{total_price} TND</Text>
          </Text>
        </Box>
      </Box>
    )
  }

  // Installment plan display
  const totalPaid = paymentInstallments
    ?.filter(inst => inst.status.toLowerCase() === "payé")
    .reduce((sum, inst) => sum + inst.amount, 0) || 0

  const totalRemaining = paymentInstallments
    ?.filter(inst => inst.status.toLowerCase() !== "payé")
    .reduce((sum, inst) => sum + inst.amount, 0) || 0

  const paidPercentage = (totalPaid / total_price) * 100

  return (
    <Box mt={5} pt={5} borderTop="1px solid" borderColor="gray.100">
      <Flex align="center" gap={2} mb={4}>
        <Flex w="32px" h="32px" borderRadius="lg" bg="blue.100" color="blue.600" align="center" justify="center">
          <CreditCard size={16} />
        </Flex>
        <Box flex={1}>
          <Text fontSize="sm" fontWeight={700} color="gray.800">Plan de Paiement</Text>
          <Text fontSize="xs" color="gray.500">{paymentInstallments?.length || 0} versements</Text>
        </Box>
      </Flex>

      {/* Progress Bar */}
      <Box mb={4}>
        <Flex justify="space-between" mb={2}>
          <Text fontSize="xs" color="gray.600" fontWeight={600}>Progression</Text>
          <Text fontSize="xs" color="gray.600" fontWeight={700}>{Math.round(paidPercentage)}%</Text>
        </Flex>
        <Box w="full" h="8px" bg="gray.200" borderRadius="full" overflow="hidden">
          <Box h="full" bg="green.500" w={`${paidPercentage}%`} transition="width 0.3s ease" />
        </Box>
        <Flex justify="space-between" mt={2} gap={2}>
          <Box>
            <Text fontSize="xs" color="gray.400">Payé</Text>
            <Text fontSize="sm" fontWeight={800} color="green.600">{totalPaid} TND</Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.400">Restant</Text>
            <Text fontSize="sm" fontWeight={800} color="orange.600">{totalRemaining} TND</Text>
          </Box>
        </Flex>
      </Box>

      {/* Installments Table */}
      {paymentInstallments && paymentInstallments.length > 0 && (
        <Box overflowX="auto">
          <Table.Root size="sm" variant="simple">
            <Table.Header bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
              <Table.Row>
                <Table.ColumnHeader fontSize="xs" fontWeight={700} color="gray.600" py={2.5}>N°</Table.ColumnHeader>
                <Table.ColumnHeader fontSize="xs" fontWeight={700} color="gray.600" py={2.5}>Montant</Table.ColumnHeader>
                <Table.ColumnHeader fontSize="xs" fontWeight={700} color="gray.600" py={2.5}>Date d'échéance</Table.ColumnHeader>
                <Table.ColumnHeader fontSize="xs" fontWeight={700} color="gray.600" py={2.5}>Statut</Table.ColumnHeader>
                <Table.ColumnHeader fontSize="xs" fontWeight={700} color="gray.600" py={2.5}>Action</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {paymentInstallments.map((inst) => {
                const isPaid = inst.status.toLowerCase() === "payé"
                const isOverdue = new Date(inst.due_date) < new Date() && !isPaid
                const statusLabel = isPaid ? "Payé" : isOverdue ? "En retard" : "En attente"
                const isPaymentDay = isTodayPaymentDay(inst.due_date)
                const isPaide = inst.status === "payé"
                const canPay = isPaymentDay && !isPaid

                return (
                  <Table.Row key={inst.id} borderColor="gray.100" _hover={{ bg: "gray.50" }}>
                    <Table.Cell fontSize="sm" fontWeight={600} color="gray.700" py={3}>
                      {inst.installment_number}
                    </Table.Cell>
                    <Table.Cell fontSize="sm" fontWeight={700} color="gray.800" py={3}>
                      {inst.amount} TND
                    </Table.Cell>
                    <Table.Cell fontSize="sm" color="gray.600" py={3}>
                      {new Date(inst.due_date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </Table.Cell>
                    <Table.Cell py={3}>
                      <Flex align="center" gap={1.5}>
                        {isPaid ? (
                          <Flex align="center" gap={1}>
                            <Flex w="16px" h="16px" borderRadius="full" bg="green.100" align="center" justify="center">
                              <LuCheck size={12} color="green" />
                            </Flex>
                            <Badge colorScheme="green" fontSize="xs" borderRadius="md">{statusLabel}</Badge>
                          </Flex>
                        ) : isOverdue ? (
                          <Flex align="center" gap={1}>
                            <Flex w="16px" h="16px" borderRadius="full" bg="red.100" align="center" justify="center">
                              <LucideAlertCircle size={12} color="red" />
                            </Flex>
                            <Badge colorScheme="red" fontSize="xs" borderRadius="md">{statusLabel}</Badge>
                          </Flex>
                        ) : (
                          <Flex align="center" gap={1}>
                            <Flex w="16px" h="16px" borderRadius="full" bg="yellow.100" align="center" justify="center">
                              <LuClock size={12} color="orange" />
                            </Flex>
                            <Badge colorScheme="yellow" fontSize="xs" borderRadius="md">{statusLabel}</Badge>
                          </Flex>
                        )}
                      </Flex>
                    </Table.Cell>
                     <Table.Cell px={4} py={3}>
                    <button
                      onClick={() => handlePayment(inst.id,inst.amount)}
                      disabled={!canPay}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "6px",
                        border: "none",
                        cursor: canPay ? "pointer" : "not-allowed",
                        backgroundColor: canPay ? "#3182CE" : "#E2E8F0",
                        color: canPay ? "white" : "#A0AEC0",
                        transition: "all 0.2s",
                        opacity: canPay ? 1 : 0.6
                      }}
                      onMouseEnter={(e) => {
                        if (canPay) e.target.style.backgroundColor = "#2C5AA0"
                      }}
                      onMouseLeave={(e) => {
                        if (canPay) e.target.style.backgroundColor = "#3182CE"
                      }}
                    >
                      {isPaide ? "Payé" : canPay ? "Payer" : "Non disponible"}
                    </button>
                  </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Box>
  )
}

function HotelBookingContent({ booking, fmt, today,disabled }) {
  const detail = booking.bookingHotelDetails[0]
  const hotelName = detail?.RoomHotelBooking?.hotelRoom?.name ?? "Hôtel inconnu"
  const address = detail?.RoomHotelBooking?.hotelRoom?.address
  const checkIn = detail?.check_in_date
  const checkOut = detail?.check_out_date
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))

  return (
    <Flex justify="space-between" align="flex-start" gap={4} flexWrap="wrap">
      <Box flex={1} minW="250px">
        <Flex align="center" gap={2} mb={1}>
          <Box color="blue.500"><FaHotel size={14} /></Box>
          <Text fontWeight={800} fontSize="lg" color="gray.800">{hotelName}</Text>
        </Flex>
        <Flex align="center" gap={1} mb={4}>
          <Box color="gray.400"><FaMapMarkerAlt size={11} /></Box>
          <Text fontSize="xs" color="gray.500">{address}</Text>
        </Flex>

        <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
          <Box bg="blue.50" borderRadius="xl" p={3}>
            <Text fontSize="xs" color="blue.400" fontWeight={600} mb={0.5}>Arrivée</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">{fmt(checkIn)}</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">{detail?.check_in_time}</Text>
          </Box>
          <Box bg="blue.50" borderRadius="xl" p={3}>
            <Text fontSize="xs" color="blue.400" fontWeight={600} mb={0.5}>Départ</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">{fmt(checkOut)}</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">{detail?.check_out_time}</Text>

          </Box>
        </Grid>

        <Flex align="center" gap={2} mb={3}>
          <Box color="blue.400"><FaMoon size={12} /></Box>
          <Text fontSize="sm" color="gray.600"><Text as="span" fontWeight={700} color="gray.800">{nights}</Text> nuit{nights > 1 ? "s" : ""}</Text>
        </Flex>

        <VStack align="stretch" spacing={2}>
          {booking.bookingHotelDetails.map((room, i) => (
            <Flex key={i} align="center" gap={3} bg="gray.50" borderRadius="lg" px={3} py={2}>
              <Box color="blue.400"><FaBed size={12} /></Box>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight={600} color="gray.700">{room.RoomHotelBooking.name}</Text>
                <Text fontSize="xs" color="gray.400">{room.number_of_guests_adult} adulte{room.number_of_guests_adult > 1 ? "s" : ""}{room.number_of_guests_children > 0 && ` · ${room.number_of_guests_children} enfant${room.number_of_guests_children > 1 ? "s" : ""}`}</Text>
              </Box>
              <Text fontSize="xs" fontWeight={700} color="blue.500">{room.RoomHotelBooking.price_by_day} TND/nuit</Text>
            </Flex>
          ))}
        </VStack>
        <Flex justify="flex-end" align="center" mt={5} pt={5} borderTop="1px solid" borderColor="gray.100" gap={3}>
            <Box textAlign="right" flex={1}>
              <Text fontSize="xs" color="gray.400" fontWeight={600}>Total</Text>
              <Text fontSize="2xl" fontWeight={900} color="blue.600">{booking.total_price}</Text>
              <Text fontSize="xs" color="gray.400">TND</Text>
            </Box>
            <VStack spacing={2} align="stretch" minW="140px">
              <Button disabled={disabled}  size="sm" colorScheme="blue" bg={"red.500"} _hover={{bg:"red.600"}} borderRadius="lg" fontWeight={600}>Annuler</Button>
              <QrCodeModal value={booking.id}  />
                <AddReviewModal id={booking.bookingHotelDetails[0].RoomHotelBooking.id} />
              
            </VStack>
          </Flex>
      </Box>
    </Flex>
  )
}

function FlightBookingContent({ booking, fmt }) {
  const flight = booking.flightBooking[0]
  const details = flight?.detailsFlight

  return (
    <Flex justify="space-between" align="flex-start" gap={4} flexWrap="wrap">
      <Box flex={1} minW="250px">
        <Flex align="center" gap={2} mb={3}>
          <Box color="orange.500"><FaPlane size={14} /></Box>
          <Text fontWeight={800} fontSize="lg" color="gray.800">{details?.compagnieFlight?.name}</Text>
        </Flex>
        <Flex align="center" gap={2} mb={3}>
          <Box color="gray.400"><FaMapMarkerAlt size={11} /></Box>
          <Text fontSize="xs" color="gray.500">{details?.compagnieFlight?.hub}</Text>
        </Flex>
        <Flex align="center" gap={2} mb={3}>
          <Box color="orange.500"><PlaneTakeoff size={14} /></Box>
          <Text fontWeight={500} fontSize="md" color="gray.800">{details?.flight_number}</Text>
        </Flex>

        <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
          <Box bg="orange.50" borderRadius="xl" p={3}>
            <Text fontSize="xs" color="orange.400" fontWeight={600} mb={0.5}>Départ</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">{fmt(details?.departure)}</Text>
            <Text fontSize="xs" color="gray.500" mt={1}>{details?.departure_airport}</Text>
          </Box>
          <Box bg="orange.50" borderRadius="xl" p={3}>
            <Text fontSize="xs" color="orange.400" fontWeight={600} mb={0.5}>Arrivée</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">{fmt(details?.arrival)}</Text>
            <Text fontSize="xs" color="gray.500" mt={1}>{details?.arrival_airport}</Text>
          </Box>
        </Grid>

        <VStack align="stretch" spacing={2}>
          <Flex align="center" gap={2}>
            <LuClock size={14} color="gray" />
            <Text fontSize="sm" color="gray.600">Durée: <Text as="span" fontWeight={700}>{details?.duration}h</Text></Text>
          </Flex>
          <Flex align="center" gap={2}>
            <Box color="orange.400"><FaPlane size={12} /></Box>
            <Text fontSize="sm" color="gray.600">Classe: <Text as="span" fontWeight={700} textTransform="capitalize">{flight?.seat_class}</Text></Text>
          </Flex>
          <Flex align="center" gap={2}>
            <LuUsers size={14} color="gray" />
            <Text fontSize="sm" color="gray.600">Passagers: <Text as="span" fontWeight={700}>{flight?.passenger_count}</Text></Text>
          </Flex>
          <Flex align="center" gap={2}>
            <LuRepeat2 size={14} color="gray" />
            <Text fontSize="sm" color="gray.600">Type: <Text as="span" fontWeight={700}>{details?.type_flight}</Text></Text>
          </Flex>
          <Flex align="center" gap={2}>
            <Box color="orange.400"><FaBed size={12} /></Box>
            <Text fontSize="sm" color="gray.600">Bagages: <Text as="span" fontWeight={700}>{details?.baggage_kg}kg</Text></Text>
          </Flex>
        </VStack>
      </Box>
    </Flex>
  )
}

function CarBookingContent({ booking, fmt }) {
  const car = booking.carDetails[0]

  return (
    <Flex justify="space-between" align="flex-start" gap={4} flexWrap="wrap">
      <Box flex={1} minW="250px">
        <Flex align="center" gap={2} mb={3}>
          <Box color="green.500"><FaCar size={14} /></Box>
          <Text fontWeight={800} fontSize="lg" color="gray.800">Location de voiture</Text>
        </Flex>

        <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
          <Box bg="green.50" borderRadius="xl" p={3}>
            <Text fontSize="xs" color="green.400" fontWeight={600} mb={0.5}>Prise</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">{fmt(car?.pickup_date)}</Text>
          </Box>
          <Box bg="green.50" borderRadius="xl" p={3}>
            <Text fontSize="xs" color="green.400" fontWeight={600} mb={0.5}>Restitution</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">{fmt(car?.return_date)}</Text>
          </Box>
        </Grid>

        {car?.vehicleBooking && (
          <VStack align="stretch" spacing={2} bg="gray.50" borderRadius="lg" px={3} py={2}>
            <Text fontSize="sm" fontWeight={600} color="gray.700">{car.vehicleBooking.name}</Text>
            <Text fontSize="xs" color="gray.500">{car.vehicleBooking.brand} - {car.vehicleBooking.model}</Text>
          </VStack>
        )}
      </Box>
    </Flex>
  )
}

function CircuitBookingContent({ booking, fmt }) {
  const circuit = booking.circuitBooking[0]
  const details = circuit?.circuitDetails
  console.log(booking)

  return (
    <Flex justify="space-between" align="flex-start" gap={4} flexWrap="wrap">
      <Box flex={1} minW="250px">
        <Flex align="center" gap={2} mb={3}>
          <Box color="orange.600"><Bus size={14} /></Box>
          <Text fontWeight={800} fontSize="lg" color="gray.800">{details?.title}</Text>
        </Flex>

        <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
          <Box bg="orange.50" borderRadius="xl" p={3}>
            <Text fontSize="xs" color="orange.400" fontWeight={600} mb={0.5}>Début</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">{fmt(details?.packagesCircuit[0].departureDate)}</Text>
          </Box>
          <Box bg="orange.50" borderRadius="xl" p={3}>
            <Text fontSize="xs" color="orange.400" fontWeight={600} mb={0.5}>Fin</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">{fmt(details?.packagesCircuit[0].returnDate)}</Text>
          </Box>
        </Grid>

        <VStack align="stretch" spacing={2}>
          <Flex align="center" gap={2}>
            <LuMapPin size={14} color="gray" />
            <Text fontSize="sm" color="gray.600">{details?.location}</Text>
          </Flex>
          <Flex align="center" gap={2}>
            <LuClock size={14} color="gray" />
            <Text fontSize="sm" color="gray.600"><Text as="span" fontWeight={700}>{details?.duration_days}</Text> jour{details?.duration_days > 1 ? "s" : ""}</Text>
          </Flex>
          <Flex align="center" gap={2}>
            <LuUsers size={14} color="gray" />
            <Text fontSize="sm" color="gray.600"><Text as="span" fontWeight={700}>{circuit?.number_of_participants}</Text> participant{circuit?.number_of_participants > 1 ? "s" : ""}</Text>
          </Flex>
        </VStack>
      </Box>
    </Flex>
  )
}

function OfferBookingContent({ booking, fmt }) {
  const offer = booking.offerBooking[0]
  const details = offer?.bookingDetailsOffer
  const pkg = offer?.bookingDetailsOffer?.packages?.[0]
  const destination = pkg?.destination?.[0]

  return (
    <Flex justify="space-between" align="flex-start" gap={4} flexWrap="wrap">
      <Box flex={1} minW="250px">
        <Flex align="center" gap={2} mb={3}>
          <Box color="purple.500"><FaRoute size={14} /></Box>
          <Text fontWeight={800} fontSize="lg" color="gray.800">{details?.title}</Text>
        </Flex>

        <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
          <Box bg="purple.50" borderRadius="xl" p={3}>
            <Text fontSize="xs" color="purple.400" fontWeight={600} mb={0.5}>Destination</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">{destination?.name || details?.destination}</Text>
          </Box>
          <Box bg="purple.50" borderRadius="xl" p={3}>
            <Text fontSize="xs" color="purple.400" fontWeight={600} mb={0.5}>Départ</Text>
            <Text fontSize="sm" fontWeight={700} color="gray.700">{fmt(pkg?.departureDate)}</Text>
          </Box>
        </Grid>

        <VStack align="stretch" spacing={2}>
          <Flex align="center" gap={2}>
            <Box color="purple.400"><FaRoute size={12} /></Box>
            <Text fontSize="sm" color="gray.600">Type: <Text as="span" fontWeight={700} textTransform="capitalize">{details?.type}</Text></Text>
          </Flex>
          <Flex align="center" gap={2}>
            <LuClock size={14} color="gray" />
            <Text fontSize="sm" color="gray.600">Durée: <Text as="span" fontWeight={700}>{details?.duration} jour{details?.duration > 1 ? "s" : ""}</Text></Text>
          </Flex>
          {destination?.nights && (
            <Flex align="center" gap={2}>
              <FaMoon size={12} color="gray" />
              <Text fontSize="sm" color="gray.600"><Text as="span" fontWeight={700}>{destination.nights}</Text> nuit{destination.nights > 1 ? "s" : ""}</Text>
            </Flex>
          )}
        </VStack>
      </Box>
    </Flex>
  )
}

export default BookingClientInfo