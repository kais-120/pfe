import {
  Container, Input, Textarea, Button,
  VStack, Field, Box, FileUpload,
  Grid, Flex, Text, Image, Spinner,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import {
  LuUpload, LuMapPin, LuImage, LuChevronLeft,
  LuCheck, LuX, LuCar, LuUsers, LuBanknote,
  LuCalendar, LuAlignLeft, LuShieldCheck, LuSettings,
} from "react-icons/lu"
import { FaGasPump, FaSnowflake, FaWifi } from "react-icons/fa"
import * as Yup from "yup"
import { AxiosToken, imageURL } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"
import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Helmet } from "react-helmet"

// Validation schema factory - allows no new images if existing images present
const createValidationSchema = (hasExistingImages = false) => {
  return Yup.object({
    brand: Yup.string().required("La marque est requise"),
    model: Yup.string().required("Le modèle est requis"),
    year: Yup.number().min(1990).max(2030).required("L'année est requise"),
    category: Yup.string().oneOf(["economy", "standard", "luxury"]).required("La catégorie est requise"),
    fuel: Yup.string().oneOf(["petrol", "diesel", "electric", "hybrid"]).required("Le carburant est requis"),
    seats: Yup.number().min(1).max(20).required("Le nombre de places est requis"),
    price_per_day: Yup.number().min(1).required("Le prix est requis"),
    min_age: Yup.number().min(18).required("L'âge minimum est requis"),
    license_years: Yup.number().min(1).required("Requis"),
    caution_standard: Yup.number().min(0).required("La caution standard est requise"),
    deposit: Yup.number().min(0).required("Le dépôt est requis"),
    // If there are existing images, don't require new ones
    images: hasExistingImages 
      ? Yup.array().max(15)
      : Yup.array().min(1, "Veuillez ajouter au moins une image").max(15),
  })
}

const CATEGORIES = [
  { value: "economy", label: "Economy" },
  { value: "standard", label: "Standard" },
  { value: "luxury", label: "Luxury" },
]

const FUELS = [
  { value: "petrol", label: "Essence" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Électrique" },
  { value: "hybrid", label: "Hybride" },
]

const STATUSES = [
  { value: "available", label: "Disponible", color: "green" },
  { value: "booked", label: "En location", color: "orange" },
  { value: "maintenance", label: "Maintenance", color: "red" },
]

const FEATURES = [
  { value: "ac", label: "Climatisation", Icon: FaSnowflake },
  { value: "gps", label: "GPS", Icon: LuMapPin },
  { value: "wifi", label: "Wi-Fi", Icon: FaWifi },
  { value: "automatic", label: "Automatique", Icon: LuSettings },
  { value: "bluetooth", label: "Bluetooth", Icon: LuSettings },
  { value: "usb", label: "Port USB", Icon: LuSettings },
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

function FormField({ formik, name, label, icon: Icon, children, hint }) {
  const isInvalid = formik.touched[name] && !!formik.errors[name]
  return (
    <Field.Root invalid={isInvalid} w="full">
      <Field.Label>
        <Text fontSize="xs" fontWeight={700} color="gray.600"
          textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
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

const inp = (formik, name, extra = {}) => ({
  name,
  value: formik.values[name],
  onChange: formik.handleChange,
  onBlur: formik.handleBlur,
  border: "none",
  bg: "transparent",
  px: 0,
  h: "42px",
  flex: 1,
  w: "full",
  fontSize: "sm",
  color: "gray.800",
  _focus: { boxShadow: "none" },
  _placeholder: { color: "gray.300" },
  ...extra,
})

function Pill({ label, active, color = "blue", onClick, icon: Icon }) {
  return (
    <Flex
      as="button" type="button"
      align="center" gap={2}
      px={3} py={2.5} borderRadius="xl"
      border="1.5px solid"
      borderColor={active ? `${color}.400` : "gray.200"}
      bg={active ? `${color}.50` : "white"}
      color={active ? `${color}.600` : "gray.500"}
      fontWeight={active ? 600 : 400} fontSize="sm"
      cursor="pointer" transition="all 0.15s"
      onClick={onClick}
      _hover={{ borderColor: `${color}.300`, bg: `${color}.50` }}
    >
      {Icon && <Icon size={13} />}
      <Text as="span" fontSize="xs">{label}</Text>
      {active && <Box ml="auto" color={`${color}.500`}><LuCheck size={11} /></Box>}
    </Flex>
  )
}

function ImagePreview({ newFiles, existingImages, onRemoveNew, onRemoveExisting }) {
  const hasImages = (newFiles?.length > 0) || (existingImages?.length > 0);
  if (!hasImages) return null;

  return (
    <Grid templateColumns="repeat(auto-fill, minmax(80px, 1fr))" gap={2} mt={3}>
      {/* Existing images from server */}
      {existingImages?.map((img, i) => (
        <Box key={`existing-${i}`} position="relative" borderRadius="lg" overflow="hidden"
          border="1px solid" borderColor="gray.100" aspectRatio="1">
          <Image 
            src={`${imageURL}/services/${img.image_url}`} 
            w="100%" h="100%" objectFit="cover"
            fallback={<Box bg="gray.100" w="100%" h="100%" />}
          />
          <Box
            position="absolute" top={1} right={1}
            w="18px" h="18px" borderRadius="full"
            bg="red.500" color="white"
            display="flex" alignItems="center" justifyContent="center"
            cursor="pointer" _hover={{ bg: "red.600" }}
            onClick={() => onRemoveExisting(img.id)}
          >
            <LuX size={10} />
          </Box>
        </Box>
      ))}

      {/* New uploaded images */}
      {newFiles?.map((file, i) => (
        <Box key={`new-${i}`} position="relative" borderRadius="lg" overflow="hidden"
          border="1px solid" borderColor="gray.100" aspectRatio="1">
          <Image src={URL.createObjectURL(file)} w="100%" h="100%" objectFit="cover" />
          <Box
            position="absolute" top={1} right={1}
            w="18px" h="18px" borderRadius="full"
            bg="red.500" color="white"
            display="flex" alignItems="center" justifyContent="center"
            cursor="pointer" _hover={{ bg: "red.600" }}
            onClick={() => onRemoveNew(i)}
          >
            <LuX size={10} />
          </Box>
        </Box>
      ))}
    </Grid>
  )
}

/* ── Main component ─────────────────────────────────────────────── */
const EditVehicle = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [loading, setLoading] = useState(true)
  const [newPreviews, setNewPreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])

  const formik = useFormik({
    initialValues: {
      brand: "", model: "", year: "",
      category: "", fuel: "",
      seats: "", price_per_day: "",
      min_age: "21", license_years: "2",
      caution_standard: "", deposit: "",
      description: "", features: [],
      status: "available", images: [],
    },
    validationSchema: createValidationSchema(existingImages.length > 0),
    onSubmit: useCallback(async (values) => {
      const fd = new FormData()
      fd.append("brand", values.brand)
      fd.append("model", values.model)
      fd.append("year", values.year)
      fd.append("category", values.category)
      fd.append("fuel", values.fuel)
      fd.append("seats", values.seats)
      fd.append("price_per_day", values.price_per_day)
      fd.append("min_age", values.min_age)
      fd.append("license_years", values.license_years)
      fd.append("caution_standard", values.caution_standard)
      fd.append("deposit", values.deposit)
      fd.append("description", values.description)
      fd.append("status", values.status)
      values.features.forEach(f => fd.append("features[]", f))
      values.images.forEach(img => fd.append("service_doc", img))
      
      if (imagesToDelete.length > 0) {
        fd.append("delete_images", JSON.stringify(imagesToDelete))
      }

      try {
        await AxiosToken.post(`/service/vehicle/update/${id}`, fd)
        toaster.create({
          description: "Véhicule modifié avec succès.",
          type: "success", closable: true,
        })
        setTimeout(() => navigate(-1), 1800)
      } catch {
        toaster.create({
          description: "Une erreur est survenue.",
          type: "error", closable: true,
        })
      }
    }, [id, imagesToDelete, navigate]),
  })

  // Fetch vehicle data on mount
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await AxiosToken.get(`/service/vehicle/get/${id}`)
        const vehicle = response.data.vehicle

        formik.setValues({
          brand: vehicle.brand || "",
          model: vehicle.model || "",
          year: vehicle.year || "",
          category: vehicle.category || "",
          fuel: vehicle.fuel || "",
          seats: vehicle.seats || "",
          price_per_day: vehicle.price_per_day || "",
          min_age: vehicle.min_age || "21",
          license_years: vehicle.license_years || "2",
          caution_standard: vehicle.caution_standard || "",
          deposit: vehicle.deposit || "",
          description: vehicle.description || "",
          features: vehicle.features || [],
          status: vehicle.status || "available",
          images: [],
        })

        setExistingImages(vehicle.images || [])
        setLoading(false)
      } catch (error) {
        toaster.create({
          description: "Erreur lors du chargement du véhicule.",
          type: "error", closable: true,
        })
        setTimeout(() => navigate(-1), 2000)
      }
    }

    if (id) fetchVehicle()
  }, [id, navigate])

  const toggle = useCallback((field, value) => {
    const arr = formik.values[field]
    formik.setFieldValue(
      field,
      arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
    )
  }, [formik])

  const handleFiles = useCallback((files) => {
    const arr = Array.from(files)
    formik.setFieldValue("images", arr)
    setNewPreviews(arr)
  }, [formik])

  const removeNewImage = useCallback((idx) => {
    const updated = newPreviews.filter((_, i) => i !== idx)
    formik.setFieldValue("images", updated)
    setNewPreviews(updated)
  }, [newPreviews, formik])

  const removeExistingImage = useCallback((imgId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imgId))
    setImagesToDelete(prev => [...prev, imgId])
  }, [])

  const p = formik.values
  const previewTotal = p.price_per_day && p.caution_standard
    ? Number(p.price_per_day) * 3 + Number(p.caution_standard)
    : null

  const totalImages = (existingImages?.length || 0) + (newPreviews?.length || 0)

  if (loading) {
    return (
      <Container py={8} display="flex" alignItems="center" justifyContent="center" minH="400px">
        <Flex direction="column" align="center" gap={4}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.500">Chargement du véhicule...</Text>
        </Flex>
      </Container>
    )
  }

  return (
    <>
    <Helmet title="Modifier véhicule"></Helmet>
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
          Gestion de la flotte
        </Text>
        <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Modifier le véhicule
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Mettez à jour les informations du véhicule
        </Text>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <VStack gap={4} align="stretch">

          <Card title="Identité du véhicule" icon={LuCar} iconColor="blue">
            <VStack gap={4} align="stretch">
              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                <FormField formik={formik} name="brand" label="Marque" icon={LuCar}>
                  <Input outline={"none"} {...inp(formik, "brand")} placeholder="Ex: Renault" />
                </FormField>
                <FormField formik={formik} name="model" label="Modèle" icon={LuCar}>
                  <Input outline={"none"} {...inp(formik, "model")} placeholder="Ex: Clio 5" />
                </FormField>
              </Grid>

              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                <FormField formik={formik} name="year" label="Année" icon={LuCalendar}>
                  <Input outline={"none"} {...inp(formik, "year", { type: "number" })} placeholder="2022" />
                </FormField>
                <FormField formik={formik} name="seats" label="Nombre de places" icon={LuUsers}>
                  <Input outline={"none"} {...inp(formik, "seats", { type: "number" })} placeholder="5" />
                  <Text fontSize="xs" color="gray.400" flexShrink={0} ml={2}>pers.</Text>
                </FormField>
              </Grid>

              {/* Category */}
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>
                  Catégorie
                  {formik.touched.category && formik.errors.category && (
                    <Text as="span" color="red.500" ml={2} fontWeight={400} textTransform="none">
                      — {formik.errors.category}
                    </Text>
                  )}
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {CATEGORIES.map(({ value, label }) => (
                    <Pill key={value} label={label}
                      active={formik.values.category === value}
                      onClick={() => formik.setFieldValue("category", value)} />
                  ))}
                </Flex>
              </Box>

              {/* Fuel */}
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>
                  Carburant
                  {formik.touched.fuel && formik.errors.fuel && (
                    <Text as="span" color="red.500" ml={2} fontWeight={400} textTransform="none">
                      — {formik.errors.fuel}
                    </Text>
                  )}
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {FUELS.map(({ value, label }) => (
                    <Pill key={value} label={label} color="orange"
                      active={formik.values.fuel === value}
                      onClick={() => formik.setFieldValue("fuel", value)} />
                  ))}
                </Flex>
              </Box>

              {/* Description */}
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                  Description
                </Text>
                <Flex
                  w="full" align="flex-start"
                  border="1.5px solid" borderColor="gray.200"
                  borderRadius="xl" bg="white" px={3} pt={2.5}
                  _focusWithin={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 3px rgba(49,130,206,0.12)"
                  }}
                >
                  <Box color="gray.400" flexShrink={0} mr={2} mt={0.5}>
                    <LuAlignLeft size={14} />
                  </Box>
                  <Textarea
                  outline={"none"}
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Confortable et économique, idéal pour les trajets en ville et longue distance…"
                    border="none" bg="transparent" px={0}
                    flex={1} w="full" minH="90px"
                    fontSize="sm" color="gray.800" resize="vertical"
                    _focus={{ boxShadow: "none" }}
                    _placeholder={{ color: "gray.300" }}
                  />
                </Flex>
              </Box>
            </VStack>
          </Card>

          {/* ── Card 2 : Tarification & conditions ── */}
          <Card title="Tarification & conditions" icon={LuBanknote} iconColor="green">
            <VStack gap={4} align="stretch">
              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                <FormField hint="Montant" formik={formik} name="price_per_day" label="Prix / jour" icon={LuBanknote}>
                  <Input outline={"none"} {...inp(formik, "price_per_day", { type: "number" })} placeholder="80" />
                  <Text fontSize="xs" color="gray.400" flexShrink={0} ml={2}>TND</Text>
                </FormField>
                <FormField formik={formik} name="deposit" label="Dépôt" icon={LuBanknote}
                  hint="Montant bloqué à la prise en charge">
                  <Input outline={"none"} {...inp(formik, "deposit", { type: "number" })} placeholder="200" />
                  <Text fontSize="xs" color="gray.400" flexShrink={0} ml={2}>TND</Text>
                </FormField>
              </Grid>

              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }} gap={4}>
                <FormField formik={formik} name="caution_standard" label="Caution standard" icon={LuShieldCheck}>
                  <Input outline={"none"} {...inp(formik, "caution_standard", { type: "number" })} placeholder="500" />
                  <Text fontSize="xs" color="gray.400" flexShrink={0} ml={2}>TND</Text>
                </FormField>
                <FormField formik={formik} name="min_age" label="Âge minimum" icon={LuShieldCheck}>
                  <Input outline={"none"} {...inp(formik, "min_age", { type: "number" })} placeholder="21" />
                  <Text fontSize="xs" color="gray.400" flexShrink={0} ml={2}>ans</Text>
                </FormField>
                <FormField formik={formik} name="license_years" label="Permis requis" icon={LuShieldCheck}>
                  <Input outline={"none"} {...inp(formik, "license_years", { type: "number" })} placeholder="2" />
                  <Text fontSize="xs" color="gray.400" flexShrink={0} ml={2}>ans</Text>
                </FormField>
              </Grid>

              {/* Live price preview */}
              {previewTotal && (
                <Box bg="green.50" borderRadius="xl" px={4} py={3}
                  border="1px solid" borderColor="green.100">
                  <Text fontSize="xs" fontWeight={700} color="green.600"
                    textTransform="uppercase" letterSpacing="wider" mb={1}>
                    Aperçu — 3 jours
                  </Text>
                  <Flex align="baseline" gap={1.5}>
                    <Text fontSize="2xl" fontWeight={900} color="green.700" lineHeight={1}>
                      {previewTotal.toFixed(0)}
                    </Text>
                    <Text fontSize="xs" color="green.600">TND total</Text>
                  </Flex>
                  <Text fontSize="xs" color="green.500" mt={0.5}>
                    {p.price_per_day} × 3 jours + {p.caution_standard} TND caution
                  </Text>
                </Box>
              )}
            </VStack>
          </Card>

          {/* ── Card 3 : Équipements & statut ── */}
          <Box bg="white" borderRadius="2xl" p={6}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)">
            <Flex align="center" gap={2} mb={5}>
              <Flex w="28px" h="28px" borderRadius="lg" bg="purple.50"
                color="purple.500" align="center" justify="center" flexShrink={0}>
                <LuSettings size={14} />
              </Flex>
              <Text fontSize="sm" fontWeight={700} color="gray.700">
                Équipements & statut
              </Text>
            </Flex>

            <VStack gap={5} align="stretch">
              {/* Features */}
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>
                  Équipements
                </Text>
                <Grid templateColumns={{ base: "1fr 1fr", sm: "repeat(3, 1fr)" }} gap={2}>
                  {FEATURES.map(({ value, label, Icon }) => (
                    <Pill key={value} label={label} icon={Icon}
                      active={formik.values.features.includes(value)}
                      onClick={() => toggle("features", value)} />
                  ))}
                </Grid>
              </Box>

              {/* Status */}
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>
                  Statut
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {STATUSES.map(({ value, label, color }) => (
                    <Pill key={value} label={label} color={color}
                      active={formik.values.status === value}
                      onClick={() => formik.setFieldValue("status", value)} />
                  ))}
                </Flex>
              </Box>
            </VStack>
          </Box>

          {/* ── Card 4 : Photos ── */}
          <Box bg="white" borderRadius="2xl" p={6}
            border="1px solid"
            borderColor={formik.touched.images && formik.errors.images && totalImages === 0
              ? "red.200" : "gray.100"}
            boxShadow="0 1px 8px rgba(0,0,0,0.05)">

            <Flex align="center" gap={2} mb={2}>
              <Flex w="28px" h="28px" borderRadius="lg" bg="orange.50"
                color="orange.500" align="center" justify="center">
                <LuImage size={14} />
              </Flex>
              <Text fontSize="sm" fontWeight={700} color="gray.700">
                Photos du véhicule
              </Text>
            </Flex>
            <Text fontSize="xs" color="gray.400" mb={4}>
              {existingImages.length > 0 
                ? `${existingImages.length} image(s) existante(s) — Ajoutez jusqu'à ${15 - totalImages} photos supplémentaires`
                : "Ajoutez jusqu'à 15 photos"
              } (.jpg, .png — max 5 MB chacune)
            </Text>

            <FileUpload.Root maxFiles={15 - totalImages} accept="image/*"
              onChange={e => handleFiles(e.target.files)}>
              <FileUpload.HiddenInput />
              <FileUpload.Dropzone w={"full"}
                border="2px dashed"
                borderColor={formik.touched.images && formik.errors.images && totalImages === 0
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

            <ImagePreview 
              newFiles={newPreviews}
              existingImages={existingImages}
              onRemoveNew={removeNewImage}
              onRemoveExisting={removeExistingImage}
            />

            {totalImages > 0 && (
              <Text fontSize="xs" color="gray.400" mt={2}>
                {totalImages} photo{totalImages > 1 ? "s" : ""} au total
              </Text>
            )}
            {formik.touched.images && formik.errors.images && totalImages === 0 && (
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
              loading={formik.isSubmitting} loadingText="Enregistrement…">
              <Flex align="center" gap={2}>
                <LuCheck size={14} />
                Enregistrer les modifications
              </Flex>
            </Button>
          </Flex>

        </VStack>
      </form>
    </Container>
    </>
  )
}

export default EditVehicle