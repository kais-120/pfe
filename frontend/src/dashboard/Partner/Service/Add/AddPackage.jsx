import {
    Container, Input, Button,
    VStack, Grid, Flex, Text, Box,
    HStack, IconButton, Portal,
    createListCollection, Select,
    DatePicker, parseDate,
} from "@chakra-ui/react"
import {
    LuPlus, LuX, LuPlaneTakeoff, LuCalendar,
} from "react-icons/lu"
import React, { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Helmet } from "react-helmet"

const validationSchema = Yup.object({
    title: Yup.string().trim().required("Le titre est requis"),
    month: Yup.string().required("Le mois est requis"),
    year: Yup.string().required("L'année est requise"),
    departureDate: Yup.string().required("La date de départ est requise"),
    returnDate: Yup.string()
        .required("La date de retour est requise")
        .test("after-departure", "La date de retour doit être après le départ", function (value) {
            const { departureDate } = this.parent
            if (!departureDate || !value) return true
            return new Date(value) > new Date(departureDate)
        }),
    departureTime: Yup.string(),
    returnTime: Yup.string(),
    departureAirport: Yup.string(),
    returnAirport: Yup.string(),
    destinations: Yup.array().of(
        Yup.object({
            name: Yup.string().trim().required("Le nom de l'hôtel est requis"),
            nights: Yup.number()
                .typeError("Doit être un nombre")
                .min(1, "Minimum 1 nuit")
                .required("Le nombre de nuits est requis"),
            rating: Yup.number().min(1).max(5),
        })
    ),
    price: Yup.number()
        .typeError("Le prix doit être un nombre")
        .min(1, "Le prix doit être supérieur à 0")
        .required("Le prix est requis"),
    seats: Yup.number()
        .typeError("Le nombre de places doit être un nombre")
        .min(1, "Minimum 1 place")
        .required("Le nombre de places est requis"),
    installment: Yup.string(),
})

const MONTHS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
]


const INSTALLMENTS = ["2", "6", "10", "12", "Non"]

const BLUE = "blue.500"
const BLUE_DARK = "blue.700"
const BLUE_GLOW = "blue.200"

function SectionCard({ title, children }) {
    return (
        <Box bg="white" borderRadius="2xl" p={6} mb={5}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)">
            <Flex align="center" gap={2} mb={5}>
                <Box w="4px" h="18px" bg={BLUE} borderRadius="2px" flexShrink={0} />
                <Text fontSize="15px" fontWeight={700} color="gray.900">{title}</Text>
            </Flex>
            {children}
        </Box>
    )
}

function Field({ label, required, error, children }) {
    return (
        <VStack align="stretch" gap={1.5}>
            <Text fontSize="11px" fontWeight={700} color="gray.600"
                textTransform="uppercase" letterSpacing="0.06em">
                {label}
                {required && <Text as="span" color="red.500" ml={0.5}>*</Text>}
            </Text>
            {children}
            {error && <Text fontSize="11px" color="red.500" mt={0.5}>{error}</Text>}
        </VStack>
    )
}

function StarRating({ value, onChange }) {
    return (
        <HStack gap={1}>
            {[1, 2, 3, 4, 5].map((s) => (
                <Text key={s} fontSize="20px" cursor="pointer"
                    color={s <= value ? "#F59E0B" : "gray.200"}
                    onClick={() => onChange(s)}
                    transition="transform 0.1s"
                    _hover={{ transform: "scale(1.2)" }}
                    lineHeight={1}>★</Text>
            ))}
        </HStack>
    )
}

const DestinationRow = React.memo(function DestinationRow({
    dest, index, onChange, onRemove, errors, touched,
}) {
    const nameError = touched?.name && errors?.name
    const nightsError = touched?.nights && errors?.nights
    return (
        <Box bg="gray.50" borderRadius="xl" p={4}
            border="1px solid" borderColor={nameError || nightsError ? "red.200" : "gray.100"}>
            <Grid templateColumns={{ base: "1fr", md: "1fr auto auto auto" }} gap={4} alignItems="end">
                <Field label="Hôtel / Destination" error={nameError}>
                    <Input name={`destinations[${index}].name`} value={dest.name}
                        onChange={(e) => onChange(index, "name", e.target.value)}
                        placeholder="ex: Swissotel Makkah 5*"
                        borderRadius="lg" border="1.5px solid"
                        borderColor={nameError ? "red.300" : "gray.200"} fontSize="sm" />
                </Field>
                <Field label="Étoiles">
                    <StarRating value={dest.rating} onChange={(val) => onChange(index, "rating", val)} />
                </Field>
                <Field label="Nuits" error={nightsError}>
                    <Input name={`destinations[${index}].nights`} value={dest.nights}
                        type="number" min={1}
                        onChange={(e) => onChange(index, "nights", e.target.value)}
                        w="80px" borderRadius="lg" border="1.5px solid"
                        borderColor={nightsError ? "red.300" : "gray.200"}
                        fontSize="sm" textAlign="center" />
                </Field>
                <IconButton aria-label="Supprimer" variant="outline" size="sm"
                    borderRadius="lg" borderColor="gray.200" color="gray.400" alignSelf="flex-end"
                    _hover={{ borderColor: "red.400", color: "red.500", bg: "red.50" }}
                    onClick={() => onRemove(index)}>
                    <LuX size={14} />
                </IconButton>
            </Grid>
        </Box>
    )
})

const inputStyle = (hasError) => ({
    borderRadius: "lg",
    border: "1.5px solid",
    borderColor: hasError ? "red.300" : "gray.200",
    fontSize: "sm",
    _focus: { borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" },
})

const DEFAULT_VALUES = {
    title: "", month: "", year: "2026",
    departureDate: "", departureTime: "11:40", departureAirport: "",
    returnDate: "", returnTime: "06:25", returnAirport: "",
    destinations: [], price: "", seats: "", installment: "6",
}

const AddPackage = ({ ontTab, onChange, initialValues, isEditing, type }) => {

    const formik = useFormik({
        initialValues: initialValues
            ? { ...DEFAULT_VALUES, ...initialValues }
            : DEFAULT_VALUES,
        validationSchema,
        onSubmit: async (values) => {
            try {
                if (isEditing) {
                    onChange((prev) =>
                        prev.map((p) => p.id === values.id ? { ...values } : p)
                    )
                } else {
                    onChange((prev) => [...prev, { ...values, id: Date.now() }])
                }
                ontTab("list")
            } catch {
                console.error("error")
            }
        },
    })

    const {
        values, errors, touched,
        handleChange, handleBlur,
        setFieldValue, setFieldTouched,
        handleSubmit, isSubmitting,
    } = formik
    const monthsCollection = createListCollection({
        items: [
            { label: "Sélectionner un mois", value: "" },
            ...MONTHS.map((m) => ({ label: m, value: m })),
        ],
    })

    const yearsCollection = createListCollection({
        items: [2026, 2027, 2028].map((y) => ({ label: y.toString(), value: y.toString() })),
    })

    const monthsMap = {
        Janvier: 0, Février: 1, Mars: 2, Avril: 3, Mai: 4, Juin: 5,
        Juillet: 6, Août: 7, Septembre: 8, Octobre: 9, Novembre: 10, Décembre: 11,
    }
    
    const year = Number(values.year)
    const monthIndex = monthsMap[values.month]
    
    const minDate = monthIndex !== undefined
        ? parseDate(`${year}-${String(monthIndex + 1).padStart(2, "0")}-01`) 
        : undefined
    const maxDate = monthIndex !== undefined
        ? parseDate(new Date(year, monthIndex + 1, 0).toISOString().split('T')[0]) 
        : undefined

    const updateDest = (i, key, val) => {
        if (key === "__blur_name") { setFieldTouched(`destinations[${i}].name`, true); return }
        if (key === "__blur_nights") { setFieldTouched(`destinations[${i}].nights`, true); return }
        const updated = values.destinations.map((d, idx) =>
            idx === i ? { ...d, [key]: val } : d
        )
        setFieldValue("destinations", updated)
    }

    const addDest = () => {
        setFieldValue("destinations", [...values.destinations, { name: "", rating: 3, nights: 3 }])
    }

    const removeDest = (i) => {
        setFieldValue("destinations", values.destinations.filter((_, idx) => idx !== i))
    }

    const dataFormal = (data) => {
        return new Date(data).toISOString().split('T')[0]
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    return (
        <>
        <Helmet title="Ajouter Offre"></Helmet>
        <Container maxW="860px" py={8} px={{ base: 4, md: 8 }}>

            <SectionCard title="Informations générales">
                <VStack align="stretch" gap={4}>
                    <Field label="Titre du package" required error={touched.title && errors.title}>
                        <Input name="title" value={values.title}
                            onChange={handleChange} onBlur={handleBlur}
                            placeholder="ex: Pkg 1"
                            {...inputStyle(touched.title && errors.title)} />
                    </Field>

                    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                        <Field label="Mois" required error={touched.month && errors.month}>
                            <Select.Root collection={monthsCollection} value={[values.month]}
                                onValueChange={(e) => setFieldValue("month", e.value[0])}>
                                <Select.HiddenSelect />
                                <Select.Control>
                                    <Select.Trigger {...inputStyle(touched.month && errors.month)}>
                                        <Select.ValueText placeholder="Sélectionner un mois" />
                                    </Select.Trigger>
                                    <Select.IndicatorGroup><Select.Indicator /></Select.IndicatorGroup>
                                </Select.Control>
                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content>
                                            {monthsCollection.items.map((item) => {
                                                const monthIndex = monthsMap[item.label];
                                                const isDisabled =
                                                    Number(values.year) === currentYear &&
                                                    monthIndex < currentMonth;
                                                    return (
                                                <Select.Item disabled={isDisabled} item={item} key={item.value}>
                                                    {item.label}<Select.ItemIndicator />
                                                </Select.Item>
                                                    )
                                            })}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                        </Field>

                        <Field label="Année" required error={touched.year && errors.year}>
                            <Select.Root collection={yearsCollection} value={[values.year]}
                                onValueChange={(e) => setFieldValue("year", e.value[0])}>
                                <Select.HiddenSelect />
                                <Select.Control>
                                    <Select.Trigger {...inputStyle(touched.year && errors.year)}>
                                        <Select.ValueText placeholder="Sélectionner une année" />
                                    </Select.Trigger>
                                    <Select.IndicatorGroup><Select.Indicator /></Select.IndicatorGroup>
                                </Select.Control>
                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content>
                                            {yearsCollection.items.map((item) => (
                                                <Select.Item item={item} key={item.value}>
                                                    {item.label}<Select.ItemIndicator />
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                        </Field>
                    </Grid>

                   
                </VStack>
            </SectionCard>

            <SectionCard title="Informations de vol">
                <VStack align="stretch" gap={4}>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 40px 1fr" }} gap={4} alignItems="start">

                        {/* Departure */}
                        <VStack align="stretch" gap={4}>
                            <Field label="Date de départ" required error={touched.departureDate && errors.departureDate}>
                                <DatePicker.Root
                                    locale="fr-FR"
                                    min={minDate}
                                    disabled={!values.month}
                                    max={maxDate}
                                    value={values.departureDate ? [parseDate(dataFormal(values.departureDate))] : (minDate ? [minDate] : [])}
                                    onValueChange={(details) => {
                                        const date = details.value?.[0]
                                        if (date) {
                                            setFieldValue("departureDate", `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`)
                                        } else {
                                            setFieldValue("departureDate", "")
                                        }
                                    }}
                                >
                                    <DatePicker.Control>
                                        <DatePicker.Input />
                                        <DatePicker.IndicatorGroup>
                                            <DatePicker.Trigger><LuCalendar /></DatePicker.Trigger>
                                        </DatePicker.IndicatorGroup>
                                    </DatePicker.Control>
                                    <Portal>
                                        <DatePicker.Positioner>
                                            <DatePicker.Content>
                                                <DatePicker.View view="day"><DatePicker.Header /><DatePicker.DayTable /></DatePicker.View>
                                                <DatePicker.View view="month"><DatePicker.Header /><DatePicker.MonthTable /></DatePicker.View>
                                                <DatePicker.View view="year"><DatePicker.Header /><DatePicker.YearTable /></DatePicker.View>
                                            </DatePicker.Content>
                                        </DatePicker.Positioner>
                                    </Portal>
                                </DatePicker.Root>
                            </Field>
                            <Field label="Heure de départ">
                                <Input type="time" name="departureTime" value={values.departureTime}
                                    onChange={handleChange} {...inputStyle(false)} />
                            </Field>
                            {type === "offer" &&
                            <Field label="Aéroport départ">
                                <Input name="departureAirport" value={values.departureAirport}
                                    onChange={handleChange} placeholder="ex: TUN-JED" {...inputStyle(false)} />
                            </Field>
                            }
                        </VStack>

                        {/* Arrow divider */}
                        <Flex align="center" justify="center" pt={8} display={{ base: "none", md: "flex" }}>
                            <LuPlaneTakeoff size={18} color="#CBD5E0" />
                        </Flex>

                        {/* Return */}
                        <VStack align="stretch" gap={4}>
                            <Field label="Date de retour" required error={touched.returnDate && errors.returnDate}>
                                <DatePicker.Root 
                                    locale="fr-FR" 
                                    min={minDate}
                                    disabled={!values.month}
                                    value={values.returnDate ? [parseDate(dataFormal(values.returnDate))] : (minDate ? [minDate] : [])}
                                    onValueChange={(details) => {
                                        const date = details.value?.[0]
                                        if (date) {
                                            setFieldValue("returnDate", `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`)
                                        } else {
                                            setFieldValue("returnDate", "")
                                        }
                                    }}
                                >
                                    <DatePicker.Control>
                                        <DatePicker.Input />
                                        <DatePicker.IndicatorGroup>
                                            <DatePicker.Trigger><LuCalendar /></DatePicker.Trigger>
                                        </DatePicker.IndicatorGroup>
                                    </DatePicker.Control>
                                    <Portal>
                                        <DatePicker.Positioner>
                                            <DatePicker.Content>
                                                <DatePicker.View view="day"><DatePicker.Header /><DatePicker.DayTable /></DatePicker.View>
                                                <DatePicker.View view="month"><DatePicker.Header /><DatePicker.MonthTable /></DatePicker.View>
                                                <DatePicker.View view="year"><DatePicker.Header /><DatePicker.YearTable /></DatePicker.View>
                                            </DatePicker.Content>
                                        </DatePicker.Positioner>
                                    </Portal>
                                </DatePicker.Root>
                            </Field>
                            <Field label="Heure de retour">
                                <Input type="time" name="returnTime" value={values.returnTime}
                                    onChange={handleChange} {...inputStyle(false)} />
                            </Field>
                            {type === "offer" && 
                            <Field label="Aéroport retour">
                                <Input value={values.returnAirport} name="returnAirport"
                                    onChange={handleChange} placeholder="ex: JED-TUN" {...inputStyle(false)} />
                            </Field>
                            }
                        </VStack>
                    </Grid>
                </VStack>
            </SectionCard>

            {/* ── Section 3: Destinations & Hôtels ── */}
            <SectionCard title="Destinations & Hôtels">
                <VStack align="stretch" gap={3} mb={3}>
                    {values.destinations.map((dest, i) => (
                        <DestinationRow key={i} dest={dest} index={i}
                            onChange={updateDest} onRemove={removeDest}
                            errors={errors.destinations?.[i]}
                            touched={touched.destinations?.[i]} />
                    ))}
                </VStack>
                <Button variant="outline" borderRadius="xl" borderStyle="dashed"
                    borderColor="gray.300" color="gray.500" fontSize="13px" fontWeight={600}
                    leftIcon={<LuPlus size={14} />}
                    _hover={{ borderColor: BLUE, color: BLUE, bg: BLUE_GLOW }}
                    onClick={addDest}>
                    Ajouter une destination
                </Button>
            </SectionCard>

            {/* ── Section 4: Prix & Paiement ── */}
            <SectionCard title="Prix & Paiement">
                <VStack align="stretch" gap={4}>
                    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                        <Field label="Prix total (TND)" required error={touched.price && errors.price}>
                            <Input type="number" name="price" value={values.price}
                                onChange={handleChange}
                                onBlur={() => setFieldTouched("price", true)}
                                placeholder="ex: 3500"
                                {...inputStyle(touched.price && errors.price)} />
                        </Field>
                        <Field label="Nombre de places" error={touched.seats && errors.seats}>
                            <Input type="number" name="seats" value={values.seats}
                                onChange={handleChange} onBlur={handleBlur}
                                placeholder="ex: 30"
                                {...inputStyle(touched.seats && errors.seats)} />
                        </Field>
                    </Grid>
                    <Field label="Facilité de paiement">
                        <HStack gap={2} flexWrap="wrap">
                            {INSTALLMENTS.map((inst) => (
                                <Button key={inst} size="sm" borderRadius="full" border="1.5px solid"
                                    borderColor={values.installment === inst ? BLUE : "gray.200"}
                                    bg={values.installment === inst ? BLUE : "white"}
                                    color={values.installment === inst ? "white" : "gray.600"}
                                    fontWeight={700} fontSize="13px" px={4}
                                    _hover={{ borderColor: BLUE, color: values.installment === inst ? "white" : BLUE }}
                                    transition="all 0.15s"
                                    onClick={() => setFieldValue("installment", inst)}>
                                    {inst !== "Non" ? inst + "X" : inst}
                                </Button>
                            ))}
                        </HStack>
                    </Field>
                </VStack>
            </SectionCard>

            {/* ── Submit ── */}
            <Flex justify="flex-end" gap={3} mt={2}>
                <Button variant="outline" borderRadius="xl" px={6}
                    color="gray.500" borderColor="gray.200"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => ontTab("list")}>
                    Annuler
                </Button>
                <Button bg={BLUE} color="white" borderRadius="xl" fontWeight={700}
                    fontSize="sm" px={8} py={5}
                    _hover={{ bg: BLUE_DARK, transform: "translateY(-2px)", boxShadow: `0 4px 12px ${BLUE_GLOW}` }}
                    transition="all 0.2s"
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    loadingText={isEditing ? "Modification..." : "Ajouter..."}>
                    {isEditing ? "Enregistrer les modifications" : "Ajouter le package"}
                </Button>
            </Flex>

        </Container>
        </>
    )
}

export default AddPackage