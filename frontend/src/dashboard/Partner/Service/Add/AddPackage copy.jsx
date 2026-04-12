import {
    Container, Input, Button,
    VStack, Grid, Flex, Text, Box,
    Select, HStack, Textarea,
    IconButton, Badge,
    Portal,
    createListCollection,
} from "@chakra-ui/react"
import {
    LuChevronLeft, LuChevronRight, LuPlus, LuX,
    LuMapPin, LuCalendar, LuPlaneTakeoff, LuCheck,
    LuGlobe, LuBanknote,
} from "react-icons/lu"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

/* ── Constants ─────────────────────────────────────────────────────── */
const MONTHS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
]

const TRIP_TYPES = [
    { value: "haj", label: "Haj / Umrah" },
    { value: "tourisme", label: "Tourisme" },
    { value: "affaires", label: "Affaires" },
]

const INSTALLMENTS = ["2X", "6X", "10X", "12X", "Non"]

const BLUE = "blue.500"
const BLUE_DARK = "blue.700"
const BLUE_GLOW = "blue.200"

function StepBar({ current }) {
    const steps = ["Informations", "Vols & Hôtels", "Prix & Options"]
    return (
        <Flex align="center" mb={10}>
            {steps.map((label, i) => {
                const n = i + 1
                const done = n < current
                const active = n === current
                return (
                    <Flex key={n} align="center" flex={n < steps.length ? 1 : "none"}>
                        <VStack gap={1} align="center" flexShrink={0}>
                            <Flex
                                w="30px" h="30px" borderRadius="full"
                                align="center" justify="center"
                                fontSize="12px" fontWeight={700}
                                bg={done || active ? BLUE : "gray.100"}
                                color={done || active ? "white" : "gray.400"}
                                boxShadow={active ? `0 0 0 4px ${BLUE_GLOW}` : "none"}
                                transition="all 0.3s"
                            >
                                {done ? <LuCheck size={13} /> : n}
                            </Flex>
                            <Text
                                fontSize="11px" fontWeight={600}
                                color={active ? BLUE : done ? "gray.600" : "gray.400"}
                                whiteSpace="nowrap"
                            >
                                {label}
                            </Text>
                        </VStack>
                        {n < steps.length && (
                            <Box
                                flex={1} h="2px" mx={3} mt="-14px"
                                bg={done ? BLUE : "gray.200"}
                                transition="background 0.3s"
                            />
                        )}
                    </Flex>
                )
            })}
        </Flex>
    )
}

/* ── Section Card ──────────────────────────────────────────────────── */
function SectionCard({ title, children }) {
    return (
        <Box
            bg="white" borderRadius="2xl" p={6} mb={5}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)"
        >
            <Flex align="center" gap={2} mb={5}>
                <Box w="4px" h="18px" bg={BLUE} borderRadius="2px" flexShrink={0} />
                <Text fontSize="15px" fontWeight={700} color="gray.900">{title}</Text>
            </Flex>
            {children}
        </Box>
    )
}

function Field({ label, required, children }) {
    return (
        <VStack align="stretch" gap={1.5}>
            <Text fontSize="11px" fontWeight={700} color="gray.600" textTransform="uppercase" letterSpacing="0.06em">
                {label}{required && <Text as="span" color={"red.500"} ml={0.5}>*</Text>}
            </Text>
            {children}
        </VStack>
    )
}

/* ── Star Rating ───────────────────────────────────────────────────── */
function StarRating({ value, onChange }) {
    return (
        <HStack gap={1}>
            {[1, 2, 3, 4, 5].map((s) => (
                <Text
                    key={s}
                    fontSize="20px"
                    cursor="pointer"
                    color={s <= value ? "#F59E0B" : "gray.200"}
                    onClick={() => onChange(s)}
                    transition="transform 0.1s"
                    _hover={{ transform: "scale(1.2)" }}
                    lineHeight={1}
                >
                    ★
                </Text>
            ))}
        </HStack>
    )
}

function DestinationRow({ dest, index, onChange, onRemove }) {
    return (
        <Box
            bg="gray.50" borderRadius="xl" p={4}
            border="1px solid" borderColor="gray.100"
        >
            <Grid templateColumns={{ base: "1fr", md: "1fr auto auto auto" }} gap={4} alignItems="end">
                <Field label="Hôtel / Destination">
                    <Input
                        value={dest.name}
                        onChange={(e) => onChange(index, "name", e.target.value)}
                        placeholder="ex: Swissotel Makkah 5*"
                        borderRadius="lg" border="1.5px solid" borderColor="gray.200"
                        fontSize="sm" _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
                    />
                </Field>
                <Field label="Étoiles">
                    <StarRating
                        value={dest.rating}
                        onChange={(val) => onChange(index, "rating", val)}
                    />
                </Field>
                <Field label="Nuits">
                    <Input
                        value={dest.nights} min={1}
                        onChange={(val) => onChange(index, "nights", +val)}
                        w="80px"
                         borderRadius="lg" border="1.5px solid" borderColor="gray.200"
                        fontSize="sm" textAlign="center"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
                    />
                       
                    
                </Field>
                <IconButton
                    aria-label="Remove"
                    variant="outline"
                    size="sm"
                    borderRadius="lg"
                    borderColor="gray.200"
                    color="gray.400"
                    alignSelf="flex-end"
                    _hover={{ borderColor: "red.400", color: "red.500", bg: "red.50" }}
                    onClick={() => onRemove(index)}
                ><LuX size={14} /></IconButton>
            </Grid>
        </Box>
    )
}

/* ── Nav Buttons ───────────────────────────────────────────────────── */
function NavButtons({ onBack, onNext, nextLabel = "Suivant", backLabel = "Retour" }) {
    return (
        <Flex justify="flex-end" gap={3} mt={2}>
            {onBack && (
                <Button
                    variant="outline" borderRadius="xl" fontWeight={600} fontSize="sm"
                    borderColor="gray.200" color="gray.600"
                    _hover={{ borderColor: "gray.400", color: "gray.900" }}
                    onClick={onBack}
                    leftIcon={<LuChevronLeft size={14} />}
                >
                    {backLabel}
                </Button>
            )}
            <Button
                bg={BLUE} color="white" borderRadius="xl" fontWeight={700} fontSize="sm"
                px={6}
                _hover={{ bg: BLUE_DARK, transform: "translateY(-2px)", boxShadow: `0 4px 12px ${BLUE_GLOW}` }}
                transition="all 0.2s"
                onClick={onNext}
                rightIcon={<LuChevronRight size={14} />}
            >
                {nextLabel}
            </Button>
        </Flex>
    )
}

function Step1({ form, setForm, onNext }) {

    const monthsCollection = createListCollection({
        items: [
            { label: "Sélectionner un mois", value: "" },
            ...MONTHS.map((m) => ({
                label: m,
                value: m,
            })),
        ],
    })
    const yearsCollection = createListCollection({
        items: [2026, 2027, 2028].map((y) => ({
            label: y.toString(),
            value: y.toString(),
        })),
    })
    return (
        <>
            <SectionCard title="Informations générales">
                <VStack align="stretch" gap={4}>
                    <Field label="Titre du package" required>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="ex: Umrah Premium - Medine & Makkah"
                            borderRadius="lg" border="1.5px solid" borderColor="gray.200"
                            fontSize="sm"
                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
                        />
                    </Field>

                    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                        <Field label="Mois" required>
                            <Select.Root
                                collection={monthsCollection}
                                value={[form.month]}
                                onValueChange={(e) =>
                                    setForm((f) => ({ ...f, month: e.value[0] }))
                                }
                            >
                                <Select.HiddenSelect />

                                <Select.Control>
                                    <Select.Trigger
                                        borderRadius="lg"
                                        border="1.5px solid"
                                        borderColor="gray.200"
                                        fontSize="sm"
                                        _focus={{
                                            borderColor: "blue.400",
                                            boxShadow: "0 0 0 3px rgba(49,130,206,0.12)",
                                        }}
                                    >
                                        <Select.ValueText placeholder="Sélectionner un mois" />
                                    </Select.Trigger>

                                    <Select.IndicatorGroup>
                                        <Select.Indicator />
                                    </Select.IndicatorGroup>
                                </Select.Control>

                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content>
                                            {monthsCollection.items.map((item) => (
                                                <Select.Item item={item} key={item.value}>
                                                    {item.label}
                                                    <Select.ItemIndicator />
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                        </Field>
                        <Field label="Année" required>
                            <Select.Root
                                collection={yearsCollection}
                                value={[form.year]}
                                onValueChange={(e) =>
                                    setForm((f) => ({ ...f, year: e.value[0] }))
                                }
                            >
                                <Select.HiddenSelect />

                                <Select.Control>
                                    <Select.Trigger
                                        borderRadius="lg"
                                        border="1.5px solid"
                                        borderColor="gray.200"
                                        fontSize="sm"
                                        _focus={{
                                            borderColor: "blue.400",
                                            boxShadow: "0 0 0 3px rgba(49,130,206,0.12)",
                                        }}
                                    >
                                        <Select.ValueText placeholder="Sélectionner une année" />
                                    </Select.Trigger>

                                    <Select.IndicatorGroup>
                                        <Select.Indicator />
                                    </Select.IndicatorGroup>
                                </Select.Control>

                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content>
                                            {yearsCollection.items.map((item) => (
                                                <Select.Item item={item} key={item.value}>
                                                    {item.label}
                                                    <Select.ItemIndicator />
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                        </Field>
                    </Grid>

                    <Field label="Type de voyage" required>
                        <HStack gap={3} flexWrap="wrap">
                            {TRIP_TYPES.map((t) => (
                                <Button
                                    key={t.value}
                                    size="sm"
                                    borderRadius="xl"
                                    border="1.5px solid"
                                    borderColor={form.type === t.value ? BLUE : "gray.200"}
                                    bg={form.type === t.value ? BLUE : "white"}
                                    color={form.type === t.value ? "white" : "gray.600"}
                                    fontWeight={600}
                                    fontSize="13px"
                                    px={4}
                                    _hover={{
                                        borderColor: BLUE,
                                        color: form.type === t.value ? "white" : BLUE,
                                    }}
                                    transition="all 0.15s"
                                    onClick={() => setForm(f => ({ ...f, type: t.value }))}
                                >
                                    {t.label}
                                </Button>
                            ))}
                        </HStack>
                    </Field>
                </VStack>
            </SectionCard>

            <NavButtons onNext={onNext} backLabel={null} />
        </>
    )
}

function Step2({ form, setForm, onNext, onBack }) {
    const updateDest = (i, key, val) => {
        const updated = form.destinations.map((d, idx) => idx === i ? { ...d, [key]: val } : d)
        setForm(f => ({ ...f, destinations: updated }))
    }

    const addDest = () => {
        setForm(f => ({
            ...f,
            destinations: [...f.destinations, { name: "", rating: 3, nights: 3 }],
        }))
    }

    const removeDest = (i) => {
        setForm(f => ({
            ...f,
            destinations: f.destinations.filter((_, idx) => idx !== i),
        }))
    }

    return (
        <>
            {/* Flight Info */}
            <SectionCard title="Informations de vol">
                <VStack align="stretch" gap={4}>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 40px 1fr" }} gap={4} alignItems="end">
                        {/* Departure */}
                        <VStack align="stretch" gap={4}>
                            <Field label="Date de départ" required>
                                <Input
                                    type="date" value={form.departureDate}
                                    onChange={(e) => setForm(f => ({ ...f, departureDate: e.target.value }))}
                                    borderRadius="lg" border="1.5px solid" borderColor="gray.200"
                                    fontSize="sm"
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
                                />
                            </Field>
                            <Field label="Heure de départ">
                                <Input
                                    type="time" value={form.departureTime}
                                    onChange={(e) => setForm(f => ({ ...f, departureTime: e.target.value }))}
                                    borderRadius="lg" border="1.5px solid" borderColor="gray.200"
                                    fontSize="sm"
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
                                />
                            </Field>
                            <Field label="Aéroport départ">
                                <Input
                                    value={form.departureAirport}
                                    onChange={(e) => setForm(f => ({ ...f, departureAirport: e.target.value }))}
                                    placeholder="ex: TUN-JED"
                                    borderRadius="lg" border="1.5px solid" borderColor="gray.200"
                                    fontSize="sm"
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
                                />
                            </Field>
                        </VStack>

                        {/* Arrow */}
                        <Flex align="center" justify="center" pb={4} display={{ base: "none", md: "flex" }}>
                            <LuPlaneTakeoff size={18} color="#CBD5E0" />
                        </Flex>

                        {/* Return */}
                        <VStack align="stretch" gap={4}>
                            <Field label="Date de retour" required>
                                <Input
                                    type="date" value={form.returnDate}
                                    onChange={(e) => setForm(f => ({ ...f, returnDate: e.target.value }))}
                                    borderRadius="lg" border="1.5px solid" borderColor="gray.200"
                                    fontSize="sm"
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
                                />
                            </Field>
                            <Field label="Heure de retour">
                                <Input
                                    type="time" value={form.returnTime}
                                    onChange={(e) => setForm(f => ({ ...f, returnTime: e.target.value }))}
                                    borderRadius="lg" border="1.5px solid" borderColor="gray.200"
                                    fontSize="sm"
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
                                />
                            </Field>
                            <Field label="Aéroport retour">
                                <Input
                                    value={form.returnAirport}
                                    onChange={(e) => setForm(f => ({ ...f, returnAirport: e.target.value }))}
                                    placeholder="ex: JED-TUN"
                                    borderRadius="lg" border="1.5px solid" borderColor="gray.200"
                                    fontSize="sm"
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
                                />
                            </Field>
                        </VStack>
                    </Grid>
                </VStack>
            </SectionCard>

            {/* Destinations */}
            <SectionCard title="Destinations & Hôtels">
                <VStack align="stretch" gap={3} mb={3}>
                    {form.destinations.map((dest, i) => (
                        <DestinationRow
                            key={i} dest={dest} index={i}
                            onChange={updateDest} onRemove={removeDest}
                        />
                    ))}
                </VStack>
                <Button
                    variant="outline"
                    borderRadius="xl"
                    borderStyle="dashed"
                    borderColor="gray.300"
                    color="gray.500"
                    fontSize="13px"
                    fontWeight={600}
                    leftIcon={<LuPlus size={14} />}
                    _hover={{ borderColor: BLUE, color: BLUE, bg: BLUE_GLOW }}
                    onClick={addDest}
                >
                    Ajouter une destination
                </Button>
            </SectionCard>

            <NavButtons onBack={onBack} onNext={onNext} />
        </>
    )
}

function Step3({ form, setForm, onBack, onSubmit }) {
    return (
        <>
            <SectionCard title="Prix & Paiement">
                <VStack align="stretch" gap={4}>
                    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                        <Field label="Prix total (TND)" required>
                            <Input
                                value={form.price} min={0}
                                onChange={(val) => setForm(f => ({ ...f, price: val }))}
                                 borderRadius="lg" border="1.5px solid" borderColor="gray.200"
                            fontSize="sm" textAlign="center"
                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
                            />
                               
                            
                        </Field>
                        <Field label="Nombre de places">
                            <Input
                                value={form.seats} min={1}
                                onChange={(val) => setForm(f => ({ ...f, seats: val }))}
                                 borderRadius="lg" border="1.5px solid" borderColor="gray.200"
                                fontSize="sm" textAlign="center"
                                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
                            />
                               
                        </Field>
                    </Grid>

                    <Field label="Facilité de paiement">
                        <HStack gap={2} flexWrap="wrap">
                            {INSTALLMENTS.map((inst) => (
                                <Button
                                    key={inst}
                                    size="sm"
                                    borderRadius="full"
                                    border="1.5px solid"
                                    borderColor={form.installment === inst ? BLUE : "gray.200"}
                                    bg={form.installment === inst ? BLUE : "white"}
                                    color={form.installment === inst ? "white" : "gray.600"}
                                    fontWeight={700}
                                    fontSize="13px"
                                    px={4}
                                    _hover={{ borderColor: BLUE, color: form.installment === inst ? "white" : BLUE }}
                                    transition="all 0.15s"
                                    onClick={() => setForm(f => ({ ...f, installment: inst }))}
                                >
                                    {inst}
                                </Button>
                            ))}
                        </HStack>
                    </Field>
                </VStack>
            </SectionCard>

            <SectionCard title="Notes & Description">
                <VStack align="stretch" gap={4}>
                    <Field label="Description du package">
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Décrivez les inclusions, services, conditions…"
                            borderRadius="lg" border="1.5px solid" borderColor="gray.200"
                            fontSize="sm" minH="100px" resize="vertical"
                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
                        />
                    </Field>
                    <Field label="Notes internes">
                        <Textarea
                            value={form.notes}
                            onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                            placeholder="Notes visibles uniquement par l'équipe…"
                            borderRadius="lg" border="1.5px solid" borderColor="gray.200"
                            fontSize="sm" minH="70px" resize="vertical"
                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
                        />
                    </Field>
                </VStack>
            </SectionCard>

            <NavButtons onBack={onBack} onNext={onSubmit} nextLabel="Publier le package" />
        </>
    )
}

const AddPackage = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({
        title: "",
        month: "",
        year: "2026",
        type: "haj",
        departureDate: "",
        departureTime: "11:40",
        departureAirport: "TUN-JED",
        returnDate: "",
        returnTime: "06:25",
        returnAirport: "JED-TUN",
        destinations: [
            { name: "Medine, Shaza Regency Plaza 3", rating: 3, nights: 4 },
            { name: "Makkah, Swissotel Makkah 5", rating: 5, nights: 6 },
        ],
        price: "",
        seats: "",
        installment: "6X",
        description: "",
        notes: "",
    })

    const handleSubmit = () => {
        
        navigate(-1)
    }

    return (
        <Container maxW="860px" py={8} px={{ base: 4, md: 8 }}>
            {/* Back */}
            <Flex
                as="button"
                type="button"
                align="center"
                gap={1.5}
                color="gray.400"
                fontSize="sm"
                fontWeight={500}
                mb={8}
                _hover={{ color: "blue.500" }}
                transition="color 0.15s"
                onClick={() => navigate(-1)}
            >
                <LuChevronLeft size={14} />
                Retour
            </Flex>

            {/* Header */}
            <Box mb={8}>
                <Text
                    fontSize="xs" fontWeight={700} color={BLUE}
                    textTransform="uppercase" letterSpacing="0.1em" mb={2}
                >
                    Packages
                </Text>
                <Text
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight={900} color="gray.900"
                    letterSpacing="-0.02em" mb={2}
                >
                    Ajouter un nouveau package
                </Text>
                <Text fontSize="sm" color="gray.500">
                    Remplissez les informations pour créer un nouveau voyage
                </Text>
            </Box>

            {/* Progress */}
            <StepBar current={step} />

            {/* Steps */}
            {step === 1 && (
                <Step1 form={form} setForm={setForm} onNext={() => setStep(2)} />
            )}
            {step === 2 && (
                <Step2
                    form={form} setForm={setForm}
                    onNext={() => setStep(3)}
                    onBack={() => setStep(1)}
                />
            )}
            {step === 3 && (
                <Step3
                    form={form} setForm={setForm}
                    onBack={() => setStep(2)}
                    onSubmit={handleSubmit}
                />
            )}
        </Container>
    )
}

export default AddPackage