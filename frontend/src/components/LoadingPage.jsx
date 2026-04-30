import { Flex } from '@chakra-ui/react'
import { ring } from 'ldrs'
ring.register()


const LoadingPage = () => {
  return (
    <Flex h={"100vh"} w={"full"} justify={"center"} align={"center"} >
        <l-ring
        size="40"
        stroke="5"
        bg-opacity="0"
        speed="2" 
        color="black" 
        ></l-ring>
    </Flex>
  )
}

export default LoadingPage