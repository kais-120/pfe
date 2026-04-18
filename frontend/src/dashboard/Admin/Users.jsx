import { useEffect, useState } from "react"
import {
  Table, Box, Badge, Button, Dialog, Portal, CloseButton,
  Input, Flex, Pagination, ButtonGroup, IconButton, Text,
  Skeleton, VStack, Avatar,
} from "@chakra-ui/react"
import { AxiosToken } from "../../Api/Api"
import { useNavigate } from "react-router-dom"
import { Plus, Trash2 } from "lucide-react"
import { LuChevronLeft, LuChevronRight, LuSearch, LuUsers, LuShieldAlert } from "react-icons/lu"
import { Helmet } from "react-helmet"

const PAGE_SIZE = 8

const ROLE_STYLE = {
  admin: { colorScheme: "red", label: "Admin" },
  partner: { colorScheme: "purple", label: "Partenaire" },
  client: { colorScheme: "blue", label: "Client" },
}

const Users = () => {
  const [data, setData] = useState([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const getDocs = async () => {
      try {
        setLoading(true)
        const res = await AxiosToken.get("/user/all")
        setData(res.data.users ?? [])
      } catch {
        console.error("Failed to load users")
      } finally {
        setLoading(false)
      }
    }
    getDocs()
  }, [])

  const handleDelete = async (id) => {
    try {
      await AxiosToken.delete(`/user/${id}`)
      setData(prev => prev.filter(u => u.id !== id))
    } catch {
      console.error("Delete failed")
    }
  }

  // Filter by search
  const filtered = data.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  )

  // Paginate
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset page on search
  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const initials = (name) =>
    name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "?"

  return (
    <>
      <Helmet title="Utilisateurs"></Helmet>
      <Box>
        {/* Page title */}
        <Box mb={6}>
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={1}>
            Administration
          </Text>
          <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
            Utilisateurs
          </Text>
        </Box>

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
            {/* Search */}
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
                placeholder="Rechercher un utilisateur…"
                value={search}
                outline={"none"}
                onChange={handleSearch}
                _focus={{ boxShadow: "none" }}
                _placeholder={{ color: "gray.300" }}
              />
            </Flex>

            <Flex align="center" gap={3}>
              {!loading && (
                <Text fontSize="sm" color="gray.400">
                  {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""}
                </Text>
              )}
              <Button
                colorScheme="blue" borderRadius="xl"
                size="sm" px={4} fontWeight={600}
                onClick={() => navigate("create")}
              >
                <Flex align="center" gap={2}>
                  <Plus size={14} />
                  Ajouter
                </Flex>
              </Button>
            </Flex>
          </Flex>

          {/* Table */}
          <Box overflowX="auto">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row bg="gray.50">
                  {["#", "Utilisateur", "Email", "Rôle", "Action"].map((h, i) => (
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
                  Array.from({ length: 6 }).map((_, i) => (
                    <Table.Row key={i}>
                      {[1, 2, 3, 4, 5].map(j => (
                        <Table.Cell key={j} px={5} py={3.5}>
                          <Skeleton h="16px" borderRadius="md" w={j === 1 ? "20px" : j === 5 ? "60px" : "120px"} />
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                ) : paginated.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} px={5} py={16} textAlign="center">
                      <VStack gap={2}>
                        <Text fontWeight={600} color="gray.600">Aucun utilisateur trouvé</Text>
                        <Text fontSize="sm" color="gray.400">
                          {search ? "Essayez une autre recherche." : "Ajoutez votre premier utilisateur."}
                        </Text>
                      </VStack>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  paginated.map((user, index) => {
                    const roleStyle = ROLE_STYLE[user.role] ?? { colorScheme: "gray", label: user.role }
                    const rowNum = (page - 1) * PAGE_SIZE + index + 1

                    return (
                      <Table.Row
                        key={user.id}
                        borderTop="1px solid" borderColor="gray.50"
                        _hover={{ bg: "gray.50" }}
                        transition="background 0.1s"
                      >
                        <Table.Cell px={5} py={3.5}>
                          <Text fontSize="xs" color="gray.400" fontWeight={600}>{rowNum}</Text>
                        </Table.Cell>

                        <Table.Cell px={5} py={3.5}>
                          <Flex align="center" gap={3}>
                            <Flex
                              w="32px" h="32px" borderRadius="full"
                              bg="blue.100" color="blue.700"
                              align="center" justify="center"
                              fontSize="10px" fontWeight={700} flexShrink={0}
                            >
                              {initials(user.name)}
                            </Flex>
                            <Text fontSize="sm" fontWeight={600} color="gray.800">
                              {user.name}
                            </Text>
                          </Flex>
                        </Table.Cell>

                        <Table.Cell px={5} py={3.5}>
                          <Text fontSize="sm" color="gray.500">{user.email}</Text>
                        </Table.Cell>

                        <Table.Cell px={5} py={3.5}>
                          <Badge
                            colorScheme={roleStyle.colorScheme}
                            borderRadius="full" px={2.5} py={0.5}
                            fontSize="xs" fontWeight={600}
                            textTransform="capitalize"
                          >
                            {roleStyle.label}
                          </Badge>
                        </Table.Cell>

                        <Table.Cell px={5} py={3.5} textAlign="right">
                          <Dialog.Root>
                            <Dialog.Trigger asChild>
                              <IconButton disabled={user.role === 'admin'}
                                size="xs" variant="ghost"
                                color="red.400" borderRadius="lg"
                                _hover={{ bg: "red.50", color: "red.500" }}
                                aria-label="Supprimer"
                              >
                                <Trash2 size={13} />
                              </IconButton>
                            </Dialog.Trigger>
                            <Portal>
                              <Dialog.Backdrop />
                              <Dialog.Positioner>
                                <Dialog.Content borderRadius="2xl" overflow="hidden">
                                  {/* Dialog header */}
                                  <Box bg="red.50" px={6} py={5}
                                    borderBottom="1px solid" borderColor="red.100">
                                    <Flex align="center" gap={3}>
                                      <Flex w="36px" h="36px" borderRadius="xl"
                                        bg="red.100" color="red.500"
                                        align="center" justify="center" flexShrink={0}>
                                        <LuShieldAlert size={16} />
                                      </Flex>
                                      <Dialog.Title fontSize="md" fontWeight={700} color="gray.900">
                                        Supprimer l'utilisateur
                                      </Dialog.Title>
                                    </Flex>
                                  </Box>

                                  <Dialog.Body px={6} py={5}>
                                    <Text fontSize="sm" color="gray.600" lineHeight="1.7">
                                      Vous êtes sur le point de supprimer{" "}
                                      <Text as="span" fontWeight={700} color="gray.800">
                                        {user.name}
                                      </Text>
                                      . Cette action est <Text as="span" color="red.500" fontWeight={600}>irréversible</Text> — toutes les données associées seront définitivement perdues.
                                    </Text>
                                  </Dialog.Body>

                                  <Dialog.Footer
                                    px={6} py={4}
                                    borderTop="1px solid" borderColor="gray.100"
                                    gap={3}
                                  >
                                    <Dialog.ActionTrigger asChild>
                                      <Button variant="outline" borderRadius="xl"
                                        size="sm" color="gray.500">
                                        Annuler
                                      </Button>
                                    </Dialog.ActionTrigger>
                                    <Button
                                      colorScheme="red" borderRadius="xl"
                                      size="sm" fontWeight={700}
                                      onClick={() => handleDelete(user.id)}
                                    >
                                      <Flex align="center" gap={1.5}>
                                        <Trash2 size={13} />
                                        Supprimer définitivement
                                      </Flex>
                                    </Button>
                                  </Dialog.Footer>

                                  <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" position="absolute" top={3} right={3} />
                                  </Dialog.CloseTrigger>
                                </Dialog.Content>
                              </Dialog.Positioner>
                            </Portal>
                          </Dialog.Root>
                        </Table.Cell>

                      </Table.Row>
                    )
                  })
                )}
              </Table.Body>
            </Table.Root>
          </Box>

          {/* Pagination */}
          {!loading && filtered.length > PAGE_SIZE && (
            <Flex
              px={5} py={4}
              borderTop="1px solid" borderColor="gray.100"
              justify="space-between" align="center"
            >
              <Text fontSize="xs" color="gray.400">
                Page {page} / {totalPages} · {filtered.length} résultats
              </Text>
              <Pagination.Root
                count={filtered.length}
                pageSize={PAGE_SIZE}
                page={page}
                onPageChange={(e) => setPage(e.page)}
              >
                <ButtonGroup size="sm" variant="ghost" gap={1}>
                  <Pagination.PrevTrigger asChild>
                    <IconButton
                      borderRadius="lg" color="gray.500"
                      _hover={{ bg: "gray.100" }}
                      isDisabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      <LuChevronLeft />
                    </IconButton>
                  </Pagination.PrevTrigger>

                  <Pagination.Items
                    render={(p) => (
                      <IconButton
                        borderRadius="lg"
                        bg={p.value === page ? "blue.50" : "transparent"}
                        color={p.value === page ? "blue.600" : "gray.500"}
                        fontWeight={p.value === page ? 700 : 400}
                        border={p.value === page ? "1.5px solid" : "none"}
                        borderColor="blue.200"
                        onClick={() => setPage(p.value)}
                      >
                        {p.value}
                      </IconButton>
                    )}
                  />

                  <Pagination.NextTrigger asChild>
                    <IconButton
                      borderRadius="lg" color="gray.500"
                      _hover={{ bg: "gray.100" }}
                      isDisabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      <LuChevronRight />
                    </IconButton>
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>
            </Flex>
          )}

        </Box>
      </Box>
    </>
  )
}

export default Users