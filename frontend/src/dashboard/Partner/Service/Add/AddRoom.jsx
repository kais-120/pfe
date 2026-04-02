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

const validationSchema = Yup.object({
  name: Yup.string().required("Le nom de chambre est requis"),
  capacity: Yup.number().required("La capacité est requise").positive("Doit être positif"),
  price_by_day: Yup.number().required("Le prix par jour est requis").positive("Doit être positif"),
  price_by_adult: Yup.number().required("Le prix par adulte est requis").positive("Doit être positif"),
  price_by_children: Yup.number().required("Le prix par enfant est requis").min(0, "Doit être ≥ 0"),
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
      name: "", capacity: "", price_by_day: "",
      price_by_adult: "", price_by_children: "", count: "",
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

  return (
    <Container maxW="680px" py={2}>

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

            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
              <Box gridColumn={{ sm: "1 / -1" }}>
                <FormField formik={formik} name="name" label="Nom de la chambre" icon={LuBed} />
              </Box>
              <FormField formik={formik} name="capacity" label="Capacité" type="number" icon={LuUsers} suffix="pers." />
              <FormField formik={formik} name="count" label="Nombre de chambres" type="number" icon={LuHash} suffix="unités" />
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

            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }} gap={4}>
              <FormField formik={formik} name="price_by_day" label="Prix / nuit" type="number" icon={LuBanknote} suffix="TND" />
              <FormField formik={formik} name="price_by_adult" label="Prix / adulte" type="number" icon={LuUsers} suffix="TND" />
              <FormField formik={formik} name="price_by_children" label="Prix / enfant" type="number" icon={LuBaby} suffix="TND" />
            </Grid>

            {/* Price preview */}
            {formik.values.price_by_day && formik.values.price_by_adult && (
              <Box
                mt={5} p={4} bg="blue.50" borderRadius="xl"
                border="1px solid" borderColor="blue.100"
              >
                <Text fontSize="xs" fontWeight={700} color="blue.600"
                  textTransform="uppercase" letterSpacing="wider" mb={2}>
                  Aperçu tarifaire — 3 nuits, 2 adultes
                  {formik.values.price_by_children > 0 ? ", 1 enfant" : ""}
                </Text>
                <Flex align="baseline" gap={1.5}>
                  <Text fontSize="2xl" fontWeight={900} color="blue.700" lineHeight={1}>
                    {(
                      Number(formik.values.price_by_day) * 3
                      + Number(formik.values.price_by_adult) * 2
                      + (formik.values.price_by_children > 0 ? Number(formik.values.price_by_children) : 0)
                    ).toFixed(0)}
                  </Text>
                  <Text fontSize="sm" color="blue.500" fontWeight={500}>TND total</Text>
                </Flex>
                <Text fontSize="xs" color="blue.400" mt={1}>
                  {formik.values.price_by_day} × 3 nuits
                  {" "}+ {formik.values.price_by_adult} × 2 adultes
                  {formik.values.price_by_children > 0
                    ? ` + ${formik.values.price_by_children} × 1 enfant`
                    : ""}
                </Text>
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
  )
}

export default AddRoom