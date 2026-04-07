import { useEffect, useRef, useState } from "react"
import {
  Box, Flex, Grid, Text, Badge, VStack, HStack,
  Button,
} from "@chakra-ui/react"
import {
  LuUsers, LuArrowUpRight, LuArrowDownRight, LuTicket,
  LuBanknote, LuStar, LuMessageSquare, LuBed, LuTrendingUp, LuClock,
} from "react-icons/lu"
import { Helmet } from "react-helmet"
import { Chart, registerables } from "chart.js"
import { AxiosToken } from "../../Api/Api"
import { useProfile } from "../../Context/useProfile"
Chart.register(...registerables)




const STATUS_STYLE = {
  "confirmée": { bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
  "en attente": { bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
  "annulée": { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
}

function RevenueChart() {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const [period, setPeriod] = useState("monthly")
  const [revenueData, setRevenueData] = useState([])
  useEffect(() => {
    const FetchData = async () => {
      try {
        const res = await AxiosToken.get("/dashboard/partner/revenue-chart");
        setRevenueData(res.data)
      } catch {
        console.error("error")
      }
    }
    FetchData()
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    const ctx = canvasRef.current.getContext("2d")
    const gradient = ctx.createLinearGradient(0, 0, 0, 220)
    gradient.addColorStop(0, "rgba(37,99,235,0.18)")
    gradient.addColorStop(1, "rgba(37,99,235,0.01)")

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: revenueData.labels,
        datasets: [{
          label: "Revenus (TND)",
          data: revenueData[period],
          borderColor: "#2563EB",
          borderWidth: 2.5,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#2563EB",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          backgroundColor: gradient,
          tension: 0.45,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1E293B",
            padding: 10,
            titleFont: { size: 11, weight: "600" },
            bodyFont: { size: 12, weight: "700" },
            callbacks: {
              label: (ctx) => `  ${ctx.parsed.y.toLocaleString("fr-TN")} TND`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#94A3B8", font: { size: 11 } } },
          y: {
            grid: { color: "#F1F5F9", drawBorder: false },
            ticks: {
              color: "#94A3B8", font: { size: 11 },
              callback: (v) => v >= 1000 ? `${v / 1000}k` : v
            }
          }
        }
      }
    })
    return () => chartRef.current?.destroy()
  }, [period])

  return (
    <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)" p={5}>
      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Text fontSize="sm" fontWeight={700} color="gray.800">Revenus</Text>
          <Text fontSize="xs" color="gray.400">Évolution sur 6 mois</Text>
        </Box>
        <HStack spacing={1}>
          {["daily", "weekly", "monthly"].map(p => (
            <Box key={p} as="button" onClick={() => setPeriod(p)}
              px={2.5} py={1} borderRadius="lg" fontSize="11px" fontWeight={600}
              bg={period === p ? "#2563EB" : "gray.100"}
              color={period === p ? "white" : "gray.500"}
              transition="all 0.15s" _hover={{ opacity: 0.85 }}>
              {p === "daily" ? "Jour" : p === "weekly" ? "Semaine" : "Mois"}
            </Box>
          ))}
        </HStack>
      </Flex>
      <Box h="200px" position="relative">
        <canvas ref={canvasRef} />

        {revenueData?.[period]?.every(v => v === 0) && (
          <Flex
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            pointerEvents="none"
          >
            <Text fontSize="sm" color="gray.400">
              Aucune donnée pour le moment
            </Text>
          </Flex>
        )}
      </Box>
    </Box>
  )
}

function BookingsChart() {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const [bookingData, setBookingData] = useState([])
  useEffect(() => {
    const FetchData = async () => {
      try {
        const res = await AxiosToken.get("/dashboard/partner/booking-chart");
        setBookingData(res.data)
      } catch {
        console.error("error")
      }
    }
    FetchData()
  }, [])
  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    const ctx = canvasRef.current.getContext("2d")
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: bookingData.labels,
        datasets: [{
          label: "Réservations",
          data: bookingData.values,
          backgroundColor: bookingData?.values?.length > 0 && bookingData?.values?.map((_, i) =>
            i === bookingData.values.length - 1 ? "#7C3AED" : "#EDE9FE"
          ),
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1E293B",
            padding: 10,
            callbacks: { label: (ctx) => `  ${ctx.parsed.y} réservations` }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#94A3B8", font: { size: 11 } } },
          y: {
            grid: { color: "#F8FAFC" },
            ticks: { color: "#94A3B8", font: { size: 11 } },
            beginAtZero: true,
          }
        }
      }
    })
    return () => chartRef.current?.destroy()
  }, [])

  return (
    <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)" p={5}>
      <Box mb={4}>
        <Text fontSize="sm" fontWeight={700} color="gray.800">Réservations</Text>
        <Text fontSize="xs" color="gray.400">Nombre sur 6 mois</Text>
      </Box>
      <Box h="200px" position="relative">
        <canvas ref={canvasRef} />

        {bookingData?.values?.length && bookingData?.values?.every(v => v === 0) && (
          <Flex
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            pointerEvents="none"
          >
            <Text fontSize="sm" color="gray.400">
              Aucune donnée pour le moment
            </Text>
          </Flex>
        )}
      </Box>
    </Box>
  )
}

function Stars({ rating }) {
  return (
    <HStack spacing={0.5}>
      {[1, 2, 3, 4, 5].map(i => (
        <LuStar key={i} size={11}
          fill={i <= rating ? "#F59E0B" : "none"}
          color={i <= rating ? "#F59E0B" : "#D1D5DB"} />
      ))}
    </HStack>
  )
}

const DashboardPartner = () => {
  const [status, setStatus] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rooms, setRooms] = useState([]);

  const {user} = useProfile()
  console.log(user)

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const resStatus = await AxiosToken.get("/dashboard/partner/status");
        setStatus(resStatus.data.data)
        const resBooking = await AxiosToken.get("/dashboard/partner/last-booking");
        setBookings(resBooking.data.bookings)
        const resReviews = await AxiosToken.get("/dashboard/partner/last-reviews");
        setReviews(resReviews.data)
        const resRooms = await AxiosToken.get("/dashboard/partner/my-rooms");
        setRooms(resRooms.data.rooms)
      } catch (err) {
        console.error(err)
      }
    }
    dataFetch()
  }, [])
  const STATS_CONFIG = [
    { key: "booking", label: "Revenus totaux", Icon: LuBanknote, accent: "#2563EB", bg: "#EFF6FF" },
    { key: "review", label: "Réservations totales", Icon: LuTicket, accent: "#7C3AED", bg: "#F5F3FF" },
    { key: "note", label: "Note moyenne", Icon: LuStar, accent: "#D97706", bg: "#FFFBEB" },
    { key: "payment", label: "Avis reçus", Icon: LuMessageSquare, accent: "#059669", bg: "#ECFDF5" },
  ]
  const mergedStats = STATS_CONFIG.map((stat) => {
    const apiData = status.find((s) => s.label === stat.key);

    return {
      ...stat,
      value: apiData?.value || "0",
      ...(stat.key !== "note" && { delta: apiData?.delta || 0 }),
    };
  });

  const activeRooms = rooms.filter(r => r.status === "active").length
  const inactiveRooms = rooms.filter(r => r.status === "inactive").length
  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000)
    if (diff < 60) return "À l'instant"
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
    return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  return (
    <>
      <Helmet title="Tableau de bord partenaire" />
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6}>

        {/* Header */}
        <Box mb={7}>
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={1}>
            Partenaire Hôtel
          </Text>
          <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
            Tableau de bord
          </Text>
          <Text fontSize="sm" color="gray.400" mt={0.5}>
            Lundi 6 avril 2026 · Données en temps réel
          </Text>
        </Box>

        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={6}>
          {mergedStats.map(({ label, value, delta, Icon, accent, bg }) => {
            const up = delta > 0
            return (
              <Box key={label} bg="white" borderRadius="2xl" p={4}
                border="1px solid" borderColor="gray.100"
                boxShadow="0 1px 8px rgba(0,0,0,0.04)"
                transition="box-shadow 0.2s"
                _hover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <Flex justify="space-between" align="flex-start" mb={3}>
                  <Flex w="38px" h="38px" borderRadius="xl"
                    bg={bg} align="center" justify="center" flexShrink={0}>
                    <Icon size={17} color={accent} />
                  </Flex>
                  {delta !== undefined &&
                    <Flex align="center" gap={0.5}
                      bg={up ? "#ECFDF5" : "#FEF2F2"}
                      borderRadius="full" px={1.5} py={0.5}>
                      {up
                        ? <LuArrowUpRight size={10} color="#065F46" />
                        : <LuArrowDownRight size={10} color="#991B1B" />}
                      <Text fontSize="10px" fontWeight={700}
                        color={up ? "#065F46" : "#991B1B"}>
                        {Math.abs(delta)}{label === "Note moyenne" ? "" : "%"}
                      </Text>
                    </Flex>
                  }
                </Flex>
                <Text fontSize="xl" fontWeight={900} color="gray.900" lineHeight={1} mb={0.5}>
                  {value}
                </Text>
                <Text fontSize="11px" color="gray.400">{label}</Text>
              </Box>
            )
          })}
        </Grid>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5} mb={6}>
          <RevenueChart />
          <BookingsChart />
        </Grid>

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
              {bookings.map((b, i) => {
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

        {/* ── 4. Reviews Section ── */}
        <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 8px rgba(0,0,0,0.05)" overflow="hidden" mb={6}>
          <Flex px={5} py={4} borderBottom="1px solid" borderColor="gray.100"
            align="center" justify="space-between">
            <Flex align="center" gap={2}>
              <LuStar size={15} color="#F59E0B" />
              <Text fontSize="sm" fontWeight={700} color="gray.800">Derniers avis</Text>
            </Flex>
            <Flex align="center" gap={2}>
              <Flex align="center" gap={1}>
                <LuStar size={13} fill="#F59E0B" color="#F59E0B" />
                <Text fontSize="sm" fontWeight={900} color="gray.800">{reviews.reviewScore}</Text>
              </Flex>
              <Text fontSize="xs" color="gray.400">· {reviews.totalReview} avis</Text>
            </Flex>
          </Flex>
          {reviews ?
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
            : <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={0}>

              {reviews.map((r, i) => (
                <Box key={i} px={5} py={4}
                  borderRight={{ md: i % 2 === 0 ? "1px solid" : "none" }}
                  borderBottom={i < reviews.length - 2 ? "1px solid" : { base: i < reviews.length - 1 ? "1px solid" : "none", md: "none" }}
                  borderColor="gray.50">
                  <Flex justify="space-between" align="flex-start" mb={1.5}>
                    <Flex align="center" gap={2}>
                      <Flex w="26px" h="26px" borderRadius="full" bg="#FFFBEB" color="#F59E0B"
                        align="center" justify="center" fontSize="9px" fontWeight={800} flexShrink={0}>
                        {r?.reviews?.clientReview?.name?.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </Flex>
                      <Box>
                        <Text fontSize="xs" fontWeight={700} color="gray.800">{r.client}</Text>
                        <Text fontSize="10px" color="gray.400">{r?.room || ""}</Text>
                      </Box>
                    </Flex>
                    <Flex direction="column" align="flex-end" gap={0.5}>
                      <Stars rating={r.rate} />
                      <Text fontSize="10px" color="gray.400">{r.time}</Text>
                    </Flex>
                  </Flex>
                  <Text fontSize="xs" color="gray.600" mt={1} fontStyle="italic">
                    "{r.comment}"
                  </Text>
                </Box>
              ))}
            </Grid>
          }
        </Box>

        <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 8px rgba(0,0,0,0.05)" overflow="hidden">
          <Flex px={5} py={4} borderBottom="1px solid" borderColor="gray.100"
            align="center" justify="space-between" flexWrap="wrap" gap={2}>
            <Flex align="center" gap={2}>
              <LuBed size={15} color="#7C3AED" />
              <Text fontSize="sm" fontWeight={700} color="gray.800">Mes chambres</Text>
            </Flex>
            <HStack spacing={2}>
              <Flex align="center" gap={1.5} px={2.5} py={1} borderRadius="full" bg="#ECFDF5">
                <Box w="6px" h="6px" borderRadius="full" bg="#10B981" />
                <Text fontSize="10px" fontWeight={700} color="#065F46">{activeRooms} actives</Text>
              </Flex>
              <Flex align="center" gap={1.5} px={2.5} py={1} borderRadius="full" bg="#F1F5F9">
                <Box w="6px" h="6px" borderRadius="full" bg="#94A3B8" />
                <Text fontSize="10px" fontWeight={700} color="#475569">{inactiveRooms} inactives</Text>
              </Flex>
            </HStack>
          </Flex>
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: "collapse" }}>
              <Box as="thead">
                <Box as="tr" bg="gray.50">
                  {["Chambre", "Statut", "Réservations", "Prix", "Occupation"].map(h => (
                    <Box key={h} as="th" px={5} py={3} textAlign="left"
                      style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {h}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {
                  rooms && rooms.length === 0 ?

                    <Box as="tr">
                      <Box as="td" colSpan={5} textAlign="center" py={10}>
                        <Text fontSize="sm" color="gray.400">
                          Aucune donnée pour le moment
                        </Text>
                      </Box>
                    </Box>
                    :

                    rooms.map((room, i) => {

                      return (
                        <Box key={room.name} as="tr"
                          style={{ borderTop: "1px solid #F8FAFC", background: "white" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                          onMouseLeave={e => e.currentTarget.style.background = "white"}>
                          <Box as="td" px={5} py={3.5}>
                            <Flex align="center" gap={2}>
                              <Flex w="28px" h="28px" borderRadius="lg" bg="#F5F3FF"
                                align="center" justify="center" flexShrink={0}>
                                <LuBed size={13} color="#7C3AED" />
                              </Flex>
                              <Text style={{ fontSize: "12px", fontWeight: 600, color: "#1E293B" }}>
                                {room.name}
                              </Text>
                            </Flex>
                          </Box>
                          <Box as="td" px={5} py={3.5}>
                            <Flex align="center" gap={1.5} px={2} py={0.5} borderRadius="full" display="inline-flex"
                              bg={room.status ? "#ECFDF5" : "#F1F5F9"}>
                              <Box w="5px" h="5px" borderRadius="full"
                                bg={room.status ? "#10B981" : "#94A3B8"} />
                              <Text style={{ fontSize: "10px", fontWeight: 700, color: room.active ? "#065F46" : "#64748B" }}>
                                {room.status ? "Active" : "Inactive"}
                              </Text>
                            </Flex>
                          </Box>
                          <Box as="td" px={5} py={3.5}>
                            <Text style={{ fontSize: "12px", fontWeight: 800, color: "#1E293B" }}>
                              {room.booked}
                            </Text>
                          </Box>
                          <Box as="td" px={5} py={3.5}>
                            <Text style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>
                              {room.price} TND
                            </Text>
                          </Box>
                          <Box as="td" px={5} py={3.5}>
                            <Flex align="center" gap={2}>
                              <Box flex={1} bg="gray.100" borderRadius="full" h="5px" overflow="hidden" maxW="80px">
                                <Box h="100%" borderRadius="full"
                                  bg={room.status ? "#7C3AED" : "#CBD5E1"}
                                  style={{ width: `${room.occupation}%`, transition: "width 0.4s" }} />
                              </Box>
                              <Text style={{ fontSize: "10px", fontWeight: 700, color: "#64748B" }}>{room.occupation}%</Text>
                            </Flex>
                          </Box>
                        </Box>
                      )
                    })}
              </Box>
            </Box>
          </Box>
          <Flex px={5} py={3.5} borderTop="1px solid" borderColor="gray.100" gap={2} flexWrap="wrap">
            <Button size="xs" colorScheme="purple" borderRadius="lg" fontWeight={700}>
              + Ajouter une chambre
            </Button>
            <Button size="xs" variant="outline" borderRadius="lg" fontWeight={600}>
              Gérer les disponibilités
            </Button>
          </Flex>
        </Box>
      </Box>
    </>
  )
}

export default DashboardPartner