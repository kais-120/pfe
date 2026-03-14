import {
  Container,
  Heading,
  Input,
  Button,
  VStack,
  Field,
} from "@chakra-ui/react";

import { useFormik } from "formik";
import * as Yup from "yup";
import { AxiosToken } from "../../../../Api/Api";
import { toaster } from "../../../../components/ui/toaster";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object({
  name: Yup.string().required("Le nom de cambre est requis"),
  capacity: Yup.number().required("La capacité est requis").positive("le nombre de chambre doit être un nombre positif"),
  price_by_day: Yup.number().required("Le prix par jour est requis").positive("La capacité  doit être un nombre positif"),
  price_by_adult: Yup.number().required("Le Prix par adulte est requis").positive("Le Prix par adulte doit être un nombre positif"),
  price_by_children: Yup.number().required("Le Prix par enfant est requis").moreThan(-1,"Le Prix par enfant doit être un nombre positif"),
  count: Yup.number().required("Le nombre de chambre est requis").positive("Le nombre de chambre doit être un nombre positif"),
});

const AddRoom = () => {

    const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: "",
      capacity: "",
      price_by_day: "",
      price_by_adult: "",
      price_by_children: "",
      count: "",
      features: ""
    },

    validationSchema,

    onSubmit: async (values) => {
      try {

        await AxiosToken.post("/service/hotel/room/add", values)

        toaster.create({
          description: "Room added successfully",
          type: "success",
          closable: true,
        })
        setTimeout(()=>{
            navigate("/dashboard/service");
        },2000)

      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <Container maxW="3xl">
      <Heading mb={8}>Ajouter un chambre</Heading>

      <form onSubmit={formik.handleSubmit}>
        <VStack >

          <Field.Root invalid={formik.touched.name && formik.errors.name}>
            <Field.Label>Nom de chambre</Field.Label>
            <Input
              bg={"white"}
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <Field.ErrorText>{formik.errors.name}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={formik.touched.capacity && formik.errors.capacity}>
            <Field.Label>Capacité</Field.Label>
            <Input
            bg={"white"}
              type="number"
              name="capacity"
              value={formik.values.capacity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <Field.ErrorText>{formik.errors.capacity}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={formik.touched.price_by_day && formik.errors.price_by_day}>
            <Field.Label>Prix par jour</Field.Label>
            <Input
            bg={"white"}
              type="number"
              name="price_by_day"
              value={formik.values.price_by_day}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <Field.ErrorText>{formik.errors.price_by_day}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={formik.touched.price_by_adult && formik.errors.price_by_adult}>
            <Field.Label>Prix par adulte</Field.Label>
            <Input
            bg={"white"}
              type="number"
              name="price_by_adult"
              value={formik.values.price_by_adult}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}

            />
                <Field.ErrorText>{formik.errors.price_by_adult}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={formik.touched.price_by_children && formik.errors.price_by_children}>
            <Field.Label>Prix par enfant</Field.Label>
            <Input
            bg={"white"}
              type="number"
              name="price_by_children"
              value={formik.values.price_by_children}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <Field.ErrorText>{formik.errors.price_by_children}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={formik.touched.count && formik.errors.count}>
            <Field.Label>Nombre de chambre</Field.Label>
            <Input
            bg={"white"}
              type="number"
              name="count"
              value={formik.values.count}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}

            />
            <Field.ErrorText>{formik.errors.count}</Field.ErrorText>
          </Field.Root>

          <Button type="submit" colorScheme="blue">
            Ajouter chambre
          </Button>

        </VStack>
      </form>
    </Container>
  )
}

export default AddRoom