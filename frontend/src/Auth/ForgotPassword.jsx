import { Box, Button, Input, Text, Flex, VStack, Field } from "@chakra-ui/react"
import { useFormik } from "formik"
import * as yup from "yup"
import { Link, useNavigate } from "react-router-dom"
import { Axios } from "../Api/Api"
import { useState } from "react"
import { LuMail, LuChevronLeft, LuChevronRight, LuCheck } from "react-icons/lu"
import { FaHotel } from "react-icons/fa"
import { LucideAlertCircle } from "lucide-react"
import logo from "../assets/image.png"

const validationSchema = yup.object({
  email: yup.string().email("Email invalide").required("L'email est requis"),
})

const ForgotPassword = () => {
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState(false)
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(false)
        const response = await Axios.post("/auth/forgot-password", { email: values.email })
        setSent(true)
        console.log(response)
        setTimeout(() => navigate(`/verify-otp/${response.data.token}`), 1500)
      } catch {
        setError(true)
      }
    }
  })

  const isInvalid = (formik.touched.email && !!formik.errors.email) || error

  return (
    <Flex minH="100vh" bg="#f5f6fa">

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
        <Box position="absolute" top="-80px" right="-80px"
          w="300px" h="300px" borderRadius="full" bg="whiteAlpha.100" />
        <Box position="absolute" bottom="-60px" left="-60px"
          w="240px" h="240px" borderRadius="full" bg="whiteAlpha.100" />

        <Box position="relative" zIndex={1}>
          <Flex align="center" gap={2.5} mb={16}>
            <img src={logo} alt="logo" />
          </Flex>

          <Text fontSize="3xl" fontWeight={900} color="white"
            lineHeight="1.2" letterSpacing="-0.5px" mb={4}>
            Mot de passe oublié ?
          </Text>
          <Text color="blue.100" fontSize="sm" lineHeight="1.8" mb={10}>
            Pas de panique. Entrez votre adresse email et nous vous enverrons
            un code de vérification pour réinitialiser votre mot de passe.
          </Text>

          {[
            "Vérification de votre identité",
            "Code OTP sécurisé à usage unique",
            "Réinitialisation rapide et sécurisée",
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

      {/* ── Right panel ── */}
      <Flex flex={1} align="center" justify="center" px={{ base: 4, md: 8 }} py={10}>
        <Box w="full" maxW="400px">

          <Flex align="center" gap={2} mb={8} display={{ base: "flex", lg: "none" }}>
            <img width={"160px"} src={logo} alt="logo" />
          </Flex>

          <Flex as={Link} to="/login" align="center" gap={1.5}
            color="gray.400" fontSize="sm" mb={8}
            _hover={{ color: "blue.500" }} transition="color 0.15s"
            display="inline-flex">
            <LuChevronLeft size={14} />
            Retour à la connexion
          </Flex>

          <Box mb={8}>
            <Text fontSize="2xl" fontWeight={900} color="gray.900"
              letterSpacing="-0.5px" mb={1}>
              Réinitialiser le mot de passe
            </Text>
            <Text fontSize="sm" color="gray.400">
              Nous enverrons un code de vérification à votre adresse email
            </Text>
          </Box>

          {/* Error banner */}
          {error && (
            <Flex align="center" gap={2.5} bg="red.50"
              border="1px solid" borderColor="red.200"
              borderRadius="xl" px={4} py={3} mb={5}>
              <Box color="red.500" flexShrink={0}><LucideAlertCircle size={15} /></Box>
              <Text fontSize="sm" color="red.600" fontWeight={500}>
                Aucun compte trouvé avec cet email. Vérifiez et réessayez.
              </Text>
            </Flex>
          )}

          {/* Success banner */}
          {sent && (
            <Flex align="center" gap={2.5} bg="green.50"
              border="1px solid" borderColor="green.200"
              borderRadius="xl" px={4} py={3} mb={5}>
              <Box color="green.500" flexShrink={0}><LuCheck size={15} /></Box>
              <Text fontSize="sm" color="green.600" fontWeight={500}>
                Code envoyé ! Redirection en cours…
              </Text>
            </Flex>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Box bg="white" borderRadius="2xl" p={6} mb={4}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 8px rgba(0,0,0,0.05)">
              <VStack gap={4} align="stretch">
                <Field.Root invalid={isInvalid} w="full">
                  <Field.Label>
                    <Text fontSize="xs" fontWeight={700} color="gray.600"
                      textTransform="uppercase" letterSpacing="wider">
                      Adresse email
                    </Text>
                  </Field.Label>
                  <Flex w="full" align="center"
                    border="1.5px solid"
                    borderColor={isInvalid ? "red.400" : "gray.200"}
                    borderRadius="xl" bg="white" px={3}
                    transition="all 0.15s"
                    _focusWithin={{
                      borderColor: isInvalid ? "red.400" : "blue.400",
                      boxShadow: isInvalid
                        ? "0 0 0 3px rgba(245,101,101,0.12)"
                        : "0 0 0 3px rgba(49,130,206,0.12)",
                    }}>
                    <Box color={isInvalid ? "red.400" : "gray.400"} mr={2} flexShrink={0}>
                      <LuMail size={14} />
                    </Box>
                    <Input
                    outline={"none"}
                      name="email" type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="exemple@email.com"
                      border="none" bg="transparent" px={0} h="42px" flex={1}
                      fontSize="sm" color="gray.800"
                      _focus={{ boxShadow: "none" }}
                      _placeholder={{ color: "gray.300" }}
                    />
                  </Flex>
                  {formik.touched.email && formik.errors.email && (
                    <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
                      {formik.errors.email}
                    </Field.ErrorText>
                  )}
                </Field.Root>
              </VStack>
            </Box>

            <Button
              type="submit" w="full" h="46px"
              colorScheme="blue" borderRadius="xl"
              fontWeight={700} fontSize="sm"
              loading={formik.isSubmitting}
              loadingText="Envoi en cours…"
              isDisabled={sent}
            >
              <Flex align="center" gap={2}>
                Envoyer le code
                <LuChevronRight size={15} />
              </Flex>
            </Button>
          </form>

        </Box>
      </Flex>
    </Flex>
  )
}

export default ForgotPassword