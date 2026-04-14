import {
  Container, Input, Textarea, Button,
  VStack, Field, Box, FileUpload,
  Grid, Flex, Text, Image,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import {
  LuUpload, LuMapPin, LuImage, LuChevronLeft,
  LuCheck, LuX, LuGlobe, LuPhone, LuMail,
  LuAlignLeft, LuLink, LuFacebook, LuInstagram,
  LuTwitter, LuBadgeCheck,
} from "react-icons/lu"
import * as Yup from "yup"
import { AxiosToken, imageURL } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

const validationSchema = Yup.object({
  name: Yup.string().required("Le nom de l'agence est requis"),
  description: Yup.string().required("La description est requise"),
  address: Yup.string().required("L'adresse est requise"),
  phone: Yup.string().required("Le téléphone est requis"),
  email: Yup.string().email("Email invalide").required("L'email est requis"),
})

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


const EditAgency = () => {
  const navigate = useNavigate()
  const [previews, setPreviews] = useState([])
  const [logoPreview, setLogoPreview] = useState(null);
  const [agency, setAgency] = useState();
  useEffect(() => {
    const agencyData = async () => {
      try {
        const res = await AxiosToken.get(`/service/agency/get`);
        setAgency(res.data.agency)
      } catch {
        console.error("error")
      }
    }
    agencyData()
  }, [])
  console.log(agency)

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: agency?.name || "", description: agency?.description || "", address: agency?.address || "",
      phone: agency?.phone || "", email: agency?.email || "", website: agency?.website || "",
      facebook: agency?.facebook || "", instagram: agency?.instagram || "", twitter: agency?.twitter || "",
      logo: agency?.logo || null,
    },
    validationSchema,
    onSubmit: async (values) => {
      const fd = new FormData()
      fd.append("name", values.name)
      fd.append("description", values.description)
      fd.append("address", values.address)
      fd.append("phone", values.phone)
      fd.append("email", values.email)
      if (values.website) fd.append("website", values.website)
      if (values.facebook) fd.append("facebook", values.facebook)
      if (values.instagram) fd.append("instagram", values.instagram)
      if (values.twitter) fd.append("twitter", values.twitter)
      if (agency.logo && values.logo) fd.append("service_doc", values.logo)

      try {
        await AxiosToken.post("/service/agency/add", fd)
        toaster.create({
          description: "Agence créée avec succès. En attente de validation.",
          type: "success", closable: true,
        })
        setTimeout(() => navigate("/partner/dashboard/service"), 1800)
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

  const handleLogo = (files) => {
    if (!files?.[0]) return
    formik.setFieldValue("logo", files[0])
    setLogoPreview(URL.createObjectURL(files[0]))
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
          Espace partenaire
        </Text>
        <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Créer mon agence de voyage
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Renseignez les informations de votre agence
        </Text>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <VStack gap={4} align="stretch">

          {/* ── Card 1 : Identité ── */}
          <Card title="Identité de l'agence" icon={LuBadgeCheck} iconColor="blue">
            <VStack gap={4} align="stretch">

              {/* Logo */}
              <Box>
                <Text fontSize="xs" fontWeight={700} color="gray.600"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>
                  Logo
                </Text>
                <Flex align="center" gap={4}>
                  {agency && !formik.values.logo ?
                    <>
                      <Box w="64px" h="64px" borderRadius="xl" overflow="hidden" flexShrink={0}
                        border="2px dashed" borderColor="gray.200" bg="gray.50"
                        display="flex" alignItems="center" justifyContent="center">
                        {logoPreview
                          ? <Box as="img" src={logoPreview} w="100%" h="100%"
                            style={{ objectFit: "cover" }} />
                          : <LuGlobe size={22} color="var(--chakra-colors-gray-300)" />
                        }
                      </Box>
                      <Box position="relative" flex={1}>
                        <Box as="input" type="file" accept="image/*"
                          position="absolute" inset={0} opacity={0} cursor="pointer"
                          onChange={e => handleLogo(e.target.files)} />
                        <Flex align="center" justify="center" gap={2}
                          border="1.5px dashed" borderColor="gray.200"
                          borderRadius="xl" bg="gray.50" h="42px"
                          cursor="pointer" transition="all 0.15s"
                          _hover={{ borderColor: "blue.300", bg: "blue.50" }}>
                          <LuUpload size={13} color="gray" />
                          <Text fontSize="sm" color="gray.500">Choisir un logo</Text>
                        </Flex>
                      </Box>
                    </>
                    :
                    <Box
                      w="64px"
                      h="64px"
                      borderRadius="xl"
                      overflow="hidden"
                      flexShrink={0}
                      border="2px dashed"
                      borderColor="gray.200"
                      bg="gray.50"
                      position="relative"
                    >
                      <Box
                        as="img"
                        src={`${imageURL}/services/${agency?.logo}`}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                      />

                      <Box
                        position="absolute"
                        top="0"
                        left="0"
                        w="100%"
                        h="100%"
                        bg="blackAlpha.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        opacity="0"
                        transition="0.3s"
                        _hover={{ opacity: 1 }} // 👈 الحل هنا
                      >
                        <Box
                          color="white"
                          cursor="pointer"
                          onClick={() => formik.setFieldValue("logo", null)}
                        >
                          <LuX size={24} />
                        </Box>
                      </Box>
                    </Box>
                  }
                </Flex>
              </Box>

              <FormField formik={formik} name="name" label="Nom de l'agence"
                icon={LuBadgeCheck} required>
                <Input outline={"none"} {...inp(formik, "name")} placeholder="Ex: Tunisie Voyages" />
              </FormField>

              <FormField formik={formik} name="description" label="Description"
                icon={LuAlignLeft} required
                hint="Présentez vos spécialités, votre expérience, votre zone de couverture…">
                {/* Textarea needs special handling outside Flex */}
                <Textarea
                  outline={"none"}
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Notre agence spécialisée dans le tourisme saharien propose des circuits authentiques…"
                  border="none" bg="transparent" px={0}
                  flex={1} w="full" minH="100px"
                  fontSize="sm" color="gray.800" resize="vertical"
                  _focus={{ boxShadow: "none" }}
                  _placeholder={{ color: "gray.300" }}
                />
              </FormField>

            </VStack>
          </Card>

          {/* ── Card 2 : Coordonnées ── */}
          <Card title="Coordonnées" icon={LuPhone} iconColor="green">
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
              <FormField formik={formik} name="phone" label="Téléphone"
                icon={LuPhone} required>
                <Input outline={"none"} {...inp(formik, "phone")} placeholder="71 000 000" />
              </FormField>

              <FormField formik={formik} name="email" label="Email de contact"
                icon={LuMail} required>
                <Input outline={"none"} {...inp(formik, "email", { type: "email" })}
                  placeholder="contact@agence.tn" />
              </FormField>

              <Box gridColumn={{ sm: "1 / -1" }}>
                <FormField formik={formik} name="address" label="Adresse"
                  icon={LuMapPin} required>
                  <Input outline={"none"} {...inp(formik, "address")}
                    placeholder="Ex: Avenue Habib Bourguiba, Tunis" />
                </FormField>
              </Box>

              <Box gridColumn={{ sm: "1 / -1" }}>
                <FormField formik={formik} name="website" label="Site web"
                  icon={LuLink}>
                  <Input outline={"none"} {...inp(formik, "website")}
                    placeholder="https://www.monagence.tn" />
                </FormField>
              </Box>
            </Grid>
          </Card>

          <Card title="Réseaux sociaux" icon={LuGlobe} iconColor="purple">
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }} gap={4}>
              <FormField formik={formik} name="facebook" label="Facebook"
                icon={LuFacebook}>
                <Input outline={"none"} {...inp(formik, "facebook")}
                  placeholder="facebook.com/monagence" />
              </FormField>

              <FormField formik={formik} name="instagram" label="Instagram"
                icon={LuInstagram}>
                <Input outline={"none"} {...inp(formik, "instagram")}
                  placeholder="@monagence" />
              </FormField>

              <FormField formik={formik} name="twitter" label="Twitter / X"
                icon={LuTwitter}>
                <Input outline={"none"}{...inp(formik, "twitter")}
                  placeholder="@monagence" />
              </FormField>
            </Grid>
          </Card>
          {/* ── Validation note ── 
          <Flex align="flex-start" gap={2.5}
            bg="blue.50" borderRadius="xl" px={4} py={3}
            border="1px solid" borderColor="blue.100">
            <Box color="blue.400" flexShrink={0} mt={0.5}>
              <LuBadgeCheck size={14} />
            </Box>
            <Text fontSize="xs" color="blue.700" lineHeight="1.7">
              Votre dossier sera examiné par notre équipe sous 24 à 48 heures.
              Vous recevrez un email de confirmation une fois votre agence approuvée.
            </Text>
          </Flex>
          */}

          {/* ── Actions ── */}
          <Flex gap={3} justify="flex-end" pb={4}>
            <Button type="button" variant="outline" borderRadius="xl" px={6}
              color="gray.500" borderColor="gray.200" _hover={{ bg: "gray.50" }}
              onClick={() => navigate(-1)}>
              Annuler
            </Button>
            <Button type="submit" colorScheme="blue" borderRadius="xl"
              px={8} fontWeight={700}
              loading={formik.isSubmitting} loadingText="Création…">
              <Flex align="center" gap={2}>
                <LuCheck size={14} />
                Créer mon agence
              </Flex>
            </Button>
          </Flex>

        </VStack>
      </form>
    </Container>
  )
}

export default EditAgency