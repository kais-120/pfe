import {
  Container,
  Heading,
  Input,
  Textarea,
  Button,
  VStack,
  Field,
  Box,
  FileUpload,
  Icon,
  createListCollection,
  Select,
  Portal
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { LuUpload } from "react-icons/lu";
import * as Yup from "yup";
import { AxiosToken } from "../../../../Api/Api";
import { toaster } from "../../../../components/ui/toaster";
import { useNavigate } from "react-router-dom";


 const validationSchema = Yup.object({
    name: Yup.string().required("Le nom de l'hôtel est requis"),
    description: Yup.string().required("La description est requise"),
    adress: Yup.string().required("L'adresse est requise"),
    equipments: Yup.array().min(1, "Veuillez sélectionner au moins un équipement"),
    images: Yup.array()
      .min(1, "Veuillez ajouter au moins une image")
      .max(15, "Maximum 15 images autorisées"),
  });


const AddHotel = () => {

  const navigate = useNavigate()
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      address: "",
      equipments: [],
      images: []
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log("first")
      console.log(values.equipments)
      console.log(values.images)
       const formData = new FormData();

  formData.append("name", values.name);
  formData.append("description", values.description);
  formData.append("address", values.adress);

  values.equipments.forEach((eq) => {
    formData.append("equipments[]", eq);
  });

  values.images.forEach((img) => {
    formData.append("service_doc", img);
  });
  try{
    await AxiosToken.post("/service/hotel/add",formData);
    toaster.create({
            description: "le hotel ajouter avec success.",
              type: "success",
              closable: true,
          })
          setTimeout(()=>{
            navigate("/dashboard/service")
          },2000)
  }catch{
    console.error("error")
  }

}
  });

  const equipmentsList = createListCollection({
    items: [
      { label: "Wifi", value: "wifi" },
      { label: "Piscine", value: "piscine" },
      { label: "Gym", value: "gym" },
      { label: "Spa", value: "spa" },
      { label: "Climatisation", value: "climatisation" },
      { label: "Restaurant", value: "restaurant" },
      { label: "Parking", value: "parking" },
    ],
  });

  return (
    <Container maxW="4xl">
      <Heading mb={8}>
        Ajouter un hôtel
      </Heading>

      <form onSubmit={formik.handleSubmit}>
        <VStack spacing={6} align="stretch">

          <Field.Root invalid={formik.touched.name && formik.errors.name}>
            <Field.Label>Nom de l'hôtel</Field.Label>
            <Input
              bg="white"
              name="name"
              placeholder="Nom hotel"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
            <Field.ErrorText>{formik.errors.name}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={formik.touched.description && formik.errors.description}>
            <Field.Label>Description</Field.Label>
            <Textarea
              bg="white"
              name="description"
              placeholder="Description de l'hôtel..."
              value={formik.values.description}
              onChange={formik.handleChange}
            />
            <Field.ErrorText>{formik.errors.description}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={formik.touched.adress && formik.errors.adress}>
            <Field.Label>Adress</Field.Label>
            <Input
              bg="white"
              name="adress"
              placeholder="Adress de l'hôtel..."
              value={formik.values.adress}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <Field.ErrorText>{formik.errors.adress}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={formik.touched.images && formik.errors.images}>
            <Field.Label>Images</Field.Label>
            <FileUpload.Root
              maxW="xl"
              alignItems="stretch"
              maxFiles={10}
              onChange={(e) => {
                console.log(e)
              const files = Array.from(e.target.files)
              formik.setFieldValue("images", files)
              }}
            >
              <FileUpload.HiddenInput />
              <FileUpload.Dropzone>
                <Icon size="md" color="fg.muted">
                  <LuUpload />
                </Icon>
                <FileUpload.DropzoneContent>
                  <Box>Drag and drop files here</Box>
                  <Box color="fg.muted">.png, .jpg up to 5MB</Box>
                </FileUpload.DropzoneContent>
              </FileUpload.Dropzone>
              <FileUpload.List clearable  />
            </FileUpload.Root>
            <Field.ErrorText>{formik.errors.images}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={formik.touched.equipments && formik.errors.equipments}>
            <Field.Label>Équipements</Field.Label>
            <Select.Root
              multiple
              collection={equipmentsList}
              size="sm"
              width="320px"
              bg="white"
              onValueChange={(details) => formik.setFieldValue("equipments", details.value)}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select framework" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {equipmentsList.items.map((equipment) => (
                      <Select.Item item={equipment} key={equipment.value}>
                        {equipment.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
            <Field.ErrorText>{formik.errors.equipments}</Field.ErrorText>
          </Field.Root>

          <Button
            colorScheme="blue"
            size="md"
            type="submit"
          >
            Ajouter l'hôtel
          </Button>

        </VStack>
      </form>
    </Container>
  );
};

export default AddHotel;