import { Helmet } from "react-helmet"
import { Box, Button, Field, Input, Text, Flex, VStack } from "@chakra-ui/react"
import { useFormik } from "formik"
import * as yup from "yup"
import { Link, useNavigate } from "react-router-dom"
import { Axios } from "../Api/Api"
import { useState } from "react"
import Cookies from "universal-cookie"
import {
  LuMail, LuLock, LuChevronRight,
  LuShieldCheck, LuHeadphones, LuTrendingUp,
} from "react-icons/lu"
import { FaHotel } from "react-icons/fa"
import { LucideAlertCircle } from "lucide-react"
import logo from "../assets/image.png"

const validationSchema = yup.object().shape({
  email:    yup.string().email("Email invalide").required("L'email est requis"),
  password: yup.string().required("Le mot de passe est requis"),
})

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
          outline={"none"}
          fontSize="sm" color="gray.800"
          _focus={{ boxShadow: "none" }}
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

const Login = () => {
  const [error,   setError]   = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const cookie   = new Cookies()

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(false)
        setLoading(true)
        const response = await Axios.post("/auth/login", values)
        cookie.set("auth", response.data.token)
        if (response.data.role === "admin" || response.data.role === "partner") {
          navigate("/dashboard")
        } else {
          navigate("/")
        }
        window.location.reload()
      } catch {
        setError(true)
        setLoading(false)
      }
    }
  })

  return (
    <>
      <Helmet><title>Connexion — H-Care</title></Helmet>

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
              <img  src={logo} alt="logo" />
            </Flex>

            <Text fontSize="3xl" fontWeight={900} color="white"
              lineHeight="1.2" letterSpacing="-0.5px" mb={4}>
              Bon retour parmi nous
            </Text>
            <Text color="blue.100" fontSize="sm" lineHeight="1.8" mb={10}>
              Connectez-vous pour accéder à votre espace et gérer vos réservations, services et bien plus encore.
            </Text>

            {[
              { Icon: LuShieldCheck,  text: "Espace sécurisé et chiffré"           },
              { Icon: LuTrendingUp,   text: "Suivez vos performances en temps réel" },
              { Icon: LuHeadphones,   text: "Support disponible 7j/7"               },
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
          <Box w="full" maxW="420px">

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
                Connexion
              </Text>
              <Text fontSize="sm" color="gray.400">
                Pas encore de compte ?{" "}
                <Link to="/signup">
                  <Text as="span" color="blue.500" fontWeight={600}
                    _hover={{ textDecoration: "underline" }}>
                    S'inscrire
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
            {error && (
              <Flex align="center" gap={2.5} bg="red.50"
                border="1px solid" borderColor="red.200"
                borderRadius="xl" px={4} py={3} mb={5}
              >
                <Box color="red.500" flexShrink={0}><LucideAlertCircle size={15} /></Box>
                <Text fontSize="sm" color="red.600" fontWeight={500}>
                  Email ou mot de passe incorrect. Veuillez réessayer.
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
                  <FormField
                    formik={formik} name="email" label="Adresse email"
                    placeholder="exemple@email.com" icon={LuMail}
                    isInvalid={error}
                  />
                  <FormField
                    formik={formik} name="password" label="Mot de passe"
                    type="password" placeholder="••••••••" icon={LuLock}
                    isInvalid={error}
                  />

                  <Flex justify="flex-end">
                    <Text onClick={()=>navigate("/forgot-password")} fontSize="xs" color="blue.500" cursor="pointer" fontWeight={500}
                      _hover={{ textDecoration: "underline" }}>
                      Mot de passe oublié ?
                    </Text>
                  </Flex>
                </VStack>
              </Box>

              <Button
                type="submit"
                w="full" h="46px"
                colorScheme="blue"
                borderRadius="xl"
                fontWeight={700}
                fontSize="sm"
                loading={loading}
                loadingText="Connexion…"
              >
                <Flex align="center" gap={2}>
                  Se connecter
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

export default Login