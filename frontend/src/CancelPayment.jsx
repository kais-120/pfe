import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  Icon,
} from "@chakra-ui/react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { FaExclamationCircle, FaArrowLeft } from "react-icons/fa"
import { useEffect, useState } from "react"
import LoadingScreen from "./components/LoadingScreen"
import { Axios } from "./Api/Api"

const CancelPayment = () => {
  const navigate = useNavigate()
  const [loading,setLoading] = useState(true)
    const [searchParams] = useSearchParams()
    const session_id = searchParams.get("session_id") ?? ""
    const booking_id = searchParams.get("booking") ?? ""
    useEffect(()=>{
      if(!session_id || !booking_id) {setLoading(false);return}
      const dataUpdate = async () => {
      try{
        await Axios.put("/payment/verify",{
          reference:session_id,
          booking_id
        })
      }catch{
        console.error("error")
      }
      finally{
        setLoading(false)
      }
    }
    dataUpdate()
    },[session_id])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (loading) return <LoadingScreen />


  return (
    <Flex bg="gray.50" minH="100vh" align="center" justify="center" px={4}>
      <Box maxW="500px" w="100%" textAlign="center">
        {/* Cancel Icon */}
        <Flex justify="center" mb={6}>
          <Flex
            w="100px"
            h="100px"
            borderRadius="full"
            bg="red.50"
            align="center"
            justify="center"
            animation="scaleIn 0.5s ease-out"
          >
            <Icon as={FaExclamationCircle} w={14} h={14} color="red.500" />
          </Flex>
        </Flex>

        {/* Title */}
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight={900}
          color="gray.800"
          mb={3}
          letterSpacing="-0.5px"
        >
          Réservation annulée
        </Text>

        <Text fontSize="sm" color="gray.500" mb={8} lineHeight="1.6">
          Votre réservation n'a pas été finalisée. Aucun montant n'a été débité de votre compte.
        </Text>

        {/* Action Buttons */}
        <VStack spacing={3} w="100%">
          <Button
            w="100%"
            size="lg"
            colorScheme="blue"
            borderRadius="xl"
            fontWeight={700}
            leftIcon={<FaArrowLeft />}
            py={6}
            onClick={() => navigate("/")}
          >
            Chercher un nouvel service
          </Button>
        </VStack>
      </Box>

      <style jsx>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </Flex>
  )
}

export default CancelPayment