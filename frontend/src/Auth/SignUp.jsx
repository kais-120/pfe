import { Helmet } from "react-helmet"
import Header from "../components/home/Header"
import { Box, Button, Field, Input, Text } from "@chakra-ui/react"
import { useFormik } from "formik"
import * as yup from "yup"
import { Link, useNavigate } from "react-router-dom"
import { Axios } from "../Api/Api"
import { useState } from "react"
import { ring } from 'ldrs'


const validationSchema = yup.object().shape({
  firstName:yup.string().min(3,"Le nom doit min 3 caractére").required("Nom est require"),
  lastName:yup.string().min(3,"Le prenom doit min 3 caractére").required("Prenom est require"),
  email:yup.string().matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Il faut email").required("Email est require"),
  password:yup.string().min(6,"Mot de passe doit etre 6").required("mot de passe est require"),
  confirmPassword:yup.string().required("Confirme mot de passe est require").oneOf([yup.ref("password"),null],"Le mot de passe not match"),
})

const SignUp = () => {
  const [emailError,setEmailError] = useState(false);
  const [loading,setLoading] = useState(false);
  const navigate = useNavigate()
  ring.register()

  const formik = useFormik({
    initialValues:{
        firstName:"",
        lastName:"",
        email:"",
        password:"",
        confirmPassword:""
    },
    validationSchema,
    onSubmit: async (values)=>{
      try{
        setEmailError(false)
        setLoading(true)
        const response = await Axios.post("/auth/register",values);
        console.log(response)
        navigate(`/verify/${response.data.token}`);
        
      }catch{
        setEmailError(true)
        setLoading(false)
      }
    }
  });
  return (
    <>
    <Helmet>
      <title>Sign</title>
    </Helmet>
    <Header />
    <div className="w-full h-screen flex justify-center items-center">
      <form className="w-full max-w-md" onSubmit={formik.handleSubmit}>
        <Box className="shadow-2xs">
            <Box className="flex" marginBottom={5}>
                <Box marginEnd={4}>
                <Field.Root invalid={formik.touched.firstName && formik.errors.firstName}>
                <Field.Label>Nom</Field.Label>
                <Input name="firstName" value={formik.values.firstName} onChange={formik.handleChange} onBlur={formik.handleBlur}  placeholder="donner votre nom"/>
                <Field.ErrorText>{formik.errors.firstName}</Field.ErrorText>
              </Field.Root>
            </Box>
            <Box>
              <Field.Root invalid={formik.touched.lastName && formik.errors.lastName}>
                <Field.Label>Prénom</Field.Label>
                <Input name="lastName" value={formik.values.lastName} onChange={formik.handleChange} onBlur={formik.handleBlur} type="text" placeholder="donner votre prenom"/>
                <Field.ErrorText>{formik.errors.lastName}</Field.ErrorText>
            </Field.Root>
          </Box>

            </Box>
            <Box marginBottom={5}>
              <Field.Root invalid={(formik.touched.email && formik.errors.email) || emailError}>
                <Field.Label>Email</Field.Label>
                <Input name="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}  placeholder="donner votre email"/>
                <Field.ErrorText>{formik.errors.email}</Field.ErrorText>
                <Field.ErrorText>{emailError && "le email est déja utlisé"}</Field.ErrorText>
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
          <Button disabled={loading} type="submit" className="w-full bg-amber-400">
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

export default SignUp