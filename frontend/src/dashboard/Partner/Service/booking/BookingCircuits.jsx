import { Box, Container, Heading, Table, Text, Badge, Flex, Grid, Skeleton, SkeletonText, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AxiosToken } from "../../../../Api/Api";
import { LuCalendarDays, LuMapPin, LuHash, LuTrendingUp, LuUser, LuClock } from "react-icons/lu";
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";

const formatDate = (d) => {
    if (!d) return "—"
    const [day, month, year] = d.split("/")
    return new Date(`${year}-${month}-${day}`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

function StatusBadge({ status }) {
    const map = {
        confirmée: { color: "green", Icon: FaCheckCircle, label: "Confirmé" },
        confirmed: { color: "green", Icon: FaCheckCircle, label: "Confirmé" },
        pending: { color: "yellow", Icon: FaHourglassHalf, label: "En attente" },
        cancelled: { color: "red", Icon: FaTimesCircle, label: "Annulé" },
    }
    const s = map[status?.toLowerCase()] ?? map.pending
    return (
        <Flex align="center" gap={1.5}>
            <s.Icon size={11} color={`var(--chakra-colors-${s.color}-500)`} />
            <Badge colorScheme={s.color} borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight={600}>{s.label}</Badge>
        </Flex>
    )
}

function StatCard({ icon: Icon, label, value, color = "blue" }) {
    return (
        <Box bg="white" borderRadius="xl" p={4} border="1px solid" borderColor="gray.100" boxShadow="0 1px 8px rgba(0,0,0,0.05)">
            <Flex align="center" gap={3}>
                <Flex w="40px" h="40px" borderRadius="lg" bg={`${color}.50`} color={`${color}.500`} align="center" justify="center" flexShrink={0}>
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

function BookingCard({ booking, index }) {
    const circuits = booking.circuitBooking ?? []
    const firstPkg = circuits[0]?.circuitDetails?.packagesCircuit?.[0]

    return (
        <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 2px 12px rgba(0,0,0,0.05)" overflow="hidden"
            transition="box-shadow 0.2s, border-color 0.2s"
            _hover={{ boxShadow: "0 6px 28px rgba(0,0,0,0.09)", borderColor: "blue.100" }}>

            {/* Header */}
            <Flex px={6} py={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.100"
                align="center" justify="space-between" flexWrap="wrap" gap={3}>
                <Flex align="center" gap={3}>
                    <Flex w="36px" h="36px" borderRadius="lg" bg="blue.100" color="blue.700"
                        align="center" justify="center" fontSize="xs" fontWeight={800} flexShrink={0}>
                        #{index + 1}
                    </Flex>
                    <Box>
                        <Flex align="center" gap={2}>
                            <LuUser size={12} color="gray" />
                            <Text fontSize="sm" fontWeight={700} color="gray.800">{booking.userBooking?.name ?? "—"}</Text>
                        </Flex>
                        <Text fontSize="xs" color="gray.400">{booking.userBooking?.email} · {booking.userBooking?.phone}</Text>
                    </Box>
                </Flex>
                <Flex gap={2} align="center" flexWrap="wrap">
                    <Badge colorScheme="blue" borderRadius="full" px={2.5} py={0.5} fontSize="xs">{booking.type}</Badge>
                    <StatusBadge status={booking.status} />
                </Flex>
            </Flex>

            <Box px={6} py={5}>
                {/* Info pills */}
                <Grid templateColumns={{ base: "1fr 1fr", sm: "repeat(4, 1fr)" }} gap={3} mb={5}>
                    <Box bg="blue.50" borderRadius="xl" p={3}>
                        <Flex align="center" gap={1.5} mb={1}><LuCalendarDays size={11} color="#3182CE" />
                            <Text fontSize="9px" fontWeight={700} color="blue.500" textTransform="uppercase" letterSpacing="wider">Départ</Text></Flex>
                        <Text fontSize="sm" fontWeight={700} color="gray.800">{formatDate(firstPkg?.departureDate)}</Text>
                        <Text fontSize="xs" color="gray.400">{firstPkg?.departureAirport}</Text>
                    </Box>
                    <Box bg="blue.50" borderRadius="xl" p={3}>
                        <Flex align="center" gap={1.5} mb={1}><LuCalendarDays size={11} color="#3182CE" />
                            <Text fontSize="9px" fontWeight={700} color="blue.500" textTransform="uppercase" letterSpacing="wider">Retour</Text></Flex>
                        <Text fontSize="sm" fontWeight={700} color="gray.800">{formatDate(firstPkg?.returnDate)}</Text>
                        <Text fontSize="xs" color="gray.400">{firstPkg?.returnAirport}</Text>
                    </Box>
                    <Box bg="gray.50" borderRadius="xl" p={3}>
                        <Flex align="center" gap={1.5} mb={1}><LuClock size={11} color="gray" />
                            <Text fontSize="9px" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wider">Durée</Text></Flex>
                        <Text fontSize="sm" fontWeight={700} color="gray.800">{firstPkg?.duration ? `${firstPkg.duration} jours` : "—"}</Text>
                    </Box>
                    <Box bg="gray.50" borderRadius="xl" p={3}>
                        <Flex align="center" gap={1.5} mb={1}><LuHash size={11} color="gray" />
                            <Text fontSize="9px" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wider">Acompte</Text></Flex>
                        <Text fontSize="sm" fontWeight={700} color="gray.800">{firstPkg?.installment ? `${firstPkg.installment}%` : "—"}</Text>
                    </Box>
                </Grid>

                {/* Circuits table */}
                <Box border="1px solid" borderColor="gray.100" borderRadius="xl" overflow="hidden" mb={4}>
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row bg="gray.50">
                                {["Circuit", "Destination", "Catégorie", "Difficulté", "Trajet", "Durée"].map(h => (
                                    <Table.ColumnHeader key={h} px={4} py={3} fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wider">{h}</Table.ColumnHeader>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {circuits.map((c) => {
                                const cd = c.circuitDetails
                                const pkg = cd?.packagesCircuit?.[0]
                                return (
                                    <Table.Row key={c.id} _hover={{ bg: "gray.50" }} borderTop="1px solid" borderColor="gray.100">
                                        <Table.Cell px={4} py={3}><Text fontSize="sm" fontWeight={600} color="gray.700">{cd?.title ?? "—"}</Text></Table.Cell>
                                        <Table.Cell px={4} py={3}>
                                            <Flex align="center" gap={1}><LuMapPin size={12} color="gray" /><Text fontSize="sm" color="gray.700">{cd?.location ?? "—"}</Text></Flex>
                                        </Table.Cell>
                                        <Table.Cell px={4} py={3}><Text fontSize="sm" color="gray.700">{cd?.category ?? "—"}</Text></Table.Cell>
                                        <Table.Cell px={4} py={3}><Badge colorScheme="orange" borderRadius="full" fontSize="xs">{cd?.difficulty ?? "—"}</Badge></Table.Cell>
                                        <Table.Cell px={4} py={3}><Text fontSize="sm" color="gray.700">{pkg ? `${pkg.departureAirport} → ${pkg.returnAirport}` : "—"}</Text></Table.Cell>
                                        <Table.Cell px={4} py={3}><Text fontSize="sm" color="gray.700">{pkg?.duration ? `${pkg.duration} j` : "—"}</Text></Table.Cell>
                                    </Table.Row>
                                )
                            })}
                        </Table.Body>
                    </Table.Root>
                </Box>

                <Flex justify="flex-end" align="center" gap={3}>
                    <Text fontSize="sm" color="gray.400">Prix total</Text>
                    <Flex align="baseline" gap={1}>
                        <Text fontSize="2xl" fontWeight={900} color="blue.600" lineHeight={1}>{booking.total_price}</Text>
                        <Text fontSize="sm" color="gray.500" fontWeight={500}>TND</Text>
                    </Flex>
                </Flex>
            </Box>
        </Box>
    )
}

export default function BookingCircuits() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await AxiosToken.get("/booking/get/partner/voyage")
                setBookings(response.data.booking ?? [])
            } catch {
                setError("Impossible de charger les réservations.")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const totalRevenue = bookings.reduce((s, b) => s + (Number(b.total_price) || 0), 0)

    return (
        <Container py={8}>
            <Box mb={7}>
                <Text fontSize="xs" fontWeight={700} color="blue.500" textTransform="uppercase" letterSpacing="widest" mb={1}>Tableau de bord</Text>
                <Heading size="xl" color="gray.900" fontWeight={900}>Réservations circuits</Heading>
            </Box>

            {!loading && bookings.length > 0 && (
                <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }} gap={3} mb={7}>
                    <StatCard icon={LuHash} label="Total réservations" value={bookings.length} color="blue" />
                    <StatCard icon={LuTrendingUp} label="Revenus totaux" value={`${totalRevenue} TND`} color="green" />
                    <StatCard icon={LuHash} label="Circuits uniques" value={new Set(bookings.flatMap(b => b.circuitBooking?.map(c => c.circuit_id) ?? [])).size} color="purple" />
                </Grid>
            )}

            {loading && <VStack spacing={4} align="stretch">{[1,2,3].map(i=><Skeleton key={i} h="200px" borderRadius="2xl"/>)}</VStack>}
            {!loading && error && <Flex justify="center" py={20}><Text color="gray.500">{error}</Text></Flex>}
            {!loading && !error && bookings.length === 0 && (
                <Flex direction="column" align="center" justify="center" py={20} gap={3} bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                    <Text fontWeight={700} color="gray.700">Aucune réservation</Text>
                    <Text fontSize="sm" color="gray.400">Les réservations circuits apparaîtront ici.</Text>
                </Flex>
            )}
            {!loading && !error && bookings.length > 0 && (
                <VStack spacing={5} align="stretch">
                    {bookings.map((b, i) => <BookingCard key={b.id} booking={b} index={i} />)}
                </VStack>
            )}
        </Container>
    )
}