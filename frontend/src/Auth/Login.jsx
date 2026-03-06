import { Helmet } from "react-helmet"
import Header from "../components/home/Header"
import { Box, Button, Field, Input, Text } from "@chakra-ui/react"
import { useFormik } from "formik"
import * as yup from "yup"
import { Link, useNavigate } from "react-router-dom"
import { Axios } from "../Api/Api"
import { useState } from "react"
import {ring} from 'ldrs';
import Cookies from "universal-cookie"

const validationSchema = yup.object().shape({
  email:yup.string().required("Email est require"),
  password:yup.string().required("mot de passe est require"),
})

const Login = () => {
  const [error,setError] = useState(false);
  const [loading,setLoading] = useState(false);
  ring.register();
  const navigate = useNavigate();
  const cookie = new Cookies();
  const formik = useFormik({
    initialValues:{
      email:"",
      password:""
    },
    validationSchema,
    onSubmit: async (values)=>{
      try{
        setError(false);
        setLoading(true);
        const response = await Axios.post("/auth/login",values);
        cookie.set("auth",response.data.token);
        if(response.data.role){
          navigate("/dashboard")
        }
        navigate("/")
        window.location.reload();
      }catch{
        setError(true);
        setLoading(false);
      }
    }
  });
  return (
    <>
    <Helmet>
      <title>Login</title>
    </Helmet>
    <Header />
    <div className="w-full h-screen flex justify-center items-center">
      <form className="w-full max-w-md" onSubmit={formik.handleSubmit}>
        <Box padding={10} bg={"white"} className=" shadow-2xl">
            <Box marginBottom={5} className="">
              <Field.Root invalid={(formik.touched.email && formik.errors.email) || error}>
                <Field.Label>Email</Field.Label>
                <Input name="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}  placeholder="donner votre email"/>
                <Field.ErrorText>{formik.errors.email}</Field.ErrorText>
              </Field.Root>
            </Box>
            <Box marginBottom={5} >
              <Field.Root invalid={(formik.touched.password && formik.errors.password) || error}>
                <Field.Label>Mot de passe</Field.Label>
                <Input name="password" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} type="password" placeholder="donner votre mot de passe"/>
                <Field.ErrorText>{formik.errors.password}</Field.ErrorText>
                <Field.ErrorText>{error && "Email ou mot de passe incorrect"}</Field.ErrorText>

            </Field.Root>
          </Box>
          <Box marginBottom={5}>
            <Text textStyle={"sm"} className="text-gray-600">Vous n'avez pas de compte ? <Link className="!font-medium" to="/signup">Inscrivez-vous</Link></Text>
          </Box>
          <Button type="submit" className="w-full">
            {
              loading ? (
                <l-ring
                stroke={3}
                speed={2}
                size={25}
                bgOpacity={0}
                color="white"
                />
              ) :
              (
                "se connecter"
              )
              
            }
          </Button>
        </Box>
      </form>

    </div>
    </>
  )
}

export default Login