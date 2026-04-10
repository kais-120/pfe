import {
  Container, Input, Textarea, Button,
  VStack, Field, Box, FileUpload,
  Grid, Flex, Text, Image, HStack, Icon,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import {
  LuUpload, LuMapPin, LuImage, LuChevronLeft,
  LuCheck, LuX, LuGlobe, LuUsers, LuBanknote,
  LuClock, LuAlignLeft, LuTag, LuPackage,
  LuListTree, LuPlus, LuArrowRight, LuSearch,
} from "react-icons/lu"
import { Plane } from "lucide-react"
import * as Yup from "yup"
import { AxiosToken } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import AddPackage from "./AddPackage"

const validationSchema = Yup.object({
  title: Yup.string().required("Le titre est requis"),
  destination: Yup.string().required("La destination est requise"),
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



function Card({ title, icon: IconComp, iconColor = "blue", children }) {
  return (
    <Box bg="white" borderRadius="2xl" p={6}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)">
      <Flex align="center" gap={2} mb={5}>
        <Flex w="28px" h="28px" borderRadius="lg"
          bg={`${iconColor}.50`} color={`${iconColor}.500`}
          align="center" justify="center" flexShrink={0}>
          <IconComp size={14} />
        </Flex>
        <Text fontSize="sm" fontWeight={700} color="gray.700">{title}</Text>
      </Flex>
      {children}
    </Box>
  )
}

/* ── FormField ───────────────────────────────────────────────────── */
function FormField({ formik, name, label, icon: IconComp, children, required }) {
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
        {IconComp && (
          <Box color={isInvalid ? "red.400" : "gray.400"} flexShrink={0} mr={2}>
            <IconComp size={14} />
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

function PackageRow({ pkg, onSelect, selected }) {
  const list = Array.isArray(selected) ? selected : [];
  selected = list.some((p) => p.id === pkg.id)

  return (
    <Box
      borderRadius="xl"
      border="1.5px solid"
      borderColor={selected ? "pink.400" : "gray.100"}
      bg={selected ? "pink.50" : "white"}
      p={4}
      cursor="pointer"
      transition="all 0.15s"
      _hover={{ borderColor: "pink.300", bg: "pink.50" }}
      onClick={() => onSelect(pkg)}
    >
      <Grid templateColumns={{ base: "1fr", sm: "1fr auto auto auto" }} gap={4} alignItems="center">

        {/* Flight dates */}
        <VStack align="start" gap={1}>
          <Text fontSize="sm" fontWeight={700} color="gray.900">{pkg.title}</Text>
          <HStack gap={3} fontSize="xs" color="gray.500" flexWrap="wrap">
            <Flex align="center" gap={1}>
              <Icon as={Plane} boxSize="10px" />
              <Text>{new Date(pkg.departureDate).toISOString().split("T")[0]}</Text>
              <Text>{pkg.departureTime}</Text>
              <LuArrowRight size={10} />
              <Text>{new Date(pkg.returnDate).toISOString().split("T")[0]}</Text>
              <Text>{pkg.returnTime}</Text>
            </Flex>
            <Text color="gray.300">·</Text>
            <Text>{pkg.duration}</Text>
          </HStack>
          {/* Destinations inline */}
          <HStack gap={3} flexWrap="wrap" mt={0.5}>
            {pkg.destinations.map((d, i) => (
              <HStack key={i} gap={1} fontSize="xs" color="gray.600">
                <LuMapPin size={11} color="#A0AEC0" />
                <Text>{d.name}</Text>
                <Text color="gray.400">({d.nights}N)</Text>
              </HStack>
            ))}
          </HStack>
        </VStack>

        {/* Month badge */}
        <Box
          bg="gray.100" borderRadius="lg" px={3} py={1}
          fontSize="xs" fontWeight={600} color="gray.600"
          whiteSpace="nowrap"
        >
          {pkg.month} {pkg.year}
        </Box>

        {/* Price */}
        <VStack align="end" gap={0}>
          <HStack gap={1} align="baseline">
            <Text fontSize="xl" fontWeight={800} color="gray.900" lineHeight={1}>
              {pkg.price.toLocaleString()}
            </Text>
            <Text fontSize="xs" color="gray.400" fontWeight={600}>TND</Text>
          </HStack>
          <Text fontSize="xs" color="#E91E8C" fontWeight={700}>{pkg.installment}</Text>
        </VStack>

        {/* Select indicator */}
        <Flex
          w="28px" h="28px" borderRadius="full"
          border="1.5px solid"
          borderColor={selected ? "pink.400" : "gray.200"}
          bg={selected ? "pink.500" : "white"}
          align="center" justify="center"
          flexShrink={0}
          transition="all 0.15s"
        >
          {selected && <LuCheck size={13} color="white" />}
        </Flex>
      </Grid>
    </Box>
  )
}


function PackagesPanel({ selectedPackages, onSelectionChange, allPackages,setAllPackages }) {
  const [tab, setTab] = useState("list")
  const [search, setSearch] = useState("")

   const filtered = allPackages.filter((p) =>
    search === "" ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.destinations.some((d) => d.name.toLowerCase().includes(search.toLowerCase()))
  )

  

  // Group by month
  const grouped = {}
  filtered.forEach((pkg) => {
    const key = `${pkg.month} ${pkg.year}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(pkg)
  })

const toggleSelect = (pkg) => {
    const isSelected = selectedPackages.some((p) => p.id === pkg.id)
    onSelectionChange(
      isSelected
        ? selectedPackages.filter((p) => p.id !== pkg.id)
        : [...selectedPackages, pkg]
    )
  }
  return (
    <Box>
      {/* Tab switcher */}
      <HStack
        gap={0}
        mb={5}
        bg="gray.50"
        borderRadius="xl"
        p={1}
        border="1px solid"
        borderColor="gray.100"
        w="fit-content"
      >
        {[
          { key: "list", label: "Packages existants", icon: LuListTree },
          { key: "add",  label: "Nouveau package",   icon: LuPlus },
        ].map(({ key, label, icon: TabIcon }) => (
          <Button
            key={key}
            size="sm"
            borderRadius="lg"
            px={4}
            fontWeight={600}
            fontSize="13px"
            bg={tab === key ? "white" : "transparent"}
            color={tab === key ? "gray.800" : "gray.500"}
            boxShadow={tab === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none"}
            border="none"
            _hover={{ bg: tab === key ? "white" : "gray.100" }}
            transition="all 0.15s"
            onClick={() => setTab(key)}
            leftIcon={<TabIcon size={13} />}
          >
            {label}
          </Button>
        ))}
      </HStack>

      {/* ── LIST TAB ── */}
      {tab === "list" && (
        <Box>
          {/* Search */}
          <Flex
            align="center" gap={2} px={3}
            border="1.5px solid" borderColor="gray.200"
            borderRadius="xl" bg="white" mb={4}
            _focusWithin={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}
          >
            <LuSearch size={14} color="#A0AEC0" />
            <Input
            outline={"none"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un package…"
              border="none" bg="transparent" px={0} h="40px"
              fontSize="sm" _focus={{ boxShadow: "none" }}
              _placeholder={{ color: "gray.300" }}
            />
          </Flex>

          {/* Selected count pill */}
          {selectedPackages.length > 0 && (
            <Flex
              align="center" gap={2} mb={4} px={3} py={2}
              bg="pink.50" borderRadius="lg"
              border="1px solid" borderColor="pink.200"
            >
              <LuCheck size={13} color="#E91E8C" />
              <Text fontSize="xs" color="pink.600" fontWeight={600}>
                {selectedPackages.length} package{selectedPackages.length > 1 ? "s" : ""} sélectionné{selectedPackages.length > 1 ? "s" : ""}
              </Text>
              <Button
                size="xs" variant="ghost" color="pink.400" ml="auto"
                fontSize="xs" h="auto" p={1}
                _hover={{ color: "pink.600" }}
                onClick={() => onSelectionChange([])}
              >
                Tout désélectionner
              </Button>
            </Flex>
          )}

          {/* Grouped list */}
          {Object.keys(grouped).length === 0 ? (
            <Flex direction="column" align="center" py={10} color="gray.400" gap={2}>
              <LuSearch size={24} />
              <Text fontSize="sm">Aucun package trouvé</Text>
            </Flex>
          ) : (
            <VStack align="stretch" gap={5}>
              {Object.entries(grouped).map(([monthKey, packages]) => (
                <Box key={monthKey}>
                  {/* Month divider */}
                  <Flex align="center" gap={2} mb={3}>
                    <Box
                      w="3px" h="14px" bg="pink.400"
                      borderRadius="2px" flexShrink={0}
                    />
                    <Text fontSize="xs" fontWeight={700} color="gray.600" textTransform="uppercase" letterSpacing="0.08em">
                      {monthKey}
                    </Text>
                    <Box flex={1} h="1px" bg="gray.100" />
                    <Text fontSize="xs" color="gray.400">{packages.length} package{packages.length > 1 ? "s" : ""}</Text>
                  </Flex>
                  <VStack align="stretch" gap={2}>
                    {packages.map((pkg) => (
                      <PackageRow
                        key={pkg.id}
                        pkg={pkg}
                        selected={
                          Array.isArray(selectedPackages) &&
                          selectedPackages.some((p) => p.id === pkg.id)
                        }

                        onSelect={toggleSelect}
                      />
                    ))}
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}

      {/* ── ADD TAB ── */}
      {tab === "add" && (
        <Box>
          <AddPackage ontTab={setTab} onChange={setAllPackages} />
        </Box>
      )}
    </Box>
  )
}

const AddOffer = () => {
  const navigate = useNavigate()
  const [previews, setPreviews] = useState([])
  const [selectedPackages, setSelectedPackages] = useState([])
  const [allPackages, setAllPackages] = useState([]) 

  const formatToArray = (text) => {
    if (!text) return []
    return text.split(",").map((item) => item.trim()).filter(Boolean)
  }

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
      if (values.duration) fd.append("duration", values.duration)
      if (values.max_persons) fd.append("max_persons", values.max_persons)
      if (values.description) fd.append("description", values.description)
      if (values.included) fd.append("included", JSON.stringify(formatToArray(values.included)))
      if (values.not_included) fd.append("not_included", JSON.stringify(formatToArray(values.not_included)))
      // Attach linked package IDs
      if (allPackages.length > 0)
        fd.append("packages", JSON.stringify(allPackages))
      values.images.forEach((img) => fd.append("service_doc", img))
      console.log(allPackages)

      try {
        await AxiosToken.post("/service/agency/offer/add", fd)
        toaster.create({ description: "Offre publiée avec succès.", type: "success", closable: true })
        // setTimeout(() => navigate(-1), 1800)
      } catch {
        toaster.create({ description: "Une erreur est survenue.", type: "error", closable: true })
      }
    },
  })
  console.log(formik.errors)

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

          {/* ── Card 1 : Informations ── */}
          <Card title="Informations de l'offre" icon={LuPackage} iconColor="blue">
            <VStack gap={4} align="stretch">

              <FormField formik={formik} name="title" label="Titre de l'offre"
                icon={LuPackage} required>
                <Input outline="none" {...inp(formik, "title")} placeholder="Ex: Voyage top Vente Istanbul 7 jours" />
              </FormField>

              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                <FormField formik={formik} name="destination" label="Destination"
                  icon={LuMapPin} required>
                  <Input outline="none" {...inp(formik, "destination")} placeholder="Ex: Tunisie, Istanbul" />
                </FormField>
                <FormField formik={formik} name="duration" label="Durée" icon={LuClock}>
                  <Input type="number" outline="none" {...inp(formik, "duration")} placeholder="Ex: 7 jours / 6 nuits" />
                </FormField>
              </Grid>

              {/* Type pills */}
              <Box>
                <Flex align="center" gap={1} mb={2}>
                  <Text fontSize="xs" fontWeight={700}
                    color={formik.touched.type && formik.errors.type ? "red.500" : "gray.600"}
                    textTransform="uppercase" letterSpacing="wider">
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
                  _focusWithin={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}>
                  <Box color="gray.400" mr={2} mt={0.5} flexShrink={0}>
                    <LuAlignLeft size={14} />
                  </Box>
                  <Textarea
                    outline="none"
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

          <Box
            bg="white" borderRadius="2xl" p={6}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)"
          >
            {/* Card header */}
            <Flex align="center" justify="space-between" mb={5}>
              <Flex align="center" gap={2}>
                <Flex w="28px" h="28px" borderRadius="lg"
                  bg="green.50" color="green.500"
                  align="center" justify="center" flexShrink={0}>
                  <LuBanknote size={14} />
                </Flex>
                <Text fontSize="sm" fontWeight={700} color="gray.700">
                  Tarification & packages
                </Text>
              </Flex>
              {selectedPackages.length > 0 && (
                <Flex
                  align="center" gap={1.5} px={3} py={1}
                  bg="pink.50" borderRadius="full"
                  border="1px solid" borderColor="pink.200"
                >
                  <LuCheck size={11} color="#E91E8C" />
                  <Text fontSize="xs" color="pink.600" fontWeight={700}>
                    {selectedPackages.length} lié{selectedPackages.length > 1 ? "s" : ""}
                  </Text>
                </Flex>
              )}
            </Flex>

            <PackagesPanel
              allPackages={allPackages}
              setAllPackages={setAllPackages}
              selectedPackages={selectedPackages}
              onSelectionChange={setSelectedPackages}
            />
          </Box>

          <Card title="Inclus & non inclus" icon={LuCheck} iconColor="purple">
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
              {[
                { name: "included",     placeholder: "Hébergement, transport, guide, repas…",                  label: "Inclus" },
                { name: "not_included", placeholder: "Vols internationaux, assurance, dépenses personnelles…", label: "Non inclus" },
              ].map(({ name, placeholder, label }) => (
                <Box key={name}>
                  <Text fontSize="xs" fontWeight={700} color="gray.600"
                    textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                    {label}
                  </Text>
                  <Flex w="full" align="flex-start"
                    border="1.5px solid" borderColor="gray.200"
                    borderRadius="xl" bg="white" px={3} pt={2.5}
                    _focusWithin={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}>
                    <Textarea
                      outline="none" name={name}
                      value={formik.values[name]}
                      onChange={formik.handleChange}
                      placeholder={placeholder}
                      border="none" bg="transparent" px={0}
                      flex={1} w="full" minH="100px"
                      fontSize="sm" color="gray.800" resize="vertical"
                      _focus={{ boxShadow: "none" }}
                      _placeholder={{ color: "gray.300" }}
                    />
                  </Flex>
                </Box>
              ))}
            </Grid>
          </Card>

          {/* ── Card 4 : Photos ── */}
          <Box bg="white" borderRadius="2xl" p={6}
            border="1px solid"
            borderColor={formik.touched.images && formik.errors.images ? "red.200" : "gray.100"}
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
              onChange={(e) => handleFiles(e.target.files)}>
              <FileUpload.HiddenInput />
              <FileUpload.Dropzone
                w="full" border="2px dashed"
                borderColor={formik.touched.images && formik.errors.images ? "red.300" : "gray.200"}
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
                    <Text fontSize="sm" fontWeight={600} color="gray.600">Glissez vos photos ici</Text>
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