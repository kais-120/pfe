import {
  Box, Button, createListCollection, Field, Input,
  Portal, Select, Text, Flex, Grid, VStack,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import { useState } from "react"
import { Helmet } from "react-helmet"
import { Link, useNavigate } from "react-router-dom"
import { Axios } from "../Api/Api"
import * as yup from "yup"
import {
  LuUser, LuMail, LuPhone, LuLock, LuBuilding2,
  LuChevronRight, LuCheck,
  LuChevronLeft,
} from "react-icons/lu"
import {
  FaPlane, FaCar, FaHotel, FaGlobe, FaRoute,
} from "react-icons/fa"
import { LucideAlertCircle } from "lucide-react"
import logo from "../assets/image.png"

const validationSchema = yup.object().shape({
  name: yup.string().min(3, "Minimum 3 caractères").required("Le nom est requis"),
  phone: yup.string().length(8, "Doit contenir 8 chiffres").required("Le téléphone est requis").matches(/^\d+$/, "Chiffres uniquement"),
  email: yup.string().email("Email invalide").required("L'email est requis"),
  password: yup.string().min(6, "Minimum 6 caractères").required("Le mot de passe est requis"),
  confirmPassword: yup.string().required("Confirmation requise").oneOf([yup.ref("password"), null], "Les mots de passe ne correspondent pas"),
  sector: yup.string().required("Le secteur est requis"),
})

const SECTORS = [
  { value: "agence de voyage", label: "Agence de voyage", Icon: FaGlobe },
  { value: "location de voitures", label: "Location de voitures", Icon: FaCar },
  { value: "hôtel", label: "Hôtel", Icon: FaHotel },
  { value: "compagnies aériennes", label: "Compagnies aériennes", Icon: FaPlane },
  { value: "voyages circuits", label: "Voyages circuits", Icon: FaRoute },
]

const sectorCollection = createListCollection({
  items: SECTORS.map(s => ({ value: s.value, label: s.label })),
})

/* ── Styled input field ─────────────────────────────────────────── */
function FormField({ formik, name, label, type = "text", placeholder, icon: Icon, extraError }) {
  const isInvalid = (formik.touched[name] && !!formik.errors[name]) || !!extraError
  return (
    <Field.Root invalid={isInvalid} w="full">
      <Field.Label>
        <Text fontSize="xs" fontWeight={700} color="gray.600"
          textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
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
        {Icon && <Box color={isInvalid ? "red.400" : "gray.400"} mr={2} flexShrink={0}><Icon size={14} /></Box>}
        <Input
          name={name} type={type}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder={placeholder}
          border="none" bg="transparent" px={0} h="42px" flex={1}
          fontSize="sm" color="gray.800"
          outline={"none"}
          _focus={{ boxShadow: "none" }}
          _placeholder={{ color: "gray.300" }}
        />
      </Flex>
      {formik.touched[name] && formik.errors[name] && (
        <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
          {formik.errors[name]}
        </Field.ErrorText>
      )}
      {extraError && (
        <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
          {extraError}
        </Field.ErrorText>
      )}
    </Field.Root>
  )
}

const PartnerSignUp = () => {
  const [emailError, setEmailError] = useState(false)
  const [phoneError, setPhoneError] = useState(false)
  const [emailPhoneError, setEmailPhoneError] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: {
      name: "", email: "", password: "",
      phone: "", confirmPassword: "", sector: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setEmailError(false)
        setEmailPhoneError(false)
        setPhoneError(false)
        setLoading(true)
        const response = await Axios.post("/auth/partner/register", values)
        navigate(`/verify/${response.data.token}`)
      } catch(err) {
        if (err.status === 422) {
          if (Object.keys(err.response.data.errors).length === 2) {
            setEmailPhoneError(true)
          }
          else {
            if (Object.keys(err.response.data.errors)[0] === "email") {
              setEmailError(true)
            } else {
              setPhoneError(true)
            }

          }
        }
        setLoading(false)
      }
    }
  })

  return (
    <>
      <Helmet><title>Inscription partenaire</title></Helmet>

      <Flex minH="100vh" bg="#f5f6fa">

        {/* ── Left panel ── */}
        <Box
          display={{ base: "none", lg: "flex" }}
          w="420px" flexShrink={0}
          bg="blue.600"
          direction="column"
          flexDirection="column"
          justify="center"
          px={12} py={16}
          position="relative"
          overflow="hidden"
        >
          {/* Decorative circles */}
          <Box position="absolute" top="-80px" right="-80px"
            w="300px" h="300px" borderRadius="full"
            bg="whiteAlpha.100" />
          <Box position="absolute" bottom="-60px" left="-60px"
            w="240px" h="240px" borderRadius="full"
            bg="whiteAlpha.100" />

          <Box position="relative" zIndex={1}>
            {/* Logo */}
            <Flex justify={"center"} align="center" gap={2.5} mb={16}>
              <img src={logo} alt="logo" />
            </Flex>

            <Text fontSize="3xl" fontWeight={900} color="white"
              lineHeight="1.2" letterSpacing="-0.5px" mb={4}>
              Rejoignez notre réseau de partenaires
            </Text>
            <Text color="blue.100" fontSize="sm" lineHeight="1.8" mb={10}>
              Gérez votre établissement, recevez des réservations et développez votre activité touristique en Tunisie.
            </Text>

            {/* Benefits */}
            {[
              "Tableau de bord complet",
              "Gestion des réservations en temps réel",
              "Visibilité auprès de milliers de voyageurs",
              "Support dédié 7j/7",
            ].map((item, i) => (
              <Flex key={i} align="center" gap={3} mb={3}>
                <Flex w="20px" h="20px" borderRadius="full"
                  bg="whiteAlpha.300" align="center" justify="center" flexShrink={0}>
                  <LuCheck size={11} color="white" />
                </Flex>
                <Text color="blue.100" fontSize="sm">{item}</Text>
              </Flex>
            ))}
          </Box>
        </Box>

        {/* ── Right panel — form ── */}
        <Flex flex={1} align="center" justify="center" px={{ base: 4, md: 8 }} py={10}>
          <Box w="full" maxW="480px">
          <Flex as={Link} to="/" align="center" gap={1.5}
                    color="gray.400" fontSize="sm" mb={8}
                    _hover={{ color: "blue.500" }} transition="color 0.15s"
                    display="inline-flex">
                    <LuChevronLeft size={14} />
                    Retour à la accueil
                  </Flex>
            {/* Mobile logo */}
            <Flex align="center" gap={2} mb={8} display={{ base: "flex", lg: "none" }}>
              <Flex w="32px" h="32px" borderRadius="lg"
                bg="blue.600" align="center" justify="center">
                <FaHotel size={15} color="white" />
              </Flex>
              <Text fontSize="lg" fontWeight={800} color="gray.900">H-Care</Text>
            </Flex>

            <Box mb={8}>
              <Text fontSize="2xl" fontWeight={900} color="gray.900"
                letterSpacing="-0.5px" mb={1}>
                Créer un compte partenaire
              </Text>
              <Text fontSize="sm" color="gray.400">
                Déjà partenaire ?{" "}
                <Link to="/login">
                  <Text as="span" color="blue.500" fontWeight={600}
                    _hover={{ textDecoration: "underline" }}>
                    Se connecter
                  </Text>
                </Link>
              </Text>
            </Box>

            {/* Global error */}
            {emailError && (
              <Flex align="center" gap={2.5} bg="red.50" border="1px solid"
                borderColor="red.200" borderRadius="xl" px={4} py={3} mb={5}>
                <Box color="red.500" flexShrink={0}><LucideAlertCircle size={15} /></Box>
                <Text fontSize="sm" color="red.600" fontWeight={500}>
                  Cet email est déjà utilisé. Essayez avec un autre email.
                </Text>
              </Flex>
            )}
            {emailPhoneError && (
              <Flex align="center" gap={2.5} bg="red.50"
                border="1px solid" borderColor="red.200"
                borderRadius="xl" px={4} py={3} mb={5}
              >
                <Box color="red.500" flexShrink={0}><LucideAlertCircle size={15} /></Box>
                <Text fontSize="sm" color="red.600" fontWeight={500}>
                  Les email et Numéro de téléphone est déjà utilisé. Essayez avec des autres.
                </Text>
              </Flex>
            )}
            {phoneError && (
              <Flex align="center" gap={2.5} bg="red.50"
                border="1px solid" borderColor="red.200"
                borderRadius="xl" px={4} py={3} mb={5}
              >
                <Box color="red.500" flexShrink={0}><LucideAlertCircle size={15} /></Box>
                <Text fontSize="sm" color="red.600" fontWeight={500}>
                  Cet Numéro de telephone est déjà utilisé. Essayez avec un autre Numéro.
                </Text>
              </Flex>
            )}

            <form onSubmit={formik.handleSubmit}>
              <Box
                bg="white" borderRadius="2xl" p={6} mb={4}
                border="1px solid" borderColor="gray.100"
                boxShadow="0 1px 8px rgba(0,0,0,0.05)"
              >
                <VStack gap={4} align="stretch">

                  <FormField formik={formik} name="name" label="Nom complet"
                    placeholder="Votre nom" icon={LuUser} />

                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <FormField formik={formik} name="email" label="Email"
                      placeholder="exemple@email.com" icon={LuMail}
                      extraError={emailError ? "Email déjà utilisé" : null} />
                    <FormField formik={formik} name="phone" label="Téléphone"
                      placeholder="12345678" icon={LuPhone} />
                  </Grid>

                  {/* Sector selector */}
                  <Field.Root invalid={formik.touched.sector && !!formik.errors.sector} w="full">
                    <Field.Label>
                      <Text fontSize="xs" fontWeight={700} color="gray.600"
                        textTransform="uppercase" letterSpacing="wider">
                        Secteur d'activité
                      </Text>
                    </Field.Label>

                    {/* Visual toggle buttons */}
                    <Grid templateColumns="1fr 1fr" gap={2} w="full">
                      {SECTORS.map(({ value, label, Icon }) => {
                        const selected = formik.values.sector === value
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
                            onClick={() => formik.setFieldValue("sector", value)}
                            _hover={{ borderColor: "blue.300", bg: "blue.50" }}
                          >
                            <Icon size={13} />
                            <Text as="span" fontSize="xs" flex={1} textAlign="left">{label}</Text>
                            {selected && <LuCheck size={11} />}
                          </Flex>
                        )
                      })}
                    </Grid>

                    {formik.touched.sector && formik.errors.sector && (
                      <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
                        {formik.errors.sector}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <FormField formik={formik} name="password" label="Mot de passe"
                      type="password" placeholder="••••••••" icon={LuLock} />
                    <FormField formik={formik} name="confirmPassword" label="Confirmation"
                      type="password" placeholder="••••••••" icon={LuLock} />
                  </Grid>

                </VStack>
              </Box>

              {/* Terms */}
              <Text fontSize="xs" color="gray.400" textAlign="center" mb={4}>
                En vous inscrivant, vous acceptez nos{" "}
                <Text as="span" color="blue.500" cursor="pointer">conditions d'utilisation</Text>
                {" "}et notre{" "}
                <Text as="span" color="blue.500" cursor="pointer">politique de confidentialité</Text>.
              </Text>

              <Button
                type="submit"
                w="full" h="46px"
                colorScheme="blue"
                borderRadius="xl"
                fontWeight={700}
                fontSize="sm"
                loading={loading}
                loadingText="Création du compte…"
              >
                <Flex align="center" gap={2}>
                  Créer mon compte partenaire
                  <LuChevronRight size={15} />
                </Flex>
              </Button>

            </form>
          </Box>
        </Flex>
      </Flex>
    </>
  )
}

export default PartnerSignUp