import { useEffect, useRef, useState } from "react"
import { Box, Button, Flex, Text, VStack, Badge } from "@chakra-ui/react"
import { Scanner } from "@yudiel/react-qr-scanner"
import {
  LuScanLine,
  LuRefreshCw, LuCopy, LuChevronLeft,
  LuZap, LuCamera, LuEye, LuEyeOff,
} from "react-icons/lu"
import { useNavigate } from "react-router-dom"
import { AxiosToken } from "../../Api/Api"
import { toaster } from "../../components/ui/toaster"
import { LucideCheckCircle, LucideXCircle } from "lucide-react"

const STATUS = {
  idle: { color: "blue", label: "Prêt à scanner" },
  scanning: { color: "blue", label: "Scan en cours…" },
  success: { color: "green", label: "QR code détecté !" },
  error: { color: "red", label: "Code invalide ou expiré" },
  loading: { color: "yellow", label: "Traitement…" },
}

export default function QrScannerPage() {
  const [status, setStatus] = useState("idle")
  const [result, setResult] = useState(null)
  const [paused, setPaused] = useState(false)
  const [error, setError] = useState("")
  const [camErr, setCamErr] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const navigate = useNavigate()
  const cooldown = useRef(false)

  /* ── Handle scan result ── */
  const handleScan = async (detectedCodes) => {
    const text = detectedCodes?.[0]?.rawValue
    if (!text || cooldown.current || paused) return

    cooldown.current = true
    setPaused(true)
    setStatus("loading")
    setResult(text)

    try {
      // Send booking_id to your backend for validation
      const res = await AxiosToken.post("/booking/scanner", { booking_id: text })
      setStatus("success")
      toaster.create({
        description: res.data.message ?? "Réservation validée avec succès.",
        type: "success",
        closable: true,
      })
    } catch (err) {
      
      const msg = err?.response?.data?.message ?? "Code invalide ou expiré."
      setStatus("error")
      setError(msg)
      toaster.create({ description: msg, type: "error", closable: true })
    }
  }

  /* ── Reset scanner ── */
  const handleReset = () => {
    setStatus("idle")
    setResult(null)
    setError("")
    setPaused(false)
    cooldown.current = false
  }

  /* ── Copy to clipboard ── */
  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    toaster.create({ description: "Copié dans le presse-papiers.", type: "info", closable: true })
  }

  /* ── Toggle scanner visibility ── */
  const toggleScanner = () => {
    setShowScanner(!showScanner)
    if (!showScanner) {
      handleReset()
    }
  }

  const s = STATUS[status]

  return (
    <Box minH="100vh" bg="#f5f6fa">
      <Box mx="auto" px={4} py={8}>

        {/* Header */}
        <Box mb={7}>
          <Flex align="center" gap={2} mb={1}>
            <Flex w="28px" h="28px" borderRadius="lg" bg="blue.100"
              color="blue.600" align="center" justify="center">
              <LuScanLine size={14} />
            </Flex>
            <Text fontSize="xs" fontWeight={700} color="blue.500"
              textTransform="uppercase" letterSpacing="widest">
              Validation
            </Text>
          </Flex>
          <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
            Scanner un QR code
          </Text>
          <Text fontSize="sm" color="gray.400" mt={1}>
            Pointez la caméra vers le QR code de réservation
          </Text>
        </Box>

        <VStack gap={4} align="stretch">

          {/* ── Show/Hide Scanner Button ── */}
          <Button
            w="full"
            colorScheme={showScanner ? "red" : "blue"}
            borderRadius="xl"
            fontWeight={700}
            size="lg"
            onClick={toggleScanner}
            leftIcon={showScanner ? <LuEyeOff size={16} /> : <LuEye size={16} />}
          >
            {showScanner ? "Masquer le scanner" : "Afficher le scanner"}
          </Button>

          {/* ── Camera card (conditionally rendered) ── */}
          {showScanner && (
            <Box bg="white" borderRadius="2xl"
              border="1.5px solid"
              borderColor={
                status === "success" ? "green.300"
                  : status === "error" ? "red.300"
                    : "gray.100"
              }
              boxShadow="0 2px 16px rgba(0,0,0,0.08)"
              overflow="hidden"
              transition="border-color 0.3s">

              {/* Status bar */}
              <Flex
                px={5} py={3}
                bg={`${s.color}.50`}
                borderBottom="1px solid"
                borderColor={`${s.color}.100`}
                align="center" justify="space-between">
                <Flex align="center" gap={2}>
                  <Box color={`${s.color}.500`}>
                    {status === "success" ? <LucideCheckCircle size={15} />
                      : status === "error" ? <LucideXCircle size={15} />
                        : status === "loading" ? <LuZap size={15} />
                          : <LuScanLine size={15} />}
                  </Box>
                  <Text fontSize="sm" fontWeight={600} color={`${s.color}.700`}>
                    {s.label}
                  </Text>
                </Flex>
                <Badge colorScheme={s.color} borderRadius="full" px={2.5} py={0.5}
                  fontSize="xs" fontWeight={700}>
                  {status === "scanning" || status === "idle" ? "En direct" : status.toUpperCase()}
                </Badge>
              </Flex>

              {/* Scanner viewport */}
              <Box position="relative" bg="black">
                {camErr ? (
                  <Flex h="300px" direction="column" align="center" justify="center"
                    gap={3} bg="gray.900">
                    <Box color="gray.500"><LuCamera size={40} /></Box>
                    <Text color="gray.400" fontSize="sm" textAlign="center" px={6}>
                      Impossible d'accéder à la caméra.
                      Vérifiez les autorisations dans votre navigateur.
                    </Text>
                    <Button size="sm" colorScheme="blue" borderRadius="xl"
                      onClick={() => { setCamErr(false); handleReset() }}>
                      Réessayer
                    </Button>
                  </Flex>
                ) : (
                  <Box
                    h="300px" overflow="hidden"
                    opacity={paused ? 0.4 : 1}
                    transition="opacity 0.3s"
                    sx={{
                      "& video": { width: "100%", height: "300px", objectFit: "cover" },
                      "& svg": { display: "none" },
                    }}>
                    <Scanner
                      onScan={handleScan}
                      paused={paused}
                      onError={() => setCamErr(true)}
                      styles={{ container: { width: "100%", height: "300px" } }}
                      components={{ audio: false }}
                    />
                  </Box>
                )}

                {/* Scan frame overlay */}
                {!paused && !camErr && (
                  <Box position="absolute" inset={0}
                    display="flex" alignItems="center" justifyContent="center"
                    pointerEvents="none">
                    <Box
                      w="200px" h="200px" position="relative"
                      borderRadius="xl"
                      boxShadow="0 0 0 9999px rgba(0,0,0,0.45)"
                    >
                      {/* Corner marks */}
                      {[
                        { top: 0, left: 0, borderTop: "3px solid", borderLeft: "3px solid" },
                        { top: 0, right: 0, borderTop: "3px solid", borderRight: "3px solid" },
                        { bottom: 0, left: 0, borderBottom: "3px solid", borderLeft: "3px solid" },
                        { bottom: 0, right: 0, borderBottom: "3px solid", borderRight: "3px solid" },
                      ].map((style, i) => (
                        <Box key={i} position="absolute" w="22px" h="22px"
                          borderColor="white" borderRadius="2px"
                          {...style} />
                      ))}

                      {/* Animated scan line */}
                      <Box
                        position="absolute" left="4px" right="4px" h="2px"
                        bg="linear-gradient(90deg, transparent, #3182CE, transparent)"
                        borderRadius="full"
                        animation="scanline 2s ease-in-out infinite"
                        sx={{
                          "@keyframes scanline": {
                            "0%": { top: "10px", opacity: 0 },
                            "10%": { opacity: 1 },
                            "90%": { opacity: 1 },
                            "100%": { top: "176px", opacity: 0 },
                          }
                        }}
                      />
                    </Box>
                  </Box>
                )}

                {/* Paused overlay */}
                {paused && !camErr && (
                  <Flex position="absolute" inset={0}
                    align="center" justify="center"
                    bg="blackAlpha.600" direction="column" gap={2}>
                    {status === "success" && <LucideCheckCircle size={48} color="#68D391" />}
                    {status === "error" && <LucideXCircle size={48} color="#FC8181" />}
                    {status === "loading" && (
                      <Box color="white" fontSize="xs">Traitement…</Box>
                    )}
                  </Flex>
                )}
              </Box>
            </Box>
          )}

          {/* ── Result card ── */}
          {result && (
            <Box bg="white" borderRadius="2xl" p={5}
              border="1px solid" borderColor="gray.100"
              boxShadow="0 1px 8px rgba(0,0,0,0.05)">

              <Text fontSize="xs" fontWeight={700} color="gray.400"
                textTransform="uppercase" letterSpacing="wider" mb={3}>
                Contenu scanné
              </Text>

              
              {/* Error message */}
              {status === "error" && error && (
                <Flex align="center" gap={2} mt={3} bg="red.50"
                  border="1px solid" borderColor="red.200"
                  borderRadius="xl" px={4} py={3}>
                  <Box color="red.400" flexShrink={0}><LucideXCircle size={14} /></Box>
                  <Text fontSize="sm" color="red.600">{error}</Text>
                </Flex>
              )}

              {/* Success message */}
              {status === "success" && (
                <Flex align="center" gap={2} mt={3} bg="green.50"
                  border="1px solid" borderColor="green.200"
                  borderRadius="xl" px={4} py={3}>
                  <Box color="green.500" flexShrink={0}><LucideCheckCircle size={14} /></Box>
                  <Text fontSize="sm" color="green.600" fontWeight={500}>
                    Réservation validée avec succès.
                  </Text>
                </Flex>
              )}
            </Box>
          )}

          {/* ── Actions ── */}
          <Flex gap={3}>
            {paused && (
              <Button flex={1} colorScheme="blue" borderRadius="xl"
                fontWeight={700} onClick={handleReset}>
                <Flex align="center" gap={2}>
                  <LuRefreshCw size={14} />
                  Scanner un autre code
                </Flex>
              </Button>
            )}
            
          </Flex>

          {/* Hint */}
          {!paused && showScanner && (
            <Text fontSize="xs" color="gray.400" textAlign="center">
              Maintenez le QR code bien éclairé et stable devant la caméra
            </Text>
          )}

        </VStack>
      </Box>
    </Box>
  )
}