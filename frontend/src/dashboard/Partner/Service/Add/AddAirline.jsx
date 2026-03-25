import {
  Box, Button, Field, Input, Textarea,
  Text, Flex, Grid, VStack,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import * as yup from "yup"
import { useNavigate } from "react-router-dom"
import { AxiosToken } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"
import {
  LuPlane, LuMapPin, LuGlobe, LuBadgeCheck,
  LuChevronLeft, LuCheck, LuStar, LuGift,
} from "react-icons/lu"
import { FaWifi, FaUtensils, FaSuitcase, FaStar } from "react-icons/fa"

const CLASSES = ["Économique", "Affaires", "Première classe"]

const AMENITIES = [
  { key: "wifi",    label: "Wi-Fi à bord",   Icon: FaWifi     },
  { key: "meals",   label: "Repas inclus",   Icon: FaUtensils },
  { key: "baggage", label: "Bagage en soute",Icon: FaSuitcase },
  { key: "lounge",  label: "Salon VIP",      Icon: FaStar     },
]

const validationSchema = yup.object({
  name:yup.string().required("Le nom est requis"),
  hub:yup.string().required("L'aéroport hub est requis"),
  description:yup.string().required("La description est requise"),
  classes:yup.array().min(1, "Sélectionnez au moins une classe"),
  amenities:yup.array().min(1, "Sélectionnez au moins une Services"),
})

function FormField({ formik, name, label, required, icon: Icon, children, hint }) {
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
      {children ?? (
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
            name={name} value={formik.values[name]}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            border="none" bg="transparent" px={0} h="42px" flex={1}
            fontSize="sm" color="gray.800"
            outline={"none"}
            _focus={{ boxShadow: "none" }}
            _placeholder={{ color: "gray.300" }}
          />
        </Flex>
      )}
      {isInvalid && (
        <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
          {formik.errors[name]}
        </Field.ErrorText>
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

const AddAirline = () => {
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: {
      name: "", hub: "",
      website: "", description: "",
      classes: [], amenities: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await AxiosToken.post("/service/airline/add", values)
        toaster.create({ description: "Compagnie ajoutée avec succès.", type: "success", closable: true })
        setTimeout(() => navigate("/partner/dashboard/service"), 1800)
      } catch {
        toaster.create({ description: "Une erreur est survenue.", type: "error", closable: true })
      }
    }
  })

  const toggleArr = (field, val) => {
    const arr = formik.values[field]
    formik.setFieldValue(field,
      arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
    )
  }

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
          Nouveau service
        </Text>
        <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Ajouter une compagnie aérienne
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Renseignez les informations de votre compagnie
        </Text>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <VStack gap={4} align="stretch">

          {/* Identity */}
          <SectionCard title="Identité de la compagnie" icon={LuBadgeCheck} iconColor="blue">
            <VStack gap={4} align="stretch">
                <FormField formik={formik} name="name" label="Nom" required icon={LuPlane}
                  hint="Nom officiel de la compagnie" />
              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormField formik={formik} name="hub" label="Aéroport hub" required icon={LuMapPin}
                  hint="Ex: Tunis-Carthage (TUN)" />
                <FormField formik={formik} name="website" label="Site web" icon={LuGlobe}
                  hint="https://..." />
              </Grid>
              <FormField formik={formik} name="description" label="Description" required
                hint="Décrivez votre réseau, vos destinations phares, vos atouts…">
                <Textarea
                  name="description" value={formik.values.description}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  placeholder="Compagnie nationale fondée en 1948, opérant sur plus de 50 destinations dans 30 pays…"
                  border="1.5px solid"
                  borderColor={formik.touched.description && formik.errors.description ? "red.400" : "gray.200"}
                  borderRadius="xl" fontSize="sm" minH="110px" resize="vertical" p={3}
                  _focus={{ borderColor: "blue.400",
                    boxShadow: "0 0 0 3px rgba(49,130,206,0.12)", outline: "none" }}
                  _placeholder={{ color: "gray.300" }}
                />
                {formik.touched.description && formik.errors.description && (
                  <Text fontSize="xs" color="red.500" mt={1}>{formik.errors.description}</Text>
                )}
              </FormField>
            </VStack>
          </SectionCard>

          {/* Classes */}
          <SectionCard title="Classes proposées *" icon={LuStar} iconColor="yellow">
            <Flex gap={3} flexWrap="wrap">
              {CLASSES.map(cls => {
                const active = formik.values.classes.includes(cls)
                return (
                  <Flex key={cls} as="button" type="button"
                    align="center" gap={2} px={5} py={3}
                    borderRadius="xl" border="1.5px solid"
                    borderColor={active ? "blue.400" : "gray.200"}
                    bg={active ? "blue.50" : "white"}
                    color={active ? "blue.600" : "gray.500"}
                    fontWeight={active ? 700 : 500} fontSize="sm"
                    cursor="pointer" transition="all 0.15s"
                    onClick={() => toggleArr("classes", cls)}>
                    <FaStar size={12} />{cls}
                    {active && <LuCheck size={12} />}
                  </Flex>
                )
              })}
            </Flex>
            {formik.touched.classes && formik.errors.classes && (
              <Text fontSize="xs" color="red.500" mt={2}>{formik.errors.classes}</Text>
            )}
          </SectionCard>

          {/* Amenities */}
          <SectionCard title="Services à bord" icon={LuGift} iconColor="purple">
            <Grid templateColumns="repeat(auto-fill, minmax(180px, 1fr))" gap={3}>
              {AMENITIES.map(({ key, label, Icon }) => {
                const active = formik.values.amenities.includes(key)
                return (
                  <Flex key={key} as="button" type="button"
                    align="center" gap={2.5} px={4} py={3}
                    borderRadius="xl" border="1.5px solid"
                    borderColor={active ? "purple.400" : "gray.200"}
                    bg={active ? "purple.50" : "white"}
                    color={active ? "purple.600" : "gray.500"}
                    fontWeight={active ? 600 : 400} fontSize="sm"
                    cursor="pointer" transition="all 0.15s"
                    onClick={() => toggleArr("amenities", key)}>
                    <Icon size={14} />{label}
                    {active && <Box ml="auto"><LuCheck size={12} /></Box>}
                  </Flex>
                )
              })}
            </Grid>
            {formik.touched.amenities && formik.errors.amenities && (
              <Text fontSize="xs" color="red.500" mt={2}>{formik.errors.amenities}</Text>
            )}
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
                <LuCheck size={14} />Ajouter la compagnie
              </Flex>
            </Button>
          </Flex>

        </VStack>
      </form>
    </Box>
  )
}

export default AddAirline