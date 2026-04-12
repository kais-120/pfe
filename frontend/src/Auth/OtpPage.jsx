import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { PinInput } from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Axios } from "../Api/Api";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

const validationSchema = Yup.object().shape({
  pinInput: Yup.array()
    .required("Le code de vérification est requis.")
    .test(
      "complete-otp",
      "Le code doit contenir 6 chiffres.",
      (otp) => {
        if (!otp) return false;
        return otp.filter((v) => v !== undefined).length === 6;
      }
    )
});

const OtpPage = () => {
    const [error,setError] = useState(""); 
  const {hash} = useParams();
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: {
      pinInput: []
    },
    validationSchema,
    onSubmit: async (values) => {
      const code = values.pinInput.join("");
      try{
        await Axios.put("/auth/verify/otp",{
            code:code,
            hash
        })
        navigate("/login")
      }catch(err){
        if(err.status === 403){
            setError("Le code OTP est incorrect.")
        }
        else if(err.status === 410){
            setError("Le code OTP a expiré.")
        }
        else{
            navigate("/")
        }
      }
      
    }
  });
  const handleResendOtp = async () => {
    try{
        await Axios.put("/auth/resend/otp",{
            hash
        })
      }catch(err){
        console.error("error")
      }
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={"white"}
      px={4}
    >
      <Box
        bg={"white"}
        p={8}
        rounded="2xl"
        shadow="xl"
        w="full"
        maxW="400px"
      >
        <VStack spacing={6}>
          <Heading size="lg">Vérification de votre compte</Heading>

          <Text fontSize="sm" color="gray.500" textAlign="center">
            Veuillez saisir le code à 6 chiffres envoyé à votre adresse e-mail.
          </Text>

          <form onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
            <VStack spacing={4}>
              <PinInput.Root
                value={formik.values.pinInput}
                onValueChange={(details) => {
                  formik.setFieldValue("pinInput", details.value);
                }}
                invalid={
                  (formik.touched.pinInput &&
                  Boolean(formik.errors.pinInput)) 
                  || error.length > 0
                }
              >
                <PinInput.HiddenInput />
                <PinInput.Control gap="3">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <PinInput.Input
                      key={index}
                      index={index}
                      borderRadius="lg"
                      borderWidth="2px"
                      _focus={{
                        borderColor: "blue.400",
                        boxShadow: "0 0 0 1px #3182ce"
                      }}
                      fontSize="xl"
                      textAlign="center"
                    />
                  ))}
                </PinInput.Control>
              </PinInput.Root>

              {formik.touched.pinInput && formik.errors.pinInput && (
                <Text fontSize="sm" color="red.400">
                  {formik.errors.pinInput}
                </Text>
              )}
              {error.length > 0 && (
                <Text fontSize="sm" color="red.400">
                  {error}
                </Text>
              )}

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                rounded="xl"
              >
                Vérifier
              </Button>
            </VStack>
          </form>

          <Text fontSize="sm" color="gray.500">
            Vous n’avez pas reçu le code ?{" "}
            <Text
            onClick={handleResendOtp}
              as="span"
              color="blue.500"
              cursor="pointer"
              fontWeight="semibold"
            >
              Renvoyer le code
            </Text>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default OtpPage;