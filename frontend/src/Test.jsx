import { useEffect, useState } from "react"
import { Box, Flex, Text } from "@chakra-ui/react"

const MESSAGES = [
  "Recherche des meilleures offres…",
  "Chargement de votre expérience…",
  "Préparation de votre voyage…",
  "Connexion en cours…",
  "Bienvenue sur TravelNow…",
]

const Test = ({ message }) => {
  const [msgIdx,    setMsgIdx]    = useState(0)
  const [progress,  setProgress]  = useState(0)
  const [dots,      setDots]      = useState("")

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length)
    }, 2000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 95) return p
        const step = Math.random() * 8 + 2
        return Math.min(95, p + step)
      })
    }, 400)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setDots(d => d.length >= 3 ? "" : d + ".")
    }, 400)
    return () => clearInterval(t)
  }, [])

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={9999}
      bg="#0E1B2E"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      overflow="hidden"
    >
      <Box position="absolute" inset={0} overflow="hidden" pointerEvents="none">
        {Array.from({ length: 40 }).map((_, i) => (
          <Box
            key={i}
            position="absolute"
            borderRadius="full"
            bg="white"
            style={{
              width:  `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top:    `${Math.random() * 100}%`,
              left:   `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </Box>

      <Box mb={8} position="relative">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          <defs>
            <style>{`
              @keyframes spin {
                from { transform-origin: 80px 80px; transform: rotate(0deg); }
                to   { transform-origin: 80px 80px; transform: rotate(360deg); }
              }
              @keyframes orbit {
                from { transform-origin: 80px 80px; transform: rotate(0deg); }
                to   { transform-origin: 80px 80px; transform: rotate(360deg); }
              }
              @keyframes planeBob {
                0%,100% { transform: translateY(0px); }
                50%      { transform: translateY(-4px); }
              }
              @keyframes twinkle {
                0%,100% { opacity: 0.1; }
                50%      { opacity: 0.5; }
              }
              .globe-ring { animation: spin 8s linear infinite; }
              .orbit-group { animation: orbit 4s linear infinite; }
              .plane-body { animation: planeBob 2s ease-in-out infinite; }
            `}</style>
          </defs>

          {/* Outer glow ring */}
          <circle cx="80" cy="80" r="72" stroke="#1B4FD8" strokeWidth="1" opacity="0.3" />
          <circle cx="80" cy="80" r="64" stroke="#2563EB" strokeWidth="0.5" opacity="0.4" />

          {/* Globe */}
          <circle cx="80" cy="80" r="52" fill="#0F2A5E" stroke="#1D4ED8" strokeWidth="1.5" />

          {/* Continent shapes */}
          <ellipse cx="68" cy="72" rx="16" ry="20" fill="#1D4ED8" opacity="0.6" />
          <ellipse cx="96" cy="66" rx="10" ry="14" fill="#1D4ED8" opacity="0.5" />
          <ellipse cx="78" cy="96" rx="12" ry="8"  fill="#1D4ED8" opacity="0.4" />
          <ellipse cx="58" cy="88" rx="7"  ry="5"  fill="#1D4ED8" opacity="0.35" />
          <ellipse cx="100" cy="88" rx="8" ry="6"  fill="#1D4ED8" opacity="0.4" />

          {/* Latitude lines */}
          <g className="globe-ring" opacity="0.25">
            <ellipse cx="80" cy="80" rx="52" ry="14" stroke="#60A5FA" strokeWidth="0.8" fill="none" />
            <ellipse cx="80" cy="80" rx="44" ry="30" stroke="#60A5FA" strokeWidth="0.8" fill="none" />
          </g>

          {/* Meridian */}
          <ellipse cx="80" cy="80" rx="18" ry="52" stroke="#60A5FA" strokeWidth="0.8" fill="none" opacity="0.2" />

          {/* Orbit ring */}
          <g className="orbit-group">
            {/* Orbit path (dashed) */}
            <circle cx="80" cy="80" r="68"
              stroke="#3B82F6" strokeWidth="1"
              strokeDasharray="6 4" fill="none" opacity="0.5" />

            <g transform="translate(80, 12)">
              <g className="plane-body">
                <rect x="-10" y="-4" width="20" height="8" rx="4" fill="#60A5FA" />
                <path d="M-2,-4 L-12,-12 L-12,-6 Z" fill="#93C5FD" />
                <path d="M-2,-4 L8,-10 L8,-5 Z" fill="#93C5FD" />
                <path d="M-10,-4 L-14,-10 L-10,-5 Z" fill="#BFDBFE" />
                <circle cx="2" cy="0" r="2" fill="#1E3A8A" />
                <circle cx="-18" cy="0" r="1.5" fill="#3B82F6" opacity="0.7" />
                <circle cx="-24" cy="0" r="1" fill="#3B82F6" opacity="0.5" />
                <circle cx="-29" cy="0" r="0.7" fill="#3B82F6" opacity="0.3" />
              </g>
            </g>
          </g>
        </svg>
      </Box>


      <Text
        fontSize="sm"
        color="#93C5FD"
        fontWeight={500}
        mb={8}
        minH="20px"
        textAlign="center"
        px={8}
        transition="opacity 0.3s"
      >
        {message ?? MESSAGES[msgIdx]}{dots}
      </Text>

      {/* ── Progress bar ── */}
      <Box
        w="220px"
        h="3px"
        bg="#1E3A8A"
        borderRadius="full"
        overflow="hidden"
      >
        <Box
          h="100%"
          borderRadius="full"
          bg="#3B82F6"
          style={{
            width: `${progress}%`,
            transition: "width 0.4s ease",
          }}
        />
      </Box>

      {/* ── Keyframes injected globally ── */}
      <style>{`
        @keyframes twinkle {
          0%,100% { opacity: 0.1; }
          50%      { opacity: 0.5; }
        }
      `}</style>
    </Box>
  )
}

export default Test