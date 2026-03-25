import {
  Box, Button, Input, Text, Flex, Grid,
  VStack, Field, Textarea, Switch,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import * as yup from "yup"
import { useNavigate } from "react-router-dom"
import { AxiosToken } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"
import {
  LuTag, LuChevronLeft, LuCheck,
  LuUsers, LuClock, LuStar, LuCompass,
} from "react-icons/lu"
import { FaHiking, FaCamera, FaUmbrellaBeach } from "react-icons/fa"

const OPTION_TYPES = [
  { key: "excursion",  label: "Excursion",  Icon: LuCompass     },
  { key: "guide",      label: "Guide",      Icon: FaHiking      },
  { key: "equipement", label: "Équipement", Icon: LuTag         },
  { key: "photo",      label: "Photo/Vidéo",Icon: FaCamera      },
  { key: "transport",  label: "Transport",  Icon: FaUmbrellaBeach},
  { key: "autre",      label: "Autre",      Icon: LuStar        },
]

const validationSchema = yup.object({
  name:  yup.string().required("Le nom est requis"),
  price: yup.number().min(0, "Doit être ≥ 0").required("Le prix est requis"),
  type:  yup.string().required("Le type est requis"),
})

function FormField({ formik, name, label, required, type = "text",
  icon: Icon, placeholder, suffix, hint }) {
  const isInvalid = formik.touched[name] && !!formik.errors[name]
  return (
    <Field.Root invalid={isInvalid} w="full">
      <Field.Label>
        <Flex align="center" gap={1}>
          <Text fontSize="xs" fontWeight={700} color="gray.600"
            textTransform="uppercase" letterSpacing="wider">{label}</Text>
          {required && <Text color="red.400" fontSize="xs">*</Text>}
        </Flex>
      </Field.Label>
      {hint && <Text fontSize="xs" color="gray.400" mt={-1} mb={1}>{hint}</Text>}
      <Flex w="full" align="center"
        border="1.5px solid" borderColor={isInvalid ? "red.400" : "gray.200"}
        borderRadius="xl" bg="white" px={3} transition="all 0.15s"
        _focusWithin={{ borderColor: isInvalid ? "red.400" : "blue.400",
          boxShadow: isInvalid ? "0 0 0 3px rgba(245,101,101,0.12)" : "0 0 0 3px rgba(49,130,206,0.12)" }}>
        {Icon && <Box color={isInvalid ? "red.400" : "gray.400"} mr={2} flexShrink={0}><Icon size={14} /></Box>}
        <Input name={name} type={type} value={formik.values[name]}
          onChange={formik.handleChange} onBlur={formik.handleBlur}
          placeholder={placeholder}
          border="none" bg="transparent" px={0} h="42px" flex={1}
          fontSize="sm" color="gray.800"
          _focus={{ boxShadow: "none" }} _placeholder={{ color: "gray.300" }} />
        {suffix && <Text fontSize="xs" color="gray.400" fontWeight={600} ml={2} flexShrink={0}>{suffix}</Text>}
      </Flex>
      {isInvalid && <Field.ErrorText fontSize="xs" color="red.500" mt={1}>{formik.errors[name]}</Field.ErrorText>}
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
          align="center" justify="center"><Icon size={14} /></Flex>
        <Text fontSize="sm" fontWeight={700} color="gray.700">{title}</Text>
      </Flex>
      {children}
    </Box>
  )
}

const AddTravelOption = () => {
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: {
      name: "", description: "", type: "excursion",
      price: "", duration_hours: "", max_people: "",
      available: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await AxiosToken.post("/service/travel/option/add", values)
        toaster.create({ description: "Option ajoutée avec succès.", type: "success", closable: true })
        setTimeout(() => navigate(-1), 1800)
      } catch {
        toaster.create({ description: "Une erreur est survenue.", type: "error", closable: true })
      }
    }
  })

  /* Live price preview */
  const priceLabel = formik.values.price
    ? `+${formik.values.price} TND / personne`
    : null

  return (
    <Box>

      <Flex as="button" type="button" align="center" gap={1.5}
        color="gray.400" fontSize="sm" mb={6}
        _hover={{ color: "purple.400" }} transition="color 0.15s"
        onClick={() => navigate(-1)}>
        <LuChevronLeft size={14} />Retour
      </Flex>

      <Box mb={8}>
        <Text fontSize="xs" fontWeight={700} color="purple.500"
          textTransform="uppercase" letterSpacing="widest" mb={1}>Options personnalisées</Text>
        <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Ajouter une option
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Excursion, guide, équipement ou service supplémentaire
        </Text>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <VStack gap={4} align="stretch">

          {/* Type */}
          <SectionCard title="Type d'option" icon={LuTag} iconColor="purple">
            <Grid templateColumns="repeat(auto-fill, minmax(140px, 1fr))" gap={2}>
              {OPTION_TYPES.map(({ key, label, Icon }) => {
                const active = formik.values.type === key
                return (
                  <Flex key={key} as="button" type="button"
                    align="center" gap={2} px={3} py={2.5}
                    borderRadius="xl" border="1.5px solid"
                    borderColor={active ? "purple.400" : "gray.200"}
                    bg={active ? "purple.50" : "white"}
                    color={active ? "purple.600" : "gray.500"}
                    fontWeight={active ? 600 : 400} fontSize="sm"
                    cursor="pointer" transition="all 0.15s"
                    onClick={() => formik.setFieldValue("type", key)}>
                    <Icon size={13} />{label}
                    {active && <Box ml="auto"><LuCheck size={11} /></Box>}
                  </Flex>
                )
              })}
            </Grid>
          </SectionCard>

          {/* Details */}
          <SectionCard title="Détails de l'option" icon={LuCompass} iconColor="blue">
            <VStack gap={4} align="stretch">
              <FormField formik={formik} name="name" label="Nom" required
                icon={LuTag} placeholder="Ex: Balade à dos de chameau" />
              <Box>
                <Flex align="center" gap={1} mb={1.5}>
                  <Text fontSize="xs" fontWeight={700} color="gray.600"
                    textTransform="uppercase" letterSpacing="wider">Description</Text>
                </Flex>
                <Flex w="full" align="flex-start"
                  border="1.5px solid" borderColor="gray.200"
                  borderRadius="xl" bg="white" px={3} pt={2.5}
                  _focusWithin={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}>
                  <Textarea name="description" value={formik.values.description}
                    onChange={formik.handleChange}
                    placeholder="1h de balade guidée dans les dunes avec coucher de soleil…"
                    border="none" bg="transparent" px={0} flex={1}
                    fontSize="sm" color="gray.800" minH="80px" resize="vertical"
                    _focus={{ boxShadow: "none" }} _placeholder={{ color: "gray.300" }} />
                </Flex>
              </Box>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormField formik={formik} name="duration_hours" label="Durée"
                  type="number" icon={LuClock} placeholder="2" suffix="heures" />
                <FormField formik={formik} name="max_people" label="Personnes max"
                  type="number" icon={LuUsers} placeholder="10" suffix="pers." />
              </Grid>
            </VStack>
          </SectionCard>

          {/* Pricing */}
          <SectionCard title="Prix" icon={LuTag} iconColor="orange">
            <FormField formik={formik} name="price" label="Prix par personne" required
              type="number" icon={LuTag} placeholder="50" suffix="TND"
              hint="Coût supplémentaire ajouté au prix du circuit" />
            {priceLabel && (
              <Flex align="center" gap={3} bg="orange.50" borderRadius="xl"
                px={4} py={3} border="1px solid" borderColor="orange.200" mt={3}>
                <Box color="orange.400"><LuTag size={16} /></Box>
                <Box>
                  <Text fontSize="xs" color="orange.600" fontWeight={600}>Supplément</Text>
                  <Text fontSize="xl" fontWeight={900} color="orange.500">{priceLabel}</Text>
                </Box>
              </Flex>
            )}
          </SectionCard>

          {/* Availability */}
          <Box bg="white" borderRadius="2xl" px={6} py={4}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)">
            <Flex align="center" justify="space-between">
              <Box>
                <Text fontSize="sm" fontWeight={700} color="gray.800">
                  Disponible immédiatement
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Activez pour proposer cette option aux voyageurs
                </Text>
              </Box>
              <Switch.Root
                checked={formik.values.available}
                onCheckedChange={({ checked }) => formik.setFieldValue("available", checked)}
                colorPalette="blue">
                <Switch.HiddenInput />
                <Switch.Control><Switch.Thumb /></Switch.Control>
              </Switch.Root>
            </Flex>
          </Box>

          <Flex gap={3} justify="flex-end" pb={4}>
            <Button type="button" variant="outline" borderRadius="xl" px={6}
              color="gray.500" borderColor="gray.200" _hover={{ bg: "gray.50" }}
              onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" colorScheme="purple" borderRadius="xl" px={8} fontWeight={700}
              loading={formik.isSubmitting} loadingText="Enregistrement…">
              <Flex align="center" gap={2}><LuCheck size={14} />Ajouter l'option</Flex>
            </Button>
          </Flex>

        </VStack>
      </form>
    </Box>
  )
}

export default AddTravelOption