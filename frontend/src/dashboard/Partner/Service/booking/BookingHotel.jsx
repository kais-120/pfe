import { Box, Container, Heading, Table, Text, Badge, Flex, Grid, Skeleton, SkeletonText, VStack, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AxiosToken } from "../../../../Api/Api";
import {
    LuCalendarDays, LuUser, LuCreditCard, LuBed,
    LuUsers, LuBaby, LuHash, LuTrendingUp,
} from "react-icons/lu";
import { FaCheckCircle, FaCheckDouble, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";

/* ── Helpers ────────────────────────────────────────────────────── */
const formatDate = (date) =>
    new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })

const nightsBetween = (a, b) => {
    const diff = (new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)
    return diff > 0 ? diff : 0
}



/* ── Status badge ───────────────────────────────────────────────── */
function StatusBadge({ status }) {
    const map = {
        "confirmée": { color: "green", Icon: FaCheckCircle, label: "Confirmé" },
        "en attente": { color: "yellow", Icon: FaHourglassHalf, label: "En attente" },
        "annulée": { color: "red", Icon: FaTimesCircle, label: "Annulé" },
        "terminée": { color: "blue", Icon: FaCheckDouble, label: "Terminée" }
        };
    const s = map[status?.toLowerCase()] ?? map.pending
    const Icon = s.Icon
    return (
        <Flex align="center" gap={1.5}>
            <Icon size={11} color={`var(--chakra-colors-${s.color}-500)`} />
            <Badge colorScheme={s.color} borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight={600}>
                {s.label}
            </Badge>
        </Flex>
    )
}

/* ── Stat card ──────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color = "blue" }) {
    return (
        <Box
            bg="white" borderRadius="xl" p={4}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)"
        >
            <Flex align="center" gap={3}>
                <Flex
                    w="40px" h="40px" borderRadius="lg"
                    bg={`${color}.50`} color={`${color}.500`}
                    align="center" justify="center" flexShrink={0}
                >
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

/* ── Skeleton booking card ──────────────────────────────────────── */
function BookingCardSkeleton() {
    return (
        <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 2px 12px rgba(0,0,0,0.05)" overflow="hidden">
            <Box px={6} py={4} borderBottom="1px solid" borderColor="gray.100">
                <SkeletonText noOfLines={1} skeletonHeight={4} w="40%" mb={2} />
                <SkeletonText noOfLines={1} skeletonHeight={3} w="25%" />
            </Box>
            <Box p={6}>
                <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={4} mb={5}>
                    {[1, 2, 3].map(i => <Skeleton key={i} h="60px" borderRadius="xl" />)}
                </Grid>
                <Skeleton h="120px" borderRadius="xl" />
            </Box>
        </Box>
    )
}

/* ── Single booking card ────────────────────────────────────────── */
function BookingCard({ booking, index }) {
    const detail = booking.bookingHotelDetails?.[0]
    const checkIn = detail?.check_in_date
    const checkOut = detail?.check_out_date
    const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : null

    const totalAdults = booking.bookingHotelDetails?.reduce((s, d) => s + (d.number_of_guests_adult ?? 0), 0)
    const totalChildren = booking.bookingHotelDetails?.reduce((s, d) => s + (d.number_of_guests_children ?? 0), 0)

    return (
        <Box
            bg="white" borderRadius="2xl"
            border="1px solid" borderColor="gray.100"
            boxShadow="0 2px 12px rgba(0,0,0,0.05)"
            overflow="hidden"
            transition="box-shadow 0.2s, border-color 0.2s"
            _hover={{ boxShadow: "0 6px 28px rgba(0,0,0,0.09)", borderColor: "blue.100" }}
        >
            {/* Card header */}
            <Flex
                px={6} py={4}
                bg="gray.50"
                borderBottom="1px solid" borderColor="gray.100"
                align="center" justify="space-between"
                flexWrap="wrap" gap={3}
            >
                <Flex align="center" gap={3}>
                    <Flex
                        w="36px" h="36px" borderRadius="lg"
                        bg="blue.100" color="blue.700"
                        align="center" justify="center"
                        fontSize="xs" fontWeight={800} flexShrink={0}
                    >
                        #{index + 1}
                    </Flex>
                    <Box>
                        <Flex align="center" gap={2}>
                            <LuUser size={12} color="gray" />
                            <Text fontSize="sm" fontWeight={700} color="gray.800">
                                {booking.userBooking?.name ?? "Client inconnu"}
                            </Text>
                        </Flex>
                        <Text fontSize="xs" color="gray.400" mt={0.5}>
                            Réservation #{booking.id?.slice?.(0, 8) ?? booking.id}
                        </Text>
                    </Box>
                </Flex>

                <Flex align="center" gap={2}>
                    {booking.status && <StatusBadge status={booking.status} />}
                </Flex>
            </Flex>

            <Box px={6} py={5}>
                {/* Info pills row */}
                <Grid templateColumns={{ base: "1fr 1fr", sm: "repeat(4, 1fr)" }} gap={3} mb={5}>

                    <Box bg="blue.50" borderRadius="xl" p={3}>
                        <Flex align="center" gap={1.5} mb={1}>
                            <LuCalendarDays size={11} color="#3182CE" />
                            <Text fontSize="9px" fontWeight={700} color="blue.500" textTransform="uppercase" letterSpacing="wider">
                                Arrivée
                            </Text>
                        </Flex>
                        <Text fontSize="sm" fontWeight={700} color="gray.800">
                            {checkIn ? formatDate(checkIn) : "—"}
                        </Text>
                    </Box>

                    <Box bg="blue.50" borderRadius="xl" p={3}>
                        <Flex align="center" gap={1.5} mb={1}>
                            <LuCalendarDays size={11} color="#3182CE" />
                            <Text fontSize="9px" fontWeight={700} color="blue.500" textTransform="uppercase" letterSpacing="wider">
                                Départ
                            </Text>
                        </Flex>
                        <Text fontSize="sm" fontWeight={700} color="gray.800">
                            {checkOut ? formatDate(checkOut) : "—"}
                        </Text>
                    </Box>

                    <Box bg="gray.50" borderRadius="xl" p={3}>
                        <Flex align="center" gap={1.5} mb={1}>
                            <LuUsers size={11} color="gray" />
                            <Text fontSize="9px" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wider">
                                Voyageurs
                            </Text>
                        </Flex>
                        <Text fontSize="sm" fontWeight={700} color="gray.800">
                            {totalAdults} adulte{totalAdults > 1 ? "s" : ""}
                            {totalChildren > 0 && ` · ${totalChildren} enfant${totalChildren > 1 ? "s" : ""}`}
                        </Text>
                    </Box>

                    <Box bg="gray.50" borderRadius="xl" p={3}>
                        <Flex align="center" gap={1.5} mb={1}>
                            <LuBed size={11} color="gray" />
                            <Text fontSize="9px" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wider">
                                Durée
                            </Text>
                        </Flex>
                        <Text fontSize="sm" fontWeight={700} color="gray.800">
                            {nights ? `${nights} nuit${nights > 1 ? "s" : ""}` : "—"}
                        </Text>
                    </Box>

                </Grid>

                {/* Rooms table */}
                <Box
                    border="1px solid" borderColor="gray.100"
                    borderRadius="xl" overflow="hidden" mb={4}
                >
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row bg="gray.50">
                                <Table.ColumnHeader
                                    px={4} py={3} fontSize="xs" fontWeight={700}
                                    color="gray.500" textTransform="uppercase" letterSpacing="wider"
                                    w="40px"
                                >
                                    <LuHash size={10} />
                                </Table.ColumnHeader>
                                <Table.ColumnHeader
                                    px={4} py={3} fontSize="xs" fontWeight={700}
                                    color="gray.500" textTransform="uppercase" letterSpacing="wider"
                                >
                                    Chambre
                                </Table.ColumnHeader>
                                <Table.ColumnHeader
                                    px={4} py={3} fontSize="xs" fontWeight={700}
                                    color="gray.500" textTransform="uppercase" letterSpacing="wider"
                                    isNumeric
                                >
                                    Adultes
                                </Table.ColumnHeader>
                                <Table.ColumnHeader
                                    px={4} py={3} fontSize="xs" fontWeight={700}
                                    color="gray.500" textTransform="uppercase" letterSpacing="wider"
                                    isNumeric
                                >
                                    Enfants
                                </Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {booking.bookingHotelDetails?.map((room, i) => (
                                <Table.Row
                                    key={room.id}
                                    _hover={{ bg: "gray.50" }}
                                    borderTop="1px solid" borderColor="gray.100"
                                >
                                    <Table.Cell px={4} py={3}>
                                        <Text fontSize="xs" color="gray.400" fontWeight={600}>{i + 1}</Text>
                                    </Table.Cell>
                                    <Table.Cell px={4} py={3}>
                                        <Flex align="center" gap={2}>
                                            <Box color="blue.400"><LuBed size={13} /></Box>
                                            <Text fontSize="sm" fontWeight={600} color="gray.700">
                                                {room.RoomHotelBooking?.name ?? "—"}
                                            </Text>
                                        </Flex>
                                    </Table.Cell>
                                    <Table.Cell px={4} py={3} isNumeric>
                                        <Flex align="center" justify="flex-end" gap={1}>
                                            <LuUsers size={12} color="gray" />
                                            <Text fontSize="sm" color="gray.700">{room.number_of_guests_adult ?? 0}</Text>
                                        </Flex>
                                    </Table.Cell>
                                    <Table.Cell px={4} py={3} isNumeric>
                                        <Flex align="center" justify="flex-end" gap={1}>
                                            <LuBaby size={12} color="gray" />
                                            <Text fontSize="sm" color="gray.700">{room.number_of_guests_children ?? 0}</Text>
                                        </Flex>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Box>

                {/* Total price */}
                <Flex justify="flex-end" align="center" gap={3}>
                    <Text fontSize="sm" color="gray.400">Prix total</Text>
                    <Flex align="baseline" gap={1}>
                        <Text fontSize="2xl" fontWeight={900} color="blue.600" lineHeight={1}>
                            {booking.total_price}
                        </Text>
                        <Text fontSize="sm" color="gray.500" fontWeight={500}>TND</Text>
                    </Flex>
                </Flex>
            </Box>
        </Box>
    )
}

export default function BookingHotel() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await AxiosToken.get("/booking/get/partner/hotel")
                setBookings(response.data.booking ?? [])
            } catch {
                setError("Impossible de charger les réservations.")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Aggregate stats
    const totalRevenue = bookings.reduce((s, b) => s + (Number(b.total_price) || 0), 0)
    const totalGuests = bookings.reduce((s, b) =>
        s + (b.bookingHotelDetails?.reduce((ss, d) => ss + (d.number_of_guests_adult ?? 0) + (d.number_of_guests_children ?? 0), 0) ?? 0), 0)

    return (
        <Container py={8}>

            {/* Page title */}
            <Box mb={7}>
                <Text fontSize="xs" fontWeight={700} color="blue.500" textTransform="uppercase"
                    letterSpacing="widest" mb={1}>
                    Tableau de bord
                </Text>
                <Heading size="xl" color="gray.900" fontWeight={900}>
                    Réservations
                </Heading>
            </Box>

            {/* Stats */}
            {!loading && bookings.length > 0 && (
                <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }} gap={3} mb={7}>
                    <StatCard icon={LuHash} label="Total réservations" value={bookings.length} color="blue" />
                    <StatCard icon={LuTrendingUp} label="Revenus totaux" value={`${totalRevenue} TND`} color="green" />
                    <StatCard icon={LuUsers} label="Total voyageurs" value={totalGuests} color="purple" />
                </Grid>
            )}

            {/* Loading */}
            {loading && (
                <VStack spacing={4} align="stretch">
                    {[1, 2, 3].map(i => <BookingCardSkeleton key={i} />)}
                </VStack>
            )}

            {/* Error */}
            {!loading && error && (
                <Flex direction="column" align="center" justify="center" py={20} gap={3}>
                    <Text color="gray.500">{error}</Text>
                </Flex>
            )}

            {/* Empty */}
            {!loading && !error && bookings.length === 0 && (
                <Flex
                    direction="column" align="center" justify="center"
                    py={20} gap={3}
                    bg="white" borderRadius="2xl"
                    border="1px dashed" borderColor="gray.200"
                >
                    <Text fontWeight={700} color="gray.700" fontSize="lg">Aucune réservation</Text>
                    <Text fontSize="sm" color="gray.400">
                        Les réservations de vos clients apparaîtront ici.
                    </Text>
                </Flex>
            )}

            {/* Booking cards */}
            {!loading && !error && bookings.length > 0 && (
                <VStack spacing={5} align="stretch">
                    {bookings.map((booking, i) => (
                        <BookingCard key={booking.id} booking={booking} index={i} />
                    ))}
                </VStack>
            )}

        </Container>
    )
}