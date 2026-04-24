import {
  Box, Button, Input, Text, Flex, Grid,
  VStack, Field, Textarea, SimpleGrid,
  HStack, Icon, ActionBar,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import * as yup from "yup"
import { useNavigate, useParams } from "react-router-dom"
import { AxiosToken, imageURL } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"
import {
  LuCompass, LuMapPin,
  LuChevronLeft, LuCheck, LuPlus,
  LuUpload, LuMountain,
  LuBanknote, LuListTree, LuSearch,
  LuArrowRight, LuPencil, LuTrash2, LuX,
} from "react-icons/lu"
import { FaCampground, FaMountain, FaUmbrellaBeach, FaHiking, FaStar } from "react-icons/fa"
import { useEffect, useState } from "react"
import AddPackage from "../Add/AddPackage"
import { Plane } from "lucide-react"


const CATEGORIES = [
  { key: "voyage", label: "Voyage", Icon: LuCompass },
  { key: "camping", label: "Camping", Icon: FaCampground },
  { key: "désert", label: "Désert", Icon: FaMountain },
  { key: "aventure", label: "Aventure", Icon: FaHiking },
  { key: "plage", label: "Plage", Icon: FaUmbrellaBeach },
  { key: "montagne", label: "Montagne", Icon: FaMountain },
  { key: "culturel", label: "Culturel", Icon: FaStar },
]

const DIFFICULTIES = [
  { val: "facile", color: "green" },
  { val: "modéré", color: "yellow" },
  { val: "difficile", color: "orange" },
  { val: "très difficile", color: "red" },
]

const INCLUSIONS_DEFAULT = [
  "Transport", "Guide", "Repas", "Hébergement",
  "Équipement", "Assurance", "Photos",
]

const validationSchema = yup.object({
  title: yup.string().required("Le titre est requis"),
  location: yup.string().required("La localisation est requise"),
  description: yup.string().required("La description est requise"),
})

function FormField({ formik, name, label, required, type = "text",
  icon: IconComp, placeholder, suffix }) {
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
      <Flex w="full" align="center"
        border="1.5px solid" borderColor={isInvalid ? "red.400" : "gray.200"}
        borderRadius="xl" bg="white" px={3} transition="all 0.15s"
        _focusWithin={{
          borderColor: isInvalid ? "red.400" : "blue.400",
          boxShadow: isInvalid
            ? "0 0 0 3px rgba(245,101,101,0.12)"
            : "0 0 0 3px rgba(49,130,206,0.12)"
        }}>
        {IconComp && (
          <Box color={isInvalid ? "red.400" : "gray.400"} mr={2} flexShrink={0}>
            <IconComp size={14} />
          </Box>
        )}
        <Input outline="none" name={name} type={type}
          value={formik.values[name]}
          onChange={formik.handleChange} onBlur={formik.handleBlur}
          placeholder={placeholder}
          border="none" bg="transparent" px={0} h="42px" flex={1}
          fontSize="sm" color="gray.800"
          _focus={{ boxShadow: "none" }} _placeholder={{ color: "gray.300" }} />
        {suffix && (
          <Text fontSize="xs" color="gray.400" fontWeight={600} ml={2} flexShrink={0}>
            {suffix}
          </Text>
        )}
      </Flex>
      {isInvalid && (
        <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
          {formik.errors[name]}
        </Field.ErrorText>
      )}
    </Field.Root>
  )
}

// ── SectionCard ────────────────────────────────────────────────────────
function SectionCard({ title, icon: IconComp, iconColor = "blue", children }) {
  return (
    <Box bg="white" borderRadius="2xl" p={6}
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)">
      <Flex align="center" gap={2} mb={5}>
        <Flex w="28px" h="28px" borderRadius="lg"
          bg={`${iconColor}.50`} color={`${iconColor}.500`}
          align="center" justify="center">
          <IconComp size={14} />
        </Flex>
        <Text fontSize="sm" fontWeight={700} color="gray.700">{title}</Text>
      </Flex>
      {children}
    </Box>
  )
}

// ── PackageRow ─────────────────────────────────────────────────────────
function PackageRow({ pkg, onSelect, selected }) {
  return (
    <Box borderRadius="xl" border="1.5px solid"
      borderColor={selected ? "pink.400" : "gray.100"}
      bg={selected ? "pink.50" : "white"}
      p={4} cursor="pointer" transition="all 0.15s"
      _hover={{ borderColor: "pink.300", bg: "pink.50" }}
      onClick={() => onSelect(pkg)}>
      <Grid templateColumns={{ base: "1fr", sm: "1fr auto auto auto" }} gap={4} alignItems="center">
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
          <HStack gap={3} flexWrap="wrap" mt={0.5}>
            {(pkg.destinations || pkg.destination || []).map((d, i) => (
              <HStack key={i} gap={1} fontSize="xs" color="gray.600">
                <LuMapPin size={11} color="#A0AEC0" />
                <Text>{d.name}</Text>
                <Text color="gray.400">({d.nights}N)</Text>
              </HStack>
            ))}
          </HStack>
        </VStack>

        <Box bg="gray.100" borderRadius="lg" px={3} py={1}
          fontSize="xs" fontWeight={600} color="gray.600" whiteSpace="nowrap">
          {pkg.month} {pkg.year}
        </Box>

        <VStack align="end" gap={0}>
          <HStack gap={1} align="baseline">
            <Text fontSize="xl" fontWeight={800} color="gray.900" lineHeight={1}>
              {Number(pkg.price).toLocaleString()}
            </Text>
            <Text fontSize="xs" color="gray.400" fontWeight={600}>TND</Text>
          </HStack>
          <Text fontSize="xs" color="#E91E8C" fontWeight={700}>{pkg.installment}</Text>
        </VStack>

        <Flex w="28px" h="28px" borderRadius="full" border="1.5px solid"
          borderColor={selected ? "pink.400" : "gray.200"}
          bg={selected ? "pink.500" : "white"}
          align="center" justify="center" flexShrink={0} transition="all 0.15s">
          {selected && <LuCheck size={13} color="white" />}
        </Flex>
      </Grid>
    </Box>
  )
}

// ── PackagesPanel ──────────────────────────────────────────────────────
function PackagesPanel({ selectedPackages, onSelectionChange, allPackages, setAllPackages,removedPackageIds,setRemovedPackageIds }) {
  const [tab, setTab] = useState("list")
  const [search, setSearch] = useState("")
  const [editingPkg, setEditingPkg] = useState(null)

  const filtered = allPackages.filter((p) =>
    search === "" ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.destinations || p.destination || []).some(
      (d) => d.name?.toLowerCase().includes(search.toLowerCase())
    )
  )

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

  const handleDeleteSelected = () => {
    const selectedIds = new Set(selectedPackages.map((p) => p.id))
    selectedIds.forEach((id)=>{
      setRemovedPackageIds(prev => [...prev,id])
    })
    setAllPackages((prev) => prev.filter((p) => !selectedIds.has(p.id)))
    
    onSelectionChange([])
  }

  const handleEditSelected = () => {
    if (selectedPackages.length === 1) {
      setEditingPkg(selectedPackages[0])
      setTab("edit")
    }
  }

  return (
    <Box>
      {/* Tab switcher */}
      <HStack gap={0} mb={5} bg="gray.50" borderRadius="xl" p={1}
        border="1px solid" borderColor="gray.100" w="fit-content">
        {[
          { key: "list", label: "Packages existants", icon: LuListTree },
          { key: "add", label: "Nouveau package", icon: LuPlus },
        ].map(({ key, label, icon: TabIcon }) => (
          <Button key={key} size="sm" borderRadius="lg" px={4} fontWeight={600}
            fontSize="13px"
            bg={tab === key ? "white" : "transparent"}
            color={tab === key ? "gray.800" : "gray.500"}
            boxShadow={tab === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none"}
            border="none" _hover={{ bg: tab === key ? "white" : "gray.100" }}
            transition="all 0.15s" onClick={() => setTab(key)}
            leftIcon={<TabIcon size={13} />}>
            {label}
          </Button>
        ))}
      </HStack>

      {/* LIST TAB */}
      {tab === "list" && (
        <Box>
          <Flex align="center" gap={2} px={3}
            border="1.5px solid" borderColor="gray.200"
            borderRadius="xl" bg="white" mb={4}
            _focusWithin={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}>
            <LuSearch size={14} color="#A0AEC0" />
            <Input outline="none" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un package…"
              border="none" bg="transparent" px={0} h="40px"
              fontSize="sm" _focus={{ boxShadow: "none" }}
              _placeholder={{ color: "gray.300" }} />
          </Flex>

          {Object.keys(grouped).length === 0 ? (
            <Flex direction="column" align="center" py={10} color="gray.400" gap={2}>
              <LuSearch size={24} />
              <Text fontSize="sm">Aucun package trouvé</Text>
            </Flex>
          ) : (
            <VStack align="stretch" gap={5}>
              {Object.entries(grouped).map(([monthKey, packages]) => (
                <Box key={monthKey}>
                  <Flex align="center" gap={2} mb={3}>
                    <Box w="3px" h="14px" bg="pink.400" borderRadius="2px" flexShrink={0} />
                    <Text fontSize="xs" fontWeight={700} color="gray.600"
                      textTransform="uppercase" letterSpacing="0.08em">{monthKey}</Text>
                    <Box flex={1} h="1px" bg="gray.100" />
                    <Text fontSize="xs" color="gray.400">
                      {packages.length} package{packages.length > 1 ? "s" : ""}
                    </Text>
                  </Flex>
                  <VStack align="stretch" gap={2}>
                    {packages.map((pkg) => (
                      <PackageRow key={pkg.id} pkg={pkg}
                        selected={selectedPackages.some((p) => p.id === pkg.id)}
                        onSelect={toggleSelect} />
                    ))}
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}

      {tab === "add" && (
        <AddPackage ontTab={setTab} onChange={setAllPackages} type="circuit" />
      )}

      {tab === "edit" && editingPkg && (
        <AddPackage
          ontTab={(t) => { setTab(t); setEditingPkg(null) }}
          onChange={setAllPackages}
          initialValues={editingPkg}
          isEditing
          type="circuit"
        />
      )}

      {/* ActionBar */}
      <ActionBar.Root open={selectedPackages.length > 0}>
        <ActionBar.Positioner>
          <ActionBar.Content>
            <ActionBar.SelectionTrigger>
              {selectedPackages.length} sélectionné{selectedPackages.length > 1 ? "s" : ""}
            </ActionBar.SelectionTrigger>
            <ActionBar.Separator />
            <Button size="sm" variant="outline" borderRadius="lg" fontSize="13px" gap={1.5}
              disabled={selectedPackages.length !== 1} onClick={handleEditSelected}>
              <LuPencil size={13} /> Modifier
            </Button>
            <Button size="sm" colorScheme="red" borderRadius="lg" fontSize="13px" gap={1.5}
              onClick={handleDeleteSelected}>
              <LuTrash2 size={13} /> Supprimer ({selectedPackages.length})
            </Button>
            <ActionBar.CloseTrigger onClick={() => onSelectionChange([])} />
          </ActionBar.Content>
        </ActionBar.Positioner>
      </ActionBar.Root>
    </Box>
  )
}

// ── EditCircuit ────────────────────────────────────────────────────────
const EditCircuit = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [existingImages, setExistingImages] = useState([])
  const [removedImageIds, setRemovedImageIds] = useState([])
  const [removedPackageIds, setRemovedPackageIds] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [newPreviews, setNewPreviews] = useState([])

  const [selectedPackages, setSelectedPackages] = useState([])
  const [allPackages, setAllPackages] = useState([])
  const [loading, setLoading] = useState(true)

  const formik = useFormik({
    initialValues: {
      title: "", location: "", description: "",
      category: "voyage", difficulty: "modéré",
      inclusions: [], available_dates: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const fd = new FormData()
        Object.entries(values).forEach(([k, v]) => {
          if (k === "inclusions" || k === "available_dates")
            v.forEach(x => fd.append(`${k}[]`, x))
          else
            fd.append(k, v)
        })

        // ── Packages ──
        if (allPackages.length > 0)
          fd.append("packages", JSON.stringify(allPackages))

        // ── New images (only if user selected new ones) ──
        newFiles.forEach(file => fd.append("service_doc", file))

        // ── IDs of existing images to delete ──
        if (removedImageIds.length > 0)
          fd.append("removed_images", JSON.stringify(removedImageIds))

         if (removedPackageIds.length > 0){
          fd.append("removed_package", JSON.stringify(removedPackageIds))
        }

        await AxiosToken.put(`/service/voyage/circuit/update/${id}`, fd)
        toaster.create({ description: "Circuit modifié avec succès.", type: "success", closable: true })
        setTimeout(() => navigate(-1), 1800)
      } catch {
        toaster.create({ description: "Une erreur est survenue.", type: "error", closable: true })
      }
    },
  })

  useEffect(() => {
    const fetchCircuit = async () => {
      try {
        const res = await AxiosToken.get(`/service/voyage/circuit/public/get/${id}`)
        const c = res.data.circuit

        // Pre-fill formik
        formik.setValues({
          title: c.title || "",
          location: c.location || "",
          description: c.description || "",
          category: c.category || "voyage",
          difficulty: c.difficulty || "modéré",
          inclusions: c.inclusions || [],
          available_dates: c.available_dates || [],
        })

        // Pre-fill packages — normalize destination field name
        const pkgs = (c.packagesCircuit || []).map((p) => ({
          ...p,
          destinations: p.destination || p.destinations || [],
          seats: p.number_place,
        }))
        setAllPackages(pkgs)
        setSelectedPackages(pkgs)   // all pre-linked packages start selected

        // Pre-fill existing images
        setExistingImages(c.images || [])
      } catch {
        toaster.create({ description: "Impossible de charger le circuit.", type: "error", closable: true })
      } finally {
        setLoading(false)
      }
    }
    fetchCircuit()
  }, [id])

  // ── Inclusions toggle ──
  const toggleIncl = (val) => {
    const arr = formik.values.inclusions
    formik.setFieldValue(
      "inclusions",
      arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
    )
  }

  // ── Remove an existing server image ──
  const removeExistingImage = (imgId) => {
    setRemovedImageIds((prev) => [...prev, imgId])
    setExistingImages((prev) => prev.filter((img) => img.id !== imgId))
  }

  // ── Remove a newly added (not yet uploaded) image ──
  const removeNewImage = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
    setNewPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Handle new file selection ──
  const handleImages = (files) => {
    const arr = Array.from(files)
    setNewFiles(arr)
    setNewPreviews(arr.map(f => URL.createObjectURL(f)))
  }

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="300px">
        <Text color="gray.400" fontSize="sm">Chargement…</Text>
      </Flex>
    )
  }

  // Total visible images count (existing kept + new)
  const totalImages = existingImages.length + newPreviews.length

  return (
    <Box>
      <Flex as="button" type="button" align="center" gap={1.5}
        color="gray.400" fontSize="sm" mb={6}
        _hover={{ color: "blue.500" }} transition="color 0.15s"
        onClick={() => navigate(-1)}>
        <LuChevronLeft size={14} /> Retour
      </Flex>

      <Box mb={8}>
        <Text fontSize="xs" fontWeight={700} color="blue.500"
          textTransform="uppercase" letterSpacing="widest" mb={1}>
          Gestion des circuits
        </Text>
        <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Modifier le circuit
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Modifiez les informations de votre circuit
        </Text>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <VStack gap={4} align="stretch">

          {/* ── General info ── */}
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
                <Flex w="full" align="flex-start" border="1.5px solid"
                  borderColor={
                    formik.touched.description && formik.errors.description
                      ? "red.400" : "gray.200"
                  }
                  borderRadius="xl" bg="white" px={3} pt={2.5}
                  _focusWithin={{ borderColor: "blue.400", boxShadow: "0 0 0 3px rgba(49,130,206,0.12)" }}>
                  <Textarea outline="none" name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="Description du circuit…"
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

          {/* ── Category + difficulty ── */}
          <SectionCard title="Catégorie & difficulté" icon={LuMountain} iconColor="green">
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>Catégorie</Text>
                <Flex gap={2} flexWrap="wrap">
                  {CATEGORIES.map(({ key, label, Icon: CatIcon }) => {
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
                        <CatIcon size={12} />{label}
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

          {/* ── Packages ── */}
          <Box bg="white" borderRadius="2xl" p={6}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)">
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
                <Flex align="center" gap={1.5} px={3} py={1}
                  bg="pink.50" borderRadius="full"
                  border="1px solid" borderColor="pink.200">
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

          {/* ── Inclusions ── */}
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

          {/* ── Photos ── */}
          <SectionCard title="Photos du circuit" icon={LuUpload} iconColor="purple">

            {/* Upload zone */}
            <Box border="2px dashed" borderColor="gray.200" borderRadius="xl"
              bg="gray.50" p={5} cursor="pointer" transition="all 0.15s"
              _hover={{ borderColor: "blue.300", bg: "blue.50" }}
              position="relative"
              mb={totalImages > 0 ? 4 : 0}>
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
                  {newFiles.length > 0
                    ? `${newFiles.length} nouvelle${newFiles.length > 1 ? "s" : ""} photo${newFiles.length > 1 ? "s" : ""} sélectionnée${newFiles.length > 1 ? "s" : ""}`
                    : "Glissez de nouvelles photos ici"}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {existingImages.length > 0
                    ? `${existingImages.length} photo${existingImages.length > 1 ? "s" : ""} existante${existingImages.length > 1 ? "s" : ""} — laisser vide pour les conserver`
                    : "JPG, PNG — max 5 MB"}
                </Text>
              </Flex>
            </Box>

            {/* ── Existing server images ── */}
            {existingImages.length > 0 && (
              <Box mb={3}>
                <Text fontSize="xs" fontWeight={700} color="gray.500"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>
                  Photos actuelles
                </Text>
                <SimpleGrid columns={5} gap={2}>
                  {existingImages.map((img) => (
                    <Box key={img.id} position="relative" h="70px" borderRadius="lg"
                      overflow="hidden" border="1px solid" borderColor="gray.100"
                      _hover={{ "& > button": { opacity: 1 } }}>
                      <Box as="img"
                        src={`${imageURL}/services/${img.image_url}`}
                        w="100%" h="100%" style={{ objectFit: "cover" }} />
                      <Box as="button" type="button"
                        position="absolute" top="3px" right="3px"
                        w="18px" h="18px" borderRadius="full"
                        bg="red.500" color="white"
                        display="flex" alignItems="center" justifyContent="center"
                        opacity={0} transition="opacity 0.15s"
                        _hover={{ bg: "red.600" }}
                        onClick={() => removeExistingImage(img.id)}>
                        <LuX size={10} />
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            )}

            {/* ── New images preview ── */}
            {newPreviews.length > 0 && (
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.500"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>
                  Nouvelles photos
                </Text>
                <SimpleGrid columns={5} gap={2}>
                  {newPreviews.map((src, i) => (
                    <Box key={i} position="relative" h="70px" borderRadius="lg"
                      overflow="hidden" border="1.5px solid" borderColor="blue.200"
                      _hover={{ "& > button": { opacity: 1 } }}>
                      <Box as="img" src={src} w="100%" h="100%"
                        style={{ objectFit: "cover" }} />
                      <Box as="button" type="button"
                        position="absolute" top="3px" right="3px"
                        w="18px" h="18px" borderRadius="full"
                        bg="red.500" color="white"
                        display="flex" alignItems="center" justifyContent="center"
                        opacity={0} transition="opacity 0.15s"
                        _hover={{ bg: "red.600" }}
                        onClick={() => removeNewImage(i)}>
                        <LuX size={10} />
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            )}

            {totalImages > 0 && (
              <Text fontSize="xs" color="gray.400" mt={2}>
                {totalImages} photo{totalImages > 1 ? "s" : ""} au total
                {removedImageIds.length > 0 &&
                  ` · ${removedImageIds.length} supprimée${removedImageIds.length > 1 ? "s" : ""}`}
              </Text>
            )}
          </SectionCard>

          <Flex gap={3} justify="flex-end" pb={4}>
            <Button type="button" variant="outline" borderRadius="xl" px={6}
              color="gray.500" borderColor="gray.200" _hover={{ bg: "gray.50" }}
              onClick={() => navigate(-1)}>
              Annuler
            </Button>
            <Button type="submit" colorScheme="blue" borderRadius="xl" px={8} fontWeight={700}
              loading={formik.isSubmitting} loadingText="Enregistrement…">
              <Flex align="center" gap={2}>
                <LuCheck size={14} /> Enregistrer les modifications
              </Flex>
            </Button>
          </Flex>

        </VStack>
      </form>
    </Box>
  )
}

export default EditCircuit