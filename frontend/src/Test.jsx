import { useState } from "react"
import {
  Box, Flex, Grid, Text, Badge, VStack, HStack,
  Table, Avatar,
} from "@chakra-ui/react"
import {
  LuUsers, LuHotel, LuPlane, LuCar, LuCompass,
  LuTrendingUp, LuTrendingDown, LuTicket,
  LuArrowUpRight, LuArrowDownRight, LuCircleDot, LuClock,
  LuBanknote, LuFileText, LuActivity,
} from "react-icons/lu"
import { FaHotel, FaPlane, FaCar, FaRoute } from "react-icons/fa"
import { LucideAlertCircle, LucideCheckCircle } from "lucide-react"

/* ════════════════════════════════════════════════════════════════
   Dummy data
═══════════════════════════════════════════════════════════════════ */
const STATS = [
  { label: "Utilisateurs",     value: "2 847",  delta: +12.4, Icon: LuUsers,      color: "blue",   bg: "#EBF4FF" },
  { label: "Réservations",     value: "1 234",  delta: +8.7,  Icon: LuTicket,     color: "purple", bg: "#F3F0FF" },
  { label: "Revenus (TND)",    value: "94 830", delta: +15.2, Icon: LuBanknote,   color: "green",  bg: "#EEFBF4" },
  { label: "Partenaires",      value: "48",     delta: +4.0,  Icon: LuFileText,   color: "orange", bg: "#FFF7ED" },
]

const SERVICES_STATS = [
  { label: "Hôtels",             value: 14, Icon: FaHotel,  color: "#3182CE", pct: 70 },
  { label: "Vols",               value: 38, Icon: FaPlane,  color: "#805AD5", pct: 55 },
  { label: "Location voitures",  value: 9,  Icon: FaCar,    color: "#38A169", pct: 30 },
  { label: "Circuits voyage",    value: 22, Icon: FaRoute,  color: "#DD6B20", pct: 45 },
]

const MONTHLY = [
  { month: "Oct", rev: 52000, res: 410 },
  { month: "Nov", rev: 61000, res: 490 },
  { month: "Déc", rev: 88000, res: 720 },
  { month: "Jan", rev: 74000, res: 590 },
  { month: "Fév", rev: 82000, res: 650 },
  { month: "Mar", rev: 94830, res: 840 },
]

const RECENT_BOOKINGS = [
  { id: "RES-8821", user: "Ahmed Trabelsi",   type: "Hôtel",   service: "Vincci Helios Beach",     amount: 1260, status: "confirmée",  date: "28 mars 2026" },
  { id: "RES-8820", user: "Sara Ben Ammar",   type: "Vol",     service: "TU301 · Tunis → Paris",   amount: 890,  status: "en attente", date: "27 mars 2026" },
  { id: "RES-8819", user: "Mehdi Jouini",     type: "Voiture", service: "Renault Clio · 3 jours",  amount: 360,  status: "confirmée",  date: "27 mars 2026" },
  { id: "RES-8818", user: "Lina Chaari",      type: "Circuit", service: "Trek Sahara · 3 jours",   amount: 240,  status: "annulée",    date: "26 mars 2026" },
  { id: "RES-8817", user: "Youssef Hamrouni", type: "Hôtel",   service: "Riu Palace Djerba",       amount: 2100, status: "confirmée",  date: "26 mars 2026" },
  { id: "RES-8816", user: "Nour Bettaieb",    type: "Vol",     service: "TU205 · Tunis → Londres", amount: 1100, status: "confirmée",  date: "25 mars 2026" },
]

const RECENT_PARTNERS = [
  { name: "Sahara Trek Tunisie", type: "Circuit",  status: "en attente", date: "28 mars",  initials: "ST" },
  { name: "AutoLux Rentals",     type: "Voiture",  status: "accepté",    date: "27 mars",  initials: "AL" },
  { name: "Tunisair Express",    type: "Airline",  status: "en attente", date: "26 mars",  initials: "TE" },
  { name: "Djerba Resort",       type: "Hôtel",    status: "accepté",    date: "25 mars",  initials: "DR" },
  { name: "Voyage Découverte",   type: "Agence",   status: "refusé",     date: "24 mars",  initials: "VD" },
]

const ACTIVITY = [
  { text: "Nouvel utilisateur inscrit",              time: "il y a 3 min",   type: "user"    },
  { text: "Réservation #RES-8821 confirmée",         time: "il y a 12 min",  type: "booking" },
  { text: "Dossier partenaire soumis — Sahara Trek", time: "il y a 28 min",  type: "partner" },
  { text: "Vol TU301 mis à jour",                    time: "il y a 1h",      type: "service" },
  { text: "Paiement reçu — 2 100 TND",               time: "il y a 2h",      type: "payment" },
  { text: "Avis 5★ posté sur Vincci Helios",         time: "il y a 3h",      type: "review"  },
]

/* ── Helpers ────────────────────────────────────────────────────── */
const STATUS_STYLE = {
  "confirmée":  { color: "green",  bg: "#EEFBF4", text: "#276749" },
  "en attente": { color: "yellow", bg: "#FFFFF0", text: "#744210" },
  "annulée":    { color: "red",    bg: "#FFF5F5", text: "#742A2A" },
  "accepté":    { color: "green",  bg: "#EEFBF4", text: "#276749" },
  "refusé":     { color: "red",    bg: "#FFF5F5", text: "#742A2A" },
}

const TYPE_COLOR = {
  "Hôtel":   { bg: "#EBF4FF", text: "#1A4E8F" },
  "Vol":     { bg: "#F3F0FF", text: "#553C9A" },
  "Voiture": { bg: "#EEFBF4", text: "#1C4532" },
  "Circuit": { bg: "#FFF7ED", text: "#7B341E" },
  "Airline": { bg: "#E9D8FD", text: "#553C9A" },
  "Agence":  { bg: "#FFF5F5", text: "#742A2A" },
}

const ACTIVITY_ICON = {
  user:    { Icon: LuUsers,     color: "#3182CE" },
  booking: { Icon: LuTicket,    color: "#805AD5" },
  partner: { Icon: LuFileText,  color: "#DD6B20" },
  service: { Icon: LuActivity,  color: "#38A169" },
  payment: { Icon: LuBanknote,  color: "#319795" },
  review:  { Icon: LucideCheckCircle, color: "#D69E2E" },
}

/* ── Mini bar chart ─────────────────────────────────────────────── */
function MiniBarChart({ data }) {
  const max = Math.max(...data.map(d => d.rev))
  return (
    <Box>
      <Flex align="flex-end" gap={1.5} h="100px" mb={2}>
        {data.map((d, i) => {
          const pct = (d.rev / max) * 100
          const isLast = i === data.length - 1
          return (
            <Flex key={d.month} direction="column" align="center" flex={1} gap={1}>
              <Box
                w="full" borderRadius="md"
                bg={isLast ? "blue.500" : "blue.100"}
                h={`${pct}%`}
                minH="4px"
                transition="height 0.4s"
              />
            </Flex>
          )
        })}
      </Flex>
      <Flex gap={1.5}>
        {data.map(d => (
          <Text key={d.month} flex={1} textAlign="center"
            fontSize="9px" color="gray.400" fontWeight={500}>
            {d.month}
          </Text>
        ))}
      </Flex>
    </Box>
  )
}

/* ── Donut-style ring ───────────────────────────────────────────── */
function ServiceRing({ pct, color, size = 48 }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <Box as="svg" w={`${size}px`} h={`${size}px`}
      viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <circle cx="24" cy="24" r={r} fill="none"
        stroke="#F0F0F0" strokeWidth="5" />
      <circle cx="24" cy="24" r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
      />
    </Box>
  )
}

/* ════════════════════════════════════════════════════════════════
   Main Dashboard
═══════════════════════════════════════════════════════════════════ */
export default function Test() {
  const [period, setPeriod] = useState("mois")

  return (
    <Box>

      {/* ── Page header ── */}
      <Flex justify="space-between" align="flex-start" mb={7} flexWrap="wrap" gap={4}>
        <Box>
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={1}>
            Vue d'ensemble
          </Text>
          <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
            Tableau de bord
          </Text>
          <Text fontSize="sm" color="gray.400" mt={0.5}>
            Samedi 28 mars 2026 · Données en temps réel
          </Text>
        </Box>
        <Flex gap={1.5} bg="white" borderRadius="xl" p={1}
          border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 4px rgba(0,0,0,0.04)">
          {["jour", "semaine", "mois", "année"].map(p => (
            <Box key={p} as="button"
              px={3} py={1.5} borderRadius="lg"
              fontSize="xs" fontWeight={600}
              bg={period === p ? "blue.600" : "transparent"}
              color={period === p ? "white" : "gray.500"}
              cursor="pointer" transition="all 0.15s"
              textTransform="capitalize"
              onClick={() => setPeriod(p)}>
              {p}
            </Box>
          ))}
        </Flex>
      </Flex>

      {/* ── KPI cards ── */}
      <Grid templateColumns={{ base: "1fr 1fr", lg: "repeat(4, 1fr)" }} gap={4} mb={6}>
        {STATS.map(({ label, value, delta, Icon, color, bg }) => {
          const up = delta > 0
          return (
            <Box key={label} bg="white" borderRadius="2xl" p={5}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 8px rgba(0,0,0,0.05)"
              transition="box-shadow 0.2s"
              _hover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <Flex justify="space-between" align="flex-start" mb={4}>
                <Flex w="42px" h="42px" borderRadius="xl"
                  bg={bg} color={`${color}.500`}
                  align="center" justify="center" flexShrink={0}>
                  <Icon size={18} />
                </Flex>
                <Flex align="center" gap={0.5}
                  bg={up ? "green.50" : "red.50"}
                  borderRadius="full" px={2} py={0.5}>
                  {up
                    ? <LuArrowUpRight size={11} color="#276749" />
                    : <LuArrowDownRight size={11} color="#742A2A" />}
                  <Text fontSize="xs" fontWeight={700}
                    color={up ? "green.700" : "red.700"}>
                    {Math.abs(delta)}%
                  </Text>
                </Flex>
              </Flex>
              <Text fontSize="2xl" fontWeight={900} color="gray.900" lineHeight={1} mb={0.5}>
                {value}
              </Text>
              <Text fontSize="xs" color="gray.400">{label}</Text>
              <Text fontSize="xs" color="gray.300" mt={0.5}>
                vs. {period} précédent{period === "mois" ? "" : "e"}
              </Text>
            </Box>
          )
        })}
      </Grid>

      {/* ── Row 2: chart + services + activity ── */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 280px 260px" }} gap={5} mb={5}>

        {/* Revenue chart */}
        <Box bg="white" borderRadius="2xl" p={5}
          border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 8px rgba(0,0,0,0.05)">
          <Flex justify="space-between" align="center" mb={5}>
            <Box>
              <Text fontSize="sm" fontWeight={700} color="gray.700">Revenus mensuels</Text>
              <Text fontSize="xs" color="gray.400">6 derniers mois</Text>
            </Box>
            <Box textAlign="right">
              <Text fontSize="xl" fontWeight={900} color="blue.600">
                94 830 TND
              </Text>
              <Flex align="center" gap={1} justify="flex-end">
                <LuArrowUpRight size={11} color="#276749" />
                <Text fontSize="xs" color="green.600" fontWeight={600}>+15.2%</Text>
              </Flex>
            </Box>
          </Flex>
          <MiniBarChart data={MONTHLY} />
          {/* Reservation count line */}
          <Flex gap={1.5} mt={4} pt={4} borderTop="1px solid" borderColor="gray.50">
            {MONTHLY.map((d, i) => (
              <Flex key={d.month} direction="column" align="center" flex={1} gap={1}>
                <Box
                  w="full" borderRadius="full" h="3px"
                  bg={i === MONTHLY.length - 1 ? "purple.400" : "purple.100"} />
                <Text fontSize="9px" color="gray.400">{d.res}</Text>
              </Flex>
            ))}
          </Flex>
          <Flex gap={4} mt={2}>
            <Flex align="center" gap={1.5}>
              <Box w="10px" h="10px" borderRadius="sm" bg="blue.400" />
              <Text fontSize="xs" color="gray.400">Revenus</Text>
            </Flex>
            <Flex align="center" gap={1.5}>
              <Box w="10px" h="3px" borderRadius="full" bg="purple.400" />
              <Text fontSize="xs" color="gray.400">Réservations</Text>
            </Flex>
          </Flex>
        </Box>

        {/* Services breakdown */}
        <Box bg="white" borderRadius="2xl" p={5}
          border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 8px rgba(0,0,0,0.05)">
          <Text fontSize="sm" fontWeight={700} color="gray.700" mb={1}>
            Répartition services
          </Text>
          <Text fontSize="xs" color="gray.400" mb={5}>Partenaires actifs</Text>
          <VStack align="stretch" spacing={4}>
            {SERVICES_STATS.map(({ label, value, Icon, color, pct }) => (
              <Flex key={label} align="center" gap={3}>
                <ServiceRing pct={pct} color={color} size={40} />
                <Box flex={1}>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="xs" fontWeight={600} color="gray.700">{label}</Text>
                    <Text fontSize="xs" fontWeight={800} color="gray.800">{value}</Text>
                  </Flex>
                  <Box bg="gray.100" borderRadius="full" h="3px" overflow="hidden">
                    <Box bg={color} h="100%" borderRadius="full" w={`${pct}%`} />
                  </Box>
                </Box>
              </Flex>
            ))}
          </VStack>

          <Box mt={5} pt={4} borderTop="1px solid" borderColor="gray.50">
            <Flex justify="space-between">
              <Text fontSize="xs" color="gray.400">Total partenaires</Text>
              <Text fontSize="sm" fontWeight={800} color="gray.900">48</Text>
            </Flex>
          </Box>
        </Box>

        {/* Live activity feed */}
        <Box bg="white" borderRadius="2xl" p={5}
          border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 8px rgba(0,0,0,0.05)">
          <Flex align="center" gap={2} mb={5}>
            <Box w="7px" h="7px" borderRadius="full" bg="green.400"
              style={{ animation: "pulse 2s infinite" }} />
            <Text fontSize="sm" fontWeight={700} color="gray.700">Activité récente</Text>
          </Flex>
          <VStack align="stretch" spacing={0}>
            {ACTIVITY.map(({ text, time, type }, i) => {
              const { Icon, color } = ACTIVITY_ICON[type]
              return (
                <Flex key={i} gap={3} py={3}
                  borderBottom={i < ACTIVITY.length - 1 ? "1px solid" : "none"}
                  borderColor="gray.50">
                  <Flex w="28px" h="28px" borderRadius="lg" flexShrink={0}
                    bg={color + "15"} align="center" justify="center">
                    <Icon size={13} color={color} />
                  </Flex>
                  <Box flex={1}>
                    <Text fontSize="xs" color="gray.700" fontWeight={500} lineHeight="1.4">
                      {text}
                    </Text>
                    <Text fontSize="10px" color="gray.400" mt={0.5}>{time}</Text>
                  </Box>
                </Flex>
              )
            })}
          </VStack>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.4; }
            }
          `}</style>
        </Box>

      </Grid>

      {/* ── Row 3: reservations table + partners ── */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 340px" }} gap={5}>

        {/* Recent bookings table */}
        <Box bg="white" borderRadius="2xl"
          border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 8px rgba(0,0,0,0.05)" overflow="hidden">

          <Flex px={5} py={4} borderBottom="1px solid" borderColor="gray.100"
            align="center" justify="space-between">
            <Box>
              <Text fontSize="sm" fontWeight={700} color="gray.700">Réservations récentes</Text>
              <Text fontSize="xs" color="gray.400">6 dernières transactions</Text>
            </Box>
            <Badge colorScheme="blue" borderRadius="full" px={2.5} py={0.5}
              fontSize="xs" fontWeight={700}>
              1 234 total
            </Badge>
          </Flex>

          <Box overflowX="auto">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row bg="gray.50">
                  {["ID", "Client", "Service", "Type", "Montant", "Statut", "Date"].map(h => (
                    <Table.ColumnHeader key={h} px={4} py={3}
                      fontSize="xs" fontWeight={700} color="gray.500"
                      textTransform="uppercase" letterSpacing="wider">
                      {h}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {RECENT_BOOKINGS.map((b, i) => {
                  const s = STATUS_STYLE[b.status]
                  const t = TYPE_COLOR[b.type] ?? { bg: "#F0F0F0", text: "#555" }
                  return (
                    <Table.Row key={b.id}
                      borderTop="1px solid" borderColor="gray.50"
                      _hover={{ bg: "gray.50" }} transition="background 0.1s">
                      <Table.Cell px={4} py={3}>
                        <Text fontSize="xs" color="gray.400" fontFamily="mono"
                          fontWeight={600}>{b.id}</Text>
                      </Table.Cell>
                      <Table.Cell px={4} py={3}>
                        <Flex align="center" gap={2}>
                          <Flex w="26px" h="26px" borderRadius="full"
                            bg="blue.100" color="blue.700"
                            align="center" justify="center"
                            fontSize="9px" fontWeight={700} flexShrink={0}>
                            {b.user.split(" ").map(w => w[0]).join("").slice(0,2)}
                          </Flex>
                          <Text fontSize="xs" fontWeight={600} color="gray.800" noOfLines={1}>
                            {b.user}
                          </Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell px={4} py={3}>
                        <Text fontSize="xs" color="gray.600" noOfLines={1} maxW="140px">
                          {b.service}
                        </Text>
                      </Table.Cell>
                      <Table.Cell px={4} py={3}>
                        <Box px={2} py={0.5} borderRadius="md" display="inline-block"
                          bg={t.bg}>
                          <Text fontSize="10px" fontWeight={700} color={t.text}>
                            {b.type}
                          </Text>
                        </Box>
                      </Table.Cell>
                      <Table.Cell px={4} py={3}>
                        <Text fontSize="xs" fontWeight={800} color="gray.800">
                          {b.amount.toLocaleString()} TND
                        </Text>
                      </Table.Cell>
                      <Table.Cell px={4} py={3}>
                        <Box px={2} py={0.5} borderRadius="full" display="inline-block"
                          bg={s.bg}>
                          <Text fontSize="10px" fontWeight={700} color={s.text}
                            textTransform="capitalize">
                            {b.status}
                          </Text>
                        </Box>
                      </Table.Cell>
                      <Table.Cell px={4} py={3}>
                        <Text fontSize="xs" color="gray.400">{b.date}</Text>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>

        {/* Recent partner requests */}
        <Box bg="white" borderRadius="2xl"
          border="1px solid" borderColor="gray.100"
          boxShadow="0 1px 8px rgba(0,0,0,0.05)" overflow="hidden">

          <Flex px={5} py={4} borderBottom="1px solid" borderColor="gray.100"
            align="center" justify="space-between">
            <Box>
              <Text fontSize="sm" fontWeight={700} color="gray.700">Demandes partenaires</Text>
              <Text fontSize="xs" color="gray.400">En attente de validation</Text>
            </Box>
            <Flex align="center" gap={1.5} bg="orange.50" borderRadius="full"
              px={2.5} py={1} border="1px solid" borderColor="orange.200">
              <LucideAlertCircle size={11} color="#C05621" />
              <Text fontSize="xs" fontWeight={700} color="orange.700">2 en attente</Text>
            </Flex>
          </Flex>

          <VStack align="stretch" spacing={0} px={5} py={3}>
            {RECENT_PARTNERS.map((p, i) => {
              const s = STATUS_STYLE[p.status]
              const t = TYPE_COLOR[p.type] ?? { bg: "#F0F0F0", text: "#555" }
              return (
                <Flex key={i} align="center" gap={3} py={3}
                  borderBottom={i < RECENT_PARTNERS.length - 1 ? "1px solid" : "none"}
                  borderColor="gray.50">
                  <Flex w="38px" h="38px" borderRadius="xl" flexShrink={0}
                    bg="blue.50" color="blue.600"
                    align="center" justify="center"
                    fontSize="xs" fontWeight={800}>
                    {p.initials}
                  </Flex>
                  <Box flex={1} minW={0}>
                    <Text fontSize="sm" fontWeight={700} color="gray.800" noOfLines={1}>
                      {p.name}
                    </Text>
                    <Flex align="center" gap={1.5} mt={0.5}>
                      <Box px={1.5} py={0.5} borderRadius="sm" bg={t.bg}>
                        <Text fontSize="9px" fontWeight={700} color={t.text}>{p.type}</Text>
                      </Box>
                      <Text fontSize="xs" color="gray.400">{p.date}</Text>
                    </Flex>
                  </Box>
                  <Box px={2} py={0.5} borderRadius="full" bg={s.bg} flexShrink={0}>
                    <Text fontSize="10px" fontWeight={700} color={s.text}
                      textTransform="capitalize">
                      {p.status}
                    </Text>
                  </Box>
                </Flex>
              )
            })}
          </VStack>

          <Box px={5} pb={4}>
            <Box
              as="button" w="full" py={2.5} borderRadius="xl"
              border="1.5px solid" borderColor="gray.200"
              bg="white" color="gray.500" fontSize="sm" fontWeight={600}
              cursor="pointer" transition="all 0.15s"
              _hover={{ bg: "gray.50", borderColor: "gray.300", color: "gray.700" }}>
              Voir tous les dossiers →
            </Box>
          </Box>
        </Box>

      </Grid>

    </Box>
  )
}