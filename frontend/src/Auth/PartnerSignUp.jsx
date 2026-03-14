import { Box, Button, createListCollection, Field, Input, Portal, Select, Text } from "@chakra-ui/react"
import { useFormik } from "formik";
import { useState } from "react";
import { Helmet } from "react-helmet"
import { Link, useNavigate } from "react-router-dom";
import { Axios } from "../Api/Api";
import { ring } from 'ldrs'
import * as yup from "yup"

const validationSchema = yup.object().shape({
  name:yup.string().min(3,"Le nom doit min 3 caractére").required("nom est require"),
  phone:yup.string().length(8,"numéro de téléphone doit min 8 chiffre").required("Le numéro de téléphone est require").matches(/^\d+$/,"Le numéro de téléphone doit etre numerique"),
  email:yup.string().matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Il faut email").required("Email est require"),
  password:yup.string().min(6,"Mot de passe doit etre 6").required("mot de passe est require"),
  confirmPassword:yup.string().required("Confirme mot de passe est require").oneOf([yup.ref("password"),null],"Le mot de passe not match"),
  sector:yup.string().required("Le secteur est require"),
})

const PartnerSignUp = () => {
    const [emailError,setEmailError] = useState(false);
      const [loading,setLoading] = useState(false);
      const navigate = useNavigate()
      ring.register()
    
      const formik = useFormik({
        initialValues:{
            name:"",
            email:"",
            password:"",
            phone:"",
            confirmPassword:"",
            sector:""
        },
        validationSchema,
        onSubmit: async (values)=>{
          try{
            setEmailError(false)
            setLoading(true)
            const response = await Axios.post("/auth/partner/register",values);
            console.log(response)
            navigate(`/verify/${response.data.token}`);
            
          }catch{
            setEmailError(true)
            setLoading(false)
          }
        }
      });
      const sectors = createListCollection({
  items: [
    { value: "Agence de Voyage" },
    { value: "Location de Voitures" },
    { value: "Hôtel" },
    { value: "Compagnies Aériennes" },
    { value: "Voyages Circuits" },
  ],
})
console.log(formik.errors)

  return (
    <>
    <Helmet>
      <title>Sign</title>
    </Helmet>
        

    <div className="w-full h-screen flex justify-center !mt-4">
      <form className="w-full max-w-md" onSubmit={formik.handleSubmit}>
        <Box className="shadow-2xs">
            <Box className="flex" marginBottom={5}>
              <Field.Root invalid={formik.touched.name && formik.errors.name}>
                <Field.Label>Nom</Field.Label>
                <Input name="name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} type="text" placeholder="donner votre nom"/>
                <Field.ErrorText>{formik.errors.name}</Field.ErrorText>
            </Field.Root>

            </Box>
            <Box marginBottom={5}>
              <Field.Root invalid={(formik.touched.email && formik.errors.email) || emailError}>
                <Field.Label>Email</Field.Label>
                <Input name="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}  placeholder="donner votre email"/>
                <Field.ErrorText>{formik.errors.email}</Field.ErrorText>
                <Field.ErrorText>{emailError && "le email est déja utlisé"}</Field.ErrorText>
              </Field.Root>
            </Box>
            <Box marginBottom={5}>
              <Field.Root invalid={(formik.touched.phone && formik.errors.phone)}>
                <Field.Label>Numéro de téléphone</Field.Label>
                <Input name="phone" value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur}  placeholder="donner votre Numero de telephone"/>
                <Field.ErrorText>{formik.errors.phone}</Field.ErrorText>
              </Field.Root>
            </Box>
            <Box marginBottom={5} >
              <Field.Root invalid={formik.touched.sector && formik.errors.sector}>
                <Field.Label>Secteur d'activité</Field.Label>
                
                 <Select.Root onValueChange={(selector)=>{
                  formik.setFieldValue("sector",selector.value[0].toLowerCase())
                 }}  collection={sectors}>
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select le secteur d'activité" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                      {sectors.items.map((sector) => (
                        <Select.Item item={sector} key={sector.value}>
                          {sector.value}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
                <Field.ErrorText>{formik.errors.sector}</Field.ErrorText>
            </Field.Root>
          </Box>
            <Box marginBottom={5} >
              <Field.Root invalid={formik.touched.password && formik.errors.password}>
                <Field.Label>Mot de passe</Field.Label>
                <Input name="password" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} type="password" placeholder="donner votre mot de passe"/>
                <Field.ErrorText>{formik.errors.password}</Field.ErrorText>
            </Field.Root>
          </Box>
            <Box marginBottom={5} >
              <Field.Root invalid={formik.touched.confirmPassword && formik.errors.confirmPassword}>
                <Field.Label>Confirme mot de passe</Field.Label>
                <Input name="confirmPassword" value={formik.values.confirmPassword} onChange={formik.handleChange} onBlur={formik.handleBlur} type="password" placeholder="Confirme votre mot de passe"/>
                <Field.ErrorText>{formik.errors.confirmPassword}</Field.ErrorText>
            </Field.Root>
          </Box>
          <Box marginBottom={5}>
            <Text textStyle={"sm"} className="text-gray-600">Vous avez déja un compte ? <Link className="!font-medium" to="/login">Se connecter</Link></Text>
          </Box>
          <Button marginBottom={5} disabled={loading} type="submit" className="w-full bg-amber-400">
           { loading ? <l-ring
              size="25"
              stroke="3"
              bgOpacity="0"
              speed="2"
              color="white" 
            />
          :
          "s'inscrit"
          }
          </Button>
        </Box>
      </form>

    </div>
    </>
  )
}

export default PartnerSignUp