import {
  Box, Container, Heading, Input, Button,
  VStack, Field, Grid, Text, Flex,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AxiosToken } from "../../../../Api/Api";
import { toaster } from "../../../../components/ui/toaster";
import { useNavigate } from "react-router-dom";
import {
  LuBed, LuUsers, LuBanknote, LuHash,
  LuChevronLeft, LuBaby, LuCheck,
} from "react-icons/lu";
import { Helmet } from "react-helmet";

const validationSchema = Yup.object({
  name: Yup.string().required("Le nom de chambre est requis"),
  capacity: Yup.number().required("La capacité est requise").positive("Doit être positif"),
  price_by_day: Yup.number().required("Le prix par nuit est requis").positive("Doit être positif"),
  count: Yup.number().required("Le nombre de chambres est requis").positive("Doit être positif"),
});

/* ── Reusable field wrapper ─────────────────────────────────────── */
function FormField({ formik, name, label, type = "text", icon: Icon, suffix }) {
  const isInvalid = formik.touched[name] && formik.errors[name]
  return (
    <Field.Root invalid={!!isInvalid}>
      <Field.Label>
        <Text fontSize="xs" fontWeight={700} color="gray.600"
          textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
      </Field.Label>
      <Flex
        align="center"
        w="full"
        border="1.5px solid"
        borderColor={isInvalid ? "red.400" : "gray.200"}
        borderRadius="xl"
        bg="white"
        px={3}
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
        <Input
          type={type}
          name={name}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          border="none"
          bg="transparent"
          flex="1"
          px={0}
          h="42px"
          fontSize="sm"
          color="gray.800"
          _focus={{ boxShadow: "none", outline: "none" }}
          _placeholder={{ color: "gray.300" }}
          placeholder={`Entrez ${label.toLowerCase()}`}
        />
        {suffix && (
          <Text fontSize="xs" color="gray.400" fontWeight={500} flexShrink={0} ml={2}>
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

const AddRoom = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: "",
      capacity: "",
      price_by_day: 0,
      count: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await AxiosToken.post("/service/hotel/room/add", values)
        toaster.create({
          description: "Chambre ajoutée avec succès",
          type: "success",
          closable: true,
        })
        setTimeout(() => navigate("/partner/dashboard/service"), 1800)
      } catch (error) {
        console.error(error)
        toaster.create({
          description: "Une erreur est survenue",
          type: "error",
          closable: true,
        })
      }
    }
  })

  const isSubmitting = formik.isSubmitting

  /* ── Price preview calculation ── */
  const calculatePreview = (nights = 3, adults = 2, children = 1) => {
    const basePrice = Number(formik.values.price_per_night) || 0
    const extraAdultFee = Number(formik.values.extra_adult_fee_per_night) || 0
    const childFee = Number(formik.values.child_fee_per_night) || 0

    const baseCost = basePrice * nights
    const extraAdultsCost = Math.max(0, adults - 2) * extraAdultFee * nights
    const childrenCost = children * childFee * nights
    const total = baseCost + extraAdultsCost + childrenCost

    return { total, baseCost, extraAdultsCost, childrenCost, adults, children, nights }
  }

  const preview = calculatePreview()

  return (
    <>
    <Helmet title="Ajouter chambre"></Helmet>
    <Container py={2}>

      {/* Back button */}
      <Flex
        as="button" align="center" gap={1.5}
        color="gray.400" fontSize="sm" mb={6}
        _hover={{ color: "blue.500" }}
        transition="color 0.15s"
        onClick={() => navigate(-1)}
        type="button"
      >
        <LuChevronLeft size={15} />
        Retour
      </Flex>

      {/* Page header */}
      <Box mb={8}>
        <Text fontSize="xs" fontWeight={700} color="blue.500"
          textTransform="uppercase" letterSpacing="widest" mb={1}>
          Gestion des chambres
        </Text>
        <Heading size="xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
          Ajouter une chambre
        </Heading>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Renseignez les informations de la nouvelle chambre
        </Text>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <VStack gap={0} align="stretch">

          {/* Card: Informations générales */}
          <Box
            bg="white" borderRadius="2xl" p={6} mb={4}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)"
          >
            <Flex align="center" gap={2} mb={5}>
              <Flex w="28px" h="28px" borderRadius="lg" bg="blue.50"
                color="blue.500" align="center" justify="center">
                <LuBed size={14} />
              </Flex>
              <Text fontSize="sm" fontWeight={700} color="gray.700">
                Informations générales
              </Text>
            </Flex>

            <Box w={"full"}>
              <FormField formik={formik} name="name" label="Nom de la chambre" icon={LuBed} />
            </Box>
            <Grid mt={"20px"} templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }} gap={4}>
              <FormField formik={formik} name="capacity" label="Capacité" type="number" icon={LuUsers} suffix="pers." />
              <FormField formik={formik} name="count" label="Nombre de chambres" type="number" icon={LuHash} suffix="unités" />
               <FormField
                formik={formik}
                name="price_by_day"
                label="Prix / nuit"
                type="number"
                icon={LuBanknote}
                suffix="TND"
              />
            </Grid>
          </Box>

          {/* Card: Tarification */}
          <Box
            bg="white" borderRadius="2xl" p={6} mb={6}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)"
          >
            <Flex align="center" gap={2} mb={5}>
              <Flex w="28px" h="28px" borderRadius="lg" bg="green.50"
                color="green.500" align="center" justify="center">
                <LuBanknote size={14} />
              </Flex>
              <Text fontSize="sm" fontWeight={700} color="gray.700">
                Tarification
              </Text>
            </Flex>
   
            {formik.values.price_by_day && (
              <Box
                mt={5} p={4} bg="blue.50" borderRadius="xl"
                border="1px solid" borderColor="blue.100"
              >
                <Text fontSize="xs" fontWeight={700} color="blue.600"
                  textTransform="uppercase" letterSpacing="wider" mb={3}>
                  Aperçu tarifaire - {preview.nights} nuits, {formik.values.capacity > 1 ? `${formik.values.capacity} personnes` : "" }
                </Text>

                <VStack align="stretch" gap={2} mb={3}>
                  {/* Base price */}
                  <Flex justify="space-between" fontSize="sm">
                    <Text color="gray.600">
                      Prix de base : {formik.values.price_by_day ? (Number(formik.values.price_by_day)) : 0} TND × {preview.nights} nuits
                    </Text>
                    <Text fontWeight={600} color="gray.800">
                      {Number(formik.values.price_by_day)} TND
                    </Text>
                  </Flex>

                 
                </VStack>

                {/* Total */}
                <Box borderTop="1px solid" borderColor="blue.200" pt={3}>
                  <Flex align="baseline" gap={1.5}>
                    <Text fontSize="2xl" fontWeight={900} color="blue.700" lineHeight={1}>
                      {Number(formik.values.price_by_day)}
                    </Text>
                    <Text fontSize="sm" color="blue.500" fontWeight={500}>TND total</Text>
                  </Flex>
                </Box>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Flex gap={3} justify="flex-end">
            <Button
              type="button"
              variant="outline"
              borderRadius="xl"
              px={6}
              color="gray.500"
              borderColor="gray.200"
              _hover={{ bg: "gray.50" }}
              onClick={() => navigate(-1)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              borderRadius="xl"
              px={8}
              fontWeight={700}
              loading={isSubmitting}
              loadingText="Enregistrement…"
            >
              <Flex align="center" gap={2}>
                <LuCheck size={14} />
                Ajouter la chambre
              </Flex>
            </Button>
          </Flex>

        </VStack>
      </form>
    </Container>
    </>
  )
}

export default AddRoom