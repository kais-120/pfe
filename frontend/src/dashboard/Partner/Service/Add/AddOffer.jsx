import {
  Container, Input, Textarea, Button,
  VStack, Field, Box, FileUpload,
  Grid, Flex, Text, Image,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import {
  LuUpload, LuMapPin, LuImage, LuChevronLeft,
  LuCheck, LuX, LuGlobe, LuUsers, LuBanknote,
  LuClock, LuAlignLeft, LuTag, LuPackage,
} from "react-icons/lu"
import * as Yup from "yup"
import { AxiosToken } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

/* ── Validation ─────────────────────────────────────────────────── */
const validationSchema = Yup.object({
  title: Yup.string().required("Le titre est requis"),
  destination: Yup.string().required("La destination est requise"),
  price: Yup.number().min(1, "Prix invalide").required("Le prix est requis"),
  type: Yup.string().required("Le type est requis"),
  images: Yup.array().min(1, "Ajoutez au moins une photo").max(15),
})

const OFFER_TYPES = [
  { value: "circuit", label: "Circuit" },
  { value: "package", label: "Package" },
  { value: "sejour", label: "Séjour" },
  { value: "croisiere", label: "Croisière" },
  { value: "aventure", label: "Aventure" },
  { value: "omar", label: "Omar" },
  { value: "haj", label: "Haj" },
]

function Card({ title, icon: Icon, iconColor = "blue", children }) {
  return (
    <Box bg="white" borderRadius="2xl" p={6}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)">
      <Flex align="center" gap={2} mb={5}>
        <Flex w="28px" h="28px" borderRadius="lg"
          bg={`${iconColor}.50`} color={`${iconColor}.500`}
          align="center" justify="center" flexShrink={0}>
          <Icon size={14} />
        </Flex>
        <Text fontSize="sm" fontWeight={700} color="gray.700">{title}</Text>
      </Flex>
      {children}
    </Box>
  )
}

/* ── Styled input ───────────────────────────────────────────────── */
function FormField({ formik, name, label, icon: Icon, children, hint, required }) {
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
      <Flex
        w="full" align="center"
        border="1.5px solid"
        borderColor={isInvalid ? "red.400" : "gray.200"}
        borderRadius="xl" bg="white" px={3}
        transition="all 0.15s"
        _focusWithin={{
          borderColor: isInvalid ? "red.400" : "blue.400",
          boxShadow: isInvalid
            ? "0 0 0 3px rgba(245,101,101,0.12)"
            : "0 0 0 3px rgba(49,130,206,0.12)",
        }}
      >
        {Icon && (
          <Box color={isInvalid ? "red.400" : "gray.400"} flexShrink={0} mr={2}>
            <Icon size={14} />
          </Box>
        )}
        {children}
      </Flex>
      {isInvalid && (
        <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
          {formik.errors[name]}
        </Field.ErrorText>
      )}
    </Field.Root>
  )
}

/* shorthand input props */
const inp = (formik, name, extra = {}) => ({
  name,
  value: formik.values[name],
  onChange: formik.handleChange,
  onBlur: formik.handleBlur,
  border: "none", bg: "transparent", px: 0,
  h: "42px", flex: 1, w: "full",
  fontSize: "sm", color: "gray.800",
  _focus: { boxShadow: "none" },
  _placeholder: { color: "gray.300" },
  ...extra,
})

function Pill({ label, active, color = "blue", onClick }) {
  return (
    <Flex
      as="button" type="button"
      align="center" gap={2} px={3} py={2}
      borderRadius="xl" border="1.5px solid"
      borderColor={active ? `${color}.400` : "gray.200"}
      bg={active ? `${color}.50` : "white"}
      color={active ? `${color}.600` : "gray.500"}
      fontWeight={active ? 600 : 400} fontSize="sm"
      cursor="pointer" transition="all 0.15s"
      onClick={onClick}
      _hover={{ borderColor: `${color}.300`, bg: `${color}.50` }}
    >
      <Text as="span" fontSize="xs">{label}</Text>
      {active && <LuCheck size={11} />}
    </Flex>
  )
}

function ImagePreview({ files, onRemove }) {
  if (!files?.length) return null
  return (
    <Grid templateColumns="repeat(auto-fill, minmax(80px, 1fr))" gap={2} mt={3}>
      {files.map((file, i) => (
        <Box key={i} position="relative" borderRadius="lg" overflow="hidden"
          border="1px solid" borderColor="gray.100" aspectRatio="1">
          <Image src={URL.createObjectURL(file)} w="100%" h="100%" objectFit="cover" />
          <Box position="absolute" top={1} right={1}
            w="18px" h="18px" borderRadius="full"
            bg="red.500" color="white"
            display="flex" alignItems="center" justifyContent="center"
            cursor="pointer" _hover={{ bg: "red.600" }}
            onClick={() => onRemove(i)}>
            <LuX size={10} />
          </Box>
        </Box>
      ))}
    </Grid>
  )
}

const AddOffer = () => {
  const navigate = useNavigate()
  const [previews, setPreviews] = useState([])

  const formatToArray = (text) => {
    if (!text) return [];
    return text
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  };
  const formik = useFormik({
    initialValues: {
      title: "", type: "", destination: "",
      duration: "", max_persons: "", price: "",
      description: "", included: "", not_included: "",
      images: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      const fd = new FormData()
      fd.append("title", values.title)
      fd.append("type", values.type)
      fd.append("destination", values.destination)
      fd.append("price", values.price)
      if (values.duration) fd.append("duration", values.duration)
      if (values.max_persons) fd.append("max_persons", values.max_persons)
      if (values.description) fd.append("description", values.description)
      if (values.included) fd.append("included", JSON.stringify(formatToArray(values.included)));
      if (values.not_included) fd.append("not_included", JSON.stringify(formatToArray(values.not_included)));
      values.images.forEach(img => fd.append("service_doc", img))

      try {
        await AxiosToken.post("/service/agency/offer/add", fd)
        toaster.create({
          description: "Offre publiée avec succès.",
          type: "success", closable: true,
        })
        setTimeout(() => navigate(-1), 1800)
      } catch {
        toaster.create({
          description: "Une erreur est survenue.",
          type: "error", closable: true,
        })
      }
    },
  })

  const handleFiles = (files) => {
    const arr = Array.from(files)
    formik.setFieldValue("images", arr)
    setPreviews(arr)
  }

  const removeImage = (idx) => {
    const updated = previews.filter((_, i) => i !== idx)
    formik.setFieldValue("images", updated)
    setPreviews(updated)
  }

  return (
    <Container py={2}>

      {/* Back */}
      <Flex as="button" type="button" align="center" gap={1.5}
        color="gray.400" fontSize="sm" mb={6}
        _hover={{ color: "blue.500" }} transition="color 0.15s"
        onClick={() => navigate(-1)}>
        <LuChevronLeft size={14} />
        Retour
      </Flex>

      {/* Header */}
      <Box mb={8}>
        <Text fontSize="xs" fontWeight={700} color="blue.500"
          textTransform="uppercase" letterSpacing="widest" mb={1}>
          Gestion des offres
        </Text>
        <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Ajouter une offre
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Publiez un circuit, package ou séjour pour vos clients
        </Text>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <VStack gap={4} align="stretch">

          {/* ── Card 1 : Informations de l'offre ── */}
          <Card title="Informations de l'offre" icon={LuPackage} iconColor="blue">
            <VStack gap={4} align="stretch">

              <FormField formik={formik} name="title" label="Titre de l'offre"
                icon={LuPackage} required>
                <Input outline={"none"} {...inp(formik, "title")} placeholder="Ex: Voyage top Vente Istanbul 7 jours" />
              </FormField>

              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                <FormField formik={formik} name="destination" label="Destination"
                  icon={LuMapPin} required>
                  <Input outline={"none"} {...inp(formik, "destination")} placeholder="Ex: Tunisie, Istanbul" />
                </FormField>
                <FormField formik={formik} name="duration" label="Durée" icon={LuClock}>
                  <Input outline={"none"} {...inp(formik, "duration")} placeholder="Ex: 7 jours / 6 nuits" />
                </FormField>
              </Grid>

              {/* Type */}
              <Box>
                <Flex align="center" gap={1} mb={2}>
                  <Text fontSize="xs" fontWeight={700} color={
                    formik.touched.type && formik.errors.type ? "red.500" : "gray.600"
                  } textTransform="uppercase" letterSpacing="wider">
                    Type d'offre
                  </Text>
                  <Text color="red.400" fontSize="xs">*</Text>
                </Flex>
                <Flex gap={2} flexWrap="wrap">
                  {OFFER_TYPES.map(({ value, label }) => (
                    <Pill key={value} label={label}
                      active={formik.values.type === value}
                      onClick={() => formik.setFieldValue("type", value)} />
                  ))}
                </Flex>
                {formik.touched.type && formik.errors.type && (
                  <Text fontSize="xs" color="red.500" mt={1}>{formik.errors.type}</Text>
                )}
              </Box>

              {/* Description */}
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                  Description
                </Text>
                <Flex w="full" align="flex-start"
                  border="1.5px solid" borderColor="gray.200"
                  borderRadius="xl" bg="white" px={3} pt={2.5}
                  _focusWithin={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 3px rgba(49,130,206,0.12)"
                  }}>
                  <Box color="gray.400" mr={2} mt={0.5} flexShrink={0}>
                    <LuAlignLeft size={14} />
                  </Box>
                  <Textarea
                    outline={"none"}
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Décrivez l'itinéraire, les étapes, les activités, les hébergements…"
                    border="none" bg="transparent" px={0}
                    flex={1} w="full" minH="110px"
                    fontSize="sm" color="gray.800" resize="vertical"
                    _focus={{ boxShadow: "none" }}
                    _placeholder={{ color: "gray.300" }}
                  />
                </Flex>
              </Box>
            </VStack>
          </Card>

          {/* ── Card 2 : Tarification & capacité ── */}
          <Card title="Tarification & capacité" icon={LuBanknote} iconColor="green">
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
              <FormField formik={formik} name="price" label="Prix par personne"
                icon={LuTag} required>
                <Input outline={"none"} {...inp(formik, "price", { type: "number" })} placeholder="450" />
                <Text fontSize="xs" color="gray.400" flexShrink={0} ml={2}>TND</Text>
              </FormField>
              <FormField formik={formik} name="max_persons" label="Personnes maximum"
                icon={LuUsers}>
                <Input outline={"none"} {...inp(formik, "max_persons", { type: "number" })} placeholder="20" />
                <Text fontSize="xs" color="gray.400" flexShrink={0} ml={2}>pers.</Text>
              </FormField>
            </Grid>
          </Card>

          {/* ── Card 3 : Inclus / Non inclus ── */}
          <Card title="Inclus & non inclus" icon={LuCheck} iconColor="purple">
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                  Inclus
                </Text>
                <Flex w="full" align="flex-start"
                  border="1.5px solid" borderColor="gray.200"
                  borderRadius="xl" bg="white" px={3} pt={2.5}
                  _focusWithin={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 3px rgba(49,130,206,0.12)"
                  }}>
                  <Textarea
                    outline={"none"}
                    name="included"
                    value={formik.values.included}
                    onChange={formik.handleChange}
                    placeholder="Hébergement, transport, guide, repas…"
                    border="none" bg="transparent" px={0}
                    flex={1} w="full" minH="100px"
                    fontSize="sm" color="gray.800" resize="vertical"
                    _focus={{ boxShadow: "none" }}
                    _placeholder={{ color: "gray.300" }}
                  />
                </Flex>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                  Non inclus
                </Text>
                <Flex w="full" align="flex-start"
                  border="1.5px solid" borderColor="gray.200"
                  borderRadius="xl" bg="white" px={3} pt={2.5}
                  _focusWithin={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 3px rgba(49,130,206,0.12)"
                  }}>
                  <Textarea
                    outline={"none"}
                    name="not_included"
                    value={formik.values.not_included}
                    onChange={formik.handleChange}
                    placeholder="Vols internationaux, assurance, dépenses personnelles…"
                    border="none" bg="transparent" px={0}
                    flex={1} w="full" minH="100px"
                    fontSize="sm" color="gray.800" resize="vertical"
                    _focus={{ boxShadow: "none" }}
                    _placeholder={{ color: "gray.300" }}
                  />
                </Flex>
              </Box>
            </Grid>
          </Card>

          {/* ── Card 4 : Photos ── */}
          <Box bg="white" borderRadius="2xl" p={6}
            border="1px solid"
            borderColor={formik.touched.images && formik.errors.images
              ? "red.200" : "gray.100"}
            boxShadow="0 1px 8px rgba(0,0,0,0.05)">
            <Flex align="center" gap={2} mb={2}>
              <Flex w="28px" h="28px" borderRadius="lg" bg="orange.50"
                color="orange.500" align="center" justify="center">
                <LuImage size={14} />
              </Flex>
              <Text fontSize="sm" fontWeight={700} color="gray.700">Photos de l'offre</Text>
            </Flex>
            <Text fontSize="xs" color="gray.400" mb={4}>
              Ajoutez jusqu'à 15 photos (.jpg, .png — max 5 MB chacune)
            </Text>

            <FileUpload.Root maxFiles={15} accept="image/*"
              onChange={e => handleFiles(e.target.files)}>
              <FileUpload.HiddenInput />
              <FileUpload.Dropzone
                w={"full"}
                border="2px dashed"
                borderColor={formik.touched.images && formik.errors.images
                  ? "red.300" : "gray.200"}
                borderRadius="xl" bg="gray.50" py={8}
                cursor="pointer" transition="all 0.15s"
                _hover={{ borderColor: "blue.300", bg: "blue.50" }}>
                <Flex direction="column" align="center" gap={2}>
                  <Flex w="44px" h="44px" borderRadius="xl" bg="white"
                    align="center" justify="center"
                    boxShadow="0 1px 6px rgba(0,0,0,0.08)">
                    <LuUpload size={18} color="#718096" />
                  </Flex>
                  <FileUpload.DropzoneContent>
                    <Text fontSize="sm" fontWeight={600} color="gray.600">
                      Glissez vos photos ici
                    </Text>
                    <Text fontSize="xs" color="gray.400">ou cliquez pour parcourir</Text>
                  </FileUpload.DropzoneContent>
                </Flex>
              </FileUpload.Dropzone>
            </FileUpload.Root>

            <ImagePreview files={previews} onRemove={removeImage} />

            {previews.length > 0 && (
              <Text fontSize="xs" color="gray.400" mt={2}>
                {previews.length} photo{previews.length > 1 ? "s" : ""} sélectionnée{previews.length > 1 ? "s" : ""}
              </Text>
            )}
            {formik.touched.images && formik.errors.images && (
              <Text fontSize="xs" color="red.500" mt={2}>{formik.errors.images}</Text>
            )}
          </Box>

          {/* ── Actions ── */}
          <Flex gap={3} justify="flex-end" pb={4}>
            <Button type="button" variant="outline" borderRadius="xl" px={6}
              color="gray.500" borderColor="gray.200" _hover={{ bg: "gray.50" }}
              onClick={() => navigate(-1)}>
              Annuler
            </Button>
            <Button type="submit" colorScheme="blue" borderRadius="xl"
              px={8} fontWeight={700}
              loading={formik.isSubmitting} loadingText="Publication…">
              <Flex align="center" gap={2}>
                <LuGlobe size={14} />
                Publier l'offre
              </Flex>
            </Button>
          </Flex>

        </VStack>
      </form>
    </Container>
  )
}

export default AddOffer