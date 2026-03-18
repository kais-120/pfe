import { useState, useRef, useEffect } from "react"
import { Box, Flex, Text } from "@chakra-ui/react"

function Counter({ label, sublabel, value, onIncrease, onDecrease, min = 0 }) {
  return (
    <Flex align="center" justify="space-between" py={3} borderBottom="1px solid" borderColor="gray.100">
      <Box>
        <Text fontSize="sm" color="gray.800">{label}</Text>
        {sublabel && <Text fontSize="xs" color="gray.400">{sublabel}</Text>}
      </Box>
      <Flex align="center" gap={3}>
        <Box
          as="button"
          w="32px" h="32px"
          borderRadius="full"
          border="1px solid"
          borderColor={value <= min ? "gray.200" : "gray.400"}
          display="flex" alignItems="center" justifyContent="center"
          cursor={value <= min ? "not-allowed" : "pointer"}
          color={value <= min ? "gray.300" : "gray.700"}
          bg="white"
          onClick={() => value > min && onDecrease()}
          _hover={value > min ? { borderColor: "gray.800", color: "gray.800" } : {}}
          transition="all 0.15s"
        >
          <Box as="svg" w="14px" h="14px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 12h14" strokeWidth="2.5" strokeLinecap="round"/>
          </Box>
        </Box>

        <Text fontSize="sm" fontWeight="semibold" color="gray.800" minW="16px" textAlign="center">
          {value}
        </Text>

        <Box
          as="button"
          w="32px" h="32px"
          borderRadius="full"
          border="1px solid"
          borderColor="gray.400"
          display="flex" alignItems="center" justifyContent="center"
          cursor="pointer"
          color="gray.700"
          bg="white"
          onClick={onIncrease}
          _hover={{ borderColor: "gray.800", color: "gray.800" }}
          transition="all 0.15s"
        >
          <Box as="svg" w="14px" h="14px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeWidth="2.5" strokeLinecap="round"/>
          </Box>
        </Box>
      </Flex>
    </Flex>
  )
}

export default function RoomSelector({room}) {
  const [open, setOpen] = useState(false)
  const [rooms, setRooms] = useState([{ adults: 2, children: 0 }])
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function updateRoom(idx, field, val) {
  setRooms(prev => {
    const updated = prev.map((r, i) =>
      i === idx ? { ...r, [field]: val } : r
    )

    room(updated)

    return updated
  })
}

function addRoom() {
  if (rooms.length <= 4) {
    setRooms(prev => {
      const updated = [...prev, { adults: 2, children: 0 }]
      room(updated)
      return updated
    })
  }
}

 function removeRoom(idx) {
  setRooms(prev => {
    const updated = prev.filter((_, i) => i !== idx)
    room(updated)
    return updated
  })
}

  const totalRooms    = rooms.length
  const totalAdults   = rooms.reduce((s, r) => s + r.adults, 0)
  const totalChildren = rooms.reduce((s, r) => s + r.children, 0)

  return (
    <Box position="relative" w="full" ref={ref}>

      {/* ── Trigger ── */}
      <Box
        as="button"
        w="full"
        h="40px"
        display="flex"
        alignItems="center"
        gap={2}
        px={3}
        border="1px solid"
        borderColor={open ? "#cc0057" : "gray.300"}
        borderRadius="4px"
        bg="white"
        cursor="pointer"
        textAlign="left"
        boxShadow={open ? "0 0 0 2px rgba(204,0,87,0.15)" : "none"}
        transition="all 0.15s"
        onClick={() => setOpen(o => !o)}
        _hover={{ borderColor: "#cc0057" }}
      >
        {/* Person icon */}
        <Box as="svg" w="16px" h="16px" fill="none" stroke="gray" viewBox="0 0 24 24" flexShrink={0}>
          <circle cx="12" cy="7" r="4" strokeWidth="1.8"/>
          <path d="M4 21v-1a8 8 0 0116 0v1" strokeWidth="1.8" strokeLinecap="round"/>
        </Box>
        <Box flex={1} overflow="hidden">
          <Text fontSize="sm" fontWeight="semibold" color="gray.800" noOfLines={1}>
            {totalRooms} Chambre{totalRooms > 1 ? "s" : ""}, {totalAdults} Adulte{totalAdults > 1 ? "s" : ""}, {totalChildren} Enfant{totalChildren > 1 ? "s" : ""}
          </Text>
        </Box>
      </Box>

      {open && (
        <Box
          position="absolute"
          top="calc(100% + 6px)"
          left={0}
          zIndex={1500}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="4px"
          boxShadow="0 8px 32px rgba(0,0,0,0.15)"
          w="320px"
          p={4}
        >
          {rooms.map((room, idx) => (
            <Box key={idx} mb={4}>
              {/* Room header */}
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                  Chambre {idx + 1}
                </Text>
                {rooms.length > 1 && (
                  <Box
                    as="button"
                    onClick={() => removeRoom(idx)}
                    bg="none"
                    border="none"
                    cursor="pointer"
                    color="gray.400"
                    _hover={{ color: "gray.700" }}
                    display="flex" alignItems="center" justifyContent="center"
                  >
                    <Box as="svg" w="16px" h="16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                    </Box>
                  </Box>
                )}
              </Flex>

              <Counter
                label="Adulte(s)"
                value={room.adults}
                min={1}
                onIncrease={() => updateRoom(idx, "adults", room.adults + 1)}
                onDecrease={() => updateRoom(idx, "adults", room.adults - 1)}
              />
              <Counter
                label="Enfant(s)"
                sublabel="De 0 à 12 ans"
                value={room.children}
                min={0}
                onIncrease={() => updateRoom(idx, "children", room.children + 1)}
                onDecrease={() => updateRoom(idx, "children", room.children - 1)}
              />
            </Box>
          ))}

          {/* Add room */}
          {rooms.length <= 4 &&
          <Box
            as="button"
            onClick={addRoom}
            bg="none"
            border="none"
            cursor="pointer"
            color="#cc0057"
            fontSize="sm"
            fontWeight="semibold"
            px={0}
            py={2}
            _hover={{ textDecoration: "underline" }}
          >
            + Ajouter une autre chambre
          </Box>
          }

          <Flex justify="flex-end" mt={3} pt={3} borderTop="1px solid" borderColor="gray.100">
            <Box
              as="button"
              onClick={() => setOpen(false)}
              px={6}
              py={2}
              border="2px solid"
              borderColor="#cc0057"
              borderRadius="4px"
              color="#cc0057"
              fontWeight="bold"
              fontSize="sm"
              bg="white"
              cursor="pointer"
              transition="all 0.15s"
              _hover={{ bg: "#cc0057", color: "white" }}
            >
              Valider
            </Box>
          </Flex>
        </Box>
      )}
    </Box>
  )
}