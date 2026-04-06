import { Box, Button, Input, Text, Flex, VStack, PinInput } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Axios } from "../Api/Api"
import {
  LuChevronLeft, LuCheck,
  LuRefreshCw, LuLock, LuShieldCheck,
} from "react-icons/lu"
import { LucideAlertCircle } from "lucide-react"
import logo from "../assets/image.png"
import { Helmet } from "react-helmet"

const OTP_LENGTH   = 6
const RESEND_DELAY = 60  

const VerifyOtp = ({link,type}) => {
    const {hash} = useParams();
  const navigate = useNavigate()


  const [otp,setOtp] = useState(Array(OTP_LENGTH).fill(""))
  const [error,setError] = useState("")
  const [success,setSuccess] = useState(false)
  const [loading,setLoading] = useState(false)
  const [resending,setResending] = useState(false)
  const [countdown,setCountdown] = useState(RESEND_DELAY)
  const [canResend,setCanResend] = useState(false)

  const inputRefs = useRef([])

  useEffect(() => {
    if (canResend) return
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); setCanResend(true); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [canResend])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (idx, val) => {
    const digit = val.replace(/\D/g, "").slice(-1)
    const next  = [...otp]
    next[idx]   = digit
    setOtp(next)
    setError("")

    if (digit && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus()
    }

    if (digit && idx === OTP_LENGTH - 1 && next.every(d => d)) {
      handleSubmit(next.join(""))
    }
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        const next = [...otp]
        next[idx]  = ""
        setOtp(next)
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus()
        const next = [...otp]
        next[idx - 1] = ""
        setOtp(next)
      }
    }
    if (e.key === "ArrowLeft"  && idx > 0)             inputRefs.current[idx - 1]?.focus()
    if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
    const next   = Array(OTP_LENGTH).fill("")
    pasted.split("").forEach((d, i) => { next[i] = d })
    setOtp(next)
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[lastFilled]?.focus()
    if (pasted.length === OTP_LENGTH) handleSubmit(pasted)
  }

  const handleSubmit = async (code = otp.join("")) => {
    if (code.length < OTP_LENGTH) {
      setError("Veuillez entrer les 6 chiffres du code.")
      return
    }
    try {
      setLoading(true)
      setError("")
      await Axios.put("/auth/verify/otp", { code,hash,type })
      setSuccess(true)
      if(type === "forgot-password"){
        setTimeout(() => navigate(`/reset-password/${hash}`), 1500)
      }
      else{
        setTimeout(() => navigate(`/login`), 1500)
      }
    } catch {
      setError("Code incorrect ou expiré. Vérifiez et réessayez.")
      setOtp(Array(OTP_LENGTH).fill(""))
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      setResending(true)
      setError("")
      await Axios.put("/auth/resend/otp", {hash,type})
      setCanResend(false)
      setCountdown(RESEND_DELAY)
      setOtp(Array(OTP_LENGTH).fill(""))
      inputRefs.current[0]?.focus()
    } catch {
      setError("Impossible de renvoyer le code. Réessayez.")
    } finally {
      setResending(false)
    }
  }

  const filled = otp.filter(d => d).length

  return (
    <>
    <Helmet title="Vérification code"></Helmet>
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

          <Flex
            w="72px" h="72px" borderRadius="2xl"
            bg="whiteAlpha.200" align="center" justify="center" mb={6}>
            <LuShieldCheck size={32} color="white" />
          </Flex>

          <Text fontSize="3xl" fontWeight={900} color="white"
            lineHeight="1.2" letterSpacing="-0.5px" mb={4}>
            Vérification en deux étapes
          </Text>
          <Text color="white" fontSize="sm" fontWeight={700} mb={8}>
          </Text>

          {[
            "Le code expire dans 5 minutes",
            "Ne partagez jamais ce code",
            "Vérifiez vos spams si nécessaire",
          ].map((item, i) => (
            <Flex key={i} align="center" gap={3} mb={3}>
              <Flex w="20px" h="20px" borderRadius="full"
                bg="whiteAlpha.300" align="center" justify="center" flexShrink={0}>
                <LuLock size={10} color="white" />
              </Flex>
              <Text color="blue.100" fontSize="sm">{item}</Text>
            </Flex>
          ))}
        </Box>
      </Box>

      <Flex flex={1} align="center" justify="center" px={{ base: 4, md: 8 }} py={10}>
        <Box w="full" maxW="420px">

          <Flex align="center" gap={2} mb={8} display={{ base: "flex", lg: "none" }}>
            <img width={"150px"} src={logo} alt="logo" />
          </Flex>
          {type === "forgot-password" && 
          <Flex as={Link} to={link} align="center" gap={1.5}
            color="gray.400" fontSize="sm" mb={8}
            _hover={{ color: "blue.500" }} transition="color 0.15s"
            display="inline-flex">
            <LuChevronLeft size={14} />
            Changer l'email
          </Flex>
          }

          <Box mb={8}>
            <Text fontSize="2xl" fontWeight={900} color="gray.900"
              letterSpacing="-0.5px" mb={1}>
              Entrez le code
            </Text>
            <Text fontSize="sm" color="gray.400">
              Code à {OTP_LENGTH} chiffres envoyé à votre email{" "}
              <Text as="span" fontWeight={600} color="gray.700"></Text>
            </Text>
          </Box>

          {error && (
            <Flex align="center" gap={2.5} bg="red.50"
              border="1px solid" borderColor="red.200"
              borderRadius="xl" px={4} py={3} mb={5}>
              <Box color="red.500" flexShrink={0}><LucideAlertCircle size={15} /></Box>
              <Text fontSize="sm" color="red.600" fontWeight={500}>{error}</Text>
            </Flex>
          )}

          {success && (
            <Flex align="center" gap={2.5} bg="green.50"
              border="1px solid" borderColor="green.200"
              borderRadius="xl" px={4} py={3} mb={5}>
              <Box color="green.500" flexShrink={0}><LuCheck size={15} /></Box>
              <Text fontSize="sm" color="green.600" fontWeight={500}>
                Code vérifié ! Redirection…
              </Text>
            </Flex>
          )}

          <Box bg="white" borderRadius="2xl" p={6} mb={4}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)">

            <Flex gap={3} justify="center" mb={6} onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <Box
                  key={idx}
                  as="input"
                  ref={el => { inputRefs.current[idx] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  w="52px" h="60px"
                  textAlign="center"
                  fontSize="xl"
                  fontWeight={800}
                  color="gray.900"
                  border="2px solid"
                  borderColor={
                    error    ? "red.300"
                    : digit  ? "blue.400"
                    : "gray.200"
                  }
                  borderRadius="xl"
                  bg={digit ? "blue.50" : "gray.50"}
                  outline="none"
                  transition="all 0.15s"
                  cursor="text"
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

            <Flex justify="center" gap={1.5} mb={6}>
              {otp.map((d, i) => (
                <Box key={i} w={d ? "20px" : "6px"} h="4px" borderRadius="full"
                  bg={d ? "blue.500" : "gray.200"} transition="all 0.2s" />
              ))}
            </Flex>

            <Button
              w="full" h="46px"
              colorScheme="blue" borderRadius="xl"
              fontWeight={700} fontSize="sm"
              loading={loading}
              loadingText="Vérification…"
              isDisabled={filled < OTP_LENGTH || success}
              onClick={() => handleSubmit()}
            >
              <Flex align="center" gap={2}>
                <LuShieldCheck size={16} />
                Vérifier le code
              </Flex>
            </Button>
          </Box>

          <Box
            bg="white" borderRadius="2xl" p={4}
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)"
          >
            <Flex align="center" justify="space-between">
              <Text fontSize="sm" color="gray.500">
                {canResend
                  ? "Vous n'avez pas reçu le code ?"
                  : `Renvoyer dans ${countdown}s`}
              </Text>
              <Button
                size="sm" variant="ghost" colorScheme="blue"
                borderRadius="lg" fontWeight={600}
                loading={resending}
                disabled={!canResend}
                loadingText="Envoi…"
                onClick={handleResend}
              >
                <Flex align="center" gap={1.5}>
                  <LuRefreshCw size={12} />
                  Renvoyer
                </Flex>
              </Button>
            </Flex>

            {!canResend && (
              <Box mt={3} bg="gray.100" borderRadius="full" h="3px" overflow="hidden">
                <Box
                  bg="blue.400" h="100%" borderRadius="full"
                  w={`${(countdown / RESEND_DELAY) * 100}%`}
                  transition="width 1s linear"
                />
              </Box>
            )}
          </Box>

        </Box>
      </Flex>
    </Flex>
    </>
  )
}

export default VerifyOtp