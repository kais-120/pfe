import { Box, Button, Input, Text, Flex, VStack, Field } from "@chakra-ui/react"
import { useFormik } from "formik"
import * as yup from "yup"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Axios } from "../Api/Api"
import { useState } from "react"
import {
  LuLock, LuCheck, LuEye, LuEyeOff,
  LuShieldCheck,
} from "react-icons/lu"
import { FaHotel } from "react-icons/fa"
import { LucideAlertCircle } from "lucide-react"
import logo from "../assets/image.png"

const validationSchema = yup.object({
  password: yup.string()
    .min(6, "Minimum 6 caractères")
    .matches(/[A-Z]/, "Au moins une majuscule")
    .matches(/[0-9]/, "Au moins un chiffre")
    .required("Le mot de passe est requis"),
  confirmPassword: yup.string()
    .required("La confirmation est requise")
    .oneOf([yup.ref("password"), null], "Les mots de passe ne correspondent pas"),
})

function getStrength(password) {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 12)  score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if      (score <= 1) return { level: 1, label: "Très faible",color: "red.400"    }
  else if (score === 2) return { level: 2, label: "Faible",color: "orange.400" }
  else if (score === 3) return { level: 3, label: "Moyen",color: "yellow.500" }
  else if (score === 4) return { level: 4, label: "Fort",color: "green.400"  }
  else return { level: 5, label: "Très fort",color: "green.600"  }
}

function PasswordField({ formik, name, label, placeholder }) {
  const [show, setShow] = useState(false)
  const isInvalid = formik.touched[name] && !!formik.errors[name]

  return (
    <Field.Root invalid={isInvalid} w="full">
      <Field.Label>
        <Text fontSize="xs" fontWeight={700} color="gray.600"
          textTransform="uppercase" letterSpacing="wider">
          {label}
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
          <LuLock size={14} />
        </Box>
        <Input
        outline={"none"}
          name={name}
          type={show ? "text" : "password"}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder={placeholder}
          border="none" bg="transparent" px={0} h="42px" flex={1}
          fontSize="sm" color="gray.800"
          _focus={{ boxShadow: "none" }}
          _placeholder={{ color: "gray.300" }}
        />
        <Box
          as="button" type="button"
          color="gray.400" flexShrink={0} ml={2}
          cursor="pointer" transition="color 0.15s"
          _hover={{ color: "gray.600" }}
          onClick={() => setShow(s => !s)}
        >
          {show ? <LuEyeOff size={15} /> : <LuEye size={15} />}
        </Box>
      </Flex>
      {isInvalid && (
        <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
          {formik.errors[name]}
        </Field.ErrorText>
      )}
    </Field.Root>
  )
}

const ResetPassword = () => {
  const navigate  = useNavigate()
  const {hash} = useParams();

  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState("")

  const formik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError("")
        await Axios.put("/auth/update-password", {
          token:hash,
          password: values.password,
        })
        setSuccess(true)
        setTimeout(() => navigate("/login"), 2000)
      } catch {
        setError("La réinitialisation a échoué. Le code a peut-être expiré.")
      }
    }
  })

  const strength = formik.values.password
    ? getStrength(formik.values.password)
    : null

  const RULES = [
    { label: "6 caractères minimum", test: formik.values.password.length >= 6},
    { label: "Une majuscule",test: /[A-Z]/.test(formik.values.password)},
    { label: "Un chiffre", test: /[0-9]/.test(formik.values.password)},
    { label: "Mots de passe identiques",
      test: !!formik.values.confirmPassword &&
            formik.values.password === formik.values.confirmPassword },
  ]

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

          <Flex w="72px" h="72px" borderRadius="2xl"
            bg="whiteAlpha.200" align="center" justify="center" mb={6}>
            <LuShieldCheck size={32} color="white" />
          </Flex>

          <Text fontSize="3xl" fontWeight={900} color="white"
            lineHeight="1.2" letterSpacing="-0.5px" mb={4}>
            Nouveau mot de passe
          </Text>
          <Text color="blue.100" fontSize="sm" lineHeight="1.8" mb={10}>
            Choisissez un mot de passe fort et unique que vous n'utilisez
            pas sur d'autres sites.
          </Text>
        </Box>
      </Box>

      {/* ── Right panel ── */}
      <Flex flex={1} align="center" justify="center" px={{ base: 4, md: 8 }} py={10}>
        <Box w="full" maxW="420px">

          {/* Mobile logo */}
          <Flex align="center" gap={2} mb={8} display={{ base: "flex", lg: "none" }}>
            <img src={logo} alt="logo" />
            
          </Flex>

          <Box mb={8}>
            <Text fontSize="2xl" fontWeight={900} color="gray.900"
              letterSpacing="-0.5px" mb={1}>
              Nouveau mot de passe
            </Text>
          </Box>

          {/* Error */}
          {error && (
            <Flex align="center" gap={2.5} bg="red.50"
              border="1px solid" borderColor="red.200"
              borderRadius="xl" px={4} py={3} mb={5}>
              <Box color="red.500" flexShrink={0}><LucideAlertCircle size={15} /></Box>
              <Text fontSize="sm" color="red.600" fontWeight={500}>{error}</Text>
            </Flex>
          )}

          {/* Success */}
          {success && (
            <Flex align="center" gap={2.5} bg="green.50"
              border="1px solid" borderColor="green.200"
              borderRadius="xl" px={4} py={3} mb={5}>
              <Box color="green.500" flexShrink={0}><LuCheck size={15} /></Box>
              <Text fontSize="sm" color="green.600" fontWeight={500}>
                Mot de passe réinitialisé ! Redirection vers la connexion…
              </Text>
            </Flex>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Box bg="white" borderRadius="2xl" p={6} mb={4}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 8px rgba(0,0,0,0.05)">
              <VStack gap={4} align="stretch">

                <PasswordField
                  formik={formik}
                  name="password"
                  label="Nouveau mot de passe"
                  placeholder="••••••••"
                />

                {/* Strength bar */}
                {strength && (
                  <Box>
                    <Flex justify="space-between" mb={1.5}>
                      <Text fontSize="xs" color="gray.400">Force du mot de passe</Text>
                      <Text fontSize="xs" fontWeight={700} color={strength.color}>
                        {strength.label}
                      </Text>
                    </Flex>
                    <Flex gap={1}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <Box
                          key={i}
                          flex={1} h="4px" borderRadius="full"
                          bg={i <= strength.level ? strength.color : "gray.100"}
                          transition="background 0.3s"
                        />
                      ))}
                    </Flex>
                  </Box>
                )}

                <PasswordField
                  formik={formik}
                  name="confirmPassword"
                  label="Confirmer le mot de passe"
                  placeholder="••••••••"
                />

                {/* Mobile checklist */}
                <Box
                  bg="gray.50" borderRadius="xl" p={4}
                  border="1px solid" borderColor="gray.100"
                >
                  <Text fontSize="xs" fontWeight={700} color="gray.500"
                    textTransform="uppercase" letterSpacing="wider" mb={3}>
                    Critères
                  </Text>
                  <VStack align="stretch" gap={2}>
                    {RULES.map(({ label, test }) => (
                      <Flex key={label} align="center" gap={2}>
                        <Box
                          w="16px" h="16px" borderRadius="full" flexShrink={0}
                          bg={test ? "green.400" : "gray.200"}
                          display="flex" alignItems="center" justifyContent="center"
                          transition="background 0.2s"
                        >
                          <LuCheck size={9} color="white" />
                        </Box>
                        <Text fontSize="xs"
                          color={test ? "gray.700" : "gray.400"}
                          fontWeight={test ? 600 : 400}>
                          {label}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>

              </VStack>
            </Box>

            <Button
              type="submit" w="full" h="46px"
              colorScheme="blue" borderRadius="xl"
              fontWeight={700} fontSize="sm"
              loading={formik.isSubmitting}
              loadingText="Réinitialisation…"
              isDisabled={success}
            >
              <Flex align="center" gap={2}>
                <LuShieldCheck size={15} />
                Réinitialiser le mot de passe
              </Flex>
            </Button>

          </form>
        </Box>
      </Flex>
    </Flex>
  )
}

export default ResetPassword