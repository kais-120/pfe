import { Box, Button, ButtonGroup, Field, FileUpload, Input, Steps, Text, Flex, VStack, Grid, Badge } from "@chakra-ui/react"
import { useFormik } from "formik"
import { useState } from "react"
import { LuFileImage, LuUpload, LuCheck, LuChevronLeft, LuChevronRight, LuCreditCard, LuBuilding2, LuBanknote, LuShieldCheck } from "react-icons/lu"
import * as Yup from 'yup'
import { AxiosToken } from "../../Api/Api"
import { useNavigate } from "react-router-dom"

const FILE_SIZE = 5 * 1024 * 1024
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"]

const fileTests = (label) =>
  Yup.mixed()
    .required(`${label} est requise`)
    .test("fileSize", "Taille max 5MB", v => v && v.size <= FILE_SIZE)
    .test("fileFormat", "Format invalide (PNG, JPG, JPEG)", v => v && SUPPORTED_FORMATS.includes(v.type))

const step1Schema = Yup.object({
  cin: Yup.string().required("Le numéro CIN est requis").matches(/^[0-9]{8}$/, "Le CIN doit contenir 8 chiffres"),
  cinRecto: fileTests("Photo recto du CIN"),
  cinVerso: fileTests("Photo verso du CIN"),
})

const step2Schema = Yup.object({
  matriculeFiscale: Yup.string().required("Le matricule fiscal est requis")
    .matches(/^\d{7}[A-Z]\/[A,B,P,N]\/[M,P,C,E,N]\/\d{3}$/, "Format invalide"),
  matriculeFiscaleImage: fileTests("Photo du matricule fiscal"),
  registreCommerceImage: fileTests("Photo du registre de commerce"),
})

const step3Schema = Yup.object({
  rip: Yup.string().required("Le RIP est requis").matches(/^[0-9]{20}$/, "Le RIP doit contenir 20 chiffres"),
  autorisationONTTImage: fileTests("Photo de l'autorisation ONTT"),
})

const STEPS = [
  { label: "Identité", icon: LuCreditCard, desc: "CIN recto & verso" },
  { label: "Entreprise", icon: LuBuilding2, desc: "Matricule & registre commerce" },
  { label: "Bancaire", icon: LuBanknote, desc: "RIP & autorisation ONTT" },
]

/* ── Styled text input ──────────────────────────────────────────── */
function StyledInput({ formik, name, label, placeholder, icon: Icon,isError,errorMessage }) {
  const isInvalid = !!formik.errors[name]
  return (
    <Field.Root invalid={isInvalid || isError} w="full">
      <Field.Label>
        <Text fontSize="xs" fontWeight={700} color="gray.600"
          textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
      </Field.Label>
      <Flex
        w="full" align="center"
        border="1.5px solid"
        borderColor={(isInvalid || isError) ? "red.400" : "gray.200"}
        borderRadius="xl" bg="white" px={3}
        transition="all 0.15s"
        _focusWithin={{
          borderColor: (isInvalid || isError) ? "red.400" : "blue.400",
          boxShadow: (isInvalid || isError)
            ? "0 0 0 3px rgba(245,101,101,0.12)"
            : "0 0 0 3px rgba(49,130,206,0.12)",
        }}
      >
        {Icon && <Box color="gray.400" mr={2} flexShrink={0}><Icon size={14} /></Box>}
        <Input
        outline={"none"}
          name={name} value={formik.values[name]}
          onChange={formik.handleChange} onBlur={formik.handleBlur}
          placeholder={placeholder}
          border="none" bg="transparent" px={0} h="42px" flex={1}
          fontSize="sm" color="gray.800"
          _focus={{ boxShadow: "none" }}
          _placeholder={{ color: "gray.300" }}
        />
      </Flex>
      {isInvalid ? (
        <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
          {formik.errors[name]}
        </Field.ErrorText>
      ) : isError && (
        <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
          {errorMessage}
        </Field.ErrorText>
      )
    }
    </Field.Root>
  )
}

function FileField({ formik, name, label, hint }) {
  const isInvalid = !!formik.errors[name]
  const hasFile = !!formik.values[name]

  return (
    <Field.Root invalid={isInvalid} w="full">
      <Field.Label>
        <Text fontSize="xs" fontWeight={700} color="gray.600"
          textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
      </Field.Label>
      {hint && <Text fontSize="xs" color="gray.400" mt={-1} mb={1}>{hint}</Text>}

      <FileUpload.Root
        accept="image/*" maxFiles={1}
        onFileAccept={(details) => formik.setFieldValue(name, details.files[0])}
        w="full"
      >
        <FileUpload.HiddenInput />
        <FileUpload.Dropzone
          w="full"
          border="2px dashed"
          borderColor={isInvalid ? "red.300" : hasFile ? "green.300" : "gray.200"}
          borderRadius="xl"
          bg={isInvalid ? "red.50" : hasFile ? "green.50" : "gray.50"}
          py={5}
          cursor="pointer"
          transition="all 0.15s"
          _hover={{ borderColor: "blue.300", bg: "blue.50" }}
        >
          <Flex direction="column" align="center" gap={2}>
            <Flex
              w="40px" h="40px" borderRadius="xl"
              bg={hasFile ? "green.100" : "white"}
              color={hasFile ? "green.500" : "gray.400"}
              align="center" justify="center"
              boxShadow="0 1px 6px rgba(0,0,0,0.08)"
            >
              {hasFile ? <LuCheck size={16} /> : <LuUpload size={16} />}
            </Flex>
            <FileUpload.DropzoneContent>
              <Text fontSize="sm" fontWeight={600}
                color={hasFile ? "green.600" : "gray.600"}>
                {hasFile ? formik.values[name]?.name?.substring(0,20) : "Glissez ou cliquez pour uploader"}
              </Text>
              {!hasFile && (
                <Text fontSize="xs" color="gray.400">PNG, JPG — max 5 MB</Text>
              )}
            </FileUpload.DropzoneContent>
          </Flex>
        </FileUpload.Dropzone>
      </FileUpload.Root>

      {isInvalid && (
        <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
          {formik.errors[name]}
        </Field.ErrorText>
      )}
    </Field.Root>
  )
}

/* ── Main component ─────────────────────────────────────────────── */
const Hotel = () => {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [cinError, setCinError] = useState(false)
  const [cinErrorMessage, setCinErrorMessage] = useState("")
  const [matriculeFiscaleError, setMatriculeFiscale] = useState(false)
  const [matriculeFiscaleErrorMessage, setMatriculeFiscaleErrorMessage] = useState("")
  const [ripError, setRipError] = useState(false)
  const [ripErrorMessage, setRipErrorMessage] = useState("")
  const navigate = useNavigate()

  const getStepSchema = (s = step) => {
    if (s === 0) return step1Schema
    if (s === 1) return step2Schema
    if (s === 2) return step3Schema
  }

  const formik = useFormik({
    initialValues: {
      cin: "", cinRecto: null, cinVerso: null,
      matriculeFiscale: "", matriculeFiscaleImage: null, registreCommerceImage: null,
      rip: "", autorisationONTTImage: null,
    },
    validationSchema: getStepSchema(),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      setRipError(false),
      setRipErrorMessage("")
      setLoading(true)
      try {
        const formData = new FormData()
        formData.append("partner_doc", values.cinRecto)
        formData.append("partner_doc", values.cinVerso)
        formData.append("partner_doc", values.matriculeFiscaleImage)
        formData.append("partner_doc", values.registreCommerceImage)
        formData.append("partner_doc", values.autorisationONTTImage)
        formData.append("cin", values.cin)
        formData.append("rip", values.rip)
        formData.append("matricule_fiscale", values.matriculeFiscale)
        await AxiosToken.post("/user/update/files", formData)
        setStep(3)
      } catch(err) {
        if(err.status === 422){
          setRipError(true),
          setRipErrorMessage("rip déjà utilisé")
        }
        console.error("Upload failed")
      } finally {
        setLoading(false)
      }
    }
  })

  const validateAndNext = async () => {
    setCinError(false);
    setCinErrorMessage("");
    setMatriculeFiscale(false);
    setMatriculeFiscaleErrorMessage("");
    setRipError(false);
    setRipErrorMessage("");
    const schema = getStepSchema()
    try {
      await schema.validate(formik.values, { abortEarly: false })
      formik.setErrors({})

      await AxiosToken.post("/user/validate-step",{step,matricule_fiscale:formik.values.matriculeFiscale,rip:formik.values.rip,cin:formik.values.cin});

      setStep(s => s + 1)
    } catch (err) {
     if (err.response && err.response.data) {
    const errors = err.response.data.errors || {}

    if (errors.cin) {
      setCinError(true)
      setCinErrorMessage(errors.cin)
    }

    if (errors.matricule_fiscale) {
      setMatriculeFiscale(true)
      setMatriculeFiscaleErrorMessage(errors.matricule_fiscale)
    }

    if (errors.rip) {
      setRipError(true)
      setRipErrorMessage(errors.rip)
    }
      }else{
      const errors = {}
      err.inner.forEach(e => { errors[e.path] = e.message })
      formik.setErrors(errors)
      }
    }
  }

  const progress = step >= 3 ? 100 : Math.round((step / 3) * 100)

  /* ── Completed state ── */
  if (step === 3) {
    return (
      <Flex direction="column" align="center" justify="center" minH="60vh" px={4}>
        <Box
          bg="white" borderRadius="2xl" p={10} textAlign="center"
          border="1px solid" borderColor="gray.100"
          boxShadow="0 4px 24px rgba(0,0,0,0.08)"
          maxW="440px" w="full"
        >
          <Flex
            w="72px" h="72px" borderRadius="full"
            bg="green.100" color="green.500"
            align="center" justify="center" mx="auto" mb={5}
          >
            <LuShieldCheck size={32} />
          </Flex>
          <Text fontSize="2xl" fontWeight={900} color="gray.900" mb={2}>
            Dossier envoyé !
          </Text>
          <Text color="gray.500" fontSize="sm" lineHeight="1.7" mb={7}>
            Votre dossier a bien été reçu. Notre équipe va vérifier vos documents
            sous 24–48h. Vous recevrez un email de confirmation après validation.
          </Text>
          <Button
            colorScheme="blue" borderRadius="xl" px={8} fontWeight={700} w="full"
            onClick={() => navigate("/")}
          >
            Retour à l'accueil
          </Button>
        </Box>
      </Flex>
    )
  }

  return (
    <Flex justify="center" px={4} py={8}>
      <Box w="full" maxW="560px">

        {/* Header */}
        <Box mb={8}>
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={1}>
            Vérification partenaire
          </Text>
          <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
            Complétez votre dossier
          </Text>
          <Text fontSize="sm" color="gray.400" mt={1}>
            3 étapes pour valider votre compte partenaire
          </Text>
        </Box>

        {/* Step indicators */}
        <Flex gap={3} mb={8}>
          {STEPS.map((s, i) => {
            const done = i < step
            const current = i === step
            const Icon = s.icon
            return (
              <Box
                key={i} flex={1}
                bg={done ? "blue.600" : current ? "white" : "gray.50"}
                border="1.5px solid"
                borderColor={done ? "blue.600" : current ? "blue.400" : "gray.200"}
                borderRadius="xl" p={3}
                transition="all 0.2s"
                boxShadow={current ? "0 0 0 3px rgba(49,130,206,0.15)" : "none"}
              >
                <Flex align="center" gap={2} mb={1}>
                  <Box color={done ? "white" : current ? "blue.500" : "gray.400"}>
                    {done ? <LuCheck size={13} /> : <Icon size={13} />}
                  </Box>
                  <Text
                    fontSize="xs" fontWeight={700}
                    color={done ? "white" : current ? "blue.600" : "gray.400"}
                  >
                    {i + 1}. {s.label}
                  </Text>
                </Flex>
                <Text
                  fontSize="9px"
                  color={done ? "blue.100" : current ? "gray.400" : "gray.300"}
                  lineHeight={1.3}
                >
                  {s.desc}
                </Text>
              </Box>
            )
          })}
        </Flex>

        {/* Progress bar */}
        <Box bg="gray.100" borderRadius="full" h="4px" mb={8} overflow="hidden">
          <Box
            bg="blue.500" h="100%" borderRadius="full"
            w={`${progress}%`} transition="width 0.4s"
          />
        </Box>

        <form onSubmit={formik.handleSubmit}>
          {/* ── Step 1: CIN ── */}
          {step === 0 && (
            <Box
              bg="white" borderRadius="2xl" p={6}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 8px rgba(0,0,0,0.05)"
            >
              <Flex align="center" gap={2} mb={6}>
                <Flex w="30px" h="30px" borderRadius="lg" bg="blue.50" color="blue.500" align="center" justify="center">
                  <LuCreditCard size={14} />
                </Flex>
                <Text fontSize="sm" fontWeight={700} color="gray.700">
                  Carte d'identité nationale
                </Text>
              </Flex>

              <VStack gap={5} align="stretch">
                <StyledInput
                  formik={formik} name="cin" label="Numéro CIN"
                  placeholder="Ex: 12345678" icon={LuCreditCard}
                  isError={cinError} errorMessage={cinErrorMessage}
                />
                <Text fontSize="xs" color="gray.400" bg="blue.50" borderRadius="lg" px={3} py={2}>
                  Uploadez une photo nette du recto et du verso de votre CIN.
                </Text>
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <FileField formik={formik} name="cinRecto" label="CIN Recto" />
                  <FileField formik={formik} name="cinVerso" label="CIN Verso" />
                </Grid>
              </VStack>
            </Box>
          )}

          {/* ── Step 2: Entreprise ── */}
          {step === 1 && (
            <Box
              bg="white" borderRadius="2xl" p={6}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 8px rgba(0,0,0,0.05)"
            >
              <Flex align="center" gap={2} mb={6}>
                <Flex w="30px" h="30px" borderRadius="lg" bg="purple.50"
                  color="purple.500" align="center" justify="center">
                  <LuBuilding2 size={14} />
                </Flex>
                <Text fontSize="sm" fontWeight={700} color="gray.700">
                  Documents d'entreprise
                </Text>
              </Flex>

              <VStack gap={5} align="stretch">
                <StyledInput
                  formik={formik} name="matriculeFiscale" label="Matricule fiscal"
                  placeholder="Ex: 1234567A/A/M/000" icon={LuBuilding2}
                  isError={matriculeFiscaleError} errorMessage={matriculeFiscaleErrorMessage}
                />
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <FileField
                    formik={formik} name="matriculeFiscaleImage"
                    label="Matricule fiscal"
                  />
                  <FileField
                    formik={formik} name="registreCommerceImage"
                    label="Registre de commerce"
                  />
                </Grid>
              </VStack>
            </Box>
          )}

          {/* ── Step 3: Bancaire ── */}
          {step === 2 && (
            <Box
              bg="white" borderRadius="2xl" p={6}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 8px rgba(0,0,0,0.05)"
            >
              <Flex align="center" gap={2} mb={6}>
                <Flex w="30px" h="30px" borderRadius="lg" bg="green.50"
                  color="green.500" align="center" justify="center">
                  <LuBanknote size={14} />
                </Flex>
                <Text fontSize="sm" fontWeight={700} color="gray.700">
                  Informations bancaires & autorisation
                </Text>
              </Flex>

              <VStack gap={5} align="stretch">
                <StyledInput
                  formik={formik} name="rip" label="RIP bancaire (20 chiffres)"
                  placeholder="Ex: 01234567890123456789" icon={LuBanknote}
                  isError={ripError} errorMessage={ripErrorMessage}
                />
                <FileField
                  formik={formik} name="autorisationONTTImage"
                  label="Autorisation ONTT"
                  hint="Document officiel d'autorisation d'exploitation touristique"
                />
              </VStack>
            </Box>
          )}

          {/* ── Navigation buttons ── */}
          <Flex justify="space-between" align="center" mt={5} gap={3}>
            <Button
              variant="outline" borderRadius="xl" px={5}
              color="gray.500" borderColor="gray.200"
              isDisabled={step <= 0}
              onClick={() => step >= 1 && setStep(s => s - 1)}
              type="button"
            >
              <Flex align="center" gap={1.5}>
                <LuChevronLeft size={14} />
                Précédent
              </Flex>
            </Button>

            <Flex align="center" gap={2}>
              <Text fontSize="xs" color="gray.400">
                Étape {step + 1} / 3
              </Text>
              {step < 2 ? (
                <Button
                  colorScheme="blue" borderRadius="xl" px={6}
                  fontWeight={700} onClick={validateAndNext}
                  type="button"
                >
                  <Flex align="center" gap={1.5}>
                    Suivant
                    <LuChevronRight size={14} />
                  </Flex>
                </Button>
              ) : (
                <Button
                  type="submit" colorScheme="blue"
                  borderRadius="xl" px={6} fontWeight={700}
                  loading={loading} loadingText="Envoi…"
                >
                  <Flex align="center" gap={1.5}>
                    <LuCheck size={14} />
                    Envoyer le dossier
                  </Flex>
                </Button>
              )}
            </Flex>
          </Flex>

        </form>
      </Box>
    </Flex>
  )
}

export default Hotel