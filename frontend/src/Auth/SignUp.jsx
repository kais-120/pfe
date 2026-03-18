import { Helmet } from "react-helmet"
import { Box, Button, Field, Input, Text, Flex, VStack, Grid } from "@chakra-ui/react"
import { useFormik } from "formik"
import * as yup from "yup"
import { Link, useNavigate } from "react-router-dom"
import { Axios } from "../Api/Api"
import { useState } from "react"
import {
  LuUser, LuMail, LuLock, LuPhone, LuChevronRight
  , LuCheck, LuMapPin, LuStar,
} from "react-icons/lu"
import { FaHotel } from "react-icons/fa"
import { LucideAlertCircle } from "lucide-react"
import Logo from "../assets/Logo"

const validationSchema = yup.object().shape({
  firstName:       yup.string().min(3, "Minimum 3 caractères").required("Le nom est requis"),
  lastName:        yup.string().min(3, "Minimum 3 caractères").required("Le prénom est requis"),
  email:           yup.string().email("Email invalide").required("L'email est requis"),
  password:        yup.string().min(6, "Minimum 6 caractères").required("Le mot de passe est requis"),
  phone:           yup.string().length(8, "Doit contenir 8 chiffres").required("Le téléphone est requis").matches(/^\d+$/, "Chiffres uniquement"),
  confirmPassword: yup.string().required("Confirmation requise").oneOf([yup.ref("password"), null], "Les mots de passe ne correspondent pas"),
})

/* ── Styled input ───────────────────────────────────────────────── */
function FormField({ formik, name, label, type = "text", placeholder, icon: Icon, isInvalid }) {
  const invalid = isInvalid || (formik.touched[name] && !!formik.errors[name])
  return (
    <Field.Root invalid={invalid} w="full">
      <Field.Label>
        <Text fontSize="xs" fontWeight={700} color="gray.600"
          textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
      </Field.Label>
      <Flex
        w="full" align="center"
        border="1.5px solid"
        borderColor={invalid ? "red.400" : "gray.200"}
        borderRadius="xl" bg="white" px={3}
        transition="all 0.15s"
        _focusWithin={{
          borderColor: invalid ? "red.400" : "blue.400",
          boxShadow: invalid
            ? "0 0 0 3px rgba(245,101,101,0.12)"
            : "0 0 0 3px rgba(49,130,206,0.12)",
        }}
      >
        {Icon && (
          <Box color={invalid ? "red.400" : "gray.400"} mr={2} flexShrink={0}>
            <Icon size={14} />
          </Box>
        )}
        <Input
          name={name} type={type}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder={placeholder}
          border="none" bg="transparent" px={0} h="42px" flex={1}
          fontSize="sm" color="gray.800"
          _focus={{ boxShadow: "none" }}
          outline={"none"}
          _placeholder={{ color: "gray.300" }}
        />
      </Flex>
      {formik.touched[name] && formik.errors[name] && (
        <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
          {formik.errors[name]}
        </Field.ErrorText>
      )}
    </Field.Root>
  )
}

const SignUp = () => {
  const [emailError, setEmailError] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: {
      firstName: "", lastName: "",
      email: "", phone: "", password: "", confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setEmailError(false)
        setLoading(true)
        const name = `${values.firstName} ${values.lastName}`
        const response = await Axios.post("/auth/register", { ...values, name })
        navigate(`/verify/${response.data.token}`)
      } catch {
        setEmailError(true)
        setLoading(false)
      }
    }
  })

  return (
    <>
      <Helmet><title>Inscription</title></Helmet>

      <Flex minH="100vh" bg="#f5f6fa">

        {/* ── Left panel ── */}
        <Box
          display={{ base: "none", lg: "flex" }}
          w="420px" flexShrink={0}
          bg="blue.600"
          flexDirection="column"
          justifyContent="center"
          px={12} py={16}
          position="relative"
          overflow="hidden"
        >
          {/* Decorative circles */}
          <Box position="absolute" top="-80px" right="-80px"
            w="300px" h="300px" borderRadius="full" bg="whiteAlpha.100" />
          <Box position="absolute" bottom="-60px" left="-60px"
            w="240px" h="240px" borderRadius="full" bg="whiteAlpha.100" />

          <Box position="relative" zIndex={1}>
            {/* Logo */}
            <Flex justify={"center"} align="center" gap={2.5} mb={16}>
              <Logo width="80px" />
            </Flex>

            <Text fontSize="3xl" fontWeight={900} color="white"
              lineHeight="1.2" letterSpacing="-0.5px" mb={4}>
              Votre prochain voyage commence ici
            </Text>
            <Text color="blue.100" fontSize="sm" lineHeight="1.8" mb={10}>
              Créez votre compte et accédez aux meilleurs hôtels, vols et offres de voyage en Tunisie.
            </Text>

            {[
              { Icon: LuStar,   text: "Accès aux meilleures offres en exclusivité" },
              { Icon: LuMapPin, text: "Destinations partout en Tunisie"            },
              { Icon: LuCheck,  text: "Réservation rapide et sécurisée"            },
            ].map(({ Icon, text }, i) => (
              <Flex key={i} align="center" gap={3} mb={3}>
                <Flex w="20px" h="20px" borderRadius="full"
                  bg="whiteAlpha.300" align="center" justify="center" flexShrink={0}>
                  <Icon size={11} color="white" />
                </Flex>
                <Text color="blue.100" fontSize="sm">{text}</Text>
              </Flex>
            ))}
          </Box>
        </Box>

        {/* ── Right panel — form ── */}
        <Flex flex={1} align="center" justify="center" px={{ base: 4, md: 8 }} py={10}>
          <Box w="full" maxW="460px">

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
                Créer un compte
              </Text>
              <Text fontSize="sm" color="gray.400">
                Déjà inscrit ?{" "}
                <Link to="/login">
                  <Text as="span" color="blue.500" fontWeight={600}
                    _hover={{ textDecoration: "underline" }}>
                    Se connecter
                  </Text>
                </Link>
                {" "}·{" "}
                <Link to="/signup/partner">
                  <Text as="span" color="blue.500" fontWeight={600}
                    _hover={{ textDecoration: "underline" }}>
                    Devenir partenaire
                  </Text>
                </Link>
              </Text>
            </Box>

            {/* Error banner */}
            {emailError && (
              <Flex align="center" gap={2.5} bg="red.50"
                border="1px solid" borderColor="red.200"
                borderRadius="xl" px={4} py={3} mb={5}
              >
                <Box color="red.500" flexShrink={0}><LucideAlertCircle size={15} /></Box>
                <Text fontSize="sm" color="red.600" fontWeight={500}>
                  Cet email est déjà utilisé. Essayez avec un autre email.
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

                  {/* Name row */}
                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <FormField formik={formik} name="firstName" label="Nom"
                      placeholder="Votre nom" icon={LuUser} />
                    <FormField formik={formik} name="lastName" label="Prénom"
                      placeholder="Votre prénom" icon={LuUser} />
                  </Grid>

                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <FormField formik={formik} name="email" label="Adresse email"
                      placeholder="exemple@email.com" icon={LuMail}
                      isInvalid={emailError} />
                    <FormField formik={formik} name="phone" label="Téléphone"
                      placeholder="12345678" icon={LuPhone} />
                  </Grid>

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
                  Créer mon compte
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

export default SignUp