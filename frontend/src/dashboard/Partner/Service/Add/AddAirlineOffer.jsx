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
  LuTag, LuCalendar, LuTicket, LuCheck,
  LuChevronLeft, LuPercent, LuBanknote,
  LuStar, LuAlignLeft,
} from "react-icons/lu"
import { FaStar } from "react-icons/fa"

const FLIGHT_CLASSES = ["Toutes classes", "Économique", "Affaires", "Première"]

const validationSchema = yup.object({
  title:       yup.string().required("Le titre est requis"),
  discount:    yup.number().positive("Doit être positif").required("La réduction est requise"),
  type:        yup.string().required(),
  valid_from:  yup.string().required("Date de début requise"),
  valid_until: yup.string().required("Date de fin requise"),
})

function FormField({ formik, name, label, required, type = "text", icon: Icon,
  placeholder, suffix, hint }) {
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
        _focusWithin={{
          borderColor: isInvalid ? "red.400" : "blue.400",
          boxShadow: isInvalid
            ? "0 0 0 3px rgba(245,101,101,0.12)"
            : "0 0 0 3px rgba(49,130,206,0.12)",
        }}>
        {Icon && <Box color={isInvalid ? "red.400" : "gray.400"} mr={2} flexShrink={0}><Icon size={14} /></Box>}
        <Input name={name} type={type}
          value={formik.values[name]}
          onChange={formik.handleChange} onBlur={formik.handleBlur}
          placeholder={placeholder}
          border="none" bg="transparent" px={0} h="42px" flex={1}
          fontSize="sm" color="gray.800"
          _focus={{ boxShadow: "none" }} _placeholder={{ color: "gray.300" }} />
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
          align="center" justify="center"><Icon size={14} /></Flex>
        <Text fontSize="sm" fontWeight={700} color="gray.700">{title}</Text>
      </Flex>
      {children}
    </Box>
  )
}

const AddAirlineOffer = () => {
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: {
      title: "", description: "", code: "",
      discount: "", type: "pourcentage",
      valid_from: "", valid_until: "",
      flight_class: "Toutes classes",
      min_purchase: "",
      loyalty_points: false,
      points_required: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await AxiosToken.post("/service/flight/offer/add", values)
        toaster.create({ description: "Offre créée avec succès.", type: "success", closable: true })
        setTimeout(() => navigate(-1), 1800)
      } catch {
        toaster.create({ description: "Une erreur est survenue.", type: "error", closable: true })
      }
    }
  })

  const discountPreview = formik.values.discount
    ? formik.values.type === "pourcentage"
      ? `-${formik.values.discount}%`
      : `-${formik.values.discount} TND`
    : null

  return (
    <Box maxW="700px">

      <Flex as="button" type="button" align="center" gap={1.5}
        color="gray.400" fontSize="sm" mb={6}
        _hover={{ color: "orange.400" }} transition="color 0.15s"
        onClick={() => navigate(-1)}>
        <LuChevronLeft size={14} />Retour
      </Flex>

      <Box mb={8}>
        <Text fontSize="xs" fontWeight={700} color="orange.500"
          textTransform="uppercase" letterSpacing="widest" mb={1}>
          Offres exclusives
        </Text>
        <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Créer une offre promotionnelle
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Attirez plus de passagers avec des réductions ciblées
        </Text>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <VStack gap={4} align="stretch">

          {/* General */}
          <SectionCard title="Informations de l'offre" icon={LuTag} iconColor="orange">
            <VStack gap={4} align="stretch">
              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormField formik={formik} name="title" label="Titre" required
                  icon={LuTag} placeholder="Ex: Promo Été 2026" />
                <FormField formik={formik} name="code" label="Code promo"
                  icon={LuTicket} placeholder="Ex: ETE2026"
                  hint="Optionnel" />
              </Grid>
              <Box>
                <Flex align="center" gap={1} mb={1.5}>
                  <Text fontSize="xs" fontWeight={700} color="gray.600"
                    textTransform="uppercase" letterSpacing="wider">Description</Text>
                </Flex>
                <Flex w="full" align="flex-start"
                  border="1.5px solid" borderColor="gray.200"
                  borderRadius="xl" bg="white" px={3} pt={2.5}
                  _focusWithin={{ borderColor: "orange.400",
                    boxShadow: "0 0 0 3px rgba(237,137,54,0.12)" }}>
                  <Box color="gray.400" mr={2} mt={0.5} flexShrink={0}>
                    <LuAlignLeft size={14} />
                  </Box>
                  <Textarea name="description" value={formik.values.description}
                    onChange={formik.handleChange}
                    placeholder="Profitez de -20% sur tous nos vols vers l'Europe cet été…"
                    border="none" bg="transparent" px={0} flex={1}
                    fontSize="sm" color="gray.800" minH="80px" resize="vertical"
                    _focus={{ boxShadow: "none" }} _placeholder={{ color: "gray.300" }} />
                </Flex>
              </Box>
            </VStack>
          </SectionCard>

          {/* Discount */}
          <SectionCard title="Réduction" icon={LuPercent} iconColor="red">
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>
                  Type de réduction *
                </Text>
                <Flex gap={3}>
                  {[
                    { val: "pourcentage",  label: "Pourcentage (%)",    Icon: LuPercent  },
                    { val: "montant fixe", label: "Montant fixe (TND)", Icon: LuBanknote },
                  ].map(({ val, label, Icon }) => {
                    const active = formik.values.type === val
                    return (
                      <Flex key={val} as="button" type="button" flex={1}
                        align="center" justify="center" gap={2} px={4} py={3}
                        borderRadius="xl" border="1.5px solid"
                        borderColor={active ? "orange.400" : "gray.200"}
                        bg={active ? "orange.50" : "white"}
                        color={active ? "orange.600" : "gray.500"}
                        fontWeight={active ? 700 : 500} fontSize="sm"
                        cursor="pointer" transition="all 0.15s"
                        onClick={() => formik.setFieldValue("type", val)}>
                        <Icon size={14} />{label}
                        {active && <LuCheck size={13} />}
                      </Flex>
                    )
                  })}
                </Flex>
              </Box>

              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormField formik={formik} name="discount" label="Valeur" required
                  type="number" placeholder="20"
                  suffix={formik.values.type === "pourcentage" ? "%" : "TND"} />
                <FormField formik={formik} name="min_purchase" label="Achat minimum"
                  type="number" placeholder="200" suffix="TND" hint="Optionnel" />
              </Grid>

              {discountPreview && (
                <Flex align="center" gap={3} bg="orange.50" borderRadius="xl"
                  px={4} py={3} border="1px solid" borderColor="orange.200">
                  <Box color="orange.400"><LuTag size={16} /></Box>
                  <Box>
                    <Text fontSize="xs" color="orange.600" fontWeight={600}>Aperçu</Text>
                    <Text fontSize="xl" fontWeight={900} color="orange.500">{discountPreview}</Text>
                  </Box>
                </Flex>
              )}
            </VStack>
          </SectionCard>

          {/* Validity & targeting */}
          <SectionCard title="Validité & ciblage" icon={LuCalendar} iconColor="blue">
            <VStack gap={4} align="stretch">
              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormField formik={formik} name="valid_from" label="Date de début"
                  required type="date" icon={LuCalendar} />
                <FormField formik={formik} name="valid_until" label="Date de fin"
                  required type="date" icon={LuCalendar} />
              </Grid>
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>
                  Classe concernée
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {FLIGHT_CLASSES.map(cls => {
                    const active = formik.values.flight_class === cls
                    return (
                      <Box key={cls} as="button" type="button"
                        px={4} py={2} borderRadius="xl" fontSize="sm" fontWeight={600}
                        border="1.5px solid"
                        borderColor={active ? "blue.400" : "gray.200"}
                        bg={active ? "blue.50" : "white"}
                        color={active ? "blue.600" : "gray.500"}
                        cursor="pointer" transition="all 0.15s"
                        onClick={() => formik.setFieldValue("flight_class", cls)}>
                        {cls}
                      </Box>
                    )
                  })}
                </Flex>
              </Box>
            </VStack>
          </SectionCard>

          {/* Loyalty */}
          <SectionCard title="Programme de fidélité" icon={LuStar} iconColor="yellow">
            <Flex align="center" justify="space-between"
              bg="yellow.50" borderRadius="xl" px={4} py={3}
              border="1px solid" borderColor="yellow.200" mb={4}>
              <Box>
                <Text fontSize="sm" fontWeight={600} color="gray.800">
                  Paiement par points fidélité
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Permettre l'utilisation de points pour cette offre
                </Text>
              </Box>
              <Switch.Root
                checked={formik.values.loyalty_points}
                onCheckedChange={({ checked }) =>
                  formik.setFieldValue("loyalty_points", checked)}
                colorPalette="yellow">
                <Switch.HiddenInput />
                <Switch.Control><Switch.Thumb /></Switch.Control>
              </Switch.Root>
            </Flex>
            {formik.values.loyalty_points && (
              <FormField formik={formik} name="points_required"
                label="Points requis" type="number"
                icon={LuStar} placeholder="500" suffix="pts"
                hint="Nombre de points nécessaires" />
            )}
          </SectionCard>

          {/* Actions */}
          <Flex gap={3} justify="flex-end" pb={4}>
            <Button type="button" variant="outline" borderRadius="xl" px={6}
              color="gray.500" borderColor="gray.200" _hover={{ bg: "gray.50" }}
              onClick={() => navigate(-1)}>
              Annuler
            </Button>
            <Button type="submit" colorScheme="orange" borderRadius="xl"
              px={8} fontWeight={700}
              loading={formik.isSubmitting} loadingText="Création…">
              <Flex align="center" gap={2}><LuTag size={14} />Créer l'offre</Flex>
            </Button>
          </Flex>

        </VStack>
      </form>
    </Box>
  )
}

export default AddAirlineOffer