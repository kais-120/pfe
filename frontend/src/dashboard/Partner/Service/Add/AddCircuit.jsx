import {
  Box, Button, Input, Text, Flex, Grid,
  VStack, Field, Textarea, SimpleGrid,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import * as yup from "yup"
import { useNavigate } from "react-router-dom"
import { AxiosToken } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"
import {
  LuCompass, LuMapPin, LuUsers, LuClock,
  LuChevronLeft, LuCheck, LuPlus, LuX,
  LuUpload, LuCalendar, LuMountain, LuTag,
} from "react-icons/lu"
import { FaCampground, FaMountain, FaUmbrellaBeach, FaHiking, FaStar } from "react-icons/fa"
import { useState } from "react"

const CATEGORIES = [
  { key: "voyage",   label: "Voyage",   Icon: LuCompass       },
  { key: "camping",  label: "Camping",  Icon: FaCampground    },
  { key: "désert",   label: "Désert",   Icon: FaMountain      },
  { key: "aventure", label: "Aventure", Icon: FaHiking        },
  { key: "plage",    label: "Plage",    Icon: FaUmbrellaBeach },
  { key: "montagne", label: "Montagne", Icon: FaMountain      },
  { key: "culturel", label: "Culturel", Icon: FaStar          },
]

const DIFFICULTIES = [
  { val: "facile",        color: "green"  },
  { val: "modéré",        color: "yellow" },
  { val: "difficile",     color: "orange" },
  { val: "très difficile",color: "red"    },
]

const INCLUSIONS_DEFAULT = [
  "Transport", "Guide", "Repas", "Hébergement",
  "Équipement", "Assurance", "Photos",
]

const validationSchema = yup.object({
  title:yup.string().required("Le titre est requis"),
  location:yup.string().required("La localisation est requise"),
  description:yup.string().required("La description est requise"),
  price_per_person:yup.number().positive("Doit être positif").required("Le prix est requis"),
  duration_days:yup.number().positive("Doit être positif").required("La durée est requise"),
  max_people:yup.number().positive("Doit être positif").required("La capacité est requise"),
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
        <Input outline={"none"} name={name} type={type} value={formik.values[name]}
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

const AddCircuit = () => {
  const navigate = useNavigate()
  const [previews, setPreviews] = useState([])
  const [dateInput, setDateInput] = useState("")

  const formik = useFormik({
    initialValues: {
      title: "", location: "", description: "",
      category: "voyage", difficulty: "modéré",
      price_per_person: "", duration_days: "", max_people: "",
      inclusions: [], available_dates: [],
      images: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const fd = new FormData()
        Object.entries(values).forEach(([k, v]) => {
          if (k === "images")          v.forEach(img => fd.append("service_doc", img))
          else if (k === "inclusions" || k === "available_dates")
            v.forEach(x => fd.append(`${k}[]`, x))
          else fd.append(k, v)
        })
        await AxiosToken.post("/service/voyage/circuit/add", fd)
        toaster.create({ description: "Circuit ajouté avec succès.", type: "success", closable: true })
        setTimeout(() => navigate(-1), 1800)
      } catch {
        toaster.create({ description: "Une erreur est survenue.", type: "error", closable: true })
      }
    }
  })

  const toggleIncl = (val) => {
    const arr = formik.values.inclusions
    formik.setFieldValue("inclusions", arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const addDate = () => {
    if (!dateInput || formik.values.available_dates.includes(dateInput)) return
    formik.setFieldValue("available_dates", [...formik.values.available_dates, dateInput])
    setDateInput("")
  }

  const removeDate = (d) =>
    formik.setFieldValue("available_dates", formik.values.available_dates.filter(x => x !== d))

  const handleImages = (files) => {
    const arr = Array.from(files)
    formik.setFieldValue("images", arr)
    setPreviews(arr.map(f => URL.createObjectURL(f)))
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
          textTransform="uppercase" letterSpacing="widest" mb={1}>Gestion des circuits</Text>
        <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Ajouter un circuit
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Décrivez l'expérience que vous proposez
        </Text>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <VStack gap={4} align="stretch">

          {/* General info */}
          <SectionCard title="Informations générales" icon={LuCompass} iconColor="blue">
            <VStack gap={4} align="stretch">
              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormField formik={formik} name="title" label="Titre du circuit" required
                  icon={LuCompass} placeholder="Ex: Trek Désert Sahara 3 jours" />
                <FormField formik={formik} name="location" label="Destination" required
                  icon={LuMapPin} placeholder="Ex: Douz → Ksar Ghilane" />
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
                    placeholder="3 jours au cœur du désert avec nuit sous les étoiles, balade à dos de chameau et coucher de soleil sur les dunes…"
                    border="none" bg="transparent" px={0} flex={1}
                    fontSize="sm" color="gray.800" minH="100px" resize="vertical"
                    _focus={{ boxShadow: "none" }} _placeholder={{ color: "gray.300" }} />
                </Flex>
                {formik.touched.description && formik.errors.description && (
                  <Text fontSize="xs" color="red.500" mt={1}>{formik.errors.description}</Text>
                )}
              </Box>
            </VStack>
          </SectionCard>

          {/* Category + difficulty */}
          <SectionCard title="Catégorie & difficulté" icon={LuMountain} iconColor="green">
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>Catégorie</Text>
                <Flex gap={2} flexWrap="wrap">
                  {CATEGORIES.map(({ key, label, Icon }) => {
                    const active = formik.values.category === key
                    return (
                      <Flex key={key} as="button" type="button"
                        align="center" gap={2} px={3} py={2}
                        borderRadius="xl" border="1.5px solid"
                        borderColor={active ? "blue.400" : "gray.200"}
                        bg={active ? "blue.50" : "white"}
                        color={active ? "blue.600" : "gray.500"}
                        fontWeight={active ? 600 : 400} fontSize="sm"
                        cursor="pointer" transition="all 0.15s"
                        onClick={() => formik.setFieldValue("category", key)}>
                        <Icon size={12} />{label}
                        {active && <LuCheck size={11} />}
                      </Flex>
                    )
                  })}
                </Flex>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>Difficulté</Text>
                <Flex gap={2} flexWrap="wrap">
                  {DIFFICULTIES.map(({ val, color }) => {
                    const active = formik.values.difficulty === val
                    return (
                      <Box key={val} as="button" type="button"
                        px={4} py={2} borderRadius="xl" fontSize="sm" fontWeight={600}
                        border="1.5px solid"
                        borderColor={active ? `${color}.400` : "gray.200"}
                        bg={active ? `${color}.50` : "white"}
                        color={active ? `${color}.600` : "gray.500"}
                        cursor="pointer" transition="all 0.15s" textTransform="capitalize"
                        onClick={() => formik.setFieldValue("difficulty", val)}>
                        {val}
                      </Box>
                    )
                  })}
                </Flex>
              </Box>
            </VStack>
          </SectionCard>

          {/* Pricing & capacity */}
          <SectionCard title="Tarif & capacité" icon={LuTag} iconColor="orange">
            <Grid templateColumns="1fr 1fr 1fr" gap={4}>
              <FormField formik={formik} name="price_per_person" label="Prix / personne"
                required type="number" icon={LuTag} placeholder="350" suffix="TND" />
              <FormField formik={formik} name="duration_days" label="Durée"
                required type="number" icon={LuClock} placeholder="3" suffix="jours" />
              <FormField formik={formik} name="max_people" label="Groupe max"
                required type="number" icon={LuUsers} placeholder="12" suffix="pers." />
            </Grid>
          </SectionCard>

          {/* Inclusions */}
          <SectionCard title="Ce qui est inclus" icon={LuCheck} iconColor="teal">
            <Grid templateColumns="repeat(auto-fill, minmax(140px, 1fr))" gap={2}>
              {INCLUSIONS_DEFAULT.map(inc => {
                const active = formik.values.inclusions.includes(inc)
                return (
                  <Flex key={inc} as="button" type="button"
                    align="center" gap={2} px={3} py={2}
                    borderRadius="xl" border="1.5px solid"
                    borderColor={active ? "teal.400" : "gray.200"}
                    bg={active ? "teal.50" : "white"}
                    color={active ? "teal.600" : "gray.500"}
                    fontWeight={active ? 600 : 400} fontSize="sm"
                    cursor="pointer" transition="all 0.15s"
                    onClick={() => toggleIncl(inc)}>
                    <LuCheck size={11} />{inc}
                  </Flex>
                )
              })}
            </Grid>
          </SectionCard>

          {/* Available dates */}
          <SectionCard title="Dates disponibles" icon={LuCalendar} iconColor="blue">
            <Flex gap={2} mb={3}>
              <Flex flex={1} align="center" border="1.5px solid" borderColor="gray.200"
                borderRadius="xl" bg="white" px={3}
                _focusWithin={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}>
                <Box color="gray.400" mr={2}><LuCalendar size={14} /></Box>
                <Input type="date" value={dateInput}
                  onChange={e => setDateInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addDate())}
                  border="none" bg="transparent" px={0} h="42px" flex={1}
                  fontSize="sm" color="gray.800" _focus={{ boxShadow: "none" }} />
              </Flex>
              <Button colorScheme="blue" borderRadius="xl" px={4} onClick={addDate}>
                <LuPlus size={14} />
              </Button>
            </Flex>
            {formik.values.available_dates.length > 0 && (
              <Flex gap={2} flexWrap="wrap">
                {formik.values.available_dates.map(d => (
                  <Flex key={d} align="center" gap={2}
                    bg="blue.50" color="blue.700" borderRadius="full"
                    px={3} py={1.5} fontSize="xs" fontWeight={600}
                    border="1px solid" borderColor="blue.200">
                    <LuCalendar size={11} />
                    {new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    <Box as="button" type="button" onClick={() => removeDate(d)}>
                      <LuX size={11} />
                    </Box>
                  </Flex>
                ))}
              </Flex>
            )}
            {formik.values.available_dates.length === 0 && (
              <Text fontSize="xs" color="gray.400">
                Ajoutez les dates de départ disponibles pour ce circuit.
              </Text>
            )}
          </SectionCard>

          {/* Photos */}
          <SectionCard title="Photos du circuit" icon={LuUpload} iconColor="purple">
            <Box border="2px dashed" borderColor="gray.200" borderRadius="xl"
              bg="gray.50" p={5} cursor="pointer" transition="all 0.15s"
              _hover={{ borderColor: "blue.300", bg: "blue.50" }}
              position="relative" mb={previews.length > 0 ? 3 : 0}>
              <Box as="input" type="file" accept="image/*" multiple
                position="absolute" inset={0} opacity={0} cursor="pointer"
                onChange={e => handleImages(e.target.files)} />
              <Flex direction="column" align="center" gap={2}>
                <Flex w="40px" h="40px" borderRadius="xl" bg="white"
                  align="center" justify="center"
                  boxShadow="0 1px 6px rgba(0,0,0,0.08)">
                  <LuUpload size={16} color="#718096" />
                </Flex>
                <Text fontSize="sm" fontWeight={600} color="gray.600">
                  Glissez vos photos ici
                </Text>
                <Text fontSize="xs" color="gray.400">JPG, PNG — max 5 MB</Text>
              </Flex>
            </Box>
            {previews.length > 0 && (
              <SimpleGrid columns={5} gap={2}>
                {previews.map((src, i) => (
                  <Box key={i} h="70px" borderRadius="lg" overflow="hidden"
                    border="1px solid" borderColor="gray.100">
                    <Box as="img" src={src} w="100%" h="100%"
                      style={{ objectFit: "cover" }} />
                  </Box>
                ))}
              </SimpleGrid>
            )}
            {previews.length > 0 && (
              <Text fontSize="xs" color="gray.400" mt={2}>
                {previews.length} photo{previews.length > 1 ? "s" : ""} sélectionnée{previews.length > 1 ? "s" : ""}
              </Text>
            )}
          </SectionCard>

          <Flex gap={3} justify="flex-end" pb={4}>
            <Button type="button" variant="outline" borderRadius="xl" px={6}
              color="gray.500" borderColor="gray.200" _hover={{ bg: "gray.50" }}
              onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" colorScheme="blue" borderRadius="xl" px={8} fontWeight={700}
              loading={formik.isSubmitting} loadingText="Enregistrement…">
              <Flex align="center" gap={2}><LuCheck size={14} />Ajouter le circuit</Flex>
            </Button>
          </Flex>

        </VStack>
      </form>
    </Box>
  )
}

export default AddCircuit