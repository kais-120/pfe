import {
  Box, Button, Input, Text, Flex, Grid, VStack, Field,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import * as yup from "yup"
import { useNavigate } from "react-router-dom"
import { AxiosToken } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"
import {
  LuPlane, LuMapPin, LuClock, LuUsers,
  LuChevronLeft, LuCheck, LuBaggageClaim,
  LuCalendar, LuTag,
} from "react-icons/lu"
import { FaStar, FaUsers } from "react-icons/fa"

const CLASSES = ["Économique", "Affaires", "Première"]
const STATUSES = [
  { val: "programmé", color: "blue" },
  { val: "retardé", color: "orange" },
  { val: "annulé", color: "red" },
]
const TYPE_FLIGHT = [
  { val: "aller retour", color: "green" },
  { val: "aller simple", color: "blue" },
]

const validationSchema = yup.object({
  flight_number: yup.string().required("N° de vol requis"),
  from: yup.string().required("Départ requis"),
  to: yup.string().required("Arrivée requise"),
  departure: yup.string().required("Date de départ requise"),
  arrival: yup.string().when("type_flight", {
    is: "aller retour",
    then: (schema) => schema.required("Date d'arrivée requise"),
    otherwise: (schema) => schema.notRequired()
  }),  
  seats_total: yup.number().positive("Doit être positif").required("Nombre de sièges requis"),
})

/* ── Reusable field wrapper ─────────────────────────────────────── */
function FormField({ formik, name, label, required, type = "text", icon: Icon, placeholder, suffix, hint }) {
  const isInvalid = formik.touched[name] && !!formik.errors[name]
  return (
    <Field.Root invalid={isInvalid} w="full">
      <Field.Label>
        <Flex align="center" gap={1}>
          <Text fontSize="xs" fontWeight={700} color="gray.600"
            textTransform="uppercase" letterSpacing="wider">
            {label}
          </Text>
          {required && <Text color="red.400" fontSize="xs">*</Text>}
        </Flex>
      </Field.Label>
      {hint && <Text fontSize="xs" color="gray.400" mt={-1} mb={1}>{hint}</Text>}
      <Flex w="full" align="center"
        border="1.5px solid" borderColor={isInvalid ? "red.400" : "gray.200"}
        borderRadius="xl" bg="white" px={3}
        transition="all 0.15s"
        _focusWithin={{
          borderColor: isInvalid ? "red.400" : "blue.400",
          boxShadow: isInvalid
            ? "0 0 0 3px rgba(245,101,101,0.12)"
            : "0 0 0 3px rgba(49,130,206,0.12)",
        }}>
        {Icon && <Box color={isInvalid ? "red.400" : "gray.400"} mr={2} flexShrink={0}><Icon size={14} /></Box>}
        <Input
          outline={"none"}
          name={name} type={type}
          value={formik.values[name]}
          onChange={formik.handleChange} onBlur={formik.handleBlur}
          placeholder={placeholder}
          border="none" bg="transparent" px={0} h="42px" flex={1}
          fontSize="sm" color="gray.800"
          _focus={{ boxShadow: "none" }}
          _placeholder={{ color: "gray.300" }}
        />
        {suffix && <Text fontSize="xs" color="gray.400" fontWeight={600} ml={2} flexShrink={0}>{suffix}</Text>}
      </Flex>
      {isInvalid && (
        <Field.ErrorText fontSize="xs" color="red.500" mt={1}>{formik.errors[name]}</Field.ErrorText>
      )}
    </Field.Root>
  )
}

function SectionCard({ title, icon: Icon, iconColor = "blue", children }) {
  return (
    <Box bg="white" borderRadius="2xl" p={6}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)">
      <Flex align="center" gap={2} mb={5}>
        <Flex w="28px" h="28px" borderRadius="lg"
          bg={`${iconColor}.50`} color={`${iconColor}.500`}
          align="center" justify="center">
          <Icon size={14} />
        </Flex>
        <Text fontSize="sm" fontWeight={700} color="gray.700">{title}</Text>
      </Flex>
      {children}
    </Box>
  )
}

const EditAirline = () => {
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: {
      flight_number: "", from: "", to: "",
      departure: "", arrival: "", duration: "",
      classes: { "Économique": "", "Affaires": "", "Première": "" },
      seatsClasses: { "Économique": "", "Affaires": "", "Première": "" },
      classesChildren: { "Économique": "", "Affaires": "", "Première": "" },
      selectedClass: "Économique",
      seats_total: "", seats_available: "",
      baggage_kg: "23", status: "programmé",type_flight:"aller retour"
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await AxiosToken.post("/service/airline/flight/add", values)
        toaster.create({ description: "Vol ajouté avec succès.", type: "success", closable: true })
        setTimeout(() => navigate(-1), 1800)
      } catch {
        toaster.create({ description: "Une erreur est survenue.", type: "error", closable: true })
      }
    }
  })

  return (
    <Box>
      {/* Back */}
      <Flex as="button" type="button" align="center" gap={1.5}
        color="gray.400" fontSize="sm" mb={6}
        _hover={{ color: "blue.500" }} transition="color 0.15s"
        onClick={() => navigate(-1)}>
        <LuChevronLeft size={14} />Retour
      </Flex>

      {/* Header */}
      <Box mb={8}>
        <Text fontSize="xs" fontWeight={700} color="blue.500"
          textTransform="uppercase" letterSpacing="widest" mb={1}>
          Gestion des vols
        </Text>
        <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Ajouter un vol
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Renseignez les informations du nouveau vol
        </Text>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <VStack gap={4} align="stretch">

          <SectionCard title="Itinéraire" icon={LuPlane} iconColor="blue">
            <VStack gap={4} align="stretch">
              <FormField formik={formik} name="flight_number" label="Numéro de vol"
                required icon={LuPlane} placeholder="Ex: TU301"
                hint="Code IATA + numéro" />

                <Text fontSize="sm" fontWeight={700} color="gray.700">Type de vol</Text>
              <Flex gap={2} flexWrap="wrap">
                {TYPE_FLIGHT.map(({ val, color }) => {
                  const active = formik.values.type_flight === val
                  return (
                    <Box key={val} as="button" type="button"
                      px={4} py={2} borderRadius="xl" fontSize="sm" fontWeight={600}
                      border="1.5px solid"
                      borderColor={active ? `${color}.400` : "gray.200"}
                      bg={active ? `${color}.50` : "white"}
                      color={active ? `${color}.600` : "gray.500"}
                      cursor="pointer" transition="all 0.15s" textTransform="capitalize"
                      onClick={() => formik.setFieldValue("type_flight", val)}>
                      {val}
                    </Box>
                  )
                })}
              </Flex>

              <Grid templateColumns={"1fr 1fr"} gap={4}>
                <FormField formik={formik} name="from" label="Départ" required
                  icon={LuMapPin} placeholder="Ex: Tunis (TUN)" />
                <FormField formik={formik} name="to" label="Arrivée" required
                  icon={LuMapPin} placeholder="Ex: Paris (CDG)" />
                  
              </Grid>

              <Grid templateColumns={formik.values.type_flight === "aller retour" ? "1fr 1fr" : "1fr"} gap={4}>
                <FormField formik={formik} name="departure" label="Date & heure départ"
                  required type="datetime-local" icon={LuCalendar} />
                  {formik.values.type_flight === "aller retour" &&
                <FormField formik={formik} name="arrival" label="Date & heure arrivée"
                  type="datetime-local" icon={LuCalendar} />
                  }
              </Grid>

              <FormField formik={formik} name="duration" label="Durée du vol"
                icon={LuClock} placeholder="Ex: 2h30"
                hint="Format libre : 2h30, 1h45…" />

            </VStack>
          </SectionCard>

          <SectionCard title="Classe & tarification" icon={FaStar} iconColor="yellow">
            <VStack gap={4} align="stretch">

              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>
                  Classes & prix *
                </Text>

                {/* Class pills — green when price is set, blue when selected */}
                <Flex gap={3} flexWrap="wrap" mb={4}>
                  {CLASSES.map(cls => {
                    const active = formik.values.selectedClass === cls
                    const hasPrice = !!formik.values.classes[cls]
                    return (
                      <Flex key={cls} as="button" type="button"
                        align="center" gap={2} px={4} py={2.5}
                        borderRadius="xl" border="1.5px solid"
                        borderColor={active ? "blue.400" : hasPrice ? "green.300" : "gray.200"}
                        bg={active ? "blue.50" : hasPrice ? "green.50" : "white"}
                        color={active ? "blue.600" : hasPrice ? "green.600" : "gray.500"}
                        fontWeight={active ? 700 : 500} fontSize="sm"
                        cursor="pointer" transition="all 0.15s"
                        onClick={() => formik.setFieldValue("selectedClass", cls)}>
                        <FaStar size={11} />
                        {cls}
                        {hasPrice && (
                          <Text as="span" fontSize="xs" fontWeight={800} ml={1}>
                            {formik.values.classes[cls]} TND
                          </Text>
                        )}
                        {active && <LuCheck size={12} />}
                      </Flex>
                    )
                  })}
                </Flex>
                <Box mb={5}>
                  <Text fontSize="xs" color="gray.400" mt={1.5}>
                    Sélectionnez une classe puis entrez son prix et siège . Répétez pour chaque classe.
                  </Text>
                </Box>
                <Flex w="full" align="center"
                  border="1.5px solid" borderColor="blue.300"
                  borderRadius="xl" bg="blue.50" px={3}
                  _focusWithin={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 3px rgba(49,130,206,0.12)"
                  }}>
                  <Flex w="32px" h="32px" borderRadius="lg" bg="blue.100"
                    color="blue.500" align="center" justify="center"
                    flexShrink={0} mr={2}>
                    <FaStar size={12} />
                  </Flex>

                  <Box flex={1}>
                    <Text fontSize="9px" fontWeight={700} color="blue.400"
                      textTransform="uppercase" letterSpacing="wider" lineHeight={1} mt={1}>
                      Prix adutle — {formik.values.selectedClass}
                    </Text>
                    <Input
                      outline={"none"}
                      type="number"
                      value={formik.values.classes[formik.values.selectedClass] || ""}
                      onChange={e =>
                        formik.setFieldValue(
                          `classes.${formik.values.selectedClass}`,
                          e.target.value
                        )
                      }
                      placeholder="Ex: 450"
                      border="none" bg="transparent" px={0} h="32px"
                      fontSize="sm" fontWeight={600} color="gray.800"
                      _focus={{ boxShadow: "none" }}
                      _placeholder={{ color: "gray.300" }}
                    />
                  </Box>
                  <Text fontSize="xs" color="blue.400" fontWeight={700} ml={2} flexShrink={0}>
                    TND
                  </Text>
                </Flex>


                <Flex  mt={5} w="full" align="center"
                  border="1.5px solid" borderColor="purple.300"
                  borderRadius="xl" bg="purple.50" px={3}
                  _focusWithin={{
                    borderColor: "purple.500",
                    boxShadow: "0 0 0 3px rgba(49,130,206,0.12)"
                  }}>
                  <Flex w="32px" h="32px" borderRadius="lg" bg="purple.100"
                    color="purple.500" align="center" justify="center"
                    flexShrink={0} mr={2}>
                    <FaStar size={12} />
                  </Flex>

                  <Box flex={1}>
                    <Text fontSize="9px" fontWeight={700} color="purple.400"
                      textTransform="uppercase" letterSpacing="wider" lineHeight={1} mt={1}>
                      Prix enfant — {formik.values.selectedClass}
                    </Text>
                    <Input
                      outline={"none"}
                      type="number"
                      value={formik.values.classesChildren[formik.values.selectedClass] || ""}
                      onChange={e =>
                        formik.setFieldValue(
                          `classesChildren.${formik.values.selectedClass}`,
                          e.target.value
                        )
                      }
                      placeholder="Ex: 250"
                      border="none" bg="transparent" px={0} h="32px"
                      fontSize="sm" fontWeight={600} color="gray.800"
                      _focus={{ boxShadow: "none" }}
                      _placeholder={{ color: "gray.300" }}
                    />
                  </Box>
                  <Text fontSize="xs" color="purple.400" fontWeight={700} ml={2} flexShrink={0}>
                    TND
                  </Text>
                </Flex>


                <Flex mt={5} w="full" align="center"
                  border="1.5px solid" borderColor="green.300"
                  borderRadius="xl" bg="green.50" px={3}
                  _focusWithin={{
                    borderColor: "green.500",
                    boxShadow: "0 0 0 3px rgba(49,130,206,0.12)"
                  }}>
                  <Flex w="32px" h="32px" borderRadius="lg" bg="green.100"
                    color="green.500" align="center" justify="center"
                    flexShrink={0} mr={2}>
                    <FaUsers size={12} />
                  </Flex>
                  <Box flex={1}>
                    <Text fontSize="9px" fontWeight={700} color="green.400"
                      textTransform="uppercase" letterSpacing="wider" lineHeight={1} mt={1}>
                      Siège — {formik.values.selectedClass}
                    </Text>
                    <Input
                      outline={"none"}
                      type="number"
                      value={formik.values.seatsClasses[formik.values.selectedClass] || ""}
                      onChange={e =>
                        formik.setFieldValue(
                          `seatsClasses.${formik.values.selectedClass}`,
                          e.target.value
                        )
                      }
                      placeholder="Ex: 50"
                      border="none" bg="transparent" px={0} h="32px"
                      fontSize="sm" fontWeight={600} color="gray.800"
                      _focus={{ boxShadow: "none" }}
                      _placeholder={{ color: "gray.300" }}
                    />
                  </Box>
                  <Text fontSize="xs" color="green.400" fontWeight={700} ml={2} flexShrink={0}>
                    sièges
                  </Text>
                </Flex>


              </Box>

            </VStack>
          </SectionCard>

          {/* Capacity */}
          <SectionCard title="Capacité & bagage" icon={LuUsers} iconColor="green">
            <Grid templateColumns="1fr 1fr 1fr" gap={4}>
              <FormField formik={formik} name="seats_total" label="Sièges total" required
                type="number" icon={LuUsers} placeholder="180" suffix="sièges" />
              <FormField formik={formik} name="baggage_kg" label="Bagage inclus"
                type="number" icon={LuBaggageClaim} placeholder="23" suffix="kg" />
            </Grid>
          </SectionCard>

          {/* Status */}
          <SectionCard title="Statut initial" icon={LuClock} iconColor="gray">
            <Flex gap={2} flexWrap="wrap">
              {STATUSES.map(({ val, color }) => {
                const active = formik.values.status === val
                return (
                  <Box key={val} as="button" type="button"
                    px={4} py={2} borderRadius="xl" fontSize="sm" fontWeight={600}
                    border="1.5px solid"
                    borderColor={active ? `${color}.400` : "gray.200"}
                    bg={active ? `${color}.50` : "white"}
                    color={active ? `${color}.600` : "gray.500"}
                    cursor="pointer" transition="all 0.15s" textTransform="capitalize"
                    onClick={() => formik.setFieldValue("status", val)}>
                    {val}
                  </Box>
                )
              })}
            </Flex>
          </SectionCard>

          {/* Actions */}
          <Flex gap={3} justify="flex-end" pb={4}>
            <Button type="button" variant="outline" borderRadius="xl" px={6}
              color="gray.500" borderColor="gray.200" _hover={{ bg: "gray.50" }}
              onClick={() => navigate(-1)}>
              Annuler
            </Button>
            <Button type="submit" colorScheme="blue" borderRadius="xl"
              px={8} fontWeight={700}
              loading={formik.isSubmitting} loadingText="Enregistrement…">
              <Flex align="center" gap={2}>
                <LuCheck size={14} />Ajouter le vol
              </Flex>
            </Button>
          </Flex>

        </VStack>
      </form>
    </Box>
  )
}

export default EditAirline