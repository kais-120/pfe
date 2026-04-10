import { Badge, Box, Flex, Grid, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react'
import { LuClock, LuTicket } from 'react-icons/lu';
import { AxiosToken } from '../../../../Api/Api';

const LocationBooking = () => {
    const STATUS_STYLE = {
  "confirmée": { bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
  "en attente": { bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
  "annulée": { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
}

      const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const dataFetch = async () => {
            try {
                const res = await AxiosToken.get("/dashboard/partner/last-booking");
                setBookings(res.data.bookings)
            } catch (err) {
                console.error(err)
            }
        }
        dataFetch()
    }, [])
     const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000)
    if (diff < 60) return "À l'instant"
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
    return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

    return (
        <Grid templateColumns={{ base: "1fr", lg: "1fr" }} gap={5} mb={6}>

            <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
                boxShadow="0 1px 8px rgba(0,0,0,0.05)" overflow="hidden">
                <Flex px={5} py={4} borderBottom="1px solid" borderColor="gray.100"
                    align="center" justify="space-between">
                    <Flex align="center" gap={2}>
                        <LuTicket size={15} color="#2563EB" />
                        <Text fontSize="sm" fontWeight={700} color="gray.800">Dernières réservations</Text>
                    </Flex>
                    <Badge bg="#EFF6FF" color="#1D4ED8" borderRadius="full" px={2} py={0.5} fontSize="10px" fontWeight={700}>
                        Live
                    </Badge>
                </Flex>
                <VStack spacing={0} align="stretch" px={5} py={3}>
                    {bookings && bookings.length === 0 ?

                        <Flex
                            b={"white"}
                            py={"20"}
                            w={"full"}
                            h={"full"}
                            alignItems={"center"}
                            justifyContent={"center"}
                            pointerEvents="none"
                        >
                            <Text fontSize="sm" color="gray.400">
                                Aucune donnée pour le moment
                            </Text>
                        </Flex>


                        : bookings.map((b, i) => {
                            const roomCounts = {};

                            b.bookingHotelDetails?.forEach(detail => {
                                const roomName = detail?.RoomHotelBooking?.name;
                                if (!roomName) return;

                                roomCounts[roomName] = (roomCounts[roomName] || 0) + 1;
                            });

                            const roomText = Object.entries(roomCounts)
                                .map(([name, count]) => `${count} ${name}`)
                                .join(", ");
                            const s = STATUS_STYLE[b.status]
                            return (
                                <Flex key={b.id} gap={3} py={3}
                                    borderBottom={i < bookings.length - 1 ? "1px solid" : "none"}
                                    borderColor="gray.50" align="center">
                                    <Flex w="32px" h="32px" borderRadius="full" flexShrink={0}
                                        bg="#EFF6FF" color="#2563EB"
                                        align="center" justify="center"
                                        fontSize="10px" fontWeight={800}>
                                        {b?.userBooking?.name?.split(" ")?.map(w => w[0])?.join("")?.slice(0, 2)}
                                    </Flex>
                                    <Box flex={1} minW={0}>
                                        <Flex justify="space-between" align="center">
                                            <Text fontSize="xs" fontWeight={700} color="gray.800" noOfLines={1}>
                                                {b?.userBooking?.name}
                                            </Text>
                                            <Text fontSize="11px" fontWeight={800} color="gray.800" ml={2} flexShrink={0}>
                                                {b.total_price} TND
                                            </Text>
                                        </Flex>
                                        <Flex align="center" gap={2} mt={0.5}>
                                            <Text fontSize="10px" color="gray.400" noOfLines={1}>{roomText}</Text>
                                            <Box w="3px" h="3px" borderRadius="full" bg="gray.300" flexShrink={0} />
                                            <Box px={1.5} py={0.5} borderRadius="full" bg={s.bg} flexShrink={0}>
                                                <Text fontSize="9px" fontWeight={700} color={s.text} textTransform="capitalize">
                                                    {b.status}
                                                </Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                    <Flex align="center" gap={1} flexShrink={0}>
                                        <LuClock size={10} color="#9CA3AF" />
                                        <Text fontSize="10px" color="gray.400">{formatTime(b.createdAt)}</Text>
                                    </Flex>
                                </Flex>
                            )
                        })}
                </VStack>
            </Box>
        </Grid>

    )
}

export default LocationBooking