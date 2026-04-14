import {
  Container, Input, Button,
  VStack, Field, Box,
  Flex, Text,
  Spinner,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import {
  LuMapPin,
  LuChevronLeft, LuCheck, LuX, LuCar,
} from "react-icons/lu"
import * as Yup from "yup"
import { AxiosToken } from "../../../../Api/Api"
import { toaster } from "../../../../components/ui/toaster"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

const validationSchema = Yup.object({
  name: Yup.string().required("Le nom de l'agence est requis"),
  address: Yup.string().required("L'adresse est requise"),
})

function FormField({ formik, name, label, icon: Icon, children, hint }) {
  const isInvalid = formik?.touched?.[name] && formik?.errors?.[name]
  return (
    <Field.Root invalid={!!isInvalid} w="full">
      <Field.Label>
        <Text fontSize="xs" fontWeight={700} color="gray.600"
          textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
      </Field.Label>
      {hint && <Text fontSize="xs" color="gray.400" mt={-1} mb={1}>{hint}</Text>}
      <Flex
        w="full"
        align="center"
        border="1.5px solid"
        borderColor={isInvalid ? "red.400" : "gray.200"}
        borderRadius="xl"
        bg="white" px={3}
        transition="border-color 0.15s, box-shadow 0.15s"
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

const EditLocation = () => {
  const navigate = useNavigate();
  const [location,setLocation] = useState();
  const [loading,setLoading] = useState(true)
  useEffect(()=>{
    const locationData = async () => {
      try{
        const res = await AxiosToken.get("/service/location/get");
        setLocation(res.data.location)
      }catch{
        console.error("error")
      }
      finally{
        setLoading(false)
      }
    }
    locationData()
  },[])

  const formik = useFormik({
    enableReinitialize:true,
    initialValues: {
      name:location?.name || "",
      address:location?.address || "",
    },
    validationSchema,
    onSubmit: async (values) => {

      try {
        await AxiosToken.post("/service/location/add", values)
        toaster.create({
          description: "Agence de location créée avec succès.",
          type: "success", closable: true,
        })
        setTimeout(() => navigate("/partner/dashboard/service"), 1800)
      } catch {
        toaster.create({
          description: "Une erreur est survenue.",
          type: "error", closable: true,
        })
      }
    }
  })

  if (loading) {
      return (
        <Container py={8} display="flex" alignItems="center" justifyContent="center" minH="400px">
          <Flex direction="column" align="center" gap={4}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.500">Chargement de le location...</Text>
          </Flex>
        </Container>
      );
    }
  

  return (
    <Container py={2}>
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
          Gestion des services
        </Text>
        <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Modifier mon agence de location
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Mettez à jour les informations de votre établissement
        </Text>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <VStack gap={4} align="stretch">

          <Box bg="white" borderRadius="2xl" p={6}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)">

            <Flex align="center" gap={2} mb={5}>
              <Flex w="28px" h="28px" borderRadius="lg" bg="blue.50"
                color="blue.500" align="center" justify="center" flexShrink={0}>
                <LuCar size={14} />
              </Flex>
              <Text fontSize="sm" fontWeight={700} color="gray.700">
                Informations de l'agence
              </Text>
            </Flex>

            <VStack gap={4} align="stretch">
              <FormField formik={formik} name="name" label="Nom de l'agence" icon={LuCar}>
                <Input
                  outline={"none"}
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Ex: AutoLux Tunisie"
                  border="none" bg="transparent" px={0} h="42px" flex={1} w="full"
                  fontSize="sm" color="gray.800"
                  _focus={{ boxShadow: "none" }}
                  _placeholder={{ color: "gray.300" }}
                />
              </FormField>

              <FormField formik={formik} name="address" label="Adresse" icon={LuMapPin}>
                <Input
                  outline={"none"}
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Ex: Avenue Habib Bourguiba, Tunis"
                  border="none" bg="transparent" px={0} h="42px" flex={1} w="full"
                  fontSize="sm" color="gray.800"
                  _focus={{ boxShadow: "none" }}
                  _placeholder={{ color: "gray.300" }}
                />
              </FormField>
            </VStack>

            {/* Info note */}
            
          </Box>

          {/* ── Actions ── */}
          <Flex gap={3} justify="flex-end" pb={4}>
            <Button
              type="button" variant="outline" borderRadius="xl" px={6}
              color="gray.500" borderColor="gray.200" _hover={{ bg: "gray.50" }}
              onClick={() => navigate(-1)}>
              Annuler
            </Button>
            <Button
              type="submit" colorScheme="blue" borderRadius="xl"
              px={8} fontWeight={700}
              loading={formik.isSubmitting}
              loadingText="Enregistrement…">
              <Flex align="center" gap={2}>
                <LuCheck size={14} />
                Enregistrer les modifications
              </Flex>
            </Button>
          </Flex>

        </VStack>
      </form>
    </Container>
  )
}

export default EditLocation