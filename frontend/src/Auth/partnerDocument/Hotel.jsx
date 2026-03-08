import { Box, Button, ButtonGroup, Field, FileUpload, Input, Steps, Text } from "@chakra-ui/react"
import { useFormik } from "formik"
import { useState } from "react"
import { LuFileImage } from "react-icons/lu"
import * as Yup from 'yup'
import { AxiosToken } from "../../Api/Api"
import { useNavigate } from "react-router-dom"
import { Check } from "lucide-react"

const FILE_SIZE = 5 * 1024 * 1024 // 5MB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"]

const step1Schema = Yup.object({
  cin: Yup.string()
    .required("Le numéro CIN est requis")
    .matches(/^[0-9]{8}$/, "Le CIN doit contenir 8 chiffres"),

  cinRecto: Yup.mixed().required("Image du recto du CIN requise")
  .test(
      "fileSize",
      "La taille du fichier est trop grande (max 5MB)",
      value => value && value.size <= FILE_SIZE
    ).test(
      "fileFormat",
      "Format de fichier non supporté (PNG, JPG, JPEG)",
      value => value && SUPPORTED_FORMATS.includes(value.type)
    ),

  cinVerso: Yup.mixed().required("Image du verco du CIN requise")
  .test(
      "fileSize",
      "La taille du fichier est trop grande (max 5MB)",
      value => value && value.size <= FILE_SIZE
    ).test(
      "fileFormat",
      "Format de fichier non supporté (PNG, JPG, JPEG)",
      value => value && SUPPORTED_FORMATS.includes(value.type)
    ),
})
const step2Schema = Yup.object({
  matriculeFiscale: Yup.string().required("Le matricule fiscale est requis").matches(/^\d{7}[A-Z]\/[A,B,P,N]\/[M,P,C,E,N]\/\d{3}$/,"Format du matricule fiscal invalide"),

  matriculeFiscaleImage: Yup.mixed().required("Image du matricule fiscale est requis")
  .test(
      "fileSize",
      "La taille du fichier est trop grande (max 5MB)",
      value => value && value.size <= FILE_SIZE
    )
    .test(
      "fileFormat",
      "Format de fichier non supporté (PNG, JPG, JPEG)",
      value => value && SUPPORTED_FORMATS.includes(value.type)
    ),

  registreCommerceImage: Yup.mixed().required("Image du registre commerce est requis")
  .test(
      "fileSize",
      "La taille du fichier est trop grande (max 5MB)",
      value => value && value.size <= FILE_SIZE
    )
    .test(
      "fileFormat",
      "Format de fichier non supporté (PNG, JPG, JPEG)",
      value => value && SUPPORTED_FORMATS.includes(value.type)
    ),
})

const step3Schema = Yup.object({
  rip: Yup.string().required("le rip est requis").matches(/^[0-9]{20}$/, "Le rip doit contenir 20 chiffres"),

  autorisationONTTImage: Yup.mixed().required("Image du autorisation ONTT est requis")
  .test(
      "fileSize",
      "La taille du fichier est trop grande (max 5MB)",
      value => value && value.size <= FILE_SIZE
    )
    .test(
      "fileFormat",
      "Format de fichier non supporté (PNG, JPG, JPEG)",
      value => value && SUPPORTED_FORMATS.includes(value.type)
    ),
})

const Hotel = () => {
  const [step, setStep] = useState(0);
  const [loading,setLoading] = useState(false);
  const navigate = useNavigate();

  const getStepSchema = () => {
  if(step === 0) return step1Schema
  if(step === 1) return step2Schema
  if(step === 2) return step3Schema
}

  const formik = useFormik({
  initialValues:{
  cin:"",
  cinRecto:null,
  cinVerso:null,
  matriculeFiscale:"",
  matriculeFiscaleImage:null,
  registreCommerceImage:null,
  rip:"",
  autorisationONTTImage:null

  },
validationSchema: getStepSchema(),
validateOnChange:false,
  validateOnBlur:false,
  onSubmit: async (values) => {
    setLoading(true);
    try{
    const formData = new FormData();
    formData.append("partner_doc",values.cinRecto);
    formData.append("partner_doc",values.cinVerso);
    formData.append("partner_doc",values.matriculeFiscaleImage);
    formData.append("partner_doc",values.registreCommerceImage);
    formData.append("partner_doc",values.autorisationONTTImage);
    formData.append("cin",values.cin);
    formData.append("rip",values.rip);
    formData.append("matricule_fiscale",values.matriculeFiscale);
    await AxiosToken.post("/user/update/files",formData);
    setLoading(false)
    setStep(prev => prev + 1)
    }catch{
      setLoading(false)
    }
  }
})
const handleStepChange = async (details) => {

  const nextStep = details.step

  if(nextStep < step){
    setStep(nextStep)
    return
  }

  const schema = getStepSchema()

  try{

    await schema.validate(formik.values,{abortEarly:false})

    setStep(nextStep)

  }catch(err){

    const errors = {}

    err.inner.forEach(e=>{
      errors[e.path] = e.message
    })

    formik.setErrors(errors)

  }
}
  return (
    <Box width={"50%"}>
      <form onSubmit={formik.handleSubmit}>
      <Steps.Root defaultStep={0} count={3}
      step={step}
      onStepChange={handleStepChange}
      >
        <Steps.List>
          <Steps.Item key={0} index={0} title="étape 1">
            <Steps.Indicator />
            <Steps.Title>étape 2</Steps.Title>
          </Steps.Item>
          <Steps.Item key={1} index={1} title="étape 2">
            <Steps.Indicator />
            <Steps.Title>étape 2</Steps.Title>
          </Steps.Item>
          <Steps.Item key={2} index={2} title="étape 3">
            <Steps.Indicator />
            <Steps.Title>étape 3</Steps.Title>
          </Steps.Item>
        </Steps.List>

        <Steps.Content key={0} index={0}>
          <Box>
          <Field.Root invalid={formik.errors.cin}>
            <Field.Label>Cin</Field.Label>
            <Input name="cin" value={formik.values.cin} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Cin" />
            <Field.ErrorText>{formik.errors.cin}</Field.ErrorText>
          </Field.Root>
          </Box>
          <Box marginTop={5}>
            <Text marginBottom={3}>Veuillez uploader les photos du recto et du verso de votre carte d'identité.</Text>
          <Field.Root invalid={formik.errors.cinRecto}>
            <Field.Label>Cin recto</Field.Label>
            <FileUpload.Root accept={"image/*"} maxW="xl" alignItems="stretch" maxFiles={1}
             onFileAccept={(details)=>{
              formik.setFieldValue("cinRecto", details.files[0])
            }}
            >
            <FileUpload.HiddenInput />
          <FileUpload.Trigger asChild>
            <Button className={`${formik.errors.cinRecto ? "!border-red-500" : undefined}`} variant="outline" size="sm">
              <LuFileImage /> Upload Images
            </Button>
          </FileUpload.Trigger>
          <FileUpload.List showSize clearable />
          </FileUpload.Root>
            <Field.ErrorText>{formik.errors.cinRecto}</Field.ErrorText>
          </Field.Root>
          <Box marginTop={5}>
          <Field.Root invalid={formik.errors.cinVerso}>
            <Field.Label>Cin verso</Field.Label>
            <FileUpload.Root accept={"image/*"} maxW="xl" alignItems="stretch" maxFiles={1}
            onFileAccept={(details)=>{
              formik.setFieldValue("cinVerso", details.files[0])
            }}
            >
            <FileUpload.HiddenInput />
          <FileUpload.Trigger asChild>
            <Button className={`${formik.errors.cinVerso ? "!border-red-500" : undefined}`} variant="outline" size="sm">
              <LuFileImage /> Upload Images
            </Button>
          </FileUpload.Trigger>
          <FileUpload.List showSize clearable />
          </FileUpload.Root>
            <Field.ErrorText>{formik.errors.cinVerso}</Field.ErrorText>
          </Field.Root>
          </Box>
          </Box>
          
        </Steps.Content>

        <Steps.Content key={1} index={1}>
             <Box>
          <Field.Root invalid={formik.errors.matriculeFiscale}>
            <Field.Label>matricule fiscale</Field.Label>
            <Input name="matriculeFiscale" value={formik.values.matriculeFiscale} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="matricule fiscale" />
            <Field.ErrorText>{formik.errors.matriculeFiscale}</Field.ErrorText>
          </Field.Root>
          </Box>
             <Box marginTop={5}>
          <Field.Root invalid={formik.errors.matriculeFiscaleImage}>
            <Field.Label>matricule fiscale image.</Field.Label>
             <FileUpload.Root accept={"image/*"} maxW="xl" alignItems="stretch" maxFiles={1}
             onFileAccept={(details)=>{
              formik.setFieldValue("matriculeFiscaleImage", details.files[0])
            }}
             >
            <FileUpload.HiddenInput />
          <FileUpload.Trigger asChild>
            <Button className={`${formik.errors.matriculeFiscaleImage ? "!border-red-500" : undefined}`} variant="outline" size="sm">
              <LuFileImage /> Upload Images
            </Button>
          </FileUpload.Trigger>
          <FileUpload.List showSize clearable />
          </FileUpload.Root>
          <Field.ErrorText>{formik.errors.matriculeFiscaleImage}</Field.ErrorText>
          </Field.Root>
          </Box>

             <Box marginTop={5}>
          <Field.Root invalid={formik.errors.registreCommerceImage}>
            <Field.Label>register commerce image</Field.Label>
             <FileUpload.Root accept={"image/*"} maxW="xl" alignItems="stretch" maxFiles={1}
             onFileAccept={(details)=>{
              formik.setFieldValue("registreCommerceImage", details.files[0])
            }}
             >
            <FileUpload.HiddenInput />
          <FileUpload.Trigger asChild>
            <Button className={`${formik.errors.registreCommerceImage ? "!border-red-500" : undefined}`} variant="outline" size="sm">
              <LuFileImage /> Upload Images
            </Button>
          </FileUpload.Trigger>
          <FileUpload.List showSize clearable />
          </FileUpload.Root>
          <Field.ErrorText>{formik.errors.registreCommerceImage}</Field.ErrorText>
          </Field.Root>
          </Box>
        </Steps.Content>

        <Steps.Content key={2} index={2}>
             <Box>
          <Field.Root invalid={formik.errors.rip}>
            <Field.Label>Rip</Field.Label>
            <Input name="rip" value={formik.values.rip} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Rip" />
            <Field.ErrorText></Field.ErrorText>
            <Field.ErrorText>{formik.errors.rip}</Field.ErrorText>
          </Field.Root>
          </Box>
             <Box marginTop={5}>
          <Field.Root invalid={formik.errors.autorisationONTTImage}>
            <Field.Label>autorisation ONTT image</Field.Label>
            <FileUpload.Root accept={"image/*"} maxW="xl" alignItems="stretch" maxFiles={1}
            onFileAccept={(details)=>{
              formik.setFieldValue("autorisationONTTImage", details.files[0])
            }}
            >
            <FileUpload.HiddenInput />
          <FileUpload.Trigger asChild>
            <Button className={`${formik.errors.autorisationONTTImage ? "!border-red-500" : undefined}`} variant="outline" size="sm">
              <LuFileImage /> Upload Images
            </Button>
          </FileUpload.Trigger>
          <FileUpload.List showSize clearable />
          </FileUpload.Root>
          <Field.ErrorText>{formik.errors.autorisationONTTImage}</Field.ErrorText>
          </Field.Root>
          </Box>

        </Steps.Content>


        <Steps.CompletedContent>

             <Box 
    textAlign="center" 
    py={10} 
    px={6} 
    borderWidth="1px" 
    borderRadius="lg" 
    bg="green.50"
  >
    
    <Box
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w="70px"
      h="70px"
      borderRadius="full"
      bg="green.100"
      mb={4}
    >
      <Check />
    </Box>

    <Text fontSize="2xl" fontWeight="bold" mb={2}>
      Demande envoyée avec succès
    </Text>

    <Text color="gray.600" mb={6}>
      Votre dossier a été envoyé. Notre équipe va vérifier vos documents.
      Vous recevrez une email après validation.
    </Text>

    <Button onClick={()=>navigate("/")} colorScheme="green">
      Retour au page de accueil
    </Button>

  </Box>

        </Steps.CompletedContent>
          {step <= 2 && 
        <ButtonGroup size="sm" variant="outline">
        <Steps.PrevTrigger asChild>
          <Button>Précédent</Button>
        </Steps.PrevTrigger>
        {step === 2 ? 
        <Button type="submit">Envoyée </Button> 
        : 
        <Steps.NextTrigger asChild>
          <Button>Suivant</Button>
        </Steps.NextTrigger>
        }
      </ButtonGroup>
}

      </Steps.Root>
    </form>
    </Box>
  )
}

export default Hotel