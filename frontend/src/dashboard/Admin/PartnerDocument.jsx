import { useEffect, useState } from "react"
import {
  Table, Box, Badge, Button, Input,
  Flex, Text, Skeleton, VStack, IconButton,
} from "@chakra-ui/react"
import { AxiosToken } from "../../Api/Api"
import { useNavigate } from "react-router-dom"
import { LuSearch, LuEye, LuFileText, LuClock } from "react-icons/lu"
import { LucideCheckCircle, LucideXCircle } from "lucide-react"

const STATUS_STYLE = {
  "en attente": { colorScheme: "yellow", icon: LuClock,       label: "En attente" },
  "accepté":    { colorScheme: "green",  icon: LucideCheckCircle, label: "Accepté"    },
  "rejetée":     { colorScheme: "red",    icon: LucideXCircle,     label: "rejetée"     },
}

const PartnerDocument = () => {
  const [data,    setData]    = useState([])
  const [search,  setSearch]  = useState("")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const getDocs = async () => {
      try {
        setLoading(true)
        const res = await AxiosToken.get("/user/admin/partner/documents")
        setData(res.data.partnerFiles ?? [])
      } catch {
        console.error("Failed to load documents")
      } finally {
        setLoading(false)
      }
    }
    getDocs()
  }, [])
console.log(data)
  const filtered = data.filter(doc =>
    doc.cin?.toLowerCase().includes(search.toLowerCase()) ||
    doc.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
    doc.users?.email?.toLowerCase().includes(search.toLowerCase()) ||
    doc.status?.toLowerCase().includes(search.toLowerCase())
  )

  const pending  = data.filter(d => d.status === "en attente").length
  const accepted = data.filter(d => d.status === "accepté").length
  const refused  = data.filter(d => d.status === "rejetée").length

  return (
    <Box>
      {/* Page title */}
      <Box mb={6}>
        <Text fontSize="xs" fontWeight={700} color="blue.500"
          textTransform="uppercase" letterSpacing="widest" mb={1}>
          Administration
        </Text>
        <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Documents partenaires
        </Text>
      </Box>

      {/* Stat pills */}
      {!loading && data.length > 0 && (
        <Flex gap={3} mb={5} flexWrap="wrap">
          {[
            { label:"Total",value: data.length,color: "blue"   },
            { label:"En attente",value: pending,color: "yellow" },
            { label:"Acceptés",value: accepted,color: "green"  },
            { label:"Rejetées",value: refused,color: "red"    },
          ].map(({ label, value, color }) => (
            <Flex
              key={label}
              align="center" gap={2}
              bg="white" borderRadius="xl" px={4} py={2.5}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 4px rgba(0,0,0,0.04)"
            >
              <Text fontSize="lg" fontWeight={900} color={`${color}.500`}>{value}</Text>
              <Text fontSize="xs" color="gray.500" fontWeight={500}>{label}</Text>
            </Flex>
          ))}
        </Flex>
      )}

      {/* Main card */}
      <Box
        bg="white" borderRadius="2xl"
        border="1px solid" borderColor="gray.100"
        boxShadow="0 1px 8px rgba(0,0,0,0.05)"
        overflow="hidden"
      >
        {/* Toolbar */}
        <Flex
          px={5} py={4}
          borderBottom="1px solid" borderColor="gray.100"
          justify="space-between" align="center"
          flexWrap="wrap" gap={3}
        >
          <Flex
            align="center" gap={2}
            border="1.5px solid" borderColor="gray.200"
            borderRadius="xl" px={3} h="40px"
            bg="gray.50" maxW="300px" w="full"
            transition="all 0.15s"
            _focusWithin={{
              borderColor: "blue.400", bg: "white",
              boxShadow: "0 0 0 3px rgba(49,130,206,0.12)"
            }}
          >
            <Box color="gray.400" flexShrink={0}><LuSearch size={14} /></Box>
            <Input
              border="none" bg="transparent" px={0} h="full"
              fontSize="sm" color="gray.800" flex={1}
              placeholder="Rechercher par CIN, partenaire…"
              value={search}
              outline={"none"}
              onChange={e => setSearch(e.target.value)}
              _focus={{ boxShadow: "none" }}
              _placeholder={{ color: "gray.300" }}
            />
          </Flex>

          {!loading && (
            <Text fontSize="sm" color="gray.400">
              {filtered.length} dossier{filtered.length !== 1 ? "s" : ""}
            </Text>
          )}
        </Flex>

        {/* Table */}
        <Box overflowX="auto">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row bg="gray.50">
                {["#", "CIN", "Partenaire", "Email", "Statut", "Secteur d'activité" ,"Action"].map((h, i) => (
                  <Table.ColumnHeader
                    key={i} px={5} py={3}
                    fontSize="xs" fontWeight={700}
                    color="gray.500" textTransform="uppercase"
                    letterSpacing="wider"
                    textAlign={h === "Action" ? "right" : "left"}
                  >
                    {h}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Table.Row key={i}>
                    {[1,2,3,4,5,6].map(j => (
                      <Table.Cell key={j} px={5} py={3.5}>
                        <Skeleton h="16px" borderRadius="md"
                          w={j === 1 ? "20px" : j === 5 ? "80px" : j === 6 ? "50px" : "120px"} />
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))
              ) : filtered.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={6} px={5} py={16} textAlign="center">
                    <VStack gap={2}>
                      <Text fontWeight={600} color="gray.600">Aucun dossier trouvé</Text>
                      <Text fontSize="sm" color="gray.400">
                        {search ? "Essayez une autre recherche." : "Aucun document partenaire pour le moment."}
                      </Text>
                    </VStack>
                  </Table.Cell>
                </Table.Row>
              ) : (
                filtered.map((doc, index) => {
                  const s    = STATUS_STYLE[doc.status] ?? { colorScheme: "gray", label: doc.status, icon: LuFileText }
                  const Icon = s.icon

                  return (
                    <Table.Row
                      key={doc.id}
                      borderTop="1px solid" borderColor="gray.50"
                      _hover={{ bg: "gray.50" }}
                      transition="background 0.1s"
                    >
                      <Table.Cell px={5} py={3.5}>
                        <Text fontSize="xs" color="gray.400" fontWeight={600}>{index + 1}</Text>
                      </Table.Cell>

                      <Table.Cell px={5} py={3.5}>
                        <Text fontSize="sm" fontWeight={700} color="gray.800"
                          fontFamily="mono" letterSpacing="wide">
                          {doc.cin}
                        </Text>
                      </Table.Cell>

                      <Table.Cell px={5} py={3.5}>
                        <Flex align="center" gap={2.5}>
                          <Flex
                            w="30px" h="30px" borderRadius="full"
                            bg="blue.100" color="blue.700"
                            align="center" justify="center"
                            fontSize="10px" fontWeight={700} flexShrink={0}
                          >
                            {doc.users?.name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
                          </Flex>
                          <Text fontSize="sm" fontWeight={600} color="gray.800">
                            {doc.users?.name}
                          </Text>
                        </Flex>
                      </Table.Cell>

                      <Table.Cell px={5} py={3.5}>
                        <Text fontSize="sm" color="gray.500">{doc.users?.email}</Text>
                      </Table.Cell>

                      <Table.Cell px={5} py={3.5}>
                        <Badge
                          colorScheme={s.colorScheme}
                          borderRadius="full" px={2.5} py={0.5}
                          fontSize="xs" fontWeight={600}
                        >
                          <Flex align="center" gap={1}>
                            <Icon size={10} />
                            {s.label}
                          </Flex>
                        </Badge>
                      </Table.Cell>

                       <Table.Cell px={5} py={3.5}>
                        <Text textTransform={"capitalize"} fontSize="sm" color="gray.500">{doc.sector}</Text>
                      </Table.Cell>

                      <Table.Cell px={5} py={3.5} textAlign="right">
                        <Button
                          size="xs" variant="outline"
                          borderRadius="lg" borderColor="blue.200"
                          color="blue.500" fontWeight={600}
                          _hover={{ bg: "blue.50" }}
                          onClick={() => navigate(doc.id)}
                        >
                          <Flex align="center" gap={1.5}>
                            <LuEye size={12} />
                            Voir
                          </Flex>
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  )
                })
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>
    </Box>
  )
}

export default PartnerDocument