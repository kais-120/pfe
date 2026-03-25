import {
  Box, Button, Input, Text, Flex, Grid,
  VStack, Field, Textarea,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import * as yup from "yup"
import { useNavigate } from "react-router-dom"
import { AxiosToken } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"
import {
  LuCompass, LuMapPin, LuGlobe, LuUsers,
  LuChevronLeft, LuCheck, LuPlus, LuX,
} from "react-icons/lu"
import { FaCampground, FaMountain, FaUmbrellaBeach, FaHiking, FaStar } from "react-icons/fa"
import { useState } from "react"

const CATEGORIES = [
  { key: "voyage",   label: "Voyage",   Icon: LuCompass       },
  { key: "camping",  label: "Camping",  Icon: FaCampground    },
  { key: "desert",   label: "Désert",   Icon: FaMountain      },
  { key: "aventure", label: "Aventure", Icon: FaHiking        },
  { key: "plage",    label: "Plage",    Icon: FaUmbrellaBeach },
  { key: "montagne", label: "Montagne", Icon: FaMountain      },
  { key: "culturel", label: "Culturel", Icon: FaStar          },
]
const DEFAULT_EQUIPMENTS = [
  "Tente", "Sac de couchage", "Matelas", "Lampe frontale",
  "Kit premiers secours", "GPS", "Gourde", "Repas inclus",
]

const validationSchema = yup.object({
  name: yup.string().required("Le nom est requis"),
  description:yup.string().required("La description est requise"),
  location:yup.string().required("La localisation est requise"),
  categories:yup.array().min(1, "Sélectionnez au moins une catégorie"),
})

function FormField({ formik, name, label, required, type = "text", icon: Icon, placeholder, hint }) {
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
        <Input outline={"none"} name={name} type={type} value={formik.values[name]}
          onChange={formik.handleChange} onBlur={formik.handleBlur}
          placeholder={placeholder}
          border="none" bg="transparent" px={0} h="42px" flex={1}
          fontSize="sm" color="gray.800"
          _focus={{ boxShadow: "none" }} _placeholder={{ color: "gray.300" }} />
      </Flex>
      {isInvalid && <Field.ErrorText  fontSize="xs" color="red.500" mt={1}>{formik.errors[name]}</Field.ErrorText>}
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

const AddVoyageAgency = () => {
  const navigate = useNavigate()
  const [customEquip, setCustomEquip] = useState("")

  const formik = useFormik({
    initialValues: {
      name: "", description: "", location: "",
      website: "", phone: "",
      categories: [], equipments: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await AxiosToken.post("/service/voyage/add", values)
        toaster.create({ description: "Agence créée avec succès.", type: "success", closable: true })
        setTimeout(() => navigate("/partner/dashboard/service"), 1800)
      } catch {
        toaster.create({ description: "Une erreur est survenue.", type: "error", closable: true })
      }
    }
  })

  const toggleArr = (field, val) => {
    const arr = formik.values[field]
    formik.setFieldValue(field, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const addCustomEquip = () => {
    const val = customEquip.trim()
    if (!val || formik.values.equipments.includes(val)) return
    formik.setFieldValue("equipments", [...formik.values.equipments, val])
    setCustomEquip("")
  }

  return (
    <Box>

      <Flex as="button" type="button" align="center" gap={1.5}
        color="gray.400" fontSize="sm" mb={6}
        _hover={{ color: "blue.500" }} transition="color 0.15s"
        onClick={() => navigate(-1)}>
        <LuChevronLeft size={14} />Retour
      </Flex>

      <Box mb={8}>
        <Text fontSize="xs" fontWeight={700} color="blue.500"
          textTransform="uppercase" letterSpacing="widest" mb={1}>Nouveau service</Text>
        <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Créer mon agence de voyage
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Renseignez votre profil pour attirer des voyageurs
        </Text>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <VStack gap={4} align="stretch">

          <SectionCard title="Informations de l'agence" icon={LuCompass} iconColor="blue">
            <VStack gap={4} align="stretch">
              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormField formik={formik} name="name" label="Nom" required
                  icon={LuCompass} placeholder="Ex: Sahara Trek Tunisie" />
                <FormField formik={formik} name="location" label="Localisation" required
                  icon={LuMapPin} placeholder="Ex: Douz, Kébili" />
              </Grid>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormField formik={formik} name="phone" label="Téléphone"
                  icon={LuUsers} placeholder="Ex: 75 000 000" />
                <FormField formik={formik} name="website" label="Site web"
                  icon={LuGlobe} placeholder="https://..." />
              </Grid>
              <Box>
                <Flex align="center" gap={1} mb={1.5}>
                  <Text fontSize="xs" fontWeight={700} color="gray.600"
                    textTransform="uppercase" letterSpacing="wider">Description *</Text>
                </Flex>
                <Flex w="full" align="flex-start"
                  border="1.5px solid"
                  borderColor={formik.touched.description && formik.errors.description ? "red.400" : "gray.200"}
                  borderRadius="xl" bg="white" px={3} pt={2.5}
                  _focusWithin={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}>
                  <Textarea outline={"none"} name="description" value={formik.values.description}
                    onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="Spécialistes des expéditions dans le désert du Sahara depuis 2005…"
                    border="none" bg="transparent" px={0} flex={1}
                    fontSize="sm" color="gray.800" minH="110px" resize="vertical"
                    _focus={{ boxShadow: "none" }} _placeholder={{ color: "gray.300" }} />
                </Flex>
                {formik.touched.description && formik.errors.description && (
                  <Text fontSize="xs" color="red.500" mt={1}>{formik.errors.description}</Text>
                )}
              </Box>
            </VStack>
          </SectionCard>

          <SectionCard title="Types d'expériences *" icon={FaHiking} iconColor="green">
            <Grid templateColumns="repeat(auto-fill, minmax(130px, 1fr))" gap={2}>
              {CATEGORIES.map(({ key, label, Icon }) => {
                const active = formik.values.categories.includes(key)
                return (
                  <Flex key={key} as="button" type="button"
                    align="center" gap={2} px={3} py={2.5}
                    borderRadius="xl" border="1.5px solid"
                    borderColor={active ? "blue.400" : "gray.200"}
                    bg={active ? "blue.50" : "white"}
                    color={active ? "blue.600" : "gray.500"}
                    fontWeight={active ? 600 : 400} fontSize="sm"
                    cursor="pointer" transition="all 0.15s"
                    onClick={() => toggleArr("categories", key)}>
                    <Icon size={13} />{label}
                    {active && <Box ml="auto"><LuCheck size={11} /></Box>}
                  </Flex>
                )
              })}
            </Grid>
            {formik.touched.categories && formik.errors.categories && (
              <Text fontSize="xs" color="red.500" mt={2}>{formik.errors.categories}</Text>
            )}
          </SectionCard>

          <SectionCard title="Équipements fournis" icon={LuCheck} iconColor="orange">
            <Grid templateColumns="repeat(auto-fill, minmax(155px, 1fr))" gap={2} mb={4}>
              {DEFAULT_EQUIPMENTS.map(eq => {
                const active = formik.values.equipments.includes(eq)
                return (
                  <Flex key={eq} as="button" type="button"
                    align="center" gap={2} px={3} py={2}
                    borderRadius="xl" border="1.5px solid"
                    borderColor={active ? "orange.400" : "gray.200"}
                    bg={active ? "orange.50" : "white"}
                    color={active ? "orange.600" : "gray.500"}
                    fontWeight={active ? 600 : 400} fontSize="sm"
                    cursor="pointer" transition="all 0.15s"
                    onClick={() => toggleArr("equipments", eq)}>
                    <LuCheck size={11} />{eq}
                  </Flex>
                )
              })}
              {formik.values.equipments.filter(e => !DEFAULT_EQUIPMENTS.includes(e)).map(e => (
                <Flex key={e} align="center" gap={2} px={3} py={2}
                  borderRadius="xl" border="1.5px solid" borderColor="orange.400"
                  bg="orange.50" color="orange.600" fontWeight={600} fontSize="sm">
                  <LuCheck size={11} />{e}
                  <Box as="button" type="button" ml="auto" onClick={() => toggleArr("equipments", e)}>
                    <LuX size={11} />
                  </Box>
                </Flex>
              ))}
            </Grid>
            <Flex gap={2}>
              <Flex flex={1} align="center" border="1.5px solid" borderColor="gray.200"
                borderRadius="xl" bg="white" px={3}
                _focusWithin={{ borderColor: "orange.400", boxShadow: "0 0 0 3px rgba(237,137,54,0.12)" }}>
                <Input outline={"none"} value={customEquip} onChange={e => setCustomEquip(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomEquip())}
                  placeholder="Ajouter un équipement personnalisé…"
                  border="none" bg="transparent" px={0} h="38px" fontSize="sm"
                  _focus={{ boxShadow: "none" }} _placeholder={{ color: "gray.300" }} />
              </Flex>
              <Button size="sm" colorScheme="orange" borderRadius="xl" px={4} onClick={addCustomEquip}>
                <LuPlus size={14} />
              </Button>
            </Flex>
          </SectionCard>

          <Flex gap={3} justify="flex-end" pb={4}>
            <Button type="button" variant="outline" borderRadius="xl" px={6}
              color="gray.500" borderColor="gray.200" _hover={{ bg: "gray.50" }}
              onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" colorScheme="blue" borderRadius="xl" px={8} fontWeight={700}
              loading={formik.isSubmitting} loadingText="Création…">
              <Flex align="center" gap={2}><LuCheck size={14} />Créer l'agence</Flex>
            </Button>
          </Flex>

        </VStack>
      </form>
    </Box>
  )
}

export default AddVoyageAgency