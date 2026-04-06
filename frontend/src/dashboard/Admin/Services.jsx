import { useEffect, useState } from "react"
import {
    Box, Flex, Grid, Badge, Button, Dialog, Portal, CloseButton,
    Input, Text, Skeleton, VStack, IconButton, Tabs,
    Table, Drawer, ScrollArea,
} from "@chakra-ui/react"
import { AxiosToken } from "../../Api/Api"
import { useNavigate } from "react-router-dom"
import { Trash2, Eye } from "lucide-react"
import { LuSearch, LuHotel, LuPlane, LuCar, LuCompass, LuBuilding2, LuShieldAlert, LuMapPin, LuPhone, LuMail } from "react-icons/lu"
import { Helmet } from "react-helmet"

const STATUS_STYLE = {
    accept: { color: "green", bg: "#EEFBF4", text: "#276749", label: "Accepté" },
    pending: { color: "yellow", bg: "#FFFFF0", text: "#744210", label: "En attente" },
    rejected: { color: "red", bg: "#FFF5F5", text: "#742A2A", label: "Rejeté" },
}

const SERVICE_ICONS = {
    hotels: { Icon: LuHotel, color: "#3182CE", label: "Hôtels" },
    agences: { Icon: LuBuilding2, color: "#805AD5", label: "Agences" },
    compagnies: { Icon: LuPlane, color: "#DD6B20", label: "Compagnies aériennes" },
    locations: { Icon: LuCar, color: "#38A169", label: "Location de voitures" },
    voyages: { Icon: LuCompass, color: "#C05621", label: "Circuits de voyage" },
}

const Services = () => {
    const [allData, setAllData] = useState({
        hotels: [],
        agences: [],
        compagnies: [],
        locations: [],
        voyages: [],
    })
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("hotels")
    const [selectedService, setSelectedService] = useState(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await AxiosToken.get("/service/get")
                setAllData(res.data.data || {
                    hotels: [],
                    agences: [],
                    compagnies: [],
                    locations: [],
                    voyages: [],
                })
            } catch {
                console.error("Failed to load services")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleDelete = async (id, type) => {
        try {
            await AxiosToken.delete(`/service/${type}/${id}`)
            setAllData(prev => ({
                ...prev,
                [type]: prev[type].filter(s => s.id !== id)
            }))
        } catch {
            console.error("Delete failed")
        }
    }

    const handleViewDetails = (service, type) => {
        setSelectedService({ ...service, type })
        setDrawerOpen(true)
    }

    // Filter data based on search
    const filterData = (items) =>
        items.filter(item =>
            item.name?.toLowerCase().includes(search.toLowerCase()) ||
            item.email?.toLowerCase().includes(search.toLowerCase()) ||
            item.phone?.toLowerCase().includes(search.toLowerCase())
        )

    const filteredData = {
        hotels: filterData(allData.hotels),
        agences: filterData(allData.agences),
        compagnies: filterData(allData.compagnies),
        locations: filterData(allData.locations),
        voyages: filterData(allData.voyages),
    }

    return (
        <>
            <Helmet title="Services"></Helmet>
            <Box>
                {/* Page header */}
                <Box mb={8}>
                    <Text fontSize="xs" fontWeight={700} color="blue.500"
                        textTransform="uppercase" letterSpacing="widest" mb={1}>
                        Gestion
                    </Text>
                    <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px" mb={2}>
                        Services
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                        Gérez tous les services partenaires.
                    </Text>
                </Box>

                {/* Stats cards */}
                <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }} gap={3} mb={8}>
                    {Object.entries(SERVICE_ICONS).map(([key, { Icon, label, color }]) => (
                        <Box key={key}
                            bg="white" borderRadius="xl" p={4}
                            border="1px solid" borderColor="gray.100"
                            boxShadow="0 1px 4px rgba(0,0,0,0.05)"
                            cursor="pointer" transition="all 0.2s"
                            _hover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderColor: "gray.200" }}
                            onClick={() => setActiveTab(key)}
                        >
                            <Flex align="center" gap={3}>
                                <Flex w="36px" h="36px" borderRadius="lg"
                                    bg={`${color}15`} color={color}
                                    align="center" justify="center" flexShrink={0}>
                                    <Icon size={16} />
                                </Flex>
                                <Box>
                                    <Text fontSize="xs" color="gray.400" fontWeight={600}>{label}</Text>
                                    <Text fontSize="lg" fontWeight={800} color="gray.800">
                                        {allData[key]?.length || 0}
                                    </Text>
                                </Box>
                            </Flex>
                        </Box>
                    ))}
                </Grid>

                {/* Main card */}
                <Box
                    bg="white" borderRadius="2xl"
                    border="1px solid" borderColor="gray.100"
                    boxShadow="0 1px 8px rgba(0,0,0,0.05)"
                    overflow="hidden"
                >
                    {/* Toolbar */}
                    <Flex
                        px={6} py={5}
                        borderBottom="1px solid" borderColor="gray.100"
                        justify="space-between" align="center"
                        flexWrap="wrap" gap={4}
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
                                placeholder="Rechercher un service…"
                                value={search}
                                outline="none"
                                onChange={(e) => setSearch(e.target.value)}
                                _focus={{ boxShadow: "none" }}
                                _placeholder={{ color: "gray.300" }}
                            />
                        </Flex>

                        {!loading && (
                            <Text fontSize="sm" color="gray.400">
                                {filteredData[activeTab]?.length || 0} résultat{(filteredData[activeTab]?.length || 0) !== 1 ? "s" : ""}
                            </Text>
                        )}
                    </Flex>

                    {/* Tabs */}
                    <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
                        <Tabs.List borderBottom="1px solid" borderColor="gray.100" px={6} bg="gray.50">
                            {Object.entries(SERVICE_ICONS).map(([key, { Icon, label }]) => (
                                <Tabs.Trigger key={key} value={key} fontSize="sm" fontWeight={600} color="gray.500"
                                    _selected={{ color: "blue.600", borderColor: "blue.600" }}>
                                    <Flex align="center" gap={2}>
                                        <Icon size={14} />
                                        {label}
                                    </Flex>
                                </Tabs.Trigger>
                            ))}
                        </Tabs.List>

                        {/* Hotels Tab */}
                        <Tabs.Content value="hotels">
                            <ServiceTable
                                items={filteredData.hotels}
                                loading={loading}
                                type="hotels"
                                onViewDetails={handleViewDetails}
                                onDelete={handleDelete}
                                renderRow={(item) => (
                                    <>
                                        <Table.Cell px={5} py={3.5}>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight={600} color="gray.800">{item.partnerHotel?.partnerInfo[0]?.cin}</Text>
                                            </VStack>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight={600} color="gray.800">{item.name}</Text>
                                            </VStack>
                                        </Table.Cell>

                                        <Table.Cell px={5} py={3.5}>
                                            <Text fontSize="sm" color="gray.600">{item.partnerHotel?.phone}</Text>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <Text fontSize="sm" color="gray.600" noOfLines={1}>{item.partnerHotel?.email}</Text>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <StatusBadge status={item.status} />
                                        </Table.Cell>
                                    </>
                                )}
                            />
                        </Tabs.Content>

                        {/* Agencies Tab */}
                        <Tabs.Content value="agences">
                            <ServiceTable
                                items={filteredData.agences}
                                loading={loading}
                                type="agences"
                                onViewDetails={handleViewDetails}
                                onDelete={handleDelete}
                                renderRow={(item) => (
                                    <>
                                        <Table.Cell px={5} py={3.5}>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight={600} color="gray.800">{item.partnerAgence?.partnerInfo[0]?.cin}</Text>
                                            </VStack>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight={600} color="gray.800">{item.name}</Text>
                                            </VStack>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <Text fontSize="sm" color="gray.600">{item.phone}</Text>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <Text fontSize="sm" color="gray.600" noOfLines={1}>{item.email}</Text>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <StatusBadge status={item.status} />
                                        </Table.Cell>
                                    </>
                                )}
                            />
                        </Tabs.Content>

                        {/* Airlines Tab */}
                        <Tabs.Content value="compagnies">
                            <ServiceTable
                                items={filteredData.compagnies}
                                loading={loading}
                                type="compagnies"
                                onViewDetails={handleViewDetails}
                                onDelete={handleDelete}
                                renderRow={(item) => (
                                    <>
                                        <Table.Cell px={5} py={3.5}>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight={600} color="gray.800">{item.partnerCompagnie?.partnerInfo[0]?.cin}</Text>
                                            </VStack>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight={600} color="gray.800">{item.name}</Text>
                                            </VStack>
                                        </Table.Cell>

                                        <Table.Cell px={5} py={3.5}>
                                            <Text fontSize="sm" color="gray.600">{item.partnerCompagnie?.phone}</Text>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <Text fontSize="sm" color="gray.600" noOfLines={1}>{item.partnerCompagnie?.email}</Text>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <StatusBadge status="accept" />
                                        </Table.Cell>
                                    </>
                                )}
                            />
                        </Tabs.Content>

                        {/* Car Rentals Tab */}
                        <Tabs.Content value="locations">
                            <ServiceTable
                                items={filteredData.locations}
                                loading={loading}
                                type="locations"
                                onViewDetails={handleViewDetails}
                                onDelete={handleDelete}
                                renderRow={(item) => (
                                    <>
                                        <Table.Cell px={5} py={3.5}>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight={600} color="gray.800">{item.partnerLocation?.partnerInfo[0]?.cin}</Text>
                                            </VStack>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight={600} color="gray.800">{item.name}</Text>
                                                <Text fontSize="xs" color="gray.400">Zone: {item.zone}</Text>
                                            </VStack>
                                        </Table.Cell>

                                        <Table.Cell px={5} py={3.5}>
                                            <Text fontSize="sm" color="gray.600">{item.partnerLocation?.phone}</Text>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <Text fontSize="sm" color="gray.600" noOfLines={1}>{item.partnerLocation?.email}</Text>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <StatusBadge status={item.status} />
                                        </Table.Cell>
                                    </>
                                )}
                            />
                        </Tabs.Content>

                        {/* Travel Circuits Tab */}
                        <Tabs.Content value="voyages">
                            <ServiceTable
                                items={filteredData.voyages}
                                loading={loading}
                                type="voyages"
                                onViewDetails={handleViewDetails}
                                onDelete={handleDelete}
                                renderRow={(item) => (
                                    <>
                                        <Table.Cell px={5} py={3.5}>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight={600} color="gray.800">{item.partnerVoyage?.partnerInfo[0]?.cin}</Text>
                                            </VStack>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight={600} color="gray.800">{item.name}</Text>
                                                <Text fontSize="xs" color="gray.400">{item.location}</Text>
                                            </VStack>
                                        </Table.Cell>

                                        <Table.Cell px={5} py={3.5}>
                                            <Text fontSize="sm" color="gray.600">{item.phone}</Text>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <Text fontSize="sm" color="gray.600" noOfLines={1}>{item.partnerVoyage?.email}</Text>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3.5}>
                                            <StatusBadge status="accept" />
                                        </Table.Cell>
                                    </>
                                )}
                            />
                        </Tabs.Content>
                    </Tabs.Root>

                </Box>
            </Box>

            {/* Detail Drawer */}
            {selectedService && (
                <Drawer.Root  onOpenChange={(e) => setDrawerOpen(e.open)} open={drawerOpen} size="md">
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content borderRadius="2xl 2xl 0 0">
                            <Drawer.Header borderBottom="1px solid" borderColor="gray.100" pb={4}>
                                <Flex justify="space-between" align="center" w="full">
                                    <Box>
                                        <Text fontSize="xs" fontWeight={700} color="blue.500" textTransform="uppercase" mb={1}>
                                            Détails du service
                                        </Text>
                                        <Text fontSize="lg" fontWeight={800} color="gray.900">
                                            {selectedService.name}
                                        </Text>
                                    </Box>
                                    <Drawer.CloseTrigger />
                                </Flex>
                            </Drawer.Header>

                            <Drawer.Body px={6} py={6}>
                                <ScrollArea.Root>
                                    <ScrollArea.Viewport>
                                        <ScrollArea.Content>
                                            <ServiceDetails service={selectedService} />
                                        </ScrollArea.Content>
                                    </ScrollArea.Viewport>

                                    <ScrollArea.Scrollbar>
                                        <ScrollArea.Thumb />
                                    </ScrollArea.Scrollbar>
                                </ScrollArea.Root>
                            </Drawer.Body>
                            <Drawer.Footer>
                                <Button onClick={()=>setDrawerOpen(false)} variant="outline">Cancel</Button>
                            </Drawer.Footer>
                            <Drawer.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Drawer.CloseTrigger>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Drawer.Root>
            )}
        </>
    )
}

/* Service Table Component */
function ServiceTable({ items, loading, type, onViewDetails, onDelete, renderRow }) {
    if (loading) {
        return (
            <Box p={6}>
                <VStack spacing={3} align="stretch">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Box key={i} h="60px" bg="gray.50" borderRadius="lg" p={4}>
                            <Skeleton h="20px" mb={2} w="60%" />
                            <Skeleton h="16px" w="40%" />
                        </Box>
                    ))}
                </VStack>
            </Box>
        )
    }

    if (items.length === 0) {
        return (
            <Flex direction="column" align="center" justify="center" py={20} gap={3}>
                <Text fontSize="lg" fontWeight={600} color="gray.700">Aucun service trouvé</Text>
                <Text fontSize="sm" color="gray.400">Essayez une autre recherche.</Text>
            </Flex>
        )
    }

    return (
        <Box overflowX="auto">
            <Table.Root size="sm">
                <Table.Header>
                    <Table.Row bg="gray.50">
                        <Table.ColumnHeader px={5} py={3} fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wider">
                            CIN
                        </Table.ColumnHeader>
                        <Table.ColumnHeader px={5} py={3} fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wider">
                            Service
                        </Table.ColumnHeader>
                        <Table.ColumnHeader px={5} py={3} fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wider">
                            Téléphone
                        </Table.ColumnHeader>
                        <Table.ColumnHeader px={5} py={3} fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wider">
                            Email
                        </Table.ColumnHeader>
                        <Table.ColumnHeader px={5} py={3} fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wider">
                            Statut
                        </Table.ColumnHeader>
                        <Table.ColumnHeader px={5} py={3} fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wider" textAlign="right">
                            Action
                        </Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {items.map((item) => (
                        <Table.Row
                            key={item.id}
                            borderTop="1px solid" borderColor="gray.50"
                            _hover={{ bg: "gray.50" }}
                            transition="background 0.1s"
                        >
                            {renderRow(item)}
                            <Table.Cell px={5} py={3.5} textAlign="right">
                                <Flex align="center" gap={2} justify="flex-end">
                                    <IconButton
                                        size="xs" variant="ghost"
                                        color="blue.500" borderRadius="lg"
                                        _hover={{ bg: "blue.50", color: "blue.600" }}
                                        aria-label="Voir détails"
                                        onClick={() => onViewDetails(item, type)}
                                    >
                                        <Eye size={14} />
                                    </IconButton>
                                    <DeleteDialog item={item} type={type} onDelete={onDelete} />
                                </Flex>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    )
}

/* Delete Dialog Component */
function DeleteDialog({ item, type, onDelete }) {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <IconButton
                    size="xs" variant="ghost"
                    color="red.400" borderRadius="lg"
                    _hover={{ bg: "red.50", color: "red.500" }}
                    aria-label="Supprimer"
                >
                    <Trash2 size={14} />
                </IconButton>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="2xl" overflow="hidden">
                        <Box bg="red.50" px={6} py={5} borderBottom="1px solid" borderColor="red.100">
                            <Flex align="center" gap={3}>
                                <Flex w="36px" h="36px" borderRadius="xl"
                                    bg="red.100" color="red.500"
                                    align="center" justify="center" flexShrink={0}>
                                    <LuShieldAlert size={16} />
                                </Flex>
                                <Dialog.Title fontSize="md" fontWeight={700} color="gray.900">
                                    Supprimer le service
                                </Dialog.Title>
                            </Flex>
                        </Box>

                        <Dialog.Body px={6} py={5}>
                            <Text fontSize="sm" color="gray.600" lineHeight="1.7">
                                Vous êtes sur le point de supprimer{" "}
                                <Text as="span" fontWeight={700} color="gray.800">
                                    {item.name}
                                </Text>
                                . Cette action est <Text as="span" color="red.500" fontWeight={600}>irréversible</Text>.
                            </Text>
                        </Dialog.Body>

                        <Dialog.Footer px={6} py={4} borderTop="1px solid" borderColor="gray.100" gap={3}>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" borderRadius="xl" size="sm" color="gray.500">
                                    Annuler
                                </Button>
                            </Dialog.ActionTrigger>
                            <Button
                                colorScheme="red" borderRadius="xl"
                                size="sm" fontWeight={700}
                                onClick={() => onDelete(item.id, type)}
                            >
                                <Flex align="center" gap={1.5}>
                                    <Trash2 size={13} />
                                    Supprimer
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
    )
}

/* Status Badge Component */
function StatusBadge({ status }) {
    const style = STATUS_STYLE[status] || STATUS_STYLE.pending
    return (
        <Box px={2.5} py={1} borderRadius="full" bg={style.bg} display="inline-block">
            <Text fontSize="10px" fontWeight={700} color={style.text} textTransform="capitalize">
                {style.label}
            </Text>
        </Box>
    )
}

/* Service Details Component */
function ServiceDetails({ service }) {
    const partner = service.partnerHotel || service.partnerAgence || service.partnerCompagnie || service.partnerLocation || service.partnerVoyage

    return (
        <VStack align="stretch" spacing={6} pr={4}>
            {/* Service Name and Type */}
            <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.400" textTransform="uppercase" mb={2}>Service</Text>
                <Text fontSize="lg" fontWeight={700} color="gray.900">{service.name}</Text>
                {service.destination && (
                    <Flex align="center" gap={2} mt={2} fontSize="sm" color="gray.600">
                        <LuMapPin size={14} />
                        {service.destination}
                    </Flex>
                )}
                {service.zone && (
                    <Flex align="center" gap={2} mt={2} fontSize="sm" color="gray.600">
                        <LuMapPin size={14} />
                        Zone: {service.zone}
                    </Flex>
                )}
                {service.location && (
                    <Flex align="center" gap={2} mt={2} fontSize="sm" color="gray.600">
                        <LuMapPin size={14} />
                        {service.location}
                    </Flex>
                )}
                {service.address && (
                    <Flex align="center" gap={2} mt={2} fontSize="sm" color="gray.600">
                        <LuMapPin size={14} />
                        {service.address}
                    </Flex>
                )}
            </Box>

            {/* Partner Information */}
            {partner && (
                <Box borderTop="1px solid" borderColor="gray.100" pt={6}>
                    <Text fontSize="xs" fontWeight={700} color="gray.400" textTransform="uppercase" mb={4}>Partenaire</Text>
                    <VStack align="start" spacing={3}>
                        <Box>
                            <Text fontSize="xs" color="gray.400" fontWeight={600} mb={1}>Nom</Text>
                            <Text fontSize="sm" fontWeight={600} color="gray.800">{partner.name}</Text>
                        </Box>
                        <Box w="full">
                            <Text fontSize="xs" color="gray.400" fontWeight={600} mb={1}>Email</Text>
                            <Flex align="center" gap={2}>
                                <LuMail size={14} color="gray" />
                                <Text fontSize="sm" color="blue.600">{partner.email}</Text>
                            </Flex>
                        </Box>
                        <Box w="full">
                            <Text fontSize="xs" color="gray.400" fontWeight={600} mb={1}>Téléphone</Text>
                            <Flex align="center" gap={2}>
                                <LuPhone size={14} color="gray" />
                                <Text fontSize="sm" color="gray.700">{partner.phone}</Text>
                            </Flex>
                        </Box>
                        {partner.verified_at && (
                            <Box>
                                <Text fontSize="xs" color="gray.400" fontWeight={600} mb={1}>Vérifié</Text>
                                <Badge colorScheme="green" borderRadius="full" fontSize="xs">
                                    ✓ Vérifié
                                </Badge>
                            </Box>
                        )}
                    </VStack>
                </Box>
            )}

            {/* Description */}
            {service.description && (
                <Box borderTop="1px solid" borderColor="gray.100" pt={6}>
                    <Text fontSize="xs" fontWeight={700} color="gray.400" textTransform="uppercase" mb={3}>Description</Text>
                    <Text fontSize="sm" color="gray.700" lineHeight="1.6">
                        {service.description.slice(0, 500)}
                        {service.description.length > 500 && "..."}
                    </Text>
                </Box>
            )}

            {/* Equipments */}
            {service.equipments && service.equipments.length > 0 && (
                <Box borderTop="1px solid" borderColor="gray.100" pt={6}>
                    <Text fontSize="xs" fontWeight={700} color="gray.400" textTransform="uppercase" mb={3}>Équipements</Text>
                    <Flex gap={2} flexWrap="wrap">
                        {service.equipments.map((eq, i) => (
                            <Badge key={i} colorScheme="blue" variant="subtle" fontSize="xs">
                                {eq}
                            </Badge>
                        ))}
                    </Flex>
                </Box>
            )}

            {/* Classes */}
            {service.classes && service.classes.length > 0 && (
                <Box borderTop="1px solid" borderColor="gray.100" pt={6}>
                    <Text fontSize="xs" fontWeight={700} color="gray.400" textTransform="uppercase" mb={3}>Classes</Text>
                    <Flex gap={2} flexWrap="wrap">
                        {service.classes.map((cls, i) => (
                            <Badge key={i} colorScheme="orange" variant="subtle" fontSize="xs">
                                {cls}
                            </Badge>
                        ))}
                    </Flex>
                </Box>
            )}

            {/* Services */}
            {service.services && service.services.length > 0 && (
                <Box borderTop="1px solid" borderColor="gray.100" pt={6}>
                    <Text fontSize="xs" fontWeight={700} color="gray.400" textTransform="uppercase" mb={3}>Services</Text>
                    <Flex gap={2} flexWrap="wrap">
                        {service.services.map((svc, i) => (
                            <Badge key={i} colorScheme="teal" variant="subtle" fontSize="xs">
                                {svc}
                            </Badge>
                        ))}
                    </Flex>
                </Box>
            )}

            {/* Categories */}
            {service.categories && service.categories.length > 0 && (
                <Box borderTop="1px solid" borderColor="gray.100" pt={6}>
                    <Text fontSize="xs" fontWeight={700} color="gray.400" textTransform="uppercase" mb={3}>Catégories</Text>
                    <Flex gap={2} flexWrap="wrap">
                        {service.categories.map((cat, i) => (
                            <Badge key={i} colorScheme="cyan" variant="subtle" fontSize="xs">
                                {cat}
                            </Badge>
                        ))}
                    </Flex>
                </Box>
            )}

            {/* Social Media */}
            {(service.facebook || service.instagram || service.twitter) && (
                <Box borderTop="1px solid" borderColor="gray.100" pt={6}>
                    <Text fontSize="xs" fontWeight={700} color="gray.400" textTransform="uppercase" mb={3}>Réseaux sociaux</Text>
                    <VStack align="start" spacing={2}>
                        {service.facebook && (
                            <Text fontSize="sm" color="gray.700">{service.facebook}</Text>
                        )}
                        {service.instagram && (
                            <Text fontSize="sm" color="gray.700">{service.instagram}</Text>
                        )}
                        {service.twitter && (
                            <Text fontSize="sm" color="gray.700">{service.twitter}</Text>
                        )}
                    </VStack>
                </Box>
            )}

            {/* Status */}
            <Box borderTop="1px solid" borderColor="gray.100" pt={6}>
                <Text fontSize="xs" fontWeight={700} color="gray.400" textTransform="uppercase" mb={3}>Statut</Text>
                <StatusBadge status={service.status} />
            </Box>
        </VStack>
    )
}

export default Services