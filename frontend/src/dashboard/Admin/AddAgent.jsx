import { Helmet } from "react-helmet"
import {
  Box, Button, Field, Input, Text,
  Flex, Grid, VStack,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import * as yup from "yup"
import { useNavigate } from "react-router-dom"
import { AxiosToken } from "../../Api/Api"
import { useState } from "react"
import {
  LuUser, LuMail, LuPhone, LuLock,
  LuChevronLeft, LuCheck,
  LuUserPlus,
} from "react-icons/lu"
import { LucideAlertCircle } from "lucide-react"

const validationSchema = yup.object().shape({
  firstName: yup.string().min(3, "Minimum 3 caractères").required("Le nom est requis"),
  lastName: yup.string().min(3, "Minimum 3 caractères").required("Le prénom est requis"),
  email: yup.string().email("Email invalide").required("L'email est requis"),
  phone: yup.string().matches(/^\d+$/, "Chiffres uniquement").length(8, "Doit contenir 8 chiffres").required("Le téléphone est requis"),
  password: yup.string().min(6, "Minimum 6 caractères").required("Le mot de passe est requis"),
  confirmPassword: yup.string().required("Confirmation requise").oneOf([yup.ref("password"), null], "Les mots de passe ne correspondent pas"),
})

function FormField({ formik, name, label, type = "text", placeholder, icon: Icon, isInvalid,isBothInvalid }) {
  const invalid = isInvalid || (formik.touched[name] && !!formik.errors[name])
  return (
    <Field.Root invalid={invalid || isBothInvalid} w="full">
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
        outline={"none"}
          name={name} type={type}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder={placeholder}
          border="none" bg="transparent" px={0} h="42px" flex={1}
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

const AddAgent = () => {
  const [emailError,setEmailError] = useState(false)
  const [phoneError,setPhoneError] = useState(false)
  const [emailPhoneError,setEmailPhoneError] = useState(false)
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: {
      firstName: "", lastName: "",
      email: "", phone: "",
      password: "", confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setEmailError(false)
        setEmailPhoneError(false)
        setPhoneError(false)
      try {
        setEmailError(false)
        const name = `${values.firstName} ${values.lastName}`
        await AxiosToken.post("/user/add/agent", { ...values, name })
        navigate(-1)
      } catch(err) {
        if(err.status === 422) {
          if(Object.keys(err.response.data.errors).length === 2){
            setEmailPhoneError(true)
          }
          else{
            if(Object.keys(err.response.data.errors)[0] === "email"){
              setEmailError(true)
            }else{
              setPhoneError(true)
            }
            
          }
        }
      }
    }
  })

  return (
    <>
      <Helmet><title>Ajouter un agent</title></Helmet>

      <Box w={"full"}>

        {/* Back */}
        <Flex
          as="button" type="button"
          align="center" gap={1.5}
          color="gray.400" fontSize="sm" mb={6}
          _hover={{ color: "blue.500" }} transition="color 0.15s"
          onClick={() => navigate(-1)}
        >
          <LuChevronLeft size={14} />
          Retour
        </Flex>

        {/* Page header */}
        <Box mb={8}>
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={1}>
            Gestion des utilisateurs
          </Text>
          <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
            Ajouter un agent
          </Text>
          <Text fontSize="sm" color="gray.400" mt={1}>
            Créez un nouveau compte agent pour votre équipe
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
                  Cet Numéro de téléphone est déjà utilisé. Essayez avec un autre Numéro.
                </Text>
              </Flex>
            )}

        <form onSubmit={formik.handleSubmit}>
          <VStack gap={4} w={"full"} align="stretch">

            {/* Identity card */}
            <Box
              bg="white" borderRadius="2xl" p={6}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 8px rgba(0,0,0,0.05)"
            >
              <Flex align="center" gap={2} mb={5}>
                <Flex w="28px" h="28px" borderRadius="lg" bg="blue.50"
                  color="blue.500" align="center" justify="center">
                  <LuUser size={14} />
                </Flex>
                <Text fontSize="sm" fontWeight={700} color="gray.700">
                  Identité
                </Text>
              </Flex>

              <VStack gap={4} align="stretch">
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <FormField formik={formik} name="firstName" label="Nom"
                    placeholder="Nom" icon={LuUser} />
                  <FormField formik={formik} name="lastName" label="Prénom"
                    placeholder="Prénom" icon={LuUser} />
                </Grid>

                <Grid templateColumns="1fr 1fr" gap={4}>
                  <FormField formik={formik} name="email" label="Adresse email"
                    placeholder="agent@example.com" icon={LuMail}
                    isInvalid={emailError} isBothInvalid={emailPhoneError} />
                  <FormField formik={formik} name="phone" label="Téléphone"
                    placeholder="12345678" icon={LuPhone} 
                    isInvalid={phoneError} isBothInvalid={emailPhoneError}
                    />
                </Grid>
              </VStack>
            </Box>

            {/* Security card */}
            <Box
              bg="white" borderRadius="2xl" p={6}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 8px rgba(0,0,0,0.05)"
            >
              <Flex align="center" gap={2} mb={5}>
                <Flex w="28px" h="28px" borderRadius="lg" bg="green.50"
                  color="green.500" align="center" justify="center">
                  <LuLock size={14} />
                </Flex>
                <Text fontSize="sm" fontWeight={700} color="gray.700">
                  Sécurité
                </Text>
              </Flex>

              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormField formik={formik} name="password" label="Mot de passe"
                  type="password" placeholder="••••••••" icon={LuLock} />
                <FormField formik={formik} name="confirmPassword" label="Confirmation"
                  type="password" placeholder="••••••••" icon={LuLock} />
              </Grid>
            </Box>

            {/* Actions */}
            <Flex gap={3} justify="flex-end">
              <Button
                type="button" variant="outline"
                borderRadius="xl" px={6}
                color="gray.500" borderColor="gray.200"
                _hover={{ bg: "gray.50" }}
                onClick={() => navigate(-1)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                colorScheme="blue" borderRadius="xl"
                px={8} fontWeight={700}
                loading={formik.isSubmitting}
                loadingText="Création…"
              >
                <Flex align="center" gap={2}>
                  <LuUserPlus size={14} />
                  Créer l'agent
                </Flex>
              </Button>
            </Flex>

          </VStack>
        </form>
      </Box>
    </>
  )
}

export default AddAgent