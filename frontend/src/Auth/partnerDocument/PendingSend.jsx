import { Box, Button, Text } from "@chakra-ui/react"
import { Helmet } from "react-helmet";
import { LuCheck } from "react-icons/lu"
import { useNavigate } from "react-router-dom"

const PendingSend = () => {
  const navigate = useNavigate();
  return (
    <>
    <Helmet title="File pending"></Helmet>
    <Box
        height={"100vh"}
        textAlign="center" 
        py={10} 
        px={6} 
        borderWidth="1px" 
        borderRadius="lg" 
        bg="green.50"
        className="flex justify-center items-center"
      >    
      <Box>
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
          <LuCheck />
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
      </Box>
    </>

    
  )
}

export default PendingSend