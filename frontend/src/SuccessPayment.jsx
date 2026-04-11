import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  Icon,
} from "@chakra-ui/react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { FaCheckCircle, FaArrowRight } from "react-icons/fa"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { Axios } from "./Api/Api"
import LoadingScreen from "./components/LoadingScreen"

const SuccessPayment = () => {
  const [loading,setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const session_id = searchParams.get("session_id") ?? ""
  useEffect(()=>{
    const dataUpdate = async () => {
    try{
      await Axios.put("/payment/verify",{
        reference:session_id
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
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  if (loading) return <LoadingScreen />

  return (
    <>
    <Helmet title="paiement confirmée"></Helmet>
    <Flex bg="gray.50" w="full" h="100vh" justify="center" align="center" px={4}>
      <Box maxW="500px" w="100%" textAlign="center">
        {/* Success Icon */}
        <Flex justify="center" mb={6}>
          <Flex
            w="100px"
            h="100px"
            borderRadius="full"
            bg="green.50"
            align="center"
            justify="center"
            animation="scaleIn 0.5s ease-out"
          >
            <Icon as={FaCheckCircle} w={14} h={14} color="green.500" />
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
          Réservation confirmée !
        </Text>

        {/* Description */}
        <Text fontSize="sm" color="gray.500" mb={8} lineHeight="1.6">
          Merci pour votre réservation. Un email de confirmation a été envoyé à votre adresse.
        </Text>

        {/* Action Buttons */}
        <VStack spacing={3} w="100%">
          <Button
            w="100%"
            size="lg"
            colorScheme="blue"
            borderRadius="xl"
            fontWeight={700}
            py={6}
            onClick={() => navigate("/")}
          >
            Retour à l'accueil
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
    </>
  )
}

export default SuccessPayment