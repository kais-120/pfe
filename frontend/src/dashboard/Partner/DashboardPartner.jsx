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
import RoomsCard from "./Dashboard/RoomsCard"
import CircuitsCard from "./Dashboard/CircuitsCard"
import HotelBooking from "./Dashboard/Booking/HotelBooking"
import CircuitsBooking from "./Dashboard/Booking/CircuitsBooking"
import HotelStatusCard from "./Dashboard/HotelStatusCard"
import StatusCard from "./Dashboard/StatusCard"
import VehicleCard from "./Dashboard/VehicleCard"
import LocationBooking from "./Dashboard/Booking/LocationBooking"
import AgencyCard from "./Dashboard/AgencyCard"
import FlightCard from "./Dashboard/FlightCard"
Chart.register(...registerables)




const STATUS_STYLE = {
  "confirmée": { bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
  "en attente": { bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
  "annulée": { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
}

function RevenueChart() {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  const [revenueData, setRevenueData] = useState({
    labels: [],
    data: []
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const FetchData = async () => {
      try {
        const res = await AxiosToken.get("/dashboard/partner/revenue-chart")

        // متأكد أنها فيها labels + data
        setRevenueData({
          labels: res.data.labels || [],
          data: res.data.monthly || []
        })
      } catch (err) {
        console.error("error", err)
      } finally {
        setLoading(false)
      }
    }

    FetchData()
  }, [])


  useEffect(() => {
    if (!canvasRef.current) return

    // destroy old chart
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const ctx = canvasRef.current.getContext("2d")

    const gradient = ctx.createLinearGradient(0, 0, 0, 220)
    gradient.addColorStop(0, "rgba(37,99,235,0.18)")
    gradient.addColorStop(1, "rgba(37,99,235,0.01)")

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: revenueData.labels,
        datasets: [
          {
            label: "Revenus (TND)",
            data: revenueData.data,
            borderColor: "#2563EB",
            borderWidth: 2.5,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#2563EB",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: gradient,
            tension: 0.45
          }
        ]
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
              label: (ctx) =>
                `${ctx.parsed.y.toLocaleString("fr-TN")} TND`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#94A3B8", font: { size: 11 } }
          },
          y: {
            grid: { color: "#F1F5F9", drawBorder: false },
            ticks: {
              color: "#94A3B8",
              font: { size: 11 },
              callback: (v) => (v >= 1000 ? `${v / 1000}k` : v)
            }
          }
        }
      }
    })

    return () => chartRef.current?.destroy()
  }, [revenueData])

  const isEmpty =
    revenueData.data?.length > 0 &&
    revenueData.data.every((v) => v === 0)

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)"
      p={5}
    >
      <Flex
        justify="space-between"
        align="center"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Text fontSize="sm" fontWeight={700} color="gray.800">
            Revenus
          </Text>
          <Text fontSize="xs" color="gray.400">
            Évolution sur 6 mois
          </Text>
        </Box>
      </Flex>

      <Box h="200px" position="relative">
        <canvas ref={canvasRef} />

        {!loading && isEmpty && (
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
  const [bookingData, setBookingData] = useState({ labels: [], values: [] })
  
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

  console.log(bookingData)
  
  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    const ctx = canvasRef.current.getContext("2d")
    
    // Ensure we have valid data
    const hasData = bookingData?.values?.length > 0 && 
                    bookingData.values.some(v => v !== null && v !== undefined)
    
    if (!hasData) {
      // Render empty chart or return early
      chartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: [],
          datasets: []
        }
      })
      return
    }
    
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: bookingData.labels,
        datasets: [{
          label: "Réservations",
          data: bookingData.values,
          backgroundColor: bookingData.values.map((_, i) =>
            i === bookingData.values.length - 1 ? "#7C3AED" : "#EDE9FE"
          ),
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: bookingData.values.length === 1 ? 0.3 : 0.7, 
          categoryPercentage: bookingData.values.length === 1 ? 0.4 : 0.8,
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
            callbacks: { 
              label: (ctx) => `  ${ctx.parsed.y} réservation${ctx.parsed.y > 1 ? 's' : ''}` 
            }
          }
        },
        scales: {
          x: { 
            grid: { display: false }, 
            ticks: { color: "#94A3B8", font: { size: 11 } },
           
            offset: bookingData.values.length === 1,
          },
          y: {
            grid: { color: "#F8FAFC" },
            ticks: { 
              color: "#94A3B8", 
              font: { size: 11 },
              stepSize: 1, 
              precision: 0,
            },
            beginAtZero: true,
            max: bookingData.values.length === 1 ? Math.max(bookingData.values[0] + 1, 5) : undefined, // Add some padding above the bar
          }
        },
        layout: {
          padding: {
            left: bookingData.values.length === 1 ? 20 : 0,
            right: bookingData.values.length === 1 ? 20 : 0,
          }
        }
      }
    })
    
    return () => chartRef.current?.destroy()
  }, [bookingData])

  const hasNoData = !bookingData?.values?.length || 
                    bookingData.values.every(v => v === 0 || v === null || v === undefined)

  return (
    <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)" p={5}>
      <Box mb={4}>
        <Text fontSize="sm" fontWeight={700} color="gray.800">Réservations</Text>
        <Text fontSize="xs" color="gray.400">Nombre sur 6 mois</Text>
      </Box>
      <Box h="200px" position="relative">
        <canvas ref={canvasRef} />

        {hasNoData && (
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
  const [reviews, setReviews] = useState([]);

  const { user } = useProfile()

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const resStatus = await AxiosToken.get("/dashboard/partner/status");
        setStatus(resStatus.data.data)
        const resReviews = await AxiosToken.get("/dashboard/partner/last-reviews");
        setReviews(resReviews.data.reviews)
      } catch (err) {
        console.error(err)
      }
    }
    dataFetch()
  }, [])
  const STATS_CONFIG = [
    { key: "payment", label: "Revenus totaux", Icon: LuBanknote, accent: "#2563EB", bg: "#EFF6FF" },
    { key: "booking", label: "Réservations totales", Icon: LuTicket, accent: "#7C3AED", bg: "#F5F3FF" },
    { key: "note", label: "Note moyenne", Icon: LuStar, accent: "#D97706", bg: "#FFFBEB" },
    { key: "review", label: "Avis reçus", Icon: LuMessageSquare, accent: "#059669", bg: "#ECFDF5" },
  ]
  const mergedStats = STATS_CONFIG.map((stat) => {
    const apiData = status.find((s) => s.label === stat.key);

    return {
      ...stat,
      value: apiData?.value || "0",
      ...(stat.key !== "note" && { delta: apiData?.delta || 0 }),
    };
  });


  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000)
    if (diff < 60) return "À l'instant"
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
    return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }
  const today = new Date();
  const formatted = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
console.log(reviews)
  return (
    <>
      <Helmet title="Tableau de bord partenaire" />
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6}>

        {/* Header */}
        <Box mb={7}>
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={1}>
            Partenaire {user.partnerInfo[0].sector}
          </Text>
          <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
            Tableau de bord
          </Text>
          <Text fontSize="sm" color="gray.400" mt={0.5}>
            {formatted} · Données en temps réel
          </Text>
        </Box>

        {
          user.partnerInfo[0].sector === "hôtel" ?
          <HotelStatusCard />
          :
          <StatusCard />
        }

        <Grid templateColumns={{ base: "1fr", lg: "1fr" }} gap={5} mb={6}>
          <RevenueChart />
          <BookingsChart />
        </Grid>

        {
          user.partnerInfo[0].sector === "hôtel" ?
          <HotelBooking />
          :
          user.partnerInfo[0].sector === "location de voitures" ?
          <LocationBooking />
          : 
          <CircuitsBooking />
        }

        {user.partnerInfo[0].sector === "hôtel" && 
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
          {reviews && reviews.length === 0 ?
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
                        {r?.clientReview?.name?.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </Flex>
                      <Box>
                        <Text fontSize="xs" fontWeight={700} color="gray.800">{r?.clientReview?.name}</Text>
                      </Box>
                    </Flex>
                    <Flex direction="column" align="flex-end" gap={0.5}>
                      <Stars rating={r.rate} />
                      <Text fontSize="10px" color="gray.400">{new Date(r.createdAt).toLocaleDateString()}</Text>
                    </Flex>
                  </Flex>
                  <Text fontSize="xs" color="gray.600" mt={1} fontStyle="italic">
                    "{r.review}"
                  </Text>
                </Box>
              ))}
            </Grid>
          }
        </Box>
        }
          {user.partnerInfo[0].sector === "hôtel" ?
            <RoomsCard />
          : user.partnerInfo[0].sector === "location de voitures" ?
            <VehicleCard />
          : user.partnerInfo[0].sector === "agence de voyage" ?
            <AgencyCard />
          : user.partnerInfo[0].sector === "compagnies aériennes" ?
            <FlightCard />
          :<CircuitsCard />
        }

      </Box>
    </>
  )
}

export default DashboardPartner