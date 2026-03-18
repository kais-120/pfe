import {
  Container, Heading, Input, Textarea, Button,
  VStack, Field, Box, FileUpload, Icon,
  createListCollection, Select, Portal,
  Grid, Flex, Text, Image, SimpleGrid,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { LuUpload, LuHotel, LuMapPin, LuAlignLeft, LuImage, LuWifi,
  LuChevronLeft, LuCheck, LuX } from "react-icons/lu";
import { FaWifi, FaSwimmingPool, FaDumbbell, FaSpa, FaSnowflake, FaUtensils, FaParking } from "react-icons/fa";
import * as Yup from "yup";
import { AxiosToken } from "../../../../Api/Api";
import { toaster } from "../../../../components/ui/toaster";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const validationSchema = Yup.object({
  name:        Yup.string().required("Le nom de l'hôtel est requis"),
  description: Yup.string().required("La description est requise"),
  address:     Yup.string().required("L'adresse est requise"),
  equipments:  Yup.array().min(1, "Veuillez sélectionner au moins un équipement"),
  images:      Yup.array()
    .min(1, "Veuillez ajouter au moins une image")
    .max(15, "Maximum 15 images autorisées"),
});

/* ── Equipment options with icons ───────────────────────────────── */
const EQUIPMENTS = [
  { value: "wifi",          label: "Wi-Fi",         Icon: FaWifi        },
  { value: "piscine",       label: "Piscine",        Icon: FaSwimmingPool},
  { value: "gym",           label: "Gym",            Icon: FaDumbbell    },
  { value: "spa",           label: "Spa",            Icon: FaSpa         },
  { value: "climatisation", label: "Climatisation",  Icon: FaSnowflake   },
  { value: "restaurant",    label: "Restaurant",     Icon: FaUtensils    },
  { value: "parking",       label: "Parking",        Icon: FaParking     },
]

const equipmentsList = createListCollection({
  items: EQUIPMENTS.map(e => ({ label: e.label, value: e.value })),
})

/* ── Text field wrapper ─────────────────────────────────────────── */
function FormField({ formik, name, label, icon: Icon, children, hint }) {
  const isInvalid = formik.touched[name] && formik.errors[name]
  return (
    <Field.Root invalid={!!isInvalid} w="full">
      <Field.Label>
        <Text fontSize="xs" fontWeight={700} color="gray.600"
          textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
      </Field.Label>
      {hint && <Text fontSize="xs" color="gray.400" mt={-1} mb={1}>{hint}</Text>}
      <Flex
        w="full"
        align={children?.type === Textarea ? "flex-start" : "center"}
        border="1.5px solid"
        borderColor={isInvalid ? "red.400" : "gray.200"}
        borderRadius="xl"
        bg="white"
        px={3}
        pt={children?.type === Textarea ? 2.5 : 0}
        transition="border-color 0.15s, box-shadow 0.15s"
        _focusWithin={{
          borderColor: isInvalid ? "red.400" : "blue.400",
          boxShadow: isInvalid
            ? "0 0 0 3px rgba(245,101,101,0.12)"
            : "0 0 0 3px rgba(49,130,206,0.12)",
        }}
      >
        {Icon && (
          <Box color={isInvalid ? "red.400" : "gray.400"} flexShrink={0} mr={2} mt={children?.type === Textarea ? 0.5 : 0}>
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

/* ── Image preview grid ─────────────────────────────────────────── */
function ImagePreview({ files, onRemove }) {
  if (!files?.length) return null
  return (
    <SimpleGrid columns={{ base: 3, sm: 4, md: 5 }} gap={2} mt={3}>
      {files.map((file, i) => (
        <Box key={i} position="relative" borderRadius="lg" overflow="hidden"
          border="1px solid" borderColor="gray.100" aspectRatio="1">
          <Image
            src={URL.createObjectURL(file)}
            w="100%" h="100%" objectFit="cover"
          />
          <Box
            position="absolute" top={1} right={1}
            w="18px" h="18px" borderRadius="full"
            bg="red.500" color="white"
            display="flex" alignItems="center" justifyContent="center"
            cursor="pointer" _hover={{ bg: "red.600" }}
            onClick={() => onRemove(i)}
          >
            <LuX size={10} />
          </Box>
        </Box>
      ))}
    </SimpleGrid>
  )
}

const AddHotel = () => {
  const navigate = useNavigate()
  const [previews, setPreviews] = useState([])

  const formik = useFormik({
    initialValues: {
      name: "", description: "", address: "",
      equipments: [], images: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData()
      formData.append("name",        values.name)
      formData.append("description", values.description)
      formData.append("address",     values.address)
      values.equipments.forEach(eq  => formData.append("equipments[]", eq))
      values.images.forEach(img     => formData.append("service_doc",  img))

      try {
        await AxiosToken.post("/service/hotel/add", formData)
        toaster.create({
          description: "Hôtel ajouté avec succès.",
          type: "success", closable: true,
        })
        setTimeout(() => navigate("/partner/dashboard/service"), 1800)
      } catch {
        toaster.create({
          description: "Une erreur est survenue.",
          type: "error", closable: true,
        })
      }
    }
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

  const toggleEquipment = (value) => {
    const current = formik.values.equipments
    const updated = current.includes(value)
      ? current.filter(e => e !== value)
      : [...current, value]
    formik.setFieldValue("equipments", updated)
  }

  return (
    <Container maxW="720px" py={2}>

      {/* Back */}
      <Flex as="button" type="button" align="center" gap={1.5}
        color="gray.400" fontSize="sm" mb={6}
        _hover={{ color: "blue.500" }} transition="color 0.15s"
        onClick={() => navigate(-1)}
      >
        <LuChevronLeft size={15} />
        Retour
      </Flex>

      {/* Header */}
      <Box mb={8}>
        <Text fontSize="xs" fontWeight={700} color="blue.500"
          textTransform="uppercase" letterSpacing="widest" mb={1}>
          Gestion des services
        </Text>
        <Heading size="xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Ajouter un hôtel
        </Heading>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Renseignez les informations de votre établissement
        </Text>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <VStack gap={4} align="stretch">

          {/* ── Card 1: Informations générales ── */}
          <Box bg="white" borderRadius="2xl" p={6}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)">

            <Flex align="center" gap={2} mb={5}>
              <Flex w="28px" h="28px" borderRadius="lg" bg="blue.50"
                color="blue.500" align="center" justify="center">
                <LuHotel size={14} />
              </Flex>
              <Text fontSize="sm" fontWeight={700} color="gray.700">
                Informations générales
              </Text>
            </Flex>

            <VStack gap={4} align="stretch">
              <FormField formik={formik} name="name" label="Nom de l'hôtel" icon={LuHotel}>
                <Input
                  name="name" placeholder="Ex: Vincci Helios Beach"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  border="none" bg="transparent" px={0} h="42px"
                  flex={1} w="full"
                  fontSize="sm" color="gray.800"
                  _focus={{ boxShadow: "none" }}
                  _placeholder={{ color: "gray.300" }}
                />
              </FormField>

              <FormField formik={formik} name="address" label="Adresse" icon={LuMapPin}>
                <Input
                  name="address" placeholder="Ex: Midoun Djerba, 4116 Midoun"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  border="none" bg="transparent" px={0} h="42px"
                  flex={1} w="full"
                  fontSize="sm" color="gray.800"
                  _focus={{ boxShadow: "none" }}
                  _placeholder={{ color: "gray.300" }}
                />
              </FormField>

              <FormField formik={formik} name="description" label="Description" icon={LuAlignLeft}>
                <Textarea
                  name="description"
                  placeholder="Décrivez votre hôtel : emplacement, ambiance, services..."
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  border="none" bg="transparent" px={0}
                  flex={1} w="full"
                  minH="120px" fontSize="sm" color="gray.800"
                  resize="vertical"
                  _focus={{ boxShadow: "none" }}
                  _placeholder={{ color: "gray.300" }}
                />
              </FormField>
            </VStack>
          </Box>

          {/* ── Card 2: Équipements ── */}
          <Box bg="white" borderRadius="2xl" p={6}
            border="1px solid"
            borderColor={formik.touched.equipments && formik.errors.equipments ? "red.200" : "gray.100"}
            boxShadow="0 1px 8px rgba(0,0,0,0.05)">

            <Flex align="center" gap={2} mb={2}>
              <Flex w="28px" h="28px" borderRadius="lg" bg="purple.50"
                color="purple.500" align="center" justify="center">
                <LuWifi size={14} />
              </Flex>
              <Text fontSize="sm" fontWeight={700} color="gray.700">
                Équipements & services
              </Text>
            </Flex>
            <Text fontSize="xs" color="gray.400" mb={4}>
              Sélectionnez tout ce que propose votre hôtel
            </Text>

            <Grid templateColumns={{ base: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" }} gap={2}>
              {EQUIPMENTS.map(({ value, label, Icon }) => {
                const selected = formik.values.equipments.includes(value)
                return (
                  <Flex
                    key={value}
                    as="button" type="button"
                    align="center" gap={2}
                    px={3} py={2.5}
                    borderRadius="xl"
                    border="1.5px solid"
                    borderColor={selected ? "blue.400" : "gray.200"}
                    bg={selected ? "blue.50" : "white"}
                    color={selected ? "blue.600" : "gray.500"}
                    fontWeight={selected ? 600 : 400}
                    fontSize="sm"
                    cursor="pointer"
                    transition="all 0.15s"
                    onClick={() => toggleEquipment(value)}
                    _hover={{
                      borderColor: selected ? "blue.400" : "gray.300",
                      bg: selected ? "blue.50" : "gray.50",
                    }}
                  >
                    <Icon size={13} />
                    {label}
                    {selected && (
                      <Box ml="auto" color="blue.500">
                        <LuCheck size={12} />
                      </Box>
                    )}
                  </Flex>
                )
              })}
            </Grid>

            {formik.touched.equipments && formik.errors.equipments && (
              <Text fontSize="xs" color="red.500" mt={2}>{formik.errors.equipments}</Text>
            )}
          </Box>

          {/* ── Card 3: Images ── */}
          <Box bg="white" borderRadius="2xl" p={6}
            border="1px solid"
            borderColor={formik.touched.images && formik.errors.images ? "red.200" : "gray.100"}
            boxShadow="0 1px 8px rgba(0,0,0,0.05)">

            <Flex align="center" gap={2} mb={2}>
              <Flex w="28px" h="28px" borderRadius="lg" bg="orange.50"
                color="orange.500" align="center" justify="center">
                <LuImage size={14} />
              </Flex>
              <Text fontSize="sm" fontWeight={700} color="gray.700">Photos de l'hôtel</Text>
            </Flex>
            <Text fontSize="xs" color="gray.400" mb={4}>
              Ajoutez jusqu'à 15 photos (.jpg, .png — max 5 MB chacune)
            </Text>

            <FileUpload.Root
              maxFiles={15}
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
            >
              <FileUpload.HiddenInput />
              <FileUpload.Dropzone
               w={"full"}
                border="2px dashed"
                borderColor={formik.touched.images && formik.errors.images ? "red.300" : "gray.200"}
                borderRadius="xl"
                bg="gray.50"
                py={8}
                cursor="pointer"
                transition="all 0.15s"
                _hover={{ borderColor: "blue.300", bg: "blue.50" }}
              >
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
                    <Text fontSize="xs" color="gray.400">
                      ou cliquez pour parcourir
                    </Text>
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

          <Flex gap={3} justify="flex-end" pb={4}>
            <Button
              type="button" variant="outline"
              borderRadius="xl" px={6}
              color="gray.500" borderColor="gray.200"
              _hover={{ bg: "gray.50" }}
              onClick={() => navigate(-1)}
            >
              Annuler
            </Button>
            <Button
              type="submit" colorScheme="blue"
              borderRadius="xl" px={8} fontWeight={700}
              loading={formik.isSubmitting}
              loadingText="Enregistrement…"
            >
              <Flex align="center" gap={2}>
                <LuCheck size={14} />
                Ajouter l'hôtel
              </Flex>
            </Button>
          </Flex>

        </VStack>
      </form>
    </Container>
  )
}

export default AddHotel