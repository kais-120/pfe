import {
  Box, Button, Input, Text, Flex, Grid,
  VStack, Field, Dialog, Portal, CloseButton,
  Tabs, Avatar,
} from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AxiosToken } from "../Api/Api"
import { toaster } from "../components/ui/toaster"
import {
  LuUser, LuMail, LuPhone, LuLock,
  LuCheck, LuEye, LuEyeOff,
  LuPencil, LuShieldCheck, LuSettings,
  LuChevronLeft,
} from "react-icons/lu"
import { useFormik } from "formik"
import * as yup from "yup"
import { LucideAlertCircle } from "lucide-react"
import LoadingScreen from "../components/LoadingScreen"
import { Helmet } from "react-helmet"

function FormField({ label, required, icon: Icon, hint, isInvalid, error, children }) {
  return (
    <Box w="full">
      <Flex align="center" gap={1} mb={1.5}>
        <Text fontSize="xs" fontWeight={700} color="gray.600"
          textTransform="uppercase" letterSpacing="wider">{label}</Text>
        {required && <Text color="red.400" fontSize="xs">*</Text>}
      </Flex>
      {hint && <Text fontSize="xs" color="gray.400" mt={-1} mb={1}>{hint}</Text>}
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
        {Icon && (
          <Box color={isInvalid ? "red.400" : "gray.400"} mr={2} flexShrink={0}>
            <Icon size={14} />
          </Box>
        )}
        {children}
      </Flex>
      {isInvalid && error && (
        <Text fontSize="xs" color="red.500" mt={1}>{error}</Text>
      )}
    </Box>
  )
}

function StyledInput({ value, onChange, onBlur, name, type = "text", placeholder,
  suffix, disabled, isInvalid }) {
  return (
    <Input
    outline={"none"}
      name={name} type={type} value={value}
      onChange={onChange} onBlur={onBlur}
      placeholder={placeholder} disabled={disabled}
      border="none" bg="transparent" px={0} h="42px" flex={1}
      fontSize="sm" color={disabled ? "gray.400" : "gray.800"}
      _focus={{ boxShadow: "none" }}
      _placeholder={{ color: "gray.300" }}
    />
  )
}

function SectionCard({ title, icon: Icon, iconColor = "blue", children }) {
  return (
    <Box bg="white" borderRadius="2xl"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)" overflow="hidden">
      <Flex px={6} py={4} borderBottom="1px solid" borderColor="gray.100"
        bg="gray.50" align="center" gap={2.5}>
        <Flex w="28px" h="28px" borderRadius="lg"
          bg={`${iconColor}.50`} color={`${iconColor}.500`}
          align="center" justify="center" flexShrink={0}>
          <Icon size={14} />
        </Flex>
        <Text fontSize="sm" fontWeight={700} color="gray.700">{title}</Text>
      </Flex>
      <Box px={6} py={5}>{children}</Box>
    </Box>
  )
}

/* ════════════════════════════════════════════════════════════════
   Password strength
═══════════════════════════════════════════════════════════════════ */
function getStrength(pw) {
  let s = 0
  if (pw.length >= 8)              s++
  if (pw.length >= 12)             s++
  if (/[A-Z]/.test(pw))            s++
  if (/[0-9]/.test(pw))            s++
  if (/[^A-Za-z0-9]/.test(pw))    s++
  if (s <= 1) return { level: 1, label: "Très faible",  color: "red.400"    }
  if (s === 2) return { level: 2, label: "Faible",       color: "orange.400" }
  if (s === 3) return { level: 3, label: "Moyen",        color: "yellow.500" }
  if (s === 4) return { level: 4, label: "Fort",         color: "green.400"  }
  return               { level: 5, label: "Très fort",   color: "green.600"  }
}

function PasswordInput({ formik, name, label, placeholder }) {
  const [show, setShow] = useState(false)
  const isInvalid = formik.touched[name] && !!formik.errors[name]
  return (
    <FormField label={label} icon={LuLock} isInvalid={isInvalid} error={formik.errors[name]}>
      <Input
      outline={"none"}
        name={name} type={show ? "text" : "password"}
        value={formik.values[name]}
        onChange={formik.handleChange} onBlur={formik.handleBlur}
        placeholder={placeholder}
        border="none" bg="transparent" px={0} h="42px" flex={1}
        fontSize="sm" color="gray.800"
        _focus={{ boxShadow: "none" }} _placeholder={{ color: "gray.300" }} />
      <Box as="button" type="button" color="gray.400" ml={2} flexShrink={0}
        cursor="pointer" transition="color 0.15s" _hover={{ color: "gray.600" }}
        onClick={() => setShow(s => !s)}>
        {show ? <LuEyeOff size={15} /> : <LuEye size={15} />}
      </Box>
    </FormField>
  )
}

/* ════════════════════════════════════════════════════════════════
   Email Change Dialog — OTP verification
═══════════════════════════════════════════════════════════════════ */
const OTP_LEN     = 6
const RESEND_WAIT = 60

function EmailOtpDialog({ open, onClose, newEmail, onConfirmed }) {
  const [otp,       setOtp]       = useState(Array(OTP_LEN).fill(""))
  const [error,     setError]     = useState("")
  const [loading,   setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_WAIT)
  const [canResend, setCanResend] = useState(false)
  const refs = useRef([])

  /* Reset state when dialog opens */
  useEffect(() => {
    if (!open) return
    setOtp(Array(OTP_LEN).fill(""))
    setError("")
    setCanResend(false)
    setCountdown(RESEND_WAIT)
    setTimeout(() => refs.current[0]?.focus(), 100)
  }, [open])

  /* Countdown */
  useEffect(() => {
    if (!open || canResend) return
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); setCanResend(true); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [open, canResend])

  const handleChange = (idx, val) => {
    const d    = val.replace(/\D/g, "").slice(-1)
    const next = [...otp]; next[idx] = d; setOtp(next); setError("")
    if (d && idx < OTP_LEN - 1) refs.current[idx + 1]?.focus()
    if (d && idx === OTP_LEN - 1 && next.every(x => x)) submit(next.join(""))
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      const next = [...otp]
      if (next[idx]) { next[idx] = ""; setOtp(next) }
      else if (idx > 0) { refs.current[idx - 1]?.focus(); next[idx - 1] = ""; setOtp(next) }
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const p    = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN)
    const next = Array(OTP_LEN).fill("")
    p.split("").forEach((d, i) => { next[i] = d })
    setOtp(next)
    refs.current[Math.min(p.length, OTP_LEN - 1)]?.focus()
    if (p.length === OTP_LEN) submit(p)
  }

  const submit = async (code = otp.join("")) => {
    if (code.length < OTP_LEN) { setError("Entrez les 6 chiffres."); return }
    try {
      setLoading(true)
      await AxiosToken.put("/user/setting/email", { email: newEmail, code })
      toaster.create({ description: "Email mis à jour avec succès.", type: "success", closable: true })
      onConfirmed(newEmail)
      onClose()
    } catch {
      setError("Code incorrect ou expiré. Réessayez.")
      setOtp(Array(OTP_LEN).fill(""))
      refs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  const resend = async () => {
    try {
      setResending(true)
      await AxiosToken.post("/user/send-email-otp", { newEmail })
      setCanResend(false); setCountdown(RESEND_WAIT)
      setOtp(Array(OTP_LEN).fill(""))
      refs.current[0]?.focus()
    } catch { setError("Impossible de renvoyer.") }
    finally { setResending(false) }
  }

  const filled = otp.filter(d => d).length

  return (
    <Dialog.Root open={open} onOpenChange={e => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="2xl" overflow="hidden" maxW="420px">

            {/* Header */}
            <Box bg="blue.50" px={6} py={5}
              borderBottom="1px solid" borderColor="blue.100">
              <Flex align="center" gap={3}>
                <Flex w="36px" h="36px" borderRadius="xl"
                  bg="blue.100" color="blue.500"
                  align="center" justify="center" flexShrink={0}>
                  <LuMail size={16} />
                </Flex>
                <Box>
                  <Dialog.Title fontSize="md" fontWeight={700} color="gray.900">
                    Vérification de l'email
                  </Dialog.Title>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    Code envoyé à{" "}
                    <Text as="span" fontWeight={600} color="blue.600">{newEmail}</Text>
                  </Text>
                </Box>
              </Flex>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} />
              </Dialog.CloseTrigger>
            </Box>

            <Dialog.Body px={6} py={5}>

              {error && (
                <Flex align="center" gap={2} bg="red.50" border="1px solid"
                  borderColor="red.200" borderRadius="xl" px={3} py={2.5} mb={4}>
                  <Box color="red.500"><LucideAlertCircle size={14} /></Box>
                  <Text fontSize="sm" color="red.600">{error}</Text>
                </Flex>
              )}

              <Text fontSize="sm" color="gray.500" mb={5} lineHeight="1.6">
                Entrez le code à 6 chiffres pour confirmer le changement d'email.
              </Text>

              {/* OTP boxes */}
              <Flex gap={2} justify="center" mb={3} onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <Box key={idx}
                    as="input" ref={el => { refs.current[idx] = el }}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    w="48px" h="56px" textAlign="center"
                    fontSize="xl" fontWeight={800} color="gray.900"
                    border="2px solid"
                    borderColor={error ? "red.300" : digit ? "blue.400" : "gray.200"}
                    borderRadius="xl"
                    bg={digit ? "blue.50" : "gray.50"}
                    outline="none" transition="all 0.15s" cursor="text"
                    _focus={{
                      borderColor: error ? "red.400" : "blue.500",
                      bg: "white",
                      boxShadow: error
                        ? "0 0 0 3px rgba(245,101,101,0.12)"
                        : "0 0 0 3px rgba(49,130,206,0.12)",
                    }}
                    style={{ caretColor: "transparent" }}
                  />
                ))}
              </Flex>

              {/* Progress dots */}
              <Flex justify="center" gap={1.5} mb={5}>
                {otp.map((d, i) => (
                  <Box key={i} w={d ? "18px" : "5px"} h="3px" borderRadius="full"
                    bg={d ? "blue.500" : "gray.200"} transition="all 0.2s" />
                ))}
              </Flex>

              <Button
                w="full" h="42px" colorScheme="blue" borderRadius="xl"
                fontWeight={700} mb={4}
                loading={loading} loadingText="Vérification…"
                isDisabled={filled < OTP_LEN}
                onClick={() => submit()}>
                <Flex align="center" gap={2}>
                  <LuShieldCheck size={14} />Confirmer le changement
                </Flex>
              </Button>

              {/* Resend */}
              <Flex align="center" justify="space-between"
                bg="gray.50" borderRadius="xl" px={4} py={3}
                border="1px solid" borderColor="gray.100">
                <Text fontSize="xs" color="gray.500">
                  {canResend ? "Pas reçu ?" : `Renvoyer dans ${countdown}s`}
                </Text>
                <Button size="xs" variant="ghost" colorScheme="blue"
                  disabled={!canResend}
                  loading={resending} loadingText="Envoi…"
                  onClick={resend}>
                  Renvoyer
                </Button>
              </Flex>
              {!canResend && (
                <Box mt={2} bg="gray.100" borderRadius="full" h="2px" overflow="hidden">
                  <Box bg="blue.400" h="100%" borderRadius="full"
                    w={`${(countdown / RESEND_WAIT) * 100}%`}
                    transition="width 1s linear" />
                </Box>
              )}

            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

const infoSchema = yup.object({
  name:  yup.string().min(3, "Minimum 3 caractères").required("Le nom est requis"),
  phone: yup.string().matches(/^\d+$/, "Chiffres uniquement")
    .length(8, "8 chiffres requis").required("Le téléphone est requis"),
})

const emailSchema = yup.object({
  email: yup.string().email("Email invalide").required("L'email est requis"),
})

function GeneralInfo({ user, onUserUpdate }) {
  const [otpDialogOpen, setOtpDialogOpen] = useState(false)
  const [pendingEmail,  setPendingEmail]  = useState("")
  const [savingInfo,    setSavingInfo]    = useState(false)
  const [savingEmail,   setSavingEmail]   = useState(false)

  const infoFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name:  user?.name  ?? "",
      phone: user?.phone ?? "",
    },
    validationSchema: infoSchema,
    onSubmit: async (values) => {
      try {
        setSavingInfo(true)
        await AxiosToken.put("/user/setting/information", values)
        toaster.create({ description: "Informations mises à jour.", type: "success", closable: true })
        onUserUpdate({ ...user, ...values })
      } catch {
        toaster.create({ description: "Téléphone est existe.", type: "error", closable: true })
      } finally { setSavingInfo(false) }
    }
  })

  const emailFormik = useFormik({
    enableReinitialize: true,
    initialValues: { email: user?.email ?? "" },
    validationSchema: emailSchema,
    onSubmit: async (values) => {
      if (values.email === user?.email) {
        toaster.create({ description: "C'est déjà votre email actuel.", type: "info", closable: true })
        return
      }
      try {
        setSavingEmail(true)
        // Send OTP to new email
        await AxiosToken.post("/user/setting/send-email-otp", { newEmail: values.email })
        setPendingEmail(values.email)
        setOtpDialogOpen(true)
      } catch {
        toaster.create({ description: "Erreur lors de l'envoi du code.", type: "error", closable: true })
      } finally { setSavingEmail(false) }
    }
  })

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <VStack gap={5} align="stretch">

      {/* Avatar section */}
      <Box bg="white" borderRadius="2xl"
        border="1px solid" borderColor="gray.100"
        boxShadow="0 1px 8px rgba(0,0,0,0.05)" px={6} py={5}>
        <Flex align="center" gap={5}>
          <Box position="relative">
            <Flex
              w="72px" h="72px" borderRadius="full"
              bg="blue.600" color="white"
              align="center" justify="center"
              fontSize="xl" fontWeight={800}>
              {initials}
            </Flex>
          </Box>
          <Box>
            <Text fontWeight={800} fontSize="lg" color="gray.900">{user?.name}</Text>
            <Text fontSize="sm" color="gray.500">{user?.email}</Text>
            <Flex align="center" gap={2} mt={1}>
              <Box w="6px" h="6px" borderRadius="full" bg="green.400" />
              <Text fontSize="xs" color="gray.400" textTransform="capitalize">
                {user?.role === "partner" ? "Partenaire" : user?.role === "admin" ? "Administrateur" : "Client"}
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* Profile info form */}
      <SectionCard title="Informations personnelles" icon={LuUser} iconColor="blue">
        <form onSubmit={infoFormik.handleSubmit}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mb={5}>
            <FormField label="Nom complet" required icon={LuUser}
              isInvalid={infoFormik.touched.name && !!infoFormik.errors.name}
              error={infoFormik.errors.name}>
              <StyledInput
                name="name" value={infoFormik.values.name}
                onChange={infoFormik.handleChange} onBlur={infoFormik.handleBlur}
                placeholder="Votre nom complet"
                isInvalid={infoFormik.touched.name && !!infoFormik.errors.name}
              />
            </FormField>
            <FormField label="Téléphone" required icon={LuPhone}
              isInvalid={infoFormik.touched.phone && !!infoFormik.errors.phone}
              error={infoFormik.errors.phone}>
              <StyledInput
                name="phone" value={infoFormik.values.phone}
                onChange={infoFormik.handleChange} onBlur={infoFormik.handleBlur}
                placeholder="12345678"
                isInvalid={infoFormik.touched.phone && !!infoFormik.errors.phone}
              />
            </FormField>
          </Grid>
          <Flex justify="flex-end">
            <Button type="submit" colorScheme="blue" borderRadius="xl"
              px={8} fontWeight={700}
              loading={savingInfo} loadingText="Sauvegarde…">
              <Flex align="center" gap={2}><LuCheck size={14} />Enregistrer</Flex>
            </Button>
          </Flex>
        </form>
      </SectionCard>

      {/* Email change form — separate section */}
      <SectionCard title="Adresse email" icon={LuMail} iconColor="orange">
        <Text fontSize="sm" color="gray.500" mb={4} lineHeight="1.6">
          La modification de votre email nécessite une vérification par code OTP
          envoyé à la nouvelle adresse.
        </Text>
        <form onSubmit={emailFormik.handleSubmit}>
          <Grid templateColumns={{ base: "1fr", md: "1fr auto" }} gap={4} align="flex-end">
            <FormField label="Nouvelle adresse email" required icon={LuMail}
              isInvalid={emailFormik.touched.email && !!emailFormik.errors.email}
              error={emailFormik.errors.email}>
              <StyledInput
                name="email" type="email"
                value={emailFormik.values.email}
                onChange={emailFormik.handleChange} onBlur={emailFormik.handleBlur}
                placeholder="nouveau@email.com"
              />
            </FormField>
            <Button type="submit" colorScheme="orange" borderRadius="xl"
              px={6} fontWeight={700} h="42px" alignSelf="flex-end"
              loading={savingEmail} loadingText="Envoi…">
              <Flex align="center" gap={2}>
                <LuMail size={14} />Changer l'email
              </Flex>
            </Button>
          </Grid>
        </form>
      </SectionCard>

      {/* OTP dialog */}
      <EmailOtpDialog
        open={otpDialogOpen}
        onClose={() => setOtpDialogOpen(false)}
        newEmail={pendingEmail}
        onConfirmed={(email) => onUserUpdate({ ...user, email })}
      />

    </VStack>
  )
}

const passwordSchema = yup.object({
  currentPassword:yup.string().required("Le mot de passe actuel est requis"),
  newPassword:yup.string()
    .min(6, "Minimum 6 caractères")
    .matches(/[A-Z]/, "Au moins une majuscule")
    .matches(/[0-9]/, "Au moins un chiffre")
    .required("Le nouveau mot de passe est requis"),
  confirmPassword:  yup.string()
    .required("La confirmation est requise")
    .oneOf([yup.ref("newPassword"), null], "Les mots de passe ne correspondent pas"),
})

function ChangePassword() {
  const RULES = (pw, confirm, newPw) => [
    { label: "6 caractères minimum",      test: pw.length >= 6           },
    { label: "Au moins une majuscule",     test: /[A-Z]/.test(pw)         },
    { label: "Au moins un chiffre",        test: /[0-9]/.test(pw)         },
    { label: "Mots de passe identiques",   test: !!confirm && pw === confirm },
  ]

  const formik = useFormik({
    initialValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await AxiosToken.put("/user/setting/update/password", {
          currentPassword: values.currentPassword,
          newPassword:     values.newPassword,
        })
        toaster.create({ description: "Mot de passe modifié avec succès.", type: "success", closable: true })
        resetForm()
      } catch(err) {
        if(err.status === 401){
            toaster.create({ description: "Mot de passe actuel incorrect.", type: "error", closable: true })
        }
        else{
            toaster.create({ description: "Le nouveau mot de passe ne peut pas être identique à l’actuel.", type: "error", closable: true })
        }
      }
    }
  })

  const strength = formik.values.newPassword
    ? getStrength(formik.values.newPassword)
    : null

  const rules = RULES(
    formik.values.newPassword,
    formik.values.confirmPassword,
    formik.values.newPassword
  )

  return (
    <VStack gap={5} align="stretch">

      <SectionCard title="Modifier le mot de passe" icon={LuLock} iconColor="blue">
        <form onSubmit={formik.handleSubmit}>
          <VStack gap={4} align="stretch" mb={5}>

            <PasswordInput formik={formik} name="currentPassword"
              label="Mot de passe actuel" placeholder="••••••••" />

            <Box borderTop="1px solid" borderColor="gray.100" pt={4}>
              <PasswordInput formik={formik} name="newPassword"
                label="Nouveau mot de passe" placeholder="••••••••" />
            </Box>

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
                  {[1,2,3,4,5].map(i => (
                    <Box key={i} flex={1} h="4px" borderRadius="full"
                      bg={i <= strength.level ? strength.color : "gray.100"}
                      transition="background 0.3s" />
                  ))}
                </Flex>
              </Box>
            )}

            <PasswordInput formik={formik} name="confirmPassword"
              label="Confirmer le nouveau mot de passe" placeholder="••••••••" />

          </VStack>

          <Flex justify="flex-end">
            <Button type="submit" colorScheme="blue" borderRadius="xl"
              px={8} fontWeight={700}
              loading={formik.isSubmitting} loadingText="Modification…">
              <Flex align="center" gap={2}><LuLock size={14} />Modifier le mot de passe</Flex>
            </Button>
          </Flex>
        </form>
      </SectionCard>

      {/* Rules card */}
      <SectionCard title="Critères de sécurité" icon={LuShieldCheck} iconColor="green">
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={3}>
          {rules.map(({ label, test }) => (
            <Flex key={label} align="center" gap={3} p={3}
              bg={test ? "green.50" : "gray.50"}
              borderRadius="xl" border="1px solid"
              borderColor={test ? "green.200" : "gray.100"}
              transition="all 0.2s">
              <Flex w="24px" h="24px" borderRadius="full" flexShrink={0}
                bg={test ? "green.400" : "gray.200"}
                align="center" justify="center"
                transition="background 0.2s">
                <LuCheck size={11} color="white" />
              </Flex>
              <Text fontSize="sm" fontWeight={test ? 600 : 400}
                color={test ? "green.700" : "gray.400"}
                transition="color 0.2s">
                {label}
              </Text>
            </Flex>
          ))}
        </Grid>
      </SectionCard>

    </VStack>
  )
}

export default function Settings() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await AxiosToken.get("/auth/profile")
        setUser(res.data.data)
      } catch {
        navigate("/login")
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [navigate])

  if (loading) {
    return (
      <LoadingScreen />
    )
  }

  return (
    <>
    <Helmet title="Paramètres"></Helmet>
    <Box bg="#f5f6fa" minH="100vh">
      <Box maxW="760px" mx="auto" px={{ base: 4, md: 6 }} py={8}>
        <Box as={Link} to="/" align="center" gap={1.5}
            color="gray.400" fontSize="sm" mb={8}
            _hover={{ color: "blue.500" }} transition="color 0.15s"
            display="inline-flex">
            <LuChevronLeft size={14} />
            Retour à la page d'accueil
          </Box>
        <Box mb={8}>
          <Flex align="center" gap={2} mb={1}>
            <Flex w="28px" h="28px" borderRadius="lg" bg="blue.100"
              color="blue.600" align="center" justify="center">
              <LuSettings size={14} />
            </Flex>
            <Text fontSize="xs" fontWeight={700} color="blue.500"
              textTransform="uppercase" letterSpacing="widest">
              Compte
            </Text>
          </Flex>
          <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
            Paramètres
          </Text>
          <Text fontSize="sm" color="gray.400" mt={1}>
            Gérez vos informations personnelles et votre sécurité
          </Text>
        </Box>

        <Tabs.Root defaultValue="general" variant="plain">
          <Tabs.List
            mb={6} bg="white" borderRadius="2xl" p={1.5}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 6px rgba(0,0,0,0.04)"
            display="inline-flex" gap={1}>
            <Tabs.Trigger value="general"
              px={5} py={2.5} borderRadius="xl" fontSize="sm" fontWeight={500}
              _selected={{ bg: "blue.600", color: "white", fontWeight: 700 }}
              transition="all 0.15s">
              <Flex align="center" gap={2}><LuUser size={14} />Informations</Flex>
            </Tabs.Trigger>
            <Tabs.Trigger value="password"
              px={5} py={2.5} borderRadius="xl" fontSize="sm" fontWeight={500}
              _selected={{ bg: "blue.600", color: "white", fontWeight: 700 }}
              transition="all 0.15s">
              <Flex align="center" gap={2}><LuLock size={14} />Mot de passe</Flex>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="general">
            <GeneralInfo user={user} onUserUpdate={setUser} />
          </Tabs.Content>

          <Tabs.Content value="password">
            <ChangePassword />
          </Tabs.Content>
        </Tabs.Root>

      </Box>
    </Box>
    </>
  )
}